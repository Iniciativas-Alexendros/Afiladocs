import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/rate-limit', () => ({
  contactRateLimit: null,
  checkoutRateLimit: null,
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
  applyRateLimit: vi.fn().mockResolvedValue({ limited: false }),
}))

vi.mock('@/lib/env', () => ({
  serverEnv: {
    n8nContactWebhook: '',
    resendFromEmail: 'noreply@afiladocs.com',
  },
  publicEnv: { siteUrl: 'http://localhost:3000' },
}))

function makeRequest(body: Record<string, unknown>, headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1', ...headers },
    body: JSON.stringify(body),
  })
}

describe('POST /api/contact', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('returns 400 when rgpd_accepted is false', async () => {
    const { POST } = await import('@/app/api/contact/route')
    const req = makeRequest({
      name: 'Test User',
      email: 'test@example.com',
      case_type: 'Consulta',
      message: 'Hello',
      rgpd_accepted: false,
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when required fields are missing', async () => {
    const { POST } = await import('@/app/api/contact/route')
    const req = makeRequest({ name: 'Test' })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 429 when rate limit is exceeded', async () => {
    vi.doMock('@/lib/rate-limit', () => ({
      contactRateLimit: {},
      checkoutRateLimit: null,
      getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
      applyRateLimit: vi.fn().mockResolvedValue({ limited: true, reset: Date.now() + 60000 }),
    }))
    vi.resetModules()
    const { POST } = await import('@/app/api/contact/route')
    const req = makeRequest({
      name: 'Test User',
      email: 'test@example.com',
      case_type: 'Consulta',
      message: 'Hello',
      rgpd_accepted: true,
    })
    const res = await POST(req)
    expect(res.status).toBe(429)
  })
})
