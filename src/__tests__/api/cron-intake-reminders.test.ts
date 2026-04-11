import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFindMany = vi.fn()
const mockGetUserById = vi.fn()

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
    orders: { findMany: mockFindMany },
  },
}))

vi.mock('@/lib/supabase/service', () => ({
  createServiceRoleClient: vi.fn().mockReturnValue({
    auth: { admin: { getUserById: mockGetUserById } },
  }),
}))

vi.mock('@/lib/email/send', () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/emails/intake-required', () => ({ IntakeRequiredEmail: vi.fn() }))
vi.mock('@/lib/alerts/notify-ops', () => ({ notifyOpsError: vi.fn() }))

function makeRequest(headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/cron/intake-reminders', {
    method: 'GET',
    headers: { 'x-forwarded-for': '127.0.0.1', ...headers },
  })
}

function doMockDefaultEnv() {
  vi.doMock('@/lib/env', () => ({
    serverEnv: { cronSecret: 'test-cron-secret' },
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

function doMockDefaultPrisma() {
  vi.doMock('@/lib/prisma/client', () => ({
    prisma: { orders: { findMany: mockFindMany } },
  }))
}

function doMockDefaultSupabase() {
  vi.doMock('@/lib/supabase/service', () => ({
    createServiceRoleClient: vi.fn().mockReturnValue({
      auth: { admin: { getUserById: mockGetUserById } },
    }),
  }))
}

describe('GET /api/cron/intake-reminders', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()
    mockFindMany.mockResolvedValue([
      { id: 'order-1', user_id: 'user-1', product_id: 'AFD-LTK-001', user: { full_name: 'Test User' } },
    ])
    mockGetUserById.mockResolvedValue({
      data: { user: { email: 'test@example.com' } },
    })
  })

  // Auth failures — use top-level vi.mock defaults
  it('returns 401 when authorization header is missing', async () => {
    const { GET } = await import('@/app/api/cron/intake-reminders/route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(401)
  })

  it('returns 401 when bearer token does not match', async () => {
    const { GET } = await import('@/app/api/cron/intake-reminders/route')
    const res = await GET(makeRequest({ authorization: 'Bearer wrong-token' }))
    expect(res.status).toBe(401)
  })

  // Success — uses top-level vi.mock (before any doMock tests)
  it('returns 200 and sends emails on success', async () => {
    const { GET } = await import('@/app/api/cron/intake-reminders/route')
    const res = await GET(makeRequest({ authorization: 'Bearer test-cron-secret' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ ok: true, emailsSent: 1 })

    const { sendEmail } = await import('@/lib/email/send')
    expect(sendEmail).toHaveBeenCalledOnce()
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'test@example.com' })
    )
  })

  // Error / edge cases — use doMock (come AFTER success tests)
  it('returns 200 with 0 emails when no orders found', async () => {
    doMockDefaultRateLimit()
    doMockDefaultEnv()
    doMockDefaultSupabase()
    vi.doMock('@/lib/prisma/client', () => ({
      prisma: { orders: { findMany: vi.fn().mockResolvedValue([]) } },
    }))
    const { GET } = await import('@/app/api/cron/intake-reminders/route')
    const res = await GET(makeRequest({ authorization: 'Bearer test-cron-secret' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ ok: true, emailsSent: 0 })
  })

  it('skips order when Supabase returns no email', async () => {
    doMockDefaultRateLimit()
    doMockDefaultEnv()
    doMockDefaultPrisma()
    vi.doMock('@/lib/supabase/service', () => ({
      createServiceRoleClient: vi.fn().mockReturnValue({
        auth: { admin: { getUserById: vi.fn().mockResolvedValue({ data: { user: { email: null } } }) } },
      }),
    }))
    const { GET } = await import('@/app/api/cron/intake-reminders/route')
    const res = await GET(makeRequest({ authorization: 'Bearer test-cron-secret' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ ok: true, emailsSent: 0 })
  })

  it('returns 503 when CRON_SECRET is not configured', async () => {
    doMockDefaultRateLimit()
    doMockDefaultPrisma()
    doMockDefaultSupabase()
    vi.doMock('@/lib/env', () => ({
      serverEnv: { cronSecret: undefined },
      publicEnv: { siteUrl: 'http://localhost:3000' },
    }))
    const { GET } = await import('@/app/api/cron/intake-reminders/route')
    const res = await GET(makeRequest({ authorization: 'Bearer test-cron-secret' }))
    expect(res.status).toBe(503)
  })

  it('returns 500 when database query fails', async () => {
    doMockDefaultRateLimit()
    doMockDefaultEnv()
    doMockDefaultSupabase()
    vi.doMock('@/lib/prisma/client', () => ({
      prisma: { orders: { findMany: vi.fn().mockRejectedValue(new Error('DB error')) } },
    }))
    const { GET } = await import('@/app/api/cron/intake-reminders/route')
    const res = await GET(makeRequest({ authorization: 'Bearer test-cron-secret' }))
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBe('Cron failed')
  })

  it('returns 429 when rate limited', async () => {
    doMockDefaultEnv()
    doMockDefaultPrisma()
    doMockDefaultSupabase()
    vi.doMock('@/lib/rate-limit', () => ({
      cronRateLimit: {},
      checkoutRateLimit: null,
      contactRateLimit: null,
      getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
      applyRateLimit: vi.fn().mockResolvedValue({ limited: true, retryAfter: 60 }),
    }))
    const { GET } = await import('@/app/api/cron/intake-reminders/route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(429)
  })
})
