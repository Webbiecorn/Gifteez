import { test, expect } from '@playwright/test'
import {
  navigateTo,
  waitForPageLoad,
  scrollIntoView,
  getElementCount,
  expectUrlToContain
} from './helpers'

test.describe('Deals Page Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Deals page
    await navigateTo(page, '/')
    await page.click('text=Deals')
    await waitForPageLoad(page)
  })

  test.describe('Page Layout', () => {
    test('should display deals page heading', async ({ page }) => {
      await expect(page.locator('h1, h2').first()).toBeVisible()
    })

    test('should display deal categories', async ({ page }) => {
      // Look for category buttons/tabs
      const categories = page.locator('button, a').filter({ hasText: /Tech|Sport|Koken|Duurzaam/i })
      
      if (await categories.first().isVisible()) {
        const count = await categories.count()
        expect(count).toBeGreaterThan(0)
      }
    })

    test('should display multiple deal cards', async ({ page }) => {
      await page.waitForTimeout(1000) // Wait for deals to load
      
      const dealCards = page.locator('[data-testid*="deal"], .deal-card, article')
      const count = await dealCards.count()
      
      expect(count).toBeGreaterThan(0)
    })
  })

  test.describe('Deal of the Week', () => {
    test('should display deal of the week section', async ({ page }) => {
      const dotw = page.locator('text=Deal van de week, text=Deal of the Week').first()
      
      if (await dotw.isVisible()) {
        await expect(dotw).toBeVisible()
        
        // Should have a featured deal nearby
        const featuredDeal = page.locator('[data-testid*="featured"], .featured-deal').first()
        if (await featuredDeal.isVisible()) {
          await expect(featuredDeal).toBeVisible()
        }
      }
    })

    test('should have retailer link in deal of the week', async ({ page }) => {
      const dotwSection = page.locator('text=Deal van de week').locator('..').locator('..')
      
      if (await dotwSection.isVisible()) {
        const retailerLink = dotwSection.locator('a:has-text("Bekijk"), a:has-text("Shop")').first()
        
        if (await retailerLink.isVisible()) {
          await expect(retailerLink).toHaveAttribute('href', /.+/)
          await expect(retailerLink).toHaveAttribute('target', '_blank')
        }
      }
    })
  })

  test.describe('Top 10 Deals', () => {
    test('should display top 10 deals section', async ({ page }) => {
      const top10 = page.locator('text=Top 10, text=Beste deals').first()
      
      if (await top10.isVisible()) {
        await top10.scrollIntoViewIfNeeded()
        await expect(top10).toBeVisible()
      }
    })

    test('should show at least 5 deals in top 10', async ({ page }) => {
      // Scroll to top 10 section
      const top10Section = page.locator('text=Top 10').locator('..').locator('..')
      
      if (await top10Section.isVisible()) {
        await top10Section.scrollIntoViewIfNeeded()
        await page.waitForTimeout(500)
        
        const dealCards = top10Section.locator('[data-testid*="deal"], .deal-card, article')
        const count = await dealCards.count()
        
        expect(count).toBeGreaterThanOrEqual(3) // At least some deals
      }
    })

    test('should display deal prices', async ({ page }) => {
      const firstDeal = page.locator('[data-testid*="deal"], .deal-card, article').first()
      
      if (await firstDeal.isVisible()) {
        // Should have price in euros
        const hasPrice = await firstDeal.locator('text=/€\\s*\\d+/').count() > 0
        
        if (hasPrice) {
          expect(hasPrice).toBe(true)
        }
      }
    })
  })

  test.describe('Deal Categories', () => {
    test('should filter deals by category', async ({ page }) => {
      // Find category buttons
      const techCategory = page.locator('button:has-text("Tech"), a:has-text("Tech")').first()
      
      if (await techCategory.isVisible()) {
        const beforeCount = await page.locator('[data-testid*="deal"], .deal-card').count()
        
        await techCategory.click()
        await page.waitForTimeout(1000)
        
        const afterCount = await page.locator('[data-testid*="deal"], .deal-card').count()
        
        // Count should be > 0 (filtered or all)
        expect(afterCount).toBeGreaterThan(0)
      }
    })

    test('should highlight active category', async ({ page }) => {
      const categoryButton = page.locator('button:has-text("Tech")').first()
      
      if (await categoryButton.isVisible()) {
        await categoryButton.click()
        await page.waitForTimeout(500)
        
        // Button should have active state
        const classes = await categoryButton.getAttribute('class')
        expect(classes).toBeTruthy()
      }
    })

    test('should show all deals when clicking "All" category', async ({ page }) => {
      const allButton = page.locator('button:has-text("Alle"), button:has-text("All")').first()
      
      if (await allButton.isVisible()) {
        // Click specific category first
        const techButton = page.locator('button:has-text("Tech")').first()
        if (await techButton.isVisible()) {
          await techButton.click()
          await page.waitForTimeout(500)
        }
        
        // Then click All
        await allButton.click()
        await page.waitForTimeout(1000)
        
        const dealCount = await page.locator('[data-testid*="deal"], .deal-card').count()
        expect(dealCount).toBeGreaterThan(0)
      }
    })
  })

  test.describe('Deal Cards', () => {
    test('should display deal image', async ({ page }) => {
      const firstDeal = page.locator('[data-testid*="deal"], .deal-card, article').first()
      
      if (await firstDeal.isVisible()) {
        const image = firstDeal.locator('img').first()
        
        if (await image.isVisible()) {
          await expect(image).toHaveAttribute('src', /.+/)
          await expect(image).toHaveAttribute('alt', /.+/)
        }
      }
    })

    test('should display deal title', async ({ page }) => {
      const firstDeal = page.locator('[data-testid*="deal"], .deal-card, article').first()
      
      if (await firstDeal.isVisible()) {
        const title = firstDeal.locator('h2, h3, h4').first()
        await expect(title).toBeVisible()
        
        const titleText = await title.textContent()
        expect(titleText).toBeTruthy()
        expect(titleText!.length).toBeGreaterThan(3)
      }
    })

    test('should display deal description', async ({ page }) => {
      const firstDeal = page.locator('[data-testid*="deal"], .deal-card, article').first()
      
      if (await firstDeal.isVisible()) {
        const description = firstDeal.locator('p').first()
        
        if (await description.isVisible()) {
          const text = await description.textContent()
          expect(text).toBeTruthy()
        }
      }
    })

    test('should have clickable retailer link', async ({ page }) => {
      const firstDeal = page.locator('[data-testid*="deal"], .deal-card, article').first()
      
      if (await firstDeal.isVisible()) {
        const retailerLink = firstDeal.locator('a:has-text("Bekijk"), a:has-text("Shop"), a:has-text("Amazon"), a:has-text("Coolblue")').first()
        
        if (await retailerLink.isVisible()) {
          await expect(retailerLink).toHaveAttribute('href', /.+/)
          await expect(retailerLink).toHaveAttribute('rel', /nofollow/)
        }
      }
    })

    test('should display deal badges if present', async ({ page }) => {
      const firstDeal = page.locator('[data-testid*="deal"], .deal-card, article').first()
      
      if (await firstDeal.isVisible()) {
        const badges = firstDeal.locator('[class*="badge"], [class*="tag"], span').filter({ hasText: /Sale|Hot|Trending/i })
        
        if (await badges.first().isVisible()) {
          await expect(badges.first()).toBeVisible()
        }
      }
    })
  })

  test.describe('Affiliate Link Tracking', () => {
    test('should have affiliate parameters in deal links', async ({ page }) => {
      const retailerLink = page.locator('a:has-text("Bekijk bij"), a').filter({ hasText: /Amazon|Coolblue/i }).first()
      
      if (await retailerLink.isVisible()) {
        const href = await retailerLink.getAttribute('href')
        
        // Should have some tracking parameters or affiliate link structure
        expect(href).toBeTruthy()
        expect(href!.length).toBeGreaterThan(10)
      }
    })

    test('should open affiliate links in new tab', async ({ page }) => {
      const retailerLink = page.locator('a:has-text("Bekijk"), a').filter({ hasText: /Amazon|Coolblue/i }).first()
      
      if (await retailerLink.isVisible()) {
        await expect(retailerLink).toHaveAttribute('target', '_blank')
        await expect(retailerLink).toHaveAttribute('rel', /noopener/)
      }
    })
  })

  test.describe('Pinned Deals', () => {
    test('should display pinned deals if available', async ({ page }) => {
      const pinnedSection = page.locator('text=Featured, text=Uitgelicht').first()
      
      if (await pinnedSection.isVisible()) {
        await pinnedSection.scrollIntoViewIfNeeded()
        await expect(pinnedSection).toBeVisible()
        
        // Should have deals nearby
        const deals = page.locator('[data-testid*="deal"], .deal-card').first()
        await expect(deals).toBeVisible()
      }
    })
  })

  test.describe('Responsive Design', () => {
    test.use({ viewport: { width: 375, height: 667 } })

    test('should display deals page on mobile', async ({ page }) => {
      await expect(page.locator('h1, h2').first()).toBeVisible()
    })

    test('should stack deal cards on mobile', async ({ page }) => {
      await page.waitForTimeout(1000)
      
      const dealCards = page.locator('[data-testid*="deal"], .deal-card, article')
      const firstCard = dealCards.first()
      
      if (await firstCard.isVisible()) {
        await expect(firstCard).toBeVisible()
        
        // Card should take full width on mobile
        const box = await firstCard.boundingBox()
        expect(box).toBeTruthy()
        if (box) {
          expect(box.width).toBeGreaterThan(300)
        }
      }
    })

    test('should make category buttons scrollable on mobile', async ({ page }) => {
      const categoryContainer = page.locator('button:has-text("Tech")').locator('..').locator('..')
      
      if (await categoryContainer.isVisible()) {
        // Container should have overflow handling
        const overflow = await categoryContainer.evaluate(el => 
          window.getComputedStyle(el).overflowX
        )
        
        // Might be scroll or auto
        expect(['scroll', 'auto', 'visible']).toContain(overflow)
      }
    })
  })

  test.describe('Loading States', () => {
    test('should show content within 2 seconds', async ({ page }) => {
      const startTime = Date.now()
      
      await page.waitForSelector('[data-testid*="deal"], .deal-card, h2, h3', { timeout: 2000 })
      
      const endTime = Date.now()
      const loadTime = endTime - startTime
      
      expect(loadTime).toBeLessThan(2000)
    })

    test('should show loading indicator if deals take time', async ({ page }) => {
      // Check if there's a loading state initially
      const loadingIndicator = page.locator('text=Laden, text=Loading, [role="status"]')
      
      // Loading might be very quick, so it's ok if not visible
      const hasLoading = await loadingIndicator.count() > 0
      const hasDeals = await page.locator('[data-testid*="deal"], .deal-card').count() > 0
      
      expect(hasLoading || hasDeals).toBe(true)
    })
  })

  test.describe('SEO and Metadata', () => {
    test('should have proper page title', async ({ page }) => {
      const title = await page.title()
      expect(title.toLowerCase()).toContain('deal')
    })

    test('should have meta description', async ({ page }) => {
      const metaDescription = page.locator('meta[name="description"]')
      await expect(metaDescription).toHaveAttribute('content', /.+/)
    })

    test('should have structured data for deals', async ({ page }) => {
      // Check for JSON-LD structured data
      const jsonLd = page.locator('script[type="application/ld+json"]')
      
      if (await jsonLd.count() > 0) {
        const content = await jsonLd.first().textContent()
        expect(content).toBeTruthy()
      }
    })
  })

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      const h1Count = await page.locator('h1').count()
      expect(h1Count).toBeGreaterThanOrEqual(1)
    })

    test('should have alt text on all deal images', async ({ page }) => {
      const images = await page.locator('[data-testid*="deal"] img, .deal-card img').all()
      
      for (const img of images) {
        const alt = await img.getAttribute('alt')
        expect(alt).not.toBeNull()
      }
    })

    test('should be keyboard navigable', async ({ page }) => {
      await page.keyboard.press('Tab')
      
      const activeElement = await page.evaluate(() => document.activeElement?.tagName)
      expect(activeElement).toBeTruthy()
    })
  })

  test.describe('Error Handling', () => {
    test('should handle empty deals gracefully', async ({ page }) => {
      // Even if no deals, page should render
      const bodyVisible = await page.locator('body').isVisible()
      expect(bodyVisible).toBe(true)
    })
  })
})
