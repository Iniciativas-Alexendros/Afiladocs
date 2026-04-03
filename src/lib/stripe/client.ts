import { serverEnv } from '@/lib/env'

/**
 * Map of product IDs to Stripe Price IDs.
 * Retorna un objeto nuevo en cada llamada para leer los lazy getters de serverEnv
 * en request time (no en build time).
 */
export function getProductPriceMap(): Record<string, string | undefined> {
  return {
    'AFD-LTK-001': serverEnv.stripePriceLtk001 || undefined,
    'AFD-PCK-001': serverEnv.stripePricePck001 || undefined,
    'AFD-REV-001': serverEnv.stripePriceRev001 || undefined,
    'AFD-INF-001': serverEnv.stripePriceInf001 || undefined,
    'AFD-CON-001': serverEnv.stripePriceCon001 || undefined,
  }
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
