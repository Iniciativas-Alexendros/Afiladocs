import { NextResponse } from 'next/server'

/**
 * Stripe webhook handler — OBJ-04
 * POST /api/webhooks/stripe
 */
export async function POST() {
  // Placeholder — implement in OBJ-04
  return NextResponse.json({ received: true })
}
