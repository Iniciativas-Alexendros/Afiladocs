import { describe, it, expect, vi, beforeEach } from 'vitest'

const findMany = vi.fn()

vi.mock('@/lib/prisma/client', () => ({
  prisma: { products: { findMany } },
}))

describe('lib/stripe/client', () => {
  beforeEach(() => {
    findMany.mockReset()
  })

  it('getActiveCatalog indexa por sku, excluye filas sin stripe_price_id', async () => {
    findMany.mockResolvedValue([
      { sku: 'AFD-A', stripe_price_id: 'price_a', eidas_level: 'AES', kind: 'template', delivery_mode: 'docuseal_fill_and_sign' },
      { sku: 'AFD-B', stripe_price_id: null, eidas_level: 'SES', kind: 'template', delivery_mode: 'download_after_payment' },
    ])
    const { getActiveCatalog } = await import('@/lib/stripe/client')
    const map = await getActiveCatalog()
    expect(map.size).toBe(1)
    expect(map.get('AFD-A')?.stripe_price_id).toBe('price_a')
    expect(map.get('AFD-B')).toBeUndefined()
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { is_active: true, stripe_price_id: { not: null } },
    }))
  })

  it('getActiveCatalog normaliza eidas_level a SES si no es AES', async () => {
    findMany.mockResolvedValue([
      { sku: 'X', stripe_price_id: 'p', eidas_level: 'weird', kind: 'template', delivery_mode: 'docuseal_fill_and_sign' },
    ])
    const { getActiveCatalog } = await import('@/lib/stripe/client')
    const map = await getActiveCatalog()
    expect(map.get('X')?.eidas_level).toBe('SES')
  })

  it('getProductPriceMap devuelve { sku: stripe_price_id } aplanado', async () => {
    findMany.mockResolvedValue([
      { sku: 'AFD-A', stripe_price_id: 'price_a', eidas_level: 'AES', kind: 'template', delivery_mode: 'docuseal_fill_and_sign' },
    ])
    const { getProductPriceMap } = await import('@/lib/stripe/client')
    const map = await getProductPriceMap()
    expect(map).toEqual({ 'AFD-A': 'price_a' })
  })
})
