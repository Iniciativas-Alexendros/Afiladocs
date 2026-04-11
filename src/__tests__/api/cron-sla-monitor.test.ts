import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFindMany = vi.fn()

vi.mock('@/lib/rate-limit', () => ({
  cronRateLimit: null,
  checkoutRateLimit: null,
  contactRateLimit: null,
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
  applyRateLimit: vi.fn().mockResolvedValue({ limited: false }),
}))

vi.mock('@/lib/env', () => ({
  serverEnv: { cronSecret: 'test-cron-secret', opsEmail: 'ops@afiladocs.com' },
  publicEnv: { siteUrl: 'http://localhost:3000' },
}))

vi.mock('@/lib/prisma/client', () => ({
  prisma: {
    documents: { findMany: mockFindMany },
  },
}))

vi.mock('@/lib/email/send', () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/emails/sla-alert', () => ({ SlaAlertEmail: vi.fn() }))
vi.mock('@/lib/alerts/notify-ops', () => ({ notifyOpsError: vi.fn() }))

const OVERDUE_DOC = {
  id: 'doc-1',
  created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
  order: { id: 'order-1', product_id: 'AFD-LTK-001', deleted_at: null, user: { full_name: 'Test User' } },
}

function makeRequest(headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/cron/sla-monitor', {
    method: 'GET',
    headers: { 'x-forwarded-for': '127.0.0.1', ...headers },
  })
}

function doMockDefaultEnv() {
  vi.doMock('@/lib/env', () => ({
    serverEnv: { cronSecret: 'test-cron-secret', opsEmail: 'ops@afiladocs.com' },
    publicEnv: { siteUrl: 'http://localhost:3000' },
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

describe('GET /api/cron/sla-monitor', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()
    mockFindMany.mockResolvedValue([OVERDUE_DOC])
  })

  // Auth failures — use top-level vi.mock defaults
  it('returns 401 when authorization header is missing', async () => {
    const { GET } = await import('@/app/api/cron/sla-monitor/route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(401)
  })

  it('returns 401 when bearer token does not match', async () => {
    const { GET } = await import('@/app/api/cron/sla-monitor/route')
    const res = await GET(makeRequest({ authorization: 'Bearer wrong-token' }))
    expect(res.status).toBe(401)
  })

  // Success with overdue docs — uses top-level vi.mock (before doMock tests)
  it('returns 200 and sends SLA alert email when overdue documents found', async () => {
    const { GET } = await import('@/app/api/cron/sla-monitor/route')
    const res = await GET(makeRequest({ authorization: 'Bearer test-cron-secret' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ ok: true, overdueCount: 1 })

    const { sendEmail } = await import('@/lib/email/send')
    expect(sendEmail).toHaveBeenCalledOnce()
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'ops@afiladocs.com',
        subject: expect.stringContaining('Alerta SLA'),
      })
    )
  })

  it('query includes soft-delete filter on orders', async () => {
    const { GET } = await import('@/app/api/cron/sla-monitor/route')
    await GET(makeRequest({ authorization: 'Bearer test-cron-secret' }))
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          order: expect.objectContaining({ deleted_at: null }),
        }),
      })
    )
  })

  // Edge cases with doMock — come AFTER success tests
  it('returns 200 with 0 overdue when no documents found', async () => {
    doMockDefaultRateLimit()
    doMockDefaultEnv()
    vi.doMock('@/lib/prisma/client', () => ({
      prisma: { documents: { findMany: vi.fn().mockResolvedValue([]) } },
    }))
    const { GET } = await import('@/app/api/cron/sla-monitor/route')
    const res = await GET(makeRequest({ authorization: 'Bearer test-cron-secret' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ ok: true, overdueCount: 0 })
  })

  it('returns 503 when CRON_SECRET is not configured', async () => {
    doMockDefaultRateLimit()
    vi.doMock('@/lib/env', () => ({
      serverEnv: { cronSecret: undefined, opsEmail: 'ops@afiladocs.com' },
      publicEnv: { siteUrl: 'http://localhost:3000' },
    }))
    vi.doMock('@/lib/prisma/client', () => ({
      prisma: { documents: { findMany: vi.fn().mockResolvedValue([]) } },
    }))
    const { GET } = await import('@/app/api/cron/sla-monitor/route')
    const res = await GET(makeRequest({ authorization: 'Bearer test-cron-secret' }))
    expect(res.status).toBe(503)
  })

  it('returns 500 when database query fails', async () => {
    doMockDefaultRateLimit()
    doMockDefaultEnv()
    vi.doMock('@/lib/prisma/client', () => ({
      prisma: { documents: { findMany: vi.fn().mockRejectedValue(new Error('DB error')) } },
    }))
    const { GET } = await import('@/app/api/cron/sla-monitor/route')
    const res = await GET(makeRequest({ authorization: 'Bearer test-cron-secret' }))
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBe('Cron failed')
  })

  it('returns 429 when rate limited', async () => {
    doMockDefaultEnv()
    vi.doMock('@/lib/prisma/client', () => ({
      prisma: { documents: { findMany: vi.fn().mockResolvedValue([]) } },
    }))
    vi.doMock('@/lib/rate-limit', () => ({
      cronRateLimit: {},
      checkoutRateLimit: null,
      contactRateLimit: null,
      getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
      applyRateLimit: vi.fn().mockResolvedValue({ limited: true, retryAfter: 60 }),
    }))
    const { GET } = await import('@/app/api/cron/sla-monitor/route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(429)
  })
})
