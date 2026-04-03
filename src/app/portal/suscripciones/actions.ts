'use server'

import { requireAuth } from '@/lib/auth'
import { serverEnv, publicEnv } from '@/lib/env'

export async function createBillingPortalSession(subscriptionId: string): Promise<{ url?: string; error?: string }> {
  await requireAuth()

  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(serverEnv.stripeSecretKey, {
      apiVersion: '2026-03-25.dahlia',
    })

    const session = await stripe.billingPortal.sessions.create({
      customer: subscriptionId,
      return_url: `${publicEnv.siteUrl}/portal/suscripciones`,
    })

    return { url: session.url }
  } catch (error) {
    console.error(JSON.stringify({
      event: 'billing_portal.error',
      message: error instanceof Error ? error.message : 'Unknown error',
      ts: new Date().toISOString(),
    }))
    return { error: 'No se pudo acceder al portal de facturación' }
  }
}
