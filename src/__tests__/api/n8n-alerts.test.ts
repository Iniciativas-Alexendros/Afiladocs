import { describe, it, expect, vi, beforeEach } from 'vitest'

const WEBHOOK_SECRET = 'test-n8n-secret'

const mockCreateMany = vi.fn()

vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }))

vi.mock('@/lib/env', () => ({
  serverEnv: {
    n8nAlertsWebhookSecret: WEBHOOK_SECRET,
    resendApiKey: 'resend_test',
    resendFromEmail: 'noreply@afiladocs.com',
    opsEmail: 'ops@afiladocs.com',
  },
  publicEnv: { siteUrl: 'http://localhost:3000' },
}))

vi.mock('@/lib/prisma/client', () => ({
  prisma: {
    monitor_alerts: { createMany: mockCreateMany },
  },
}))

vi.mock('@/lib/email/send', () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}))

const VALID_ALERT = {
  source: 'BOE',
  title: 'Nueva normativa fiscal 2026',
  urgency: 'media' as const,
}

function makeRequest(body: unknown, headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/webhooks/n8n-alerts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1', ...headers },
    body: JSON.stringify(body),
  })
}

function doMockDefaultEnv() {
  vi.doMock('@/lib/env', () => ({
    serverEnv: {
      n8nAlertsWebhookSecret: WEBHOOK_SECRET,
      resendApiKey: 'resend_test',
      resendFromEmail: 'noreply@afiladocs.com',
      opsEmail: 'ops@afiladocs.com',
    },
    publicEnv: { siteUrl: 'http://localhost:3000' },
  }))
}

describe('POST /api/webhooks/n8n-alerts', () => {
  beforeEach(() => {
    vi.resetModules()
    mockCreateMany.mockResolvedValue({ count: 1 })
  })

  // Auth failures — use top-level vi.mock (secret is set)
  it('returns 401 when Authorization header is missing', async () => {
    const { POST } = await import('@/app/api/webhooks/n8n-alerts/route')
    const res = await POST(makeRequest(VALID_ALERT))
    expect(res.status).toBe(401)
  })

  it('returns 401 when Bearer token is invalid', async () => {
    const { POST } = await import('@/app/api/webhooks/n8n-alerts/route')
    const res = await POST(makeRequest(VALID_ALERT, { authorization: 'Bearer wrong-token' }))
    expect(res.status).toBe(401)
  })

  it('returns 401 when Authorization scheme is malformed (no token after space)', async () => {
    const { POST } = await import('@/app/api/webhooks/n8n-alerts/route')
    // split(' ') on 'Bearer' gives ['Bearer'] → token=undefined → false
    const res = await POST(makeRequest(VALID_ALERT, { authorization: 'Bearer' }))
    expect(res.status).toBe(401)
  })

  // Success and validation cases — use top-level vi.mock (come before doMock tests)
  it('returns 422 when payload fails schema validation', async () => {
    const { POST } = await import('@/app/api/webhooks/n8n-alerts/route')
    const res = await POST(makeRequest({ invalid: true }, { authorization: `Bearer ${WEBHOOK_SECRET}` }))
    expect(res.status).toBe(422)
  })

  it('returns 200 with valid single alert and stores it', async () => {
    const { POST } = await import('@/app/api/webhooks/n8n-alerts/route')
    const res = await POST(makeRequest(VALID_ALERT, { authorization: `Bearer ${WEBHOOK_SECRET}` }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.received).toBe(true)
    expect(json.count).toBe(1)
  })

  it('returns 200 with valid batched alerts array', async () => {
    const { POST } = await import('@/app/api/webhooks/n8n-alerts/route')
    const batch = [VALID_ALERT, { source: 'DOUE', title: 'Directiva europea', urgency: 'baja' as const }]
    const res = await POST(makeRequest(batch, { authorization: `Bearer ${WEBHOOK_SECRET}` }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.received).toBe(true)
  })

  it('sends email to ops for high-urgency alerts', async () => {
    const { POST } = await import('@/app/api/webhooks/n8n-alerts/route')
    const highAlert = { source: 'BOE', title: 'Urgencia máxima', urgency: 'alta' as const }
    const res = await POST(makeRequest(highAlert, { authorization: `Bearer ${WEBHOOK_SECRET}` }))
    expect(res.status).toBe(200)

    const { sendEmail } = await import('@/lib/email/send')
    expect(sendEmail).toHaveBeenCalledOnce()
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'ops@afiladocs.com', subject: expect.stringContaining('URGENTE') })
    )
  })

  it('does not send email for non-urgent alerts', async () => {
    const { POST } = await import('@/app/api/webhooks/n8n-alerts/route')
    const res = await POST(makeRequest(VALID_ALERT, { authorization: `Bearer ${WEBHOOK_SECRET}` }))
    expect(res.status).toBe(200)

    const { sendEmail } = await import('@/lib/email/send')
    expect(sendEmail).not.toHaveBeenCalled()
  })

  // Misconfiguration — uses doMock (comes LAST to avoid contaminating previous tests)
  it('returns 503 when N8N_ALERTS_WEBHOOK_SECRET is not configured', async () => {
    vi.doMock('@/lib/env', () => ({
      serverEnv: { n8nAlertsWebhookSecret: '', opsEmail: 'ops@afiladocs.com', resendApiKey: 'test', resendFromEmail: 'noreply@afiladocs.com' },
      publicEnv: { siteUrl: 'http://localhost:3000' },
    }))
    const { POST } = await import('@/app/api/webhooks/n8n-alerts/route')
    const res = await POST(makeRequest(VALID_ALERT, { authorization: `Bearer ${WEBHOOK_SECRET}` }))
    expect(res.status).toBe(503)
  })

  // Restore default env for any tests after the doMock above
  it('correct Bearer scheme enforcement (split not replace)', async () => {
    doMockDefaultEnv()
    const { POST } = await import('@/app/api/webhooks/n8n-alerts/route')
    // "BearerTOKEN" (no space) → split gives ['BearerTOKEN'] → scheme !== 'Bearer' → false
    const res = await POST(makeRequest(VALID_ALERT, { authorization: `Bearer${WEBHOOK_SECRET}` }))
    expect(res.status).toBe(401)
  })
})
