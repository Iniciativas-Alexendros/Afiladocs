import { test, expect } from '@playwright/test'

test.describe('Shop and checkout', () => {
  test('tienda page loads and shows products', async ({ page }) => {
    await page.goto('/tienda')
    await expect(page).toHaveTitle(/afiladocs/i)
    // Products should be visible
    await expect(page.locator('[data-testid="product-card"], .product-card, article').first()).toBeVisible()
  })

  test('home page renders hero section', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/afiladocs/i)
    // Hero or main content should be visible
    await expect(page.locator('main')).toBeVisible()
  })

  test('health endpoint returns ok', async ({ page }) => {
    const res = await page.request.get('/api/health')
    expect(res.status()).toBe(200)
    const json = await res.json()
    expect(json.status).toBe('ok')
  })
})
