import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma/client'
import { serverEnv, publicEnv } from '@/lib/env'
import { getSigningAdapter } from '@/lib/signing'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { safeSendEmail } from '@/lib/email/send'
import { logEvent } from '@/lib/log/structured'
import DocumentCompleted from '@/emails/document-completed'
import { notifyOpsError } from '@/lib/alerts/notify-ops'
import crypto from 'crypto'
import React from 'react'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

// DocuSeal webhook event shape
interface DocuSealWebhookPayload {
  event_type: string
  timestamp: string
  data: {
    id: number
    status: string
    completed_at?: string
    template?: { name?: string }
    submitters?: Array<{ email?: string; name?: string }>
    metadata?: { orderId?: string; productSku?: string }
  }
}

const FULFILLMENT_EVENTS = new Set(['form.completed', 'submission.completed'])

function verifyDocuSealSignature(bodyText: string, secret: string, signature: string | null): boolean {
  if (!signature) return false
  const expected = crypto.createHmac('sha256', secret).update(bodyText).digest('hex')
  const expectedBuf = Buffer.from(expected, 'hex')
  const signatureBuf = Buffer.from(signature, 'hex')
  if (expectedBuf.length !== signatureBuf.length) return false
  return crypto.timingSafeEqual(expectedBuf, signatureBuf)
}

/**
 * Resolve the internal `documents` row for a DocuSeal submission.
 * Primary lookup: by `signing_document_id`. If missing (e.g. legacy orders or
 * race with dispatch insert), fall back to `metadata.orderId` so ops still
 * can see the signed PDF landed in storage.
 */
async function resolveDocument(
  signingDocumentId: string,
  metadata: DocuSealWebhookPayload['data']['metadata'],
) {
  const byId = await prisma.documents.findFirst({ where: { signing_document_id: signingDocumentId } })
  if (byId) return byId
  if (!metadata?.orderId) return null
  const byOrder = await prisma.documents.findFirst({
    where: { order_id: metadata.orderId, signing_document_id: null },
    orderBy: { created_at: 'desc' },
  })
  if (byOrder) {
    logEvent.warn('docuseal.webhook.resolve_fallback', {
      signing_document_id: signingDocumentId,
      order_id: metadata.orderId,
      matched_document_id: byOrder.id,
    })
    await prisma.documents.update({
      where: { id: byOrder.id },
      data: { signing_document_id: signingDocumentId, signing_provider: 'docuseal' },
    })
    return { ...byOrder, signing_document_id: signingDocumentId }
  }
  return null
}

async function uploadPdfToStorage(pdfBuffer: ArrayBuffer, orderId: string): Promise<{ storagePath: string | null; hash: string | null }> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', pdfBuffer)
  const hash = Buffer.from(hashBuffer).toString('hex')
  const storagePath = `orders/${orderId}/signed_${Date.now()}.pdf`

  const supabase = createServiceRoleClient()
  const { error } = await supabase.storage
    .from('documents')
    .upload(storagePath, Buffer.from(pdfBuffer), { contentType: 'application/pdf', upsert: false })

  if (error) {
    logEvent.error('docuseal.webhook.upload_error', { message: error.message, order_id: orderId })
    return { storagePath: null, hash: null }
  }
  return { storagePath, hash }
}

async function notifyClient(orderId: string, userId: string, productId: string): Promise<void> {
  const supabaseAdmin = createServiceRoleClient()
  const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId)
  const userEmail = userData?.user?.email
  if (!userEmail) return
  await safeSendEmail(
    {
      to: userEmail,
      subject: 'Tu documento firmado está disponible — afiladocs',
      react: React.createElement(DocumentCompleted, {
        userName: userData.user?.user_metadata?.full_name ?? userEmail,
        productName: productId,
        portalUrl: `${publicEnv.siteUrl}/portal/pedido/${orderId}`,
      }),
    },
    'docuseal.webhook.email_error',
    { order_id: orderId },
  )
}

async function processSignedSubmission(payload: DocuSealWebhookPayload): Promise<NextResponse> {
  const signingDocumentId = String(payload.data.id)
  const doc = await resolveDocument(signingDocumentId, payload.data.metadata)

  if (!doc) {
    logEvent.error('docuseal.webhook.document_not_found', {
      signing_document_id: signingDocumentId,
      order_id: payload.data.metadata?.orderId,
      product_sku: payload.data.metadata?.productSku,
    })
    void notifyOpsError({
      event: 'docuseal.webhook.document_not_found',
      message: `Submission ${signingDocumentId} sin document row interno`,
      severity: 'critical',
      metadata: { signing_document_id: signingDocumentId, orderId: payload.data.metadata?.orderId },
    })
    // 200 para que DocuSeal no entre en reintentos indefinidos. Ops resuelve manualmente.
    return NextResponse.json({ ignored: true, reason: 'document_not_found' })
  }

  const adapter = getSigningAdapter()
  const pdfBuffer = await adapter.getDocumentPdf(signingDocumentId)
  const { storagePath, hash } = await uploadPdfToStorage(pdfBuffer, doc.order_id)

  if (!storagePath || !hash) {
    void notifyOpsError({
      event: 'docuseal.webhook.storage_failed',
      message: `No se pudo persistir PDF firmado para pedido ${doc.order_id}`,
      severity: 'critical',
      metadata: { orderId: doc.order_id, signing_document_id: signingDocumentId },
    })
    return NextResponse.json({ ignored: true, reason: 'storage_failed' })
  }

  const order = await prisma.$transaction(async (tx) => {
    await tx.documents.update({
      where: { id: doc.id },
      data: {
        status: 'final',
        signed_at: new Date(),
        signed_pdf_path: storagePath,
        hash_sha256_signed: hash,
        signing_provider: 'docuseal',
      },
    })
    const updated = await tx.orders.update({ where: { id: doc.order_id }, data: { status: 'completed' } })
    await tx.audit_log.create({
      data: {
        event: 'document.signed',
        order_id: doc.order_id,
        user_id: updated.user_id,
        metadata: { signing_document_id: signingDocumentId, provider: 'docuseal' },
      },
    })
    return updated
  })

  revalidateTag('orders', 'default')
  revalidateTag(`orders-${order.user_id}`, 'default')
  revalidateTag(`order-${order.id}`, 'default')
  await notifyClient(order.id, order.user_id, order.product_id)
  return NextResponse.json({ success: true })
}

export async function POST(req: Request) {
  const secret = serverEnv.docusealWebhookSecret
  if (!secret) {
    logEvent.error('docuseal.webhook.not_configured', {})
    return new NextResponse('Webhook not configured', { status: 503 })
  }

  try {
    const bodyText = await req.text()
    const signature = req.headers.get('x-docuseal-signature')

    if (!verifyDocuSealSignature(bodyText, secret, signature)) {
      return new NextResponse(signature ? 'Invalid signature' : 'Missing signature', { status: 401 })
    }

    let payload: DocuSealWebhookPayload
    try {
      payload = JSON.parse(bodyText) as DocuSealWebhookPayload
    } catch {
      return new NextResponse('Invalid JSON payload', { status: 400 })
    }

    if (!FULFILLMENT_EVENTS.has(payload.event_type)) {
      return NextResponse.json({ ignored: true, event: payload.event_type })
    }

    return await processSignedSubmission(payload)
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    logEvent.error('docuseal.webhook.error', { message: errMsg })
    void notifyOpsError({ event: 'docuseal.webhook.error', message: errMsg, severity: 'critical' })
    return new NextResponse('Webhook processing failed', { status: 500 })
  }
}
