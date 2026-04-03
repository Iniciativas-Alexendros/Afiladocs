import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/rate-limit', () => ({
  checkoutRateLimit: null,
  contactRateLimit: null,
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
  applyRateLimit: vi.fn().mockResolvedValue({ limited: false }),
}))

vi.mock('@/lib/stripe/client', () => ({
  getProductPriceMap: vi.fn().mockReturnValue({
    'AFD-LTK-001': 'price_test_ltk',
    'AFD-PCK-001': 'price_test_pck',
  }),
}))

vi.mock('@/lib/env', () => ({
  serverEnv: {
    stripeSecretKey: 'sk_test_123',
    stripeWebhookSecret: 'whsec_test',
  },
  publicEnv: { siteUrl: 'http://localhost:3000' },
}))

// Mock Stripe as a class constructor
vi.mock('stripe', () => {
  const mockStripe = vi.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/test' }),
      },
    },
  }))
  return { default: mockStripe }
})

function makeRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/checkout', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('returns 400 when items array is empty', async () => {
    const { POST } = await import('@/app/api/checkout/route')
    const req = makeRequest({ items: [], successUrl: 'http://localhost/ok', cancelUrl: 'http://localhost/cancel' })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when price ID is not in whitelist', async () => {
    const { POST } = await import('@/app/api/checkout/route')
    const req = makeRequest({
      items: [{ priceId: 'price_not_whitelisted', quantity: 1 }],
      successUrl: 'http://localhost/ok',
      cancelUrl: 'http://localhost/cancel',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 429 when rate limited', async () => {
    vi.doMock('@/lib/rate-limit', () => ({
      checkoutRateLimit: {},
      contactRateLimit: null,
      getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
      applyRateLimit: vi.fn().mockResolvedValue({ limited: true, reset: Date.now() + 60000 }),
    }))
    vi.resetModules()
    const { POST } = await import('@/app/api/checkout/route')
    const req = makeRequest({
      items: [{ price: 'price_test_ltk', quantity: 1 }],
      successUrl: 'http://localhost/ok',
      cancelUrl: 'http://localhost/cancel',
    })
    const res = await POST(req)
    expect(res.status).toBe(429)
  })
})
