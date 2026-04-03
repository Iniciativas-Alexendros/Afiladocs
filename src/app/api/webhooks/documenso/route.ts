import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { serverEnv } from '@/lib/env'
import crypto from 'crypto'

export async function POST(req: Request) {
  // 1. Verificar que el secreto está configurado — sin él, rechazar siempre
  const secret = serverEnv.documensoWebhookSecret
  if (!secret) {
    console.error(JSON.stringify({
      event: 'documenso.webhook.not_configured',
      ts: new Date().toISOString(),
    }))
    return new NextResponse('Webhook not configured', { status: 503 })
  }

  try {
    const bodyText = await req.text()

    // 2. Verificar firma HMAC — siempre obligatorio
    const signature = req.headers.get('documenso-signature')
    if (!signature) {
      return new NextResponse('Missing signature', { status: 401 })
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(bodyText)
      .digest('hex')

    if (signature !== expectedSignature) {
      return new NextResponse('Invalid signature', { status: 401 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let payload: any
    try {
      payload = JSON.parse(bodyText)
    } catch {
      return new NextResponse('Invalid JSON payload', { status: 400 })
    }
    const { event, documentId } = payload as { event?: string; documentId?: string }

    // We only care when the document gets completed/signed by all parties
    if (event !== 'DOCUMENT_COMPLETED') {
        return new NextResponse('Ignored event', { status: 200 })
    }

    // 2. Find the corresponding document in our db
    const doc = await prisma.documents.findFirst({
        where: { documenso_document_id: documentId }
    })

    if (!doc) {
        return new NextResponse('Document not found in internal tracking', { status: 404 })
    }

    // 3. Update document status
    await prisma.documents.update({
        where: { id: doc.id },
        data: {
            status: 'final',
            signed_at: new Date(),
            // Here we would ideally download the signed PDF from Documenso API and 
            // upload it to our Supabase Storage `documents` bucket, then update `signed_pdf_path`.
            // signed_pdf_path: ...
        }
    })

    // 4. Update order status if all documents are finished
    // (In a real scenario, we check if all required docs for the order are signed)
    const order = await prisma.orders.update({
        where: { id: doc.order_id },
        data: { status: 'completed' }
    })

    // 5. Audit log
    await prisma.audit_log.create({
        data: {
            event: 'document_signed_via_documenso',
            order_id: doc.order_id,
            user_id: order.user_id,
            metadata: { documenso_id: documentId }
        }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(JSON.stringify({
      event: 'documenso.webhook.error',
      message: error instanceof Error ? error.message : 'Unknown error',
      ts: new Date().toISOString(),
    }))
    return new NextResponse('Webhook processing failed', { status: 500 })
  }
}
