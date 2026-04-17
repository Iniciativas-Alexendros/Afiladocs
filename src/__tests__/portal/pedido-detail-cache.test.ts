import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFindFirst = vi.fn()
const mockRequireAuth = vi.fn()
type UnstableCacheArgs = [
  fn: (...args: unknown[]) => unknown,
  key: unknown[],
  opts: { tags?: string[]; revalidate?: number },
]
const mockUnstableCache = vi.fn<(...args: UnstableCacheArgs) => (...args: unknown[]) => unknown>(
  (fn) => fn,
)

vi.mock('next/cache', () => ({
  unstable_cache: mockUnstableCache,
}))

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND')
  },
}))

vi.mock('@/lib/auth', () => ({ requireAuth: mockRequireAuth }))

vi.mock('@/lib/prisma/client', () => ({
  prisma: { orders: { findFirst: mockFindFirst } },
}))

describe('portal/pedido/[id]/page.tsx — unstable_cache wrapper', () => {
  beforeEach(() => {
    vi.resetModules()
    mockUnstableCache.mockClear()
    mockRequireAuth.mockResolvedValue({ id: 'user-1' })
    mockFindFirst.mockResolvedValue({
      id: 'order-1',
      user_id: 'user-1',
      product_id: 'AFD-LTK-001',
      status: 'intake_pending',
      amount_cents: 9900,
      currency: 'eur',
      eidas_level: 'SES',
      created_at: new Date('2026-04-16T10:00:00Z'),
      documents: [],
    })
  })

  it('wraps the Prisma query with cache key containing orderId and userId', async () => {
    const { default: OrderDetailPage } = await import('@/app/portal/pedido/[id]/page')
    await OrderDetailPage({ params: Promise.resolve({ id: 'order-1' }) })

    expect(mockUnstableCache).toHaveBeenCalledWith(
      expect.any(Function),
      ['portal-order-order-1-user-1'],
      expect.objectContaining({ revalidate: 60 }),
    )
  })

  it('emits granular tags orders, orders-${userId}, order-${id}', async () => {
    const { default: OrderDetailPage } = await import('@/app/portal/pedido/[id]/page')
    await OrderDetailPage({ params: Promise.resolve({ id: 'order-1' }) })

    const [, , opts] = mockUnstableCache.mock.calls[0]
    expect(opts.tags).toEqual(['orders', 'orders-user-1', 'order-order-1'])
  })

  it('scopes cache key by userId so two users never share a cache entry', async () => {
    const { default: OrderDetailPage } = await import('@/app/portal/pedido/[id]/page')
    await OrderDetailPage({ params: Promise.resolve({ id: 'order-shared' }) })

    mockRequireAuth.mockResolvedValue({ id: 'user-2' })
    await OrderDetailPage({ params: Promise.resolve({ id: 'order-shared' }) })

    const firstKey = mockUnstableCache.mock.calls[0][1]
    const secondKey = mockUnstableCache.mock.calls[1][1]
    expect(firstKey).not.toEqual(secondKey)
    expect(firstKey[0]).toBe('portal-order-order-shared-user-1')
    expect(secondKey[0]).toBe('portal-order-order-shared-user-2')
  })

  it('forwards id and userId to prisma.orders.findFirst where clause', async () => {
    const { default: OrderDetailPage } = await import('@/app/portal/pedido/[id]/page')
    await OrderDetailPage({ params: Promise.resolve({ id: 'order-42' }) })

    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'order-42', user_id: 'user-1' },
        include: { documents: true },
      }),
    )
  })

  it('calls notFound() when order is null (RLS-safe: no cross-user leak)', async () => {
    mockFindFirst.mockResolvedValue(null)
    const { default: OrderDetailPage } = await import('@/app/portal/pedido/[id]/page')
    await expect(
      OrderDetailPage({ params: Promise.resolve({ id: 'order-missing' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND')
  })
})
