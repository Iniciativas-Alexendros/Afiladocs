import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { serverEnv } from '@/lib/env'
import { sendEmail } from '@/lib/email/send'
import { PaymentConfirmation } from '@/emails/PaymentConfirmation'
import React from 'react'

// Vercel Function: Node.js runtime requerido para crypto nativo (verificación HMAC-SHA256 Stripe)
export const runtime = 'nodejs'
// force-dynamic: Stripe necesita el raw body sin cachear para verificar la firma
export const dynamic = 'force-dynamic'

// Lazy getter — Stripe lanza si la key está vacía en carga del módulo (build time).
// En runtime (request time) serverEnv.stripeSecretKey estará disponible.
function getStripe() {
  const key = serverEnv.stripeSecretKey
  if (!key) return null
  return new Stripe(key, { apiVersion: '2026-03-25.dahlia' })
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerEmail = session.customer_details?.email
  const amountTotal = session.amount_total ?? 0
  const amount = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: session.currency?.toUpperCase() ?? 'EUR',
  }).format(amountTotal / 100)

  console.log(JSON.stringify({
    event: 'checkout.completed',
    sessionId: session.id,
    customerEmail,
    amount,
    ts: new Date().toISOString(),
  }))

  if (!customerEmail) return

  try {
    await sendEmail({
      to: customerEmail,
      subject: 'Confirmación de pago — afiladocs',
      react: React.createElement(PaymentConfirmation, {
        customerEmail,
        amount,
        sessionId: session.id,
      }),
    })
  } catch (emailErr) {
    // El email de confirmación es no crítico — log interno, no propagar
    console.error(JSON.stringify({
      event: 'email.confirmation.failed',
      message: emailErr instanceof Error ? emailErr.message : 'Unknown error',
      sessionId: session.id,
      ts: new Date().toISOString(),
    }))
  }
}

function handlePaymentFailed(intent: Stripe.PaymentIntent) {
  console.error(JSON.stringify({
    event: 'payment.failed',
    intentId: intent.id,
    lastError: intent.last_payment_error?.message,
    ts: new Date().toISOString(),
  }))
}

export async function POST(req: Request) {
  const stripe = getStripe()
  if (!stripe || !serverEnv.stripeWebhookSecret) {
    console.error(JSON.stringify({
      event: 'stripe.webhook.misconfigured',
      message: 'Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET',
      ts: new Date().toISOString(),
    }))
    return new NextResponse('Webhook not configured', { status: 503 })
  }

  // Lee el raw body como texto ANTES de cualquier parsing.
  // Stripe verifica la firma sobre el payload exacto — cualquier transformación invalida la firma.
  const rawBody = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return new NextResponse('Missing stripe-signature header', { status: 400 })
  }

  let event: Stripe.Event
  try {
    // constructEventAsync: versión async recomendada para entornos serverless
    event = await stripe.webhooks.constructEventAsync(rawBody, sig, serverEnv.stripeWebhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(JSON.stringify({
      event: 'stripe.webhook.signature_failed',
      message,
      ts: new Date().toISOString(),
    }))
    return new NextResponse(`Webhook signature invalid: ${message}`, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
      case 'payment_intent.payment_failed':
        handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break
      default:
        console.log(JSON.stringify({ event: 'stripe.unhandled', type: event.type }))
    }
  } catch (err) {
    // No devolver 500 a Stripe — reintentaría el evento indefinidamente.
    // Loguear el error y responder 200 para confirmar recepción.
    console.error(JSON.stringify({
      event: 'stripe.handler.error',
      type: event.type,
      message: err instanceof Error ? err.message : 'Unknown error',
      ts: new Date().toISOString(),
    }))
  }

  return NextResponse.json({ received: true })
}
