import { test, expect } from '@playwright/test'
import { dismissCookieBannerIfPresent } from './helpers'

test.describe('Hero mascot visibility with cookie consent', () => {
  test('mascot stays visible after accepting cookies', async ({ page }) => {
    await page.setViewportSize({ width: 1736, height: 768 })
    await page.goto('/')

    const mascot = page.locator('img[alt="Gifteez mascotte - vrolijk cadeau karakter"]')
    await mascot.waitFor({ state: 'visible' })

  await dismissCookieBannerIfPresent(page)

    await expect(mascot).toBeVisible()

    await page.reload()

    await expect(mascot).toBeVisible()
  })
})
