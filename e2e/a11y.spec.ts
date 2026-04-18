import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const RULES_WCAG_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

async function scan(page: import('@playwright/test').Page, url: string) {
  await page.goto(url, { waitUntil: 'networkidle' })
  const results = await new AxeBuilder({ page })
    .withTags(RULES_WCAG_AA)
    .disableRules(['region'])
    .analyze()
  return results
}

test.describe('Accesibilidad · WCAG 2.1 AA baseline', () => {
  test('/ (home) sin violaciones críticas', async ({ page }) => {
    const { violations } = await scan(page, '/')
    const critical = violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')
    expect(critical, JSON.stringify(critical, null, 2)).toEqual([])
  })

  test('/tienda sin violaciones críticas', async ({ page }) => {
    const { violations } = await scan(page, '/tienda')
    const critical = violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')
    expect(critical, JSON.stringify(critical, null, 2)).toEqual([])
  })

  test('/login sin violaciones críticas', async ({ page }) => {
    const { violations } = await scan(page, '/login')
    const critical = violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')
    expect(critical, JSON.stringify(critical, null, 2)).toEqual([])
  })

  test('/contacto sin violaciones críticas', async ({ page }) => {
    const { violations } = await scan(page, '/contacto')
    const critical = violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')
    expect(critical, JSON.stringify(critical, null, 2)).toEqual([])
  })
})
