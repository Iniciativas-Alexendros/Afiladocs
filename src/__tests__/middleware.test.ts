import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockBlockedCountries: { value: string[] } = { value: [] }

vi.mock('@/lib/env', () => ({
  serverEnv: {
    get geoBlockedCountries() {
      return mockBlockedCountries.value
    },
  },
  publicEnv: { supabaseUrl: 'http://localhost', supabaseAnonKey: 'anon' },
}))

vi.mock('@/lib/supabase/middleware', () => ({
  updateSession: vi.fn(async (_req: NextRequest, headers?: Headers) => {
    const { NextResponse } = await import('next/server')
    const res = NextResponse.next({ request: { headers: headers ?? new Headers() } })
    return res
  }),
}))

function makeRequest(url: string, headers: Record<string, string> = {}) {
  return new NextRequest(new URL(url, 'http://localhost:3000'), {
    headers: new Headers(headers),
  })
}

describe('middleware', () => {
  beforeEach(() => {
    mockBlockedCountries.value = []
  })

  it('blocks suspicious paths with path traversal pattern', async () => {
    const { middleware } = await import('../../middleware')
    const res = await middleware(makeRequest('/api/%2E%2E%2Fetc%2Fpasswd'))
    expect(res.status).toBe(403)
  })

  it('blocks sqlmap UA on /api routes', async () => {
    const { middleware } = await import('../../middleware')
    const res = await middleware(
      makeRequest('/api/contact', { 'user-agent': 'sqlmap/1.7' }),
    )
    expect(res.status).toBe(403)
  })

  it('allows Googlebot on /api routes', async () => {
    const { middleware } = await import('../../middleware')
    const res = await middleware(
      makeRequest('/api/contact', {
        'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      }),
    )
    expect(res.status).not.toBe(403)
  })

  it('skips bot detection on webhook routes', async () => {
    const { middleware } = await import('../../middleware')
    const res = await middleware(
      makeRequest('/api/webhooks/stripe', { 'user-agent': 'curl/8.0' }),
    )
    expect(res.status).not.toBe(403)
  })

  it('emits CSP with nonce and x-nonce header on normal requests', async () => {
    const { middleware } = await import('../../middleware')
    const res = await middleware(makeRequest('/'))
    const nonce = res.headers.get('x-nonce')
    expect(nonce).toBeTruthy()
    expect(nonce!.length).toBeGreaterThan(10)
    const csp = res.headers.get('Content-Security-Policy')
    expect(csp).toBeTruthy()
    expect(csp).toContain(`'nonce-${nonce}'`)
    expect(csp).not.toContain("'unsafe-inline' https://js.stripe.com")
  })

  it('blocks geo when country is in GEO_BLOCKED_COUNTRIES', async () => {
    mockBlockedCountries.value = ['RU']
    const { middleware } = await import('../../middleware')
    const res = await middleware(
      makeRequest('/', { 'x-vercel-ip-country': 'RU' }),
    )
    expect(res.status).toBe(403)
  })

  it('allows country not in block list', async () => {
    mockBlockedCountries.value = ['RU']
    const { middleware } = await import('../../middleware')
    const res = await middleware(
      makeRequest('/', { 'x-vercel-ip-country': 'ES' }),
    )
    expect(res.status).not.toBe(403)
  })
})
