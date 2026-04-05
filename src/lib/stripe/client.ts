import { serverEnv } from '@/lib/env'

/**
 * Map of internal product IDs to Stripe Price IDs.
 * Retorna un objeto nuevo en cada llamada para leer los lazy getters de serverEnv
 * en request time (no en build time).
 */
export function getProductPriceMap(): Record<string, string | undefined> {
  return {
    'AFD-PAK-001': serverEnv.stripePricePak001 || undefined,
    'AFD-CPS-001': serverEnv.stripePriceCps001 || undefined,
    'AFD-NDA-001': serverEnv.stripePriceNda001 || undefined,
    'AFD-PWL-001': serverEnv.stripePricePwl001 || undefined,
  }
}

/**
 * eIDAS signature level per product.
 * SES = Simple Electronic Signature (low risk)
 * AES = Advanced Electronic Signature (higher risk, contracts)
 */
export const EIDAS_LEVEL_MAP: Record<string, 'SES' | 'AES'> = {
  'AFD-PAK-001': 'AES',
  'AFD-CPS-001': 'AES',
  'AFD-NDA-001': 'AES',
  'AFD-PWL-001': 'SES',
}
