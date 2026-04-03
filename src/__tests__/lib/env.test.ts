import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('env — publicEnv', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('resolveSiteUrl: uses NEXT_PUBLIC_SITE_URL when set', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://afiladocs.com')
    const { publicEnv } = await import('@/lib/env')
    expect(publicEnv.siteUrl).toBe('https://afiladocs.com')
    vi.unstubAllEnvs()
  })

  it('resolveSiteUrl: prepends https:// to VERCEL_URL when no custom domain', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '')
    vi.stubEnv('VERCEL_URL', 'afiladocs.vercel.app')
    const { publicEnv } = await import('@/lib/env')
    expect(publicEnv.siteUrl).toBe('https://afiladocs.vercel.app')
    vi.unstubAllEnvs()
  })

  it('resolveSiteUrl: falls back to localhost in development', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '')
    vi.stubEnv('VERCEL_URL', '')
    const { publicEnv } = await import('@/lib/env')
    expect(publicEnv.siteUrl).toBe('http://localhost:3000')
    vi.unstubAllEnvs()
  })
})

describe('env — serverEnv lazy getters', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('optional getters return empty string when not set', async () => {
    vi.stubEnv('N8N_CONTACT_WEBHOOK_URL', '')
    const { serverEnv } = await import('@/lib/env')
    expect(serverEnv.n8nContactWebhook).toBe('')
    vi.unstubAllEnvs()
  })

  it('signingProvider defaults to docuseal when not set', async () => {
    vi.stubEnv('SIGNING_PROVIDER', '')
    const { serverEnv } = await import('@/lib/env')
    expect(serverEnv.signingProvider).toBe('docuseal')
    vi.unstubAllEnvs()
  })

  it('signingProvider returns value when explicitly set', async () => {
    vi.stubEnv('SIGNING_PROVIDER', 'documenso')
    const { serverEnv } = await import('@/lib/env')
    expect(serverEnv.signingProvider).toBe('documenso')
    vi.unstubAllEnvs()
  })
})
