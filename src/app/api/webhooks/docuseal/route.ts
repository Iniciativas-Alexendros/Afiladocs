import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma/client'
import { serverEnv, publicEnv } from '@/lib/env'
import { getSigningAdapter } from '@/lib/signing'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { sendEmail } from '@/lib/email/send'
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
    metadata?: { orderId?: string }
  }
}

function verifyDocuSealSignature(bodyText: string, secret: string, signature: string | null): boolean {
  if (!signature) return false
  const expected = crypto.createHmac('sha256', secret).update(bodyText).digest('hex')
  return signature === expected
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
    console.error(JSON.stringify({ event: 'docuseal.webhook.upload_error', message: error.message, order_id: orderId, ts: new Date().toISOString() }))
    return { storagePath: null, hash: null }
  }
  return { storagePath, hash }
}

async function notifyClient(orderId: string, userId: string, productId: string): Promise<void> {
  try {
    const supabaseAdmin = createServiceRoleClient()
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId)
    const userEmail = userData?.user?.email
    if (!userEmail) return
    await sendEmail({
      to: userEmail,
      subject: 'Tu documento firmado está disponible — afiladocs',
      react: React.createElement(DocumentCompleted, {
        userName: userData.user?.user_metadata?.full_name ?? userEmail,
        productName: productId,
        portalUrl: `${publicEnv.siteUrl}/portal/pedido/${orderId}`,
      }),
    })
  } catch (emailError) {
    console.error(JSON.stringify({ event: 'docuseal.webhook.email_error', message: emailError instanceof Error ? emailError.message : 'Unknown', order_id: orderId, ts: new Date().toISOString() }))
  }
}

export async function POST(req: Request) {
  const secret = serverEnv.docusealWebhookSecret
  if (!secret) {
    console.error(JSON.stringify({ event: 'docuseal.webhook.not_configured', ts: new Date().toISOString() }))
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

    if (payload.event_type !== 'form.completed') {
      return NextResponse.json({ ignored: true, event: payload.event_type })
    }

    const signingDocumentId = String(payload.data.id)
    const doc = await prisma.documents.findFirst({ where: { signing_document_id: signingDocumentId } })

    if (!doc) {
      console.error(JSON.stringify({ event: 'docuseal.webhook.document_not_found', signing_document_id: signingDocumentId, ts: new Date().toISOString() }))
      return new NextResponse('Document not found in internal tracking', { status: 404 })
    }

    const adapter = getSigningAdapter()
    const pdfBuffer = await adapter.getDocumentPdf(signingDocumentId)
    const { storagePath, hash } = await uploadPdfToStorage(pdfBuffer, doc.order_id)

    await prisma.documents.update({
      where: { id: doc.id },
      data: { status: 'final', signed_at: new Date(), signed_pdf_path: storagePath, hash_sha256_signed: hash, signing_provider: 'docuseal' },
    })

    const order = await prisma.orders.update({ where: { id: doc.order_id }, data: { status: 'completed' } })

    revalidateTag('orders')
    revalidateTag(`orders-${order.user_id}`)

    await prisma.audit_log.create({
      data: { event: 'document.signed', order_id: doc.order_id, user_id: order.user_id, metadata: { signing_document_id: signingDocumentId, provider: 'docuseal' } },
    })

    await notifyClient(order.id, order.user_id, order.product_id)

    return NextResponse.json({ success: true })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error(JSON.stringify({ event: 'docuseal.webhook.error', message: errMsg, ts: new Date().toISOString() }))
    void notifyOpsError({ event: 'docuseal.webhook.error', message: errMsg, severity: 'critical' })
    return new NextResponse('Webhook processing failed', { status: 500 })
  }
}
