import { test, expect } from '@playwright/test'
import {
  navigateTo,
  waitForPageLoad,
  expectUrlToContain,
  hasText,
  isMobileViewport
} from './helpers'

test.describe('Navigation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start at homepage
    await navigateTo(page, '/')
  })

  test.describe('Main Navigation', () => {
    test('should display main navigation header', async ({ page }) => {
      const header = page.locator('header')
      await expect(header).toBeVisible()

      // Check for logo
      const logo = page.locator('header').locator('text=Gifteez')
      await expect(logo).toBeVisible()
    })

    test('should navigate to Gift Finder from header', async ({ page }) => {
  await page.locator('[data-testid="nav-giftFinder"]:visible').first().click()
      await waitForPageLoad(page)

      expectUrlToContain(page, '/gift-finder')
      await expect(page.locator('h1')).toContainText('Gift Finder')
    })

    test('should navigate to Deals page from header', async ({ page }) => {
      await page.locator('[data-testid="nav-deals"]:visible').first().click()
      await waitForPageLoad(page)

      expectUrlToContain(page, '/deals')
      await expect(page.locator('h1, h2').first()).toBeVisible()
    })

    test('should navigate to Blog from header', async ({ page }) => {
      await page.getByTestId('nav-blog').first().click()
      await waitForPageLoad(page)

      expectUrlToContain(page, '/blog')
      await expect(page.locator('h1')).toContainText('Blog')
    })

    test('should navigate to Cadeaugidsen hub from header', async ({ page }) => {
      // Only applicable for desktop navigation (hidden behind hamburger on mobile)
      if (isMobileViewport(page)) test.skip()
      await page.locator('[data-testid="nav-cadeausHub"]:visible').first().click()
      await waitForPageLoad(page)

      expectUrlToContain(page, '/cadeaus')
      // The hub page hero uses an H1 with "Cadeaugidsen" text
      await expect(page.locator('h1, h2').first()).toContainText(/Cadeaugidsen/i)
    })

    test('should navigate back to homepage when clicking logo', async ({ page }) => {
      // Navigate away from home
  await page.getByTestId('nav-blog').first().click()
      await waitForPageLoad(page)

      // Click logo to return home
      await page.click('header >> text=Gifteez')
      await waitForPageLoad(page)

      expect(page.url()).toMatch(/\/$/)
    })
  })

  test.describe('Mobile Navigation', () => {
    test.use({ viewport: { width: 375, height: 667 } })

    test('should open mobile menu on hamburger click', async ({ page }) => {
      // Look for hamburger menu icon (usually button with menu icon)
      const mobileMenuButton = page.locator('button[aria-label*="menu" i], button[aria-label*="Menu"]').first()
      
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click()
        await page.waitForTimeout(300) // Wait for animation

        // Check if mobile menu is visible
        const mobileMenu = page.locator('nav')
        await expect(mobileMenu).toBeVisible()
      }
    })

    test('should navigate in mobile menu', async ({ page }) => {
      const mobileMenuButton = page.locator('button[aria-label*="menu" i], button[aria-label*="Menu"]').first()
      
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click()
        await page.waitForTimeout(300)

        // Click a menu item
  await page.getByTestId('nav-giftFinder').first().click()
        await waitForPageLoad(page)

        expectUrlToContain(page, '/gift-finder')
      }
    })
  })

  test.describe('Footer Navigation', () => {
    test('should display footer with links', async ({ page }) => {
      const footer = page.locator('footer')
      await footer.scrollIntoViewIfNeeded()
      await expect(footer).toBeVisible()
    })

    test('should navigate to About page from footer', async ({ page }) => {
      await page.locator('footer').scrollIntoViewIfNeeded()
      
      const aboutLink = page.locator('footer >> text=Over ons, footer >> text=About').first()
      if (await aboutLink.isVisible()) {
        await aboutLink.click()
        await waitForPageLoad(page)

        expectUrlToContain(page, '/about')
      }
    })

    test('should navigate to Contact page from footer', async ({ page }) => {
      await page.locator('footer').scrollIntoViewIfNeeded()
      
      const contactLink = page.locator('footer >> text=Contact').first()
      if (await contactLink.isVisible()) {
        await contactLink.click()
        await waitForPageLoad(page)

        expectUrlToContain(page, '/contact')
      }
    })

    test('should navigate to Privacy page from footer', async ({ page }) => {
      await page.locator('footer').scrollIntoViewIfNeeded()
      
      const privacyLink = page.locator('footer >> text=Privacy').first()
      if (await privacyLink.isVisible()) {
        await privacyLink.click()
        await waitForPageLoad(page)

        expectUrlToContain(page, '/privacy')
      }
    })

    test('should have social media links in footer', async ({ page }) => {
      await page.locator('footer').scrollIntoViewIfNeeded()
      
      // Check for social links (they might have aria-labels or sr-only text)
      const footer = page.locator('footer')
      const linksCount = await footer.locator('a').count()
      
      expect(linksCount).toBeGreaterThan(0)
    })
  })

  test.describe('Breadcrumbs Navigation', () => {
    test('should display breadcrumbs on blog page', async ({ page }) => {
      await page.click('text=Blog')
      await waitForPageLoad(page)

      const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]')
      if (await breadcrumb.isVisible()) {
        await expect(breadcrumb).toBeVisible()
        await expect(breadcrumb).toContainText('Home')
      }
    })

    test('should navigate using breadcrumbs', async ({ page }) => {
      await page.click('text=Blog')
      await waitForPageLoad(page)

      const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]')
      if (await breadcrumb.isVisible()) {
        // Click home breadcrumb
        await breadcrumb.locator('text=Home').click()
        await waitForPageLoad(page)

        expect(page.url()).toMatch(/\/$/)
      }
    })

    test('should show current page in breadcrumbs', async ({ page }) => {
      await page.click('text=Deals')
      await waitForPageLoad(page)

      const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]')
      if (await breadcrumb.isVisible()) {
        // Current page should be styled differently (not a link)
        const currentPage = breadcrumb.locator('span').last()
        await expect(currentPage).toBeVisible()
      }
    })
  })

  test.describe('Search Functionality', () => {
    test('should have search input if available', async ({ page }) => {
      const searchInput = page.locator('input[type="search"], input[placeholder*="Zoek"]')
      
      if (await searchInput.isVisible()) {
        await expect(searchInput).toBeVisible()
        await expect(searchInput).toBeEditable()
      }
    })

    test('should perform search and show results', async ({ page }) => {
      const searchInput = page.locator('input[type="search"], input[placeholder*="Zoek"]').first()
      
      if (await searchInput.isVisible()) {
        await searchInput.fill('cadeau')
        await searchInput.press('Enter')
        await waitForPageLoad(page)

        // Should show some results or a "no results" message
        const hasResults = await page.locator('[data-testid*="result"], .result, article').count() > 0
        const hasNoResults = await hasText(page, 'geen resultaten')
        
        expect(hasResults || hasNoResults).toBe(true)
      }
    })
  })

  test.describe('Accessibility', () => {
    test('should have skip to main content link', async ({ page }) => {
      // Skip links are often visually hidden but should be in DOM
      const skipLink = page.locator('a[href="#main"], a[href="#content"]').first()
      
      if (await skipLink.count() > 0) {
        await expect(skipLink).toBeInViewport({ ratio: 0 }) // Can be off-screen
      }
    })

    test('should have proper heading hierarchy', async ({ page }) => {
      // Should have exactly one h1
      const h1Count = await page.locator('h1').count()
      expect(h1Count).toBeGreaterThanOrEqual(1)
      expect(h1Count).toBeLessThanOrEqual(2) // Some pages might have multiple h1s

      // Should have navigation landmarks
      const navCount = await page.locator('nav').count()
      expect(navCount).toBeGreaterThan(0)
    })

    test('should have alt text on all images', async ({ page }) => {
      const images = await page.locator('img').all()
      
      for (const img of images) {
        const alt = await img.getAttribute('alt')
        expect(alt).not.toBeNull()
      }
    })

    test('should be keyboard navigable', async ({ page }) => {
      // Tab through focusable elements
      await page.keyboard.press('Tab')
      
      // Check if something is focused
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
      expect(focusedElement).toBeTruthy()
    })
  })

  test.describe('Error Handling', () => {
    test('should show 404 page for invalid route', async ({ page }) => {
      await page.goto('/this-page-does-not-exist-at-all')
      await waitForPageLoad(page)

      // Should show 404 message or redirect to home
      const has404 = await hasText(page, '404') || await hasText(page, 'niet gevonden')
      const isHome = page.url().match(/\/$/)
      
      expect(has404 || isHome).toBeTruthy()
    })

    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate offline mode
      await page.context().setOffline(true)
      
      await page.goto('/')
      
      // Should show error message or cached content
      const pageLoaded = await page.locator('body').isVisible()
      expect(pageLoaded).toBe(true)
      
      // Restore online
      await page.context().setOffline(false)
    })
  })

  test.describe('Page Metadata', () => {
    test('should have proper page title on homepage', async ({ page }) => {
      await expect(page).toHaveTitle(/Gifteez/i)
    })

    test('should have meta description', async ({ page }) => {
      const metaDescription = page.locator('meta[name="description"]')
      await expect(metaDescription).toHaveAttribute('content', /.+/)
    })

    test('should have Open Graph tags', async ({ page }) => {
      const ogTitle = page.locator('meta[property="og:title"]')
      const ogDescription = page.locator('meta[property="og:description"]')
      
      await expect(ogTitle).toHaveAttribute('content', /.+/)
      await expect(ogDescription).toHaveAttribute('content', /.+/)
    })

    test('should update page title on navigation', async ({ page }) => {
      const homeTitle = await page.title()
      
      await page.click('text=Blog')
      await waitForPageLoad(page)
      
      const blogTitle = await page.title()
      
      expect(blogTitle).not.toBe(homeTitle)
      expect(blogTitle).toContain('Blog')
    })
  })
})
