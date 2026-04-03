import { describe, it, expect, vi, beforeEach } from 'vitest'
import crypto from 'crypto'

const WEBHOOK_SECRET = 'test-docuseal-secret'

const mockFindFirst = vi.fn()
const mockDocUpdate = vi.fn()
const mockOrderUpdate = vi.fn()
const mockAuditCreate = vi.fn()
const mockUpload = vi.fn()
const mockGetDocumentPdf = vi.fn()
const mockGetUserById = vi.fn()

vi.mock('@/lib/env', () => ({
  serverEnv: {
    docusealWebhookSecret: WEBHOOK_SECRET,
    resendApiKey: 'resend_test',
    resendFromEmail: 'noreply@afiladocs.es',
  },
  publicEnv: { siteUrl: 'http://localhost:3000' },
}))

vi.mock('@/lib/signing', () => ({
  getSigningAdapter: () => ({
    getDocumentPdf: mockGetDocumentPdf,
  }),
}))

vi.mock('@/lib/supabase/service', () => ({
  createServiceRoleClient: () => ({
    storage: {
      from: () => ({ upload: mockUpload }),
    },
    auth: {
      admin: { getUserById: mockGetUserById },
    },
  }),
}))

vi.mock('@/lib/email/send', () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/prisma/client', () => ({
  prisma: {
    documents: { findFirst: mockFindFirst, update: mockDocUpdate },
    orders: { update: mockOrderUpdate },
    audit_log: { create: mockAuditCreate },
  },
}))

function makeSignedRequest(body: string, secret: string) {
  const signature = crypto.createHmac('sha256', secret).update(body).digest('hex')
  return new Request('http://localhost/api/webhooks/docuseal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-docuseal-signature': signature },
    body,
  })
}

describe('POST /api/webhooks/docuseal', () => {
  beforeEach(() => {
    vi.resetModules()
    mockFindFirst.mockResolvedValue({ id: 'doc-1', order_id: 'order-1' })
    mockDocUpdate.mockResolvedValue({ id: 'doc-1' })
    mockOrderUpdate.mockResolvedValue({ id: 'order-1', user_id: 'user-1', product_id: 'AFD-LTK-001' })
    mockAuditCreate.mockResolvedValue({})
    mockUpload.mockResolvedValue({ error: null })
    mockGetDocumentPdf.mockResolvedValue(new ArrayBuffer(1024))
    mockGetUserById.mockResolvedValue({
      data: { user: { email: 'user@test.com', user_metadata: { full_name: 'Test' } } },
    })
  })

  it('returns 401 when signature header is missing', async () => {
    const { POST } = await import('@/app/api/webhooks/docuseal/route')
    const req = new Request('http://localhost/api/webhooks/docuseal', {
      method: 'POST',
      body: JSON.stringify({ event_type: 'form.completed', data: { id: 1 } }),
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 401 when signature is invalid', async () => {
    const { POST } = await import('@/app/api/webhooks/docuseal/route')
    const req = new Request('http://localhost/api/webhooks/docuseal', {
      method: 'POST',
      headers: { 'x-docuseal-signature': 'bad_signature' },
      body: JSON.stringify({ event_type: 'form.completed', data: { id: 1 } }),
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 200 and ignores non-completion events', async () => {
    const { POST } = await import('@/app/api/webhooks/docuseal/route')
    const body = JSON.stringify({ event_type: 'form.viewed', timestamp: new Date().toISOString(), data: { id: 1, status: 'pending' } })
    const req = makeSignedRequest(body, WEBHOOK_SECRET)
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ignored).toBe(true)
  })

  it('processes form.completed event successfully', async () => {
    const { POST } = await import('@/app/api/webhooks/docuseal/route')
    const body = JSON.stringify({
      event_type: 'form.completed',
      timestamp: new Date().toISOString(),
      data: { id: 42, status: 'completed', completed_at: new Date().toISOString() },
    })
    const req = makeSignedRequest(body, WEBHOOK_SECRET)
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
  })
})
