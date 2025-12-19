
import { test, expect } from '@playwright/test';

test('Page load verification', async ({ page }) => {
  test.setTimeout(180000); // 3 minutes test timeout

  // Navigate to the page with a longer navigation timeout
  await page.goto('http://localhost:5173', { timeout: 120000 }); // 2 minutes

  // Wait for the main content to be visible to ensure the page is loaded
  await expect(page.locator('main')).toBeVisible({ timeout: 60000 }); // 1 minute

  // Take a screenshot of the whole page
  await page.screenshot({ path: '/home/jules/verification/screenshot.png', fullPage: true });
});
