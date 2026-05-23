import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFindFirst = vi.fn()
const mockAuditCreate = vi.fn()
const mockAuditFindFirst = vi.fn()
const mockRevalidateTag = vi.fn()

vi.mock('@/lib/env', () => ({
  serverEnv: {
    stripeSecretKey: 'sk_test_123',
    stripeWebhookSecret: 'whsec_test',
    resendApiKey: 'resend_test',
    resendFromEmail: 'noreply@afiladocs.com',
    easyVerifactuApiUrl: '',
    easyVerifactuApiKey: '',
  },
  publicEnv: { siteUrl: 'http://localhost:3000' },
}))

vi.mock('@/lib/email/send', () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
  safeSendEmail: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/prisma/client', () => ({
  prisma: {
    orders: {
      update: vi.fn().mockResolvedValue({ id: 'order-1', user_id: 'user-1' }),
      findFirst: mockFindFirst,
    },
    audit_log: {
      create: mockAuditCreate,
      findFirst: mockAuditFindFirst,
    },
    profiles: {
      findFirst: vi.fn().mockResolvedValue(null),
    },
  },
}))

vi.mock('@/lib/alerts/notify-ops', () => ({ notifyOpsError: vi.fn() }))

vi.mock('next/cache', () => ({ revalidateTag: mockRevalidateTag }))

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
    mockFindFirst.mockResolvedValue(null)
    mockAuditCreate.mockResolvedValue({})
    mockAuditFindFirst.mockResolvedValue(null) // not yet processed
    mockRevalidateTag.mockReset()
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

  it('returns 200 immediately for already-processed event (idempotency)', async () => {
    vi.doMock('@/lib/prisma/client', () => ({
      prisma: {
        orders: { findFirst: mockFindFirst, update: vi.fn() },
        audit_log: {
          create: mockAuditCreate,
          findFirst: vi.fn().mockResolvedValue({ id: 'existing', event: 'stripe_event.evt_123' }),
        },
        profiles: { findFirst: vi.fn().mockResolvedValue(null) },
      },
    }))
    vi.doMock('stripe', () => {
      class MockStripe {
        webhooks = {
          constructEventAsync: vi.fn().mockResolvedValue({
            id: 'evt_123',
            type: 'checkout.session.completed',
            data: { object: { id: 'cs_test', customer_details: { email: 'test@example.com' }, amount_total: 9900, currency: 'eur', metadata: {} } },
          }),
        }
      }
      return { default: MockStripe }
    })
    const { POST } = await import('@/app/api/webhooks/stripe/route')
    const req = new Request('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      headers: { 'stripe-signature': 'valid_sig' },
      body: '{}',
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.received).toBe(true)
    // Email should NOT have been sent for duplicate event
    const { safeSendEmail } = await import('@/lib/email/send')
    expect(safeSendEmail).not.toHaveBeenCalled()
  })

  it('returns 200 and processes checkout.session.completed', async () => {
    vi.doMock('stripe', () => {
      class MockStripe {
        webhooks = {
          constructEventAsync: vi.fn().mockResolvedValue({
            id: 'evt_new',
            type: 'checkout.session.completed',
            data: {
              object: {
                id: 'cs_test',
                customer_details: { email: 'buyer@example.com' },
                amount_total: 9900,
                currency: 'eur',
                metadata: { userId: 'user-1', orderId: 'order-1', productId: 'AFD-LTK-001' },
              },
            },
          }),
        }
      }
      return { default: MockStripe }
    })
    vi.doMock('@/lib/prisma/client', () => ({
      prisma: {
        orders: {
          update: vi.fn().mockResolvedValue({ id: 'order-1', user_id: 'user-1', status: 'intake_pending', product_id: 'AFD-LTK-001' }),
          findFirst: vi.fn().mockResolvedValue({ id: 'order-1', user_id: 'user-1', status: 'intake_pending', product_id: 'AFD-LTK-001', user: { full_name: 'Buyer' } }),
        },
        audit_log: {
          create: mockAuditCreate,
          findFirst: vi.fn().mockResolvedValue(null),
        },
        profiles: { findFirst: vi.fn().mockResolvedValue(null) },
      },
    }))
    const { POST } = await import('@/app/api/webhooks/stripe/route')
    const req = new Request('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      headers: { 'stripe-signature': 'valid_sig' },
      body: '{}',
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.received).toBe(true)

    const { safeSendEmail } = await import('@/lib/email/send')
    expect(safeSendEmail).toHaveBeenCalled()
    // Idempotency record should be created
    expect(mockAuditCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ event: 'stripe_event.evt_new' }) })
    )
    // Granular cache tags must be revalidated so portal/pedidos y /portal/pedido/[id] se refrescan al instante
    expect(mockRevalidateTag).toHaveBeenCalledWith('orders', 'default')
    expect(mockRevalidateTag).toHaveBeenCalledWith('orders-user-1', 'default')
    expect(mockRevalidateTag).toHaveBeenCalledWith('order-order-1', 'default')
  })
})
