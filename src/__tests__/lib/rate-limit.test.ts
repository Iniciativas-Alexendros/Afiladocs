import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock @upstash/ratelimit and @upstash/redis before importing the module
vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: vi.fn().mockImplementation(() => ({
    limit: vi.fn().mockResolvedValue({ success: true, reset: Date.now() + 60000, limit: 10, remaining: 9 }),
  })),
  __esModule: true,
}))

vi.mock('@upstash/redis', () => ({
  Redis: {
    fromEnv: vi.fn().mockReturnValue({}),
  },
  __esModule: true,
}))

describe('applyRateLimit', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('returns not-limited when Redis is not configured (graceful fallback)', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '')
    const { applyRateLimit, checkoutRateLimit } = await import('@/lib/rate-limit')
    const result = await applyRateLimit(checkoutRateLimit, '127.0.0.1')
    expect(result.limited).toBe(false)
    vi.unstubAllEnvs()
  })
})
