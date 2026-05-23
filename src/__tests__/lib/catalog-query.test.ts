import { describe, it, expect, vi, beforeEach } from 'vitest'

const findMany = vi.fn()
const findFirst = vi.fn()
const findUnique = vi.fn()
const revalidateTag = vi.fn()

vi.mock('next/cache', () => ({
  unstable_cache: <Args extends unknown[], R>(fn: (...args: Args) => R) => fn,
  revalidateTag,
}))

vi.mock('@/lib/prisma/client', () => ({
  prisma: {
    products: { findMany, findFirst, findUnique },
  },
}))

const SAMPLE = {
  sku: 'AFD-RGPD-REG-001',
  slug: 'registro-actividades-tratamiento',
  title: 'Registro de actividades',
  description_md: 'md',
  category: 'rgpd',
  kind: 'template',
  price_cents: 4900,
  vat_mode: 'included',
  stripe_price_id: null,
  docuseal_template_id: null,
  storage_path: null,
  delivery_mode: 'docuseal_fill_and_sign',
  eidas_level: 'SES',
  is_active: true,
  display_order: 10,
  created_at: new Date(),
  updated_at: new Date(),
}

describe('lib/catalog/query', () => {
  beforeEach(() => {
    findMany.mockReset()
    findFirst.mockReset()
    findUnique.mockReset()
    revalidateTag.mockReset()
  })

  it('getActiveProducts filters is_active=true and orders by display_order asc, title asc', async () => {
    findMany.mockResolvedValue([SAMPLE])
    const { getActiveProducts } = await import('@/lib/catalog/query')
    const rows = await getActiveProducts()
    expect(rows).toHaveLength(1)
    expect(findMany).toHaveBeenCalledWith({
      where: { is_active: true },
      orderBy: [{ display_order: 'asc' }, { title: 'asc' }],
    })
  })

  it('getProductsByCategory narrows by category', async () => {
    findMany.mockResolvedValue([SAMPLE])
    const { getProductsByCategory } = await import('@/lib/catalog/query')
    await getProductsByCategory('rgpd')
    expect(findMany).toHaveBeenCalledWith({
      where: { is_active: true, category: 'rgpd' },
      orderBy: [{ display_order: 'asc' }, { title: 'asc' }],
    })
  })

  it('getProductBySlug requires is_active=true', async () => {
    findFirst.mockResolvedValue(SAMPLE)
    const { getProductBySlug } = await import('@/lib/catalog/query')
    const p = await getProductBySlug('registro-actividades-tratamiento')
    expect(p?.sku).toBe('AFD-RGPD-REG-001')
    expect(findFirst).toHaveBeenCalledWith({ where: { slug: 'registro-actividades-tratamiento', is_active: true } })
  })

  it('getProductBySku ignores is_active (used by ops)', async () => {
    findUnique.mockResolvedValue({ ...SAMPLE, is_active: false })
    const { getProductBySku } = await import('@/lib/catalog/query')
    const p = await getProductBySku('AFD-RGPD-REG-001')
    expect(p?.is_active).toBe(false)
    expect(findUnique).toHaveBeenCalledWith({ where: { sku: 'AFD-RGPD-REG-001' } })
  })

  it('revalidateProductsCache calls revalidateTag("products")', async () => {
    const { revalidateProductsCache, PRODUCTS_CACHE_TAG } = await import('@/lib/catalog/query')
    revalidateProductsCache()
    expect(revalidateTag).toHaveBeenCalledWith(PRODUCTS_CACHE_TAG, 'default')
  })
})
