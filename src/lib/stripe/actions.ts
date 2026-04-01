'use server'

import { redirect } from 'next/navigation'
import { stripe } from './client'
import { requireAuth } from '@/lib/auth'

export async function createCheckoutSession(productId: string, returnUrl: string) {
  const { user } = await requireAuth()

  if (!user) {
    redirect('/login?next=/checkout')
  }

  // Find the exact price ID for this product or use the product id as price if it's already a price
  // Usually, in Stripe, you pass a price ID directly to line_items
  // We'll assume productId passed here is actually a price ID for simplicity,
  // or you could map internal product keys to Stripe price IDs.
  
  const stripeSession = await stripe.checkout.sessions.create({
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/pago-exitoso?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: returnUrl,
    payment_method_types: ['card'],
    mode: 'payment',
    billing_address_collection: 'required',
    customer_email: user.email,
    client_reference_id: user.id, // we tie the checkout to this user
    line_items: [
      {
        price: productId, // Needs to be a valid Stripe Price ID
        quantity: 1,
      },
    ],
    metadata: {
      userId: user.id,
      productId: productId,
    },
  })

  if (!stripeSession.url) {
    throw new Error('Could not create checkout session')
  }

  // Redirect manually via next/navigation
  redirect(stripeSession.url)
}
