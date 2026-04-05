import { test, expect } from '@playwright/test'

test.describe('Cron endpoints', () => {
  test.describe('cleanup-expired-sessions', () => {
    test('returns 401 or 503 without authorization', async ({ page }) => {
      const res = await page.request.get('/api/cron/cleanup-expired-sessions')
      expect([401, 503]).toContain(res.status())
    })

    test('returns 401 or 503 with wrong token', async ({ page }) => {
      const res = await page.request.get('/api/cron/cleanup-expired-sessions', {
        headers: { authorization: 'Bearer wrong-token' },
      })
      expect([401, 503]).toContain(res.status())
    })
  })

  test.describe('subscription-reminders', () => {
    test('returns 401 or 503 without authorization', async ({ page }) => {
      const res = await page.request.get('/api/cron/subscription-reminders')
      expect([401, 503]).toContain(res.status())
    })

    test('returns 401 or 503 with wrong token', async ({ page }) => {
      const res = await page.request.get('/api/cron/subscription-reminders', {
        headers: { authorization: 'Bearer wrong-token' },
      })
      expect([401, 503]).toContain(res.status())
    })
  })

  test.describe('with valid CRON_SECRET', () => {
    const cronSecret = process.env.CRON_SECRET
    const conditionalTest = cronSecret ? test : test.skip

    conditionalTest('cleanup-expired-sessions returns 200 with valid token', async ({ page }) => {
      const res = await page.request.get('/api/cron/cleanup-expired-sessions', {
        headers: { authorization: `Bearer ${cronSecret}` },
      })
      expect(res.status()).toBe(200)
      const json = await res.json()
      expect(json.ok).toBe(true)
    })

    conditionalTest('subscription-reminders returns 200 with valid token', async ({ page }) => {
      const res = await page.request.get('/api/cron/subscription-reminders', {
        headers: { authorization: `Bearer ${cronSecret}` },
      })
      expect(res.status()).toBe(200)
      const json = await res.json()
      expect(json.ok).toBe(true)
    })
  })
})
