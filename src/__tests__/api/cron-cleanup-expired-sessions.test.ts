import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/rate-limit', () => ({
  cronRateLimit: null,
  checkoutRateLimit: null,
  contactRateLimit: null,
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
  applyRateLimit: vi.fn().mockResolvedValue({ limited: false }),
}))

vi.mock('@/lib/env', () => ({
  serverEnv: { cronSecret: 'test-cron-secret' },
  publicEnv: { siteUrl: 'http://localhost:3000' },
}))

vi.mock('@/lib/prisma/client', () => ({
  prisma: {
    orders: {
      updateMany: vi.fn().mockResolvedValue({ count: 3 }),
    },
  },
}))

function makeRequest(headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/cron/cleanup-expired-sessions', {
    method: 'GET',
    headers: { 'x-forwarded-for': '127.0.0.1', ...headers },
  })
}

// Helpers to re-establish default mocks in doMock tests
function doMockDefaultEnv() {
  vi.doMock('@/lib/env', () => ({
    serverEnv: { cronSecret: 'test-cron-secret' },
    publicEnv: { siteUrl: 'http://localhost:3000' },
  }))
}

function doMockDefaultPrisma() {
  vi.doMock('@/lib/prisma/client', () => ({
    prisma: {
      orders: {
        updateMany: vi.fn().mockResolvedValue({ count: 3 }),
      },
    },
  }))
}

function doMockDefaultRateLimit() {
  vi.doMock('@/lib/rate-limit', () => ({
    cronRateLimit: null,
    checkoutRateLimit: null,
    contactRateLimit: null,
    getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
    applyRateLimit: vi.fn().mockResolvedValue({ limited: false }),
  }))
}

describe('GET /api/cron/cleanup-expired-sessions', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()
  })

  it('returns 401 when authorization header is missing', async () => {
    const { GET } = await import('@/app/api/cron/cleanup-expired-sessions/route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(401)
  })

  it('returns 401 when bearer token does not match', async () => {
    const { GET } = await import('@/app/api/cron/cleanup-expired-sessions/route')
    const res = await GET(makeRequest({ authorization: 'Bearer wrong-token' }))
    expect(res.status).toBe(401)
  })

  it('returns 200 with softDeleted count on success', async () => {
    const { GET } = await import('@/app/api/cron/cleanup-expired-sessions/route')
    const res = await GET(makeRequest({ authorization: 'Bearer test-cron-secret' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ ok: true, softDeleted: 3 })

    const { prisma } = await import('@/lib/prisma/client')
    expect(prisma.orders.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'intake_pending',
          intake_completed_at: null,
          deleted_at: null,
          created_at: expect.objectContaining({ lt: expect.any(Date) }),
        }),
        data: expect.objectContaining({ deleted_at: expect.any(Date) }),
      })
    )
  })

  it('returns 503 when CRON_SECRET is not configured', async () => {
    doMockDefaultRateLimit()
    doMockDefaultPrisma()
    vi.doMock('@/lib/env', () => ({
      serverEnv: { cronSecret: undefined },
      publicEnv: { siteUrl: 'http://localhost:3000' },
    }))
    const { GET } = await import('@/app/api/cron/cleanup-expired-sessions/route')
    const res = await GET(makeRequest({ authorization: 'Bearer test-cron-secret' }))
    expect(res.status).toBe(503)
  })

  it('returns 500 when database operation fails', async () => {
    doMockDefaultRateLimit()
    doMockDefaultEnv()
    vi.doMock('@/lib/prisma/client', () => ({
      prisma: {
        orders: {
          updateMany: vi.fn().mockRejectedValue(new Error('DB error')),
        },
      },
    }))
    const { GET } = await import('@/app/api/cron/cleanup-expired-sessions/route')
    const res = await GET(makeRequest({ authorization: 'Bearer test-cron-secret' }))
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBe('Cron failed')
  })

  it('returns 429 when rate limited', async () => {
    doMockDefaultEnv()
    doMockDefaultPrisma()
    vi.doMock('@/lib/rate-limit', () => ({
      cronRateLimit: {},
      checkoutRateLimit: null,
      contactRateLimit: null,
      getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
      applyRateLimit: vi.fn().mockResolvedValue({ limited: true, retryAfter: 60 }),
    }))
    const { GET } = await import('@/app/api/cron/cleanup-expired-sessions/route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(429)
  })
})
