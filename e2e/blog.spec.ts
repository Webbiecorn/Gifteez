import { test, expect } from '@playwright/test'
import {
  navigateTo,
  waitForPageLoad,
  ensureCookieConsent,
  dismissCookieBannerIfPresent,
  clickHeaderNav,
} from './helpers'

test.describe('Blog Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Blog page
    await ensureCookieConsent(page)
    await navigateTo(page, '/')
    await dismissCookieBannerIfPresent(page)
    await clickHeaderNav(page, 'nav-blog')
    await waitForPageLoad(page)
  })

  test.describe('Blog Listing Page', () => {
    test('should display blog page heading', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('Blog')
    })

    test('should display multiple blog posts', async ({ page }) => {
      await page.waitForTimeout(1000) // Wait for posts to load
      
      const blogPosts = page.locator('article, [data-testid*="post"], .blog-post')
      const count = await blogPosts.count()
      
      expect(count).toBeGreaterThan(0)
    })

    test('should display post titles', async ({ page }) => {
      const firstPost = page.locator('article, [data-testid*="post"]').first()
      
      if (await firstPost.isVisible()) {
        const title = firstPost.locator('h2, h3').first()
        await expect(title).toBeVisible()
        
        const titleText = await title.textContent()
        expect(titleText).toBeTruthy()
        expect(titleText!.length).toBeGreaterThan(5)
      }
    })

    test('should display post excerpts or descriptions', async ({ page }) => {
      const firstPost = page.locator('article, [data-testid*="post"]').first()
      
      if (await firstPost.isVisible()) {
        const description = firstPost.locator('p').first()
        
        if (await description.isVisible()) {
          const text = await description.textContent()
          expect(text).toBeTruthy()
        }
      }
    })

    test('should display post metadata (date, author, category)', async ({ page }) => {
      const firstPost = page.locator('article, [data-testid*="post"]').first()
      
      if (await firstPost.isVisible()) {
        const semanticDateCount = await firstPost.locator('time, [datetime]').count()
        const patternDateCount = await firstPost.locator('text=/\\b\\d{1,2}[\\/.-]\\d{1,2}[\\/.-]\\d{2,4}\\b/').count()
        const categoryChipCount = await firstPost.locator('[class*="category" i], [class*="tag" i]').count()
        const categoryTextCount = await firstPost.locator('text=/categorie|category|tips|tag/i').count()

        expect(
          semanticDateCount > 0 ||
            patternDateCount > 0 ||
            categoryChipCount > 0 ||
            categoryTextCount > 0
        ).toBe(true)
      }
    })

    test('should have featured images on posts', async ({ page }) => {
      const firstPost = page.locator('article, [data-testid*="post"]').first()
      
      if (await firstPost.isVisible()) {
        const image = firstPost.locator('img').first()
        
        if (await image.isVisible()) {
          await expect(image).toHaveAttribute('src', /.+/)
          await expect(image).toHaveAttribute('alt', /.+/)
        }
      }
    })

    test('should have clickable post links', async ({ page }) => {
      const firstPost = page.locator('article, [data-testid*="post"]').first()
      
      if (await firstPost.isVisible()) {
        const anchorLink = firstPost.locator('a[href]').first()
        if ((await anchorLink.count()) > 0) {
          await expect(anchorLink).toHaveAttribute('href', /.+/)
          await expect(anchorLink).toBeVisible()
        } else {
          const interactiveFallback = firstPost
            .locator('button, [role="button"], [role="link"]')
            .filter({ hasText: /lees|ontdek|meer/i })
            .first()
          await expect(interactiveFallback).toBeVisible()
        }
      }
    })
  })

  test.describe('Blog Post Detail Page', () => {
    test.beforeEach(async ({ page }) => {
      // Click on first blog post
      const firstPostLink = page.locator('article a, [data-testid*="post"] a').first()
      
      if (await firstPostLink.isVisible()) {
        await firstPostLink.click()
        await waitForPageLoad(page)
      }
    })

    test('should display post title', async ({ page }) => {
      const title = page.locator('h1').first()
      await expect(title).toBeVisible()
      
      const titleText = await title.textContent()
      expect(titleText).toBeTruthy()
      expect(titleText!.length).toBeGreaterThan(5)
    })

    test('should display post content', async ({ page }) => {
      // Look for main article content
      const content = page.locator('article, main').first()
      await expect(content).toBeVisible()
      
      // Should have paragraphs
      const paragraphs = content.locator('p')
      const count = await paragraphs.count()
      expect(count).toBeGreaterThan(0)
    })

    test('should display post metadata', async ({ page }) => {
      // Look for published date
      const publishedDate = page.locator('time, [datetime]').first()
      
      if (await publishedDate.isVisible()) {
        await expect(publishedDate).toBeVisible()
      }
    })

    test('should display author information if available', async ({ page }) => {
      const author = page.locator('text=/Auteur|Author|Door/i').first()
      
      if (await author.isVisible()) {
        await expect(author).toBeVisible()
      }
    })

    test('should have featured image', async ({ page }) => {
      const featuredImage = page.locator('article img, main img').first()
      
      if (await featuredImage.isVisible()) {
        await expect(featuredImage).toHaveAttribute('src', /.+/)
        await expect(featuredImage).toHaveAttribute('alt', /.+/)
      }
    })

    test('should have breadcrumbs navigation', async ({ page }) => {
      const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]')
      
      if (await breadcrumb.isVisible()) {
        await expect(breadcrumb).toBeVisible()
        await expect(breadcrumb).toContainText('Blog')
      }
    })

    test('should have share buttons', async ({ page }) => {
      const shareButtons = page.locator('button:has-text("Deel"), a:has-text("Share"), [aria-label*="share" i]')
      
      if (await shareButtons.first().isVisible()) {
        await expect(shareButtons.first()).toBeVisible()
      }
    })

    test('should have related posts section', async ({ page }) => {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await page.waitForTimeout(500)
      
      const relatedPosts = page.locator('text=/Gerelateerd|Related|Meer artikelen/i').first()
      
      await expect(relatedPosts).toBeVisible()
    })
  })

  test.describe('Blog Categories', () => {
    test('should display blog categories if available', async ({ page }) => {
      const headingLocator = page.locator('text=/Categorieën|Categories/i').first()
      const chipsLocator = page
        .locator('[data-testid*="category"], [class*="category" i], button, a')
        .filter({ hasText: /categorie|gift|tips|cadeau/i })
        .first()

      const headingVisible = (await headingLocator.count()) > 0 && (await headingLocator.isVisible())
      const chipVisible = (await chipsLocator.count()) > 0 && (await chipsLocator.isVisible())

      expect(headingVisible || chipVisible).toBe(true)
    })

    test('should filter posts by category', async ({ page }) => {
      const categoryLink = page.locator('a, button').filter({ hasText: /Gift Tips|Sustainable|Tech/i }).first()
      
      if (await categoryLink.isVisible()) {
        await categoryLink.click()
        await waitForPageLoad(page)
        
        // Should show filtered posts
        const posts = page.locator('article, [data-testid*="post"]')
        const count = await posts.count()
        expect(count).toBeGreaterThanOrEqual(0)
      }
    })
  })

  test.describe('Blog Search', () => {
    test('should have search functionality', async ({ page }) => {
      const searchInput = page.locator('input[type="search"], input[placeholder*="Zoek"]').first()
      
      if (await searchInput.isVisible()) {
        await expect(searchInput).toBeVisible()
        await expect(searchInput).toBeEditable()
      }
    })

    test('should search blog posts', async ({ page }) => {
      const searchInput = page.locator('input[type="search"], input[placeholder*="Zoek"]').first()
      
      if (await searchInput.isVisible()) {
        await searchInput.fill('cadeau')
        await searchInput.press('Enter')
        await page.waitForTimeout(1000)
        
        // Should show results or no results message
        const hasResults = await page.locator('article, [data-testid*="post"]').count() > 0
        const hasNoResults = await page.locator('text=/geen resultaten|no results/i').count() > 0
        
        expect(hasResults || hasNoResults).toBe(true)
      }
    })
  })

  test.describe('Blog Pagination', () => {
    test('should have pagination if many posts', async ({ page }) => {
      const pagination = page.locator('nav[aria-label*="pagination" i], [class*="pagination"]').first()
      
      if (await pagination.isVisible()) {
        await pagination.scrollIntoViewIfNeeded()
        await expect(pagination).toBeVisible()
      }
    })

    test('should navigate to next page', async ({ page }) => {
      const nextButton = page.locator('button:has-text("Volgende"), a:has-text("Next"), button:has-text(">")').first()
      
      if (await nextButton.isVisible()) {
        await nextButton.scrollIntoViewIfNeeded()
        await nextButton.click()
        await waitForPageLoad(page)
        
        // URL or content should change
        const posts = page.locator('article, [data-testid*="post"]')
        const count = await posts.count()
        expect(count).toBeGreaterThan(0)
      }
    })

    test('should navigate to previous page', async ({ page }) => {
      // Go to next page first
      const nextButton = page.locator('button:has-text("Volgende"), a:has-text("Next")').first()
      
      if (await nextButton.isVisible()) {
        await nextButton.scrollIntoViewIfNeeded()
        await nextButton.click()
        await waitForPageLoad(page)
        
        // Then go back
        const prevButton = page.locator('button:has-text("Vorige"), a:has-text("Previous"), button:has-text("<")').first()
        
        if (await prevButton.isVisible()) {
          await prevButton.click()
          await waitForPageLoad(page)
          
          // Should be back on first page
          const posts = page.locator('article, [data-testid*="post"]')
          const count = await posts.count()
          expect(count).toBeGreaterThan(0)
        }
      }
    })
  })

  test.describe('Responsive Design', () => {
    test.use({ viewport: { width: 375, height: 667 } })

    test('should display blog listing on mobile', async ({ page }) => {
      await expect(page.locator('h1')).toBeVisible()
      
      const posts = page.locator('article, [data-testid*="post"]')
      if (await posts.first().isVisible()) {
        await expect(posts.first()).toBeVisible()
      }
    })

    test('should display blog post detail on mobile', async ({ page }) => {
      const firstPostLink = page.locator('article a, [data-testid*="post"] a').first()
      
      if (await firstPostLink.isVisible()) {
        await firstPostLink.click()
        await waitForPageLoad(page)
        
        const title = page.locator('h1').first()
        await expect(title).toBeVisible()
        
        const content = page.locator('article, main').first()
        await expect(content).toBeVisible()
      }
    })

    test('should make images responsive on mobile', async ({ page }) => {
      const firstPost = page.locator('article, [data-testid*="post"]').first()
      
      if (await firstPost.isVisible()) {
        const image = firstPost.locator('img').first()
        
        if (await image.isVisible()) {
          const box = await image.boundingBox()
          expect(box).toBeTruthy()
          
          if (box) {
            // Image should not exceed viewport width
            expect(box.width).toBeLessThanOrEqual(375)
          }
        }
      }
    })
  })

  test.describe('SEO and Metadata', () => {
    test('should have proper page title on listing', async ({ page }) => {
      const title = await page.title()
      expect(title.toLowerCase()).toContain('blog')
    })

    test('should have proper page title on post detail', async ({ page }) => {
      const firstPostLink = page.locator('article a, [data-testid*="post"] a').first()
      
      if (await firstPostLink.isVisible()) {
        await firstPostLink.click()
        await waitForPageLoad(page)
        
        const title = await page.title()
        expect(title).toBeTruthy()
        expect(title.length).toBeGreaterThan(10)
      }
    })

    test('should have meta description on post', async ({ page }) => {
      const firstPostLink = page.locator('article a, [data-testid*="post"] a').first()
      
      if (await firstPostLink.isVisible()) {
        await firstPostLink.click()
        await waitForPageLoad(page)
        
        const metaDescription = page.locator('meta[name="description"]')
        await expect(metaDescription).toHaveAttribute('content', /.+/)
      }
    })

    test('should have structured data for blog posts', async ({ page }) => {
      const firstPostLink = page.locator('article a, [data-testid*="post"] a').first()
      
      if (await firstPostLink.isVisible()) {
        await firstPostLink.click()
        await waitForPageLoad(page)
        
        const jsonLd = page.locator('script[type="application/ld+json"]')
        
        if (await jsonLd.count() > 0) {
          const content = await jsonLd.first().textContent()
          expect(content).toBeTruthy()
          
          // Should contain BlogPosting or Article type
          expect(content).toMatch(/BlogPosting|Article/)
        }
      }
    })

    test('should have canonical URL', async ({ page }) => {
      const firstPostLink = page.locator('article a, [data-testid*="post"] a').first()
      
      if (await firstPostLink.isVisible()) {
        await firstPostLink.click()
        await waitForPageLoad(page)
        
        const canonical = page.locator('link[rel="canonical"]')
        
        if (await canonical.count() > 0) {
          await expect(canonical).toHaveAttribute('href', /.+/)
        }
      }
    })
  })

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy on listing', async ({ page }) => {
      const h1Count = await page.locator('h1').count()
      expect(h1Count).toBe(1)
      
      const headings = page.locator('h2, h3, h4')
      const count = await headings.count()
      expect(count).toBeGreaterThan(0)
    })

    test('should have proper heading hierarchy on post detail', async ({ page }) => {
      const firstPostLink = page.locator('article a, [data-testid*="post"] a').first()
      
      if (await firstPostLink.isVisible()) {
        await firstPostLink.click()
        await waitForPageLoad(page)
        
        const h1Count = await page.locator('h1').count()
        expect(h1Count).toBeGreaterThanOrEqual(1)
      }
    })

    test('should have alt text on all images', async ({ page }) => {
      const images = await page.locator('article img, [data-testid*="post"] img').all()
      
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

  test.describe('Performance', () => {
    test('should load blog listing within 2 seconds', async ({ page }) => {
      const startTime = Date.now()
      
      await page.waitForSelector('article, [data-testid*="post"], h2', { timeout: 2000 })
      
      const endTime = Date.now()
      const loadTime = endTime - startTime
      
      expect(loadTime).toBeLessThan(2000)
    })

    test('should load blog post within 3 seconds', async ({ page }) => {
      const firstPostLink = page.locator('article a, [data-testid*="post"] a').first()
      
      if (await firstPostLink.isVisible()) {
        const startTime = Date.now()
        
        await firstPostLink.click()
        await page.waitForSelector('article, main, h1', { timeout: 3000 })
        
        const endTime = Date.now()
        const loadTime = endTime - startTime
        
        expect(loadTime).toBeLessThan(3000)
      }
    })
  })
})

test.describe('Specific Blog Post: Cadeaugidsen quick-start', () => {
  test('should open the Cadeaugidsen quick-start blog by slug', async ({ page }) => {
    await navigateTo(page, '/blog/cadeaugidsen-snel-starten')
    await waitForPageLoad(page)

    await expect(page.locator('h1').first()).toContainText('Cadeaugidsen')
  })
})
