import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
  typescript: true,
})

/**
 * Map of product IDs to Stripe Price IDs.
 * Price IDs are configured via environment variables.
 */
export const PRODUCT_PRICE_MAP: Record<string, string | undefined> = {
  'AFD-LTK-001': process.env.STRIPE_PRICE_LTK_001,
  'AFD-PCK-001': process.env.STRIPE_PRICE_PCK_001,
  'AFD-REV-001': process.env.STRIPE_PRICE_REV_001,
  'AFD-INF-001': process.env.STRIPE_PRICE_INF_001,
  'AFD-CON-001': process.env.STRIPE_PRICE_CON_001,
}

/**
 * eIDAS signature level per product.
 */
export const EIDAS_LEVEL_MAP: Record<string, 'SES' | 'AES'> = {
  'AFD-LTK-001': 'SES',
  'AFD-CON-001': 'SES',
  'AFD-REV-001': 'AES',
  'AFD-INF-001': 'AES',
  'AFD-PCK-001': 'AES',
}
