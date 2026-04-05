import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma/client'
import { serverEnv, publicEnv } from '@/lib/env'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { sendEmail } from '@/lib/email/send'
import DocumentCompleted from '@/emails/document-completed'
import crypto from 'crypto'
import React from 'react'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

function verifySignature(bodyText: string, secret: string, signature: string | null): boolean {
  if (!signature) return false
  const expected = crypto.createHmac('sha256', secret).update(bodyText).digest('hex')
  return signature === expected
}

async function downloadAndStorePdf(documentId: string, orderId: string): Promise<{ storagePath: string | null; signedHash: string | null }> {
  const apiKey = serverEnv.documensoApiKey
  if (!apiKey) return { storagePath: null, signedHash: null }

  try {
    const pdfResponse = await fetch(
      `${serverEnv.documensoApiUrl}/documents/${documentId}/download`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    )
    if (!pdfResponse.ok) return { storagePath: null, signedHash: null }

    const pdfBuffer = await pdfResponse.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', pdfBuffer)
    const signedHash = Buffer.from(hashBuffer).toString('hex')
    const storagePath = `orders/${orderId}/signed_${Date.now()}.pdf`

    const supabase = createServiceRoleClient()
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, Buffer.from(pdfBuffer), { contentType: 'application/pdf', upsert: false })

    if (uploadError) {
      console.error(JSON.stringify({ event: 'documenso.webhook.upload_error', message: uploadError.message, order_id: orderId, ts: new Date().toISOString() }))
      return { storagePath: null, signedHash: null }
    }
    return { storagePath, signedHash }
  } catch (err) {
    console.error(JSON.stringify({ event: 'documenso.webhook.download_error', message: err instanceof Error ? err.message : 'Unknown', document_id: documentId, ts: new Date().toISOString() }))
    return { storagePath: null, signedHash: null }
  }
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
    console.error(JSON.stringify({ event: 'documenso.webhook.email_error', message: emailError instanceof Error ? emailError.message : 'Unknown', order_id: orderId, ts: new Date().toISOString() }))
  }
}

function parseAndValidateRequest(bodyText: string, signatureHeader: string | null, secret: string):
  | { ok: true; event: string | undefined; documentId: string | undefined }
  | { ok: false; response: NextResponse } {
  if (!verifySignature(bodyText, secret, signatureHeader)) {
    return { ok: false, response: new NextResponse(signatureHeader ? 'Invalid signature' : 'Missing signature', { status: 401 }) }
  }
  try {
    const payload = JSON.parse(bodyText) as { event?: string; documentId?: string }
    return { ok: true, event: payload.event, documentId: payload.documentId }
  } catch {
    return { ok: false, response: new NextResponse('Invalid JSON payload', { status: 400 }) }
  }
}

async function processDocumentCompletion(documentId: string): Promise<NextResponse> {
  const doc = await prisma.documents.findFirst({ where: { documenso_document_id: documentId } })
  if (!doc) return new NextResponse('Document not found in internal tracking', { status: 404 })

  const { storagePath, signedHash } = await downloadAndStorePdf(documentId, doc.order_id)

  await prisma.documents.update({
    where: { id: doc.id },
    data: {
      status: 'final',
      signed_at: new Date(),
      ...(storagePath ? { signed_pdf_path: storagePath } : {}),
      ...(signedHash ? { hash_sha256_signed: signedHash } : {}),
    },
  })

  const order = await prisma.orders.update({ where: { id: doc.order_id }, data: { status: 'completed' } })

  revalidateTag('orders')
  revalidateTag(`orders-${order.user_id}`)

  await prisma.audit_log.create({
    data: {
      event: 'document.signed',
      order_id: doc.order_id,
      user_id: order.user_id,
      metadata: { documenso_id: documentId, signed_pdf_stored: Boolean(storagePath) },
    },
  })

  await notifyClient(order.id, order.user_id, order.product_id)
  return NextResponse.json({ success: true })
}

export async function POST(req: Request) {
  const secret = serverEnv.documensoWebhookSecret
  if (!secret) {
    console.error(JSON.stringify({ event: 'documenso.webhook.not_configured', ts: new Date().toISOString() }))
    return new NextResponse('Webhook not configured', { status: 503 })
  }

  try {
    const bodyText = await req.text()
    const result = parseAndValidateRequest(bodyText, req.headers.get('documenso-signature'), secret)
    if (!result.ok) return result.response

    if (result.event !== 'DOCUMENT_COMPLETED') {
      return new NextResponse('Ignored event', { status: 200 })
    }

    return await processDocumentCompletion(result.documentId ?? '')
  } catch (error) {
    console.error(JSON.stringify({ event: 'documenso.webhook.error', message: error instanceof Error ? error.message : 'Unknown error', ts: new Date().toISOString() }))
    return new NextResponse('Webhook processing failed', { status: 500 })
  }
}
