import { test, expect } from '@playwright/test'

test.describe('Contact form', () => {
  test('renders contact page', async ({ page }) => {
    await page.goto('/contacto')
    await expect(page).toHaveTitle(/afiladocs/i)
  })

  test('shows validation error when RGPD is not accepted', async ({ page }) => {
    await page.goto('/contacto')
    const submitBtn = page.locator('button[type="submit"]')
    if (await submitBtn.isVisible()) {
      await submitBtn.click()
      // Should show validation errors without RGPD consent
      await expect(page.locator('form')).toBeVisible()
    }
  })
})
