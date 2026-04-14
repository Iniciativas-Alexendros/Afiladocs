import type { orders, products, profiles } from '@prisma/client'
import React from 'react'
import { prisma } from '@/lib/prisma/client'
import { notifyOpsError } from '@/lib/alerts/notify-ops'
import { safeSendEmail } from '@/lib/email/send'
import { TemplateDownloadReady } from '@/emails/template-download-ready'
import { publicEnv } from '@/lib/env'
import { logEvent } from '@/lib/log/structured'
import { dispatchByProductKind, type DispatchResult } from './dispatch'

type OrderWithUser = orders & { user: profiles }

/**
 * Orchestrates product fulfillment after Stripe `checkout.session.completed`.
 * Looks up the product by SKU, invokes `dispatchByProductKind`, logs the
 * outcome, and notifies ops on failure. Intentionally catches all errors so
 * the Stripe webhook can still acknowledge the event (we never want Stripe
 * to retry a duplicated order creation due to a downstream provider hiccup).
 */
export async function fulfillOrderFromSession(
  order: OrderWithUser,
  customerEmail: string,
): Promise<void> {
  if (!order.product_sku) return

  try {
    const product = await prisma.products.findUnique({ where: { sku: order.product_sku } })
    if (!product) {
      logEvent.error('dispatch.product_not_found', { orderId: order.id, productSku: order.product_sku })
      return
    }

    const result = await dispatchByProductKind(order, product, {
      name: order.user.full_name ?? 'Cliente',
      email: customerEmail,
    })

    logEvent.info('dispatch.success', {
      orderId: order.id,
      productSku: product.sku,
      deliveryMode: product.delivery_mode,
      resultKind: result.kind,
    })

    await notifyCustomerByResult(order, product, customerEmail, result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    logEvent.error('dispatch.failed', { orderId: order.id, productSku: order.product_sku, message })
    void notifyOpsError({
      event: 'dispatch.failed',
      message,
      severity: 'critical',
      metadata: { orderId: order.id, productSku: order.product_sku },
    })
  }
}

async function notifyCustomerByResult(
  order: OrderWithUser,
  product: products,
  customerEmail: string,
  result: DispatchResult,
): Promise<void> {
  if (result.kind !== 'download_url') return
  await safeSendEmail(
    {
      to: customerEmail,
      subject: `Tu ${product.title} está listo para descargar`,
      react: React.createElement(TemplateDownloadReady, {
        userName: order.user.full_name ?? 'Cliente',
        productName: product.title,
        downloadUrl: result.signedUrl,
        expiresAt: result.expiresAt,
        portalUrl: `${publicEnv.siteUrl}/portal/pedido/${order.id}`,
      }),
    },
    'email.template_download_ready.failed',
    { orderId: order.id },
  )
}
