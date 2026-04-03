import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('login page renders correctly', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveTitle(/afiladocs/i)
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('registro page renders correctly', async ({ page }) => {
    await page.goto('/registro')
    await expect(page).toHaveTitle(/afiladocs/i)
    await expect(page.locator('form')).toBeVisible()
  })

  test('portal redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/portal')
    // Should redirect to login
    await expect(page).toHaveURL(/login/)
  })
})
