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
    subscriptions: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: 'sub-1',
          user_id: 'user-1',
          product_id: 'AFD-LTK-001',
          status: 'active',
          updated_at: new Date('2024-01-01'),
          user: { full_name: 'Test User' },
        },
      ]),
    },
  },
}))

vi.mock('@/lib/supabase/service', () => ({
  createServiceRoleClient: vi.fn().mockReturnValue({
    auth: {
      admin: {
        getUserById: vi.fn().mockResolvedValue({
          data: { user: { email: 'test@example.com' } },
        }),
      },
    },
  }),
}))

vi.mock('@/lib/email/send', () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/emails/subscription-active', () => ({
  default: vi.fn(),
}))

function makeRequest(headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/cron/subscription-reminders', {
    method: 'GET',
    headers: { 'x-forwarded-for': '127.0.0.1', ...headers },
  })
}

// Individual helpers to re-establish default mocks in doMock tests
function doMockDefaultRateLimit() {
  vi.doMock('@/lib/rate-limit', () => ({
    cronRateLimit: null,
    checkoutRateLimit: null,
    contactRateLimit: null,
    getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
    applyRateLimit: vi.fn().mockResolvedValue({ limited: false }),
  }))
}

function doMockDefaultEnv() {
  vi.doMock('@/lib/env', () => ({
    serverEnv: { cronSecret: 'test-cron-secret' },
    publicEnv: { siteUrl: 'http://localhost:3000' },
  }))
}

function doMockDefaultPrisma() {
  vi.doMock('@/lib/prisma/client', () => ({
    prisma: {
      subscriptions: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'sub-1',
            user_id: 'user-1',
            product_id: 'AFD-LTK-001',
            status: 'active',
            updated_at: new Date('2024-01-01'),
            user: { full_name: 'Test User' },
          },
        ]),
      },
    },
  }))
}

function doMockDefaultSupabase() {
  vi.doMock('@/lib/supabase/service', () => ({
    createServiceRoleClient: vi.fn().mockReturnValue({
      auth: {
        admin: {
          getUserById: vi.fn().mockResolvedValue({
            data: { user: { email: 'test@example.com' } },
          }),
        },
      },
    }),
  }))
}

function doMockDefaultEmail() {
  vi.doMock('@/lib/email/send', () => ({
    sendEmail: vi.fn().mockResolvedValue(undefined),
  }))
}

function doMockDefaultTemplate() {
  vi.doMock('@/emails/subscription-active', () => ({
    default: vi.fn(),
  }))
}

describe('GET /api/cron/subscription-reminders', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()
  })

  it('returns 401 when authorization header is missing', async () => {
    const { GET } = await import('@/app/api/cron/subscription-reminders/route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(401)
  })

  it('returns 401 when bearer token does not match', async () => {
    const { GET } = await import('@/app/api/cron/subscription-reminders/route')
    const res = await GET(makeRequest({ authorization: 'Bearer wrong-token' }))
    expect(res.status).toBe(401)
  })

  it('returns 200 and sends emails on success', async () => {
    const { GET } = await import('@/app/api/cron/subscription-reminders/route')
    const res = await GET(makeRequest({ authorization: 'Bearer test-cron-secret' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ ok: true, emailsSent: 1 })

    const { sendEmail } = await import('@/lib/email/send')
    expect(sendEmail).toHaveBeenCalledTimes(1)
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@example.com',
        subject: expect.stringContaining('renovación'),
      })
    )
  })

  it('returns 503 when CRON_SECRET is not configured', async () => {
    doMockDefaultRateLimit()
    doMockDefaultPrisma()
    doMockDefaultSupabase()
    doMockDefaultEmail()
    doMockDefaultTemplate()
    vi.doMock('@/lib/env', () => ({
      serverEnv: { cronSecret: undefined },
      publicEnv: { siteUrl: 'http://localhost:3000' },
    }))
    const { GET } = await import('@/app/api/cron/subscription-reminders/route')
    const res = await GET(makeRequest({ authorization: 'Bearer test-cron-secret' }))
    expect(res.status).toBe(503)
  })

  it('returns 200 with 0 emails when no subscriptions found', async () => {
    doMockDefaultRateLimit()
    doMockDefaultEnv()
    doMockDefaultSupabase()
    doMockDefaultEmail()
    doMockDefaultTemplate()
    vi.doMock('@/lib/prisma/client', () => ({
      prisma: {
        subscriptions: {
          findMany: vi.fn().mockResolvedValue([]),
        },
      },
    }))
    const { GET } = await import('@/app/api/cron/subscription-reminders/route')
    const res = await GET(makeRequest({ authorization: 'Bearer test-cron-secret' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ ok: true, emailsSent: 0 })
  })

  it('continues processing when individual email fails', async () => {
    const { GET } = await import('@/app/api/cron/subscription-reminders/route')
    const { sendEmail } = (await import('@/lib/email/send')) as unknown as { sendEmail: ReturnType<typeof vi.fn> }
    sendEmail.mockRejectedValue(new Error('Email service down'))
    const res = await GET(makeRequest({ authorization: 'Bearer test-cron-secret' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.emailsSent).toBe(0)
  })

  it('skips subscription when Supabase returns no email', async () => {
    doMockDefaultRateLimit()
    doMockDefaultEnv()
    doMockDefaultPrisma()
    doMockDefaultEmail()
    doMockDefaultTemplate()
    vi.doMock('@/lib/supabase/service', () => ({
      createServiceRoleClient: vi.fn().mockReturnValue({
        auth: {
          admin: {
            getUserById: vi.fn().mockResolvedValue({
              data: { user: { email: null } },
            }),
          },
        },
      }),
    }))
    const { GET } = await import('@/app/api/cron/subscription-reminders/route')
    const res = await GET(makeRequest({ authorization: 'Bearer test-cron-secret' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ ok: true, emailsSent: 0 })
  })

  it('returns 500 when database query fails', async () => {
    doMockDefaultRateLimit()
    doMockDefaultEnv()
    doMockDefaultSupabase()
    doMockDefaultEmail()
    doMockDefaultTemplate()
    vi.doMock('@/lib/prisma/client', () => ({
      prisma: {
        subscriptions: {
          findMany: vi.fn().mockRejectedValue(new Error('DB error')),
        },
      },
    }))
    const { GET } = await import('@/app/api/cron/subscription-reminders/route')
    const res = await GET(makeRequest({ authorization: 'Bearer test-cron-secret' }))
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBe('Cron failed')
  })

  it('returns 429 when rate limited', async () => {
    doMockDefaultEnv()
    doMockDefaultPrisma()
    doMockDefaultSupabase()
    doMockDefaultEmail()
    doMockDefaultTemplate()
    vi.doMock('@/lib/rate-limit', () => ({
      cronRateLimit: {},
      checkoutRateLimit: null,
      contactRateLimit: null,
      getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
      applyRateLimit: vi.fn().mockResolvedValue({ limited: true, retryAfter: 60 }),
    }))
    const { GET } = await import('@/app/api/cron/subscription-reminders/route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(429)
  })
})
