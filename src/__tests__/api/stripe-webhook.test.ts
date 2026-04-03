import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/env', () => ({
  serverEnv: {
    stripeSecretKey: 'sk_test_123',
    stripeWebhookSecret: 'whsec_test',
    resendApiKey: 'resend_test',
    resendFromEmail: 'noreply@afiladocs.es',
    easyVerifactuApiUrl: '',
    easyVerifactuApiKey: '',
  },
  publicEnv: { siteUrl: 'http://localhost:3000' },
}))

vi.mock('@/lib/email/send', () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/prisma/client', () => ({
  prisma: {
    orders: { update: vi.fn().mockResolvedValue({ id: 'order-1', user_id: 'user-1' }) },
    audit_log: { create: vi.fn().mockResolvedValue({}) },
  },
}))

// Mock Stripe using a class so `new Stripe(...)` works correctly
vi.mock('stripe', () => {
  class MockStripe {
    webhooks = {
      constructEventAsync: vi.fn().mockRejectedValue(new Error('Signature verification failed')),
    }
  }
  return { default: MockStripe }
})

describe('POST /api/webhooks/stripe', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('returns 400 when stripe-signature header is missing', async () => {
    const { POST } = await import('@/app/api/webhooks/stripe/route')
    const req = new Request('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      body: '{}',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when Stripe signature verification fails', async () => {
    const { POST } = await import('@/app/api/webhooks/stripe/route')
    const req = new Request('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      headers: { 'stripe-signature': 'bad_sig' },
      body: '{}',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
