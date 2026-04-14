import type { orders, products } from '@prisma/client'
import { prisma } from '@/lib/prisma/client'
import { DocuSealAdapter } from '@/lib/signing/docuseal'
import { getTemplateSignedUrl, DEFAULT_TEMPLATE_TTL_SEC } from '@/lib/storage/templates'
import { publicEnv } from '@/lib/env'

export type DispatchResult =
  | { kind: 'docuseal_submission'; submissionId: string }
  | { kind: 'download_url'; signedUrl: string; expiresAt: string }
  | { kind: 'human_review_pending' }

interface Customer {
  name: string
  email: string
}

/**
 * Route the fulfillment flow based on product.kind + product.delivery_mode.
 * Called from the Stripe `checkout.session.completed` webhook after the
 * order row is persisted. Mutates `orders.status` and, for DocuSeal flows,
 * `orders.docuseal_submission_id` (field added by later migration).
 *
 * Keep this function free of Stripe/email side effects — those belong to
 * the webhook. The dispatcher only handles provider calls + status.
 */
export async function dispatchByProductKind(
  order: orders,
  product: products,
  customer: Customer,
): Promise<DispatchResult> {
  switch (product.delivery_mode) {
    case 'docuseal_fill_and_sign':
    case 'docuseal_fill_only': {
      if (!product.docuseal_template_id) {
        throw new Error(
          `Product ${product.sku} has delivery_mode=${product.delivery_mode} but no docuseal_template_id`,
        )
      }
      const adapter = new DocuSealAdapter()
      const submission = await adapter.createFromTemplate({
        templateId: Number(product.docuseal_template_id),
        orderId: order.id,
        productSku: product.sku,
        submitter: {
          name: customer.name,
          email: customer.email,
          role: product.delivery_mode === 'docuseal_fill_and_sign' ? 'First Party' : 'Form Submitter',
        },
        sendEmail: true,
        redirectUrl: `${publicEnv.siteUrl}/portal/pedido/${order.id}`,
      })
      await prisma.documents.create({
        data: {
          order_id: order.id,
          product_id: product.sku,
          eidas_level: product.eidas_level,
          signing_provider: 'docuseal',
          signing_document_id: submission.id,
          status: 'draft',
        },
      })
      await prisma.orders.update({
        where: { id: order.id },
        data: { status: 'awaiting_signature' },
      })
      return { kind: 'docuseal_submission', submissionId: submission.id }
    }
    case 'download_after_payment': {
      if (!product.storage_path) {
        throw new Error(
          `Product ${product.sku} has delivery_mode=download_after_payment but no storage_path`,
        )
      }
      const signedUrl = await getTemplateSignedUrl(product.storage_path)
      const expiresAt = new Date(Date.now() + DEFAULT_TEMPLATE_TTL_SEC * 1000).toISOString()
      await prisma.orders.update({
        where: { id: order.id },
        data: { status: 'delivered' },
      })
      return { kind: 'download_url', signedUrl, expiresAt }
    }
    case 'human_review': {
      await prisma.orders.update({
        where: { id: order.id },
        data: { status: 'intake_pending' },
      })
      return { kind: 'human_review_pending' }
    }
    default:
      throw new Error(`Unknown delivery_mode for product ${product.sku}: ${product.delivery_mode}`)
  }
}
