import { describe, it, expect, vi, beforeEach } from 'vitest'
import crypto from 'crypto'

const WEBHOOK_SECRET = 'test-documenso-secret'

const mockFindFirst = vi.fn()
const mockDocUpdate = vi.fn()
const mockOrderUpdate = vi.fn()
const mockAuditCreate = vi.fn()

vi.mock('@/lib/env', () => ({
  serverEnv: {
    documensoWebhookSecret: WEBHOOK_SECRET,
  },
  publicEnv: { siteUrl: 'http://localhost:3000' },
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
  return new Request('http://localhost/api/webhooks/documenso', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'documenso-signature': signature },
    body,
  })
}

describe('POST /api/webhooks/documenso', () => {
  beforeEach(() => {
    vi.resetModules()
    mockFindFirst.mockResolvedValue({ id: 'doc-1', order_id: 'order-1' })
    mockDocUpdate.mockResolvedValue({ id: 'doc-1' })
    mockOrderUpdate.mockResolvedValue({ id: 'order-1', user_id: 'user-1' })
    mockAuditCreate.mockResolvedValue({})
  })

  it('returns 401 when signature is missing', async () => {
    const { POST } = await import('@/app/api/webhooks/documenso/route')
    const req = new Request('http://localhost/api/webhooks/documenso', {
      method: 'POST',
      body: '{}',
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 401 when HMAC signature is invalid', async () => {
    const { POST } = await import('@/app/api/webhooks/documenso/route')
    const req = new Request('http://localhost/api/webhooks/documenso', {
      method: 'POST',
      headers: { 'documenso-signature': 'invalid' },
      body: '{"event":"DOCUMENT_COMPLETED","documentId":"123"}',
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 200 and ignores non-DOCUMENT_COMPLETED events', async () => {
    const { POST } = await import('@/app/api/webhooks/documenso/route')
    const body = JSON.stringify({ event: 'DOCUMENT_SENT', documentId: '123' })
    const req = makeSignedRequest(body, WEBHOOK_SECRET)
    const res = await POST(req)
    expect(res.status).toBe(200)
  })

  it('processes DOCUMENT_COMPLETED event successfully', async () => {
    const { POST } = await import('@/app/api/webhooks/documenso/route')
    const body = JSON.stringify({ event: 'DOCUMENT_COMPLETED', documentId: '123' })
    const req = makeSignedRequest(body, WEBHOOK_SECRET)
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
  })
})
