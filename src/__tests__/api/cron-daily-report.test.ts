import { describe, it, expect, vi, beforeEach } from 'vitest'

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
    orders: { count: vi.fn().mockResolvedValue(2) },
    documents: { count: vi.fn().mockResolvedValue(1) },
    monitor_alerts: { count: vi.fn().mockResolvedValue(3) },
    audit_log: { count: vi.fn().mockResolvedValue(0) },
    subscriptions: { count: vi.fn().mockResolvedValue(5) },
  },
}))

vi.mock('@/lib/email/send', () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/emails/daily-ops-report', () => ({ DailyOpsReport: vi.fn() }))
vi.mock('@/lib/alerts/notify-ops', () => ({ notifyOpsError: vi.fn() }))

function makeRequest(headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/cron/daily-report', {
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

describe('GET /api/cron/daily-report', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()
  })

  // Auth failures — use top-level vi.mock defaults
  it('returns 401 when authorization header is missing', async () => {
    const { GET } = await import('@/app/api/cron/daily-report/route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(401)
  })

  it('returns 401 when bearer token does not match', async () => {
    const { GET } = await import('@/app/api/cron/daily-report/route')
    const res = await GET(makeRequest({ authorization: 'Bearer wrong-token' }))
    expect(res.status).toBe(401)
  })

  // Success — uses top-level vi.mock (before doMock tests)
  it('returns 200 and sends report email on success', async () => {
    const { GET } = await import('@/app/api/cron/daily-report/route')
    const res = await GET(makeRequest({ authorization: 'Bearer test-cron-secret' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body).toMatchObject({
      newOrders: expect.any(Number),
      signedDocuments: expect.any(Number),
      pendingIntakes: expect.any(Number),
    })

    const { sendEmail } = await import('@/lib/email/send')
    expect(sendEmail).toHaveBeenCalledOnce()
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'ops@afiladocs.com',
        subject: expect.stringContaining('Informe diario'),
      })
    )
  })

  // Error cases — use doMock (come AFTER success tests)
  it('returns 503 when CRON_SECRET is not configured', async () => {
    doMockDefaultRateLimit()
    vi.doMock('@/lib/prisma/client', () => ({
      prisma: {
        orders: { count: vi.fn().mockResolvedValue(0) },
        documents: { count: vi.fn().mockResolvedValue(0) },
        monitor_alerts: { count: vi.fn().mockResolvedValue(0) },
        audit_log: { count: vi.fn().mockResolvedValue(0) },
        subscriptions: { count: vi.fn().mockResolvedValue(0) },
      },
    }))
    vi.doMock('@/lib/env', () => ({
      serverEnv: { cronSecret: undefined, opsEmail: 'ops@afiladocs.com' },
      publicEnv: { siteUrl: 'http://localhost:3000' },
    }))
    const { GET } = await import('@/app/api/cron/daily-report/route')
    const res = await GET(makeRequest({ authorization: 'Bearer test-cron-secret' }))
    expect(res.status).toBe(503)
  })

  it('returns 500 when database query fails', async () => {
    doMockDefaultRateLimit()
    doMockDefaultEnv()
    vi.doMock('@/lib/prisma/client', () => ({
      prisma: {
        orders: { count: vi.fn().mockRejectedValue(new Error('DB error')) },
        documents: { count: vi.fn().mockResolvedValue(0) },
        monitor_alerts: { count: vi.fn().mockResolvedValue(0) },
        audit_log: { count: vi.fn().mockResolvedValue(0) },
        subscriptions: { count: vi.fn().mockResolvedValue(0) },
      },
    }))
    const { GET } = await import('@/app/api/cron/daily-report/route')
    const res = await GET(makeRequest({ authorization: 'Bearer test-cron-secret' }))
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBe('Cron failed')
  })

  it('returns 429 when rate limited', async () => {
    doMockDefaultEnv()
    vi.doMock('@/lib/prisma/client', () => ({
      prisma: {
        orders: { count: vi.fn().mockResolvedValue(0) },
        documents: { count: vi.fn().mockResolvedValue(0) },
        monitor_alerts: { count: vi.fn().mockResolvedValue(0) },
        audit_log: { count: vi.fn().mockResolvedValue(0) },
        subscriptions: { count: vi.fn().mockResolvedValue(0) },
      },
    }))
    vi.doMock('@/lib/rate-limit', () => ({
      cronRateLimit: {},
      checkoutRateLimit: null,
      contactRateLimit: null,
      getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
      applyRateLimit: vi.fn().mockResolvedValue({ limited: true, retryAfter: 60 }),
    }))
    const { GET } = await import('@/app/api/cron/daily-report/route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(429)
  })
})
