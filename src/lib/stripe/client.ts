import { cache } from 'react'
import { prisma } from '@/lib/prisma/client'

export type CatalogEntry = {
  sku: string
  stripe_price_id: string
  eidas_level: 'SES' | 'AES'
  kind: string
  delivery_mode: string
}

/**
 * Catálogo vivo indexado por SKU — sólo productos activos con `stripe_price_id` poblado.
 * Fuente única: tabla `products` (sustituye al whitelist env-based).
 * Cacheado por request (React `cache`) para evitar queries duplicadas en el mismo handler.
 */
export const getActiveCatalog = cache(async (): Promise<Map<string, CatalogEntry>> => {
  const rows = await prisma.products.findMany({
    where: { is_active: true, stripe_price_id: { not: null } },
    select: { sku: true, stripe_price_id: true, eidas_level: true, kind: true, delivery_mode: true },
  })
  const map = new Map<string, CatalogEntry>()
  for (const r of rows) {
    if (!r.stripe_price_id) continue
    map.set(r.sku, {
      sku: r.sku,
      stripe_price_id: r.stripe_price_id,
      eidas_level: (r.eidas_level === 'AES' ? 'AES' : 'SES'),
      kind: r.kind,
      delivery_mode: r.delivery_mode,
    })
  }
  return map
})

/**
 * Legacy-friendly helper: devuelve { sku → stripe_price_id } para los productos activos.
 * Mantener sólo para compat con tests/código externo; nuevos callers deberían usar `getActiveCatalog`.
 */
export async function getProductPriceMap(): Promise<Record<string, string>> {
  const catalog = await getActiveCatalog()
  const out: Record<string, string> = {}
  for (const [sku, entry] of catalog) out[sku] = entry.stripe_price_id
  return out
}
