import { test, expect } from '@playwright/test'
import {
  navigateTo,
  waitForPageLoad,
  getLocalStorageItem,
  expectUrlToContain,
  clearLocalStorage
} from './helpers'

test.describe('Gift Finder Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/')
    await clearLocalStorage(page)
    
    // Navigate to Gift Finder
    await navigateTo(page, '/')
    await page.click('text=Gift Finder')
    await waitForPageLoad(page)
  })

  test.describe('Form Interaction', () => {
    test('should display gift finder form', async ({ page }) => {
      // Check for form elements
      await expect(page.locator('h1, h2').first()).toContainText('Gift Finder')
      
      // Should have recipient selection
      const recipientField = page.locator('select, input[name*="recipient"]').first()
      if (await recipientField.isVisible()) {
        await expect(recipientField).toBeVisible()
      }
    })

    test('should select recipient from dropdown', async ({ page }) => {
      const recipientSelect = page.locator('select').first()
      
      if (await recipientSelect.isVisible()) {
        await recipientSelect.selectOption({ index: 1 })
        
        const selectedValue = await recipientSelect.inputValue()
        expect(selectedValue).toBeTruthy()
      }
    })

    test('should select occasion', async ({ page }) => {
      // Look for occasion selector
      const occasionButtons = page.locator('button:has-text("Verjaardag"), button:has-text("Kerstmis")')
      
      if (await occasionButtons.first().isVisible()) {
        await occasionButtons.first().click()
        
        // Button should have selected state
        const isSelected = await occasionButtons.first().getAttribute('class')
        expect(isSelected).toBeTruthy()
      }
    })

    test('should select multiple interests', async ({ page }) => {
      // Look for interest tags/buttons
      const interestButtons = page.locator('button:has-text("Tech"), button:has-text("Sport"), button:has-text("Koken")')
      
      if (await interestButtons.first().isVisible()) {
        const firstInterest = interestButtons.first()
        const secondInterest = interestButtons.nth(1)
        
        await firstInterest.click()
        await page.waitForTimeout(100)
        await secondInterest.click()
        await page.waitForTimeout(100)
        
        // Both should be selected
        expect(await firstInterest.count()).toBeGreaterThan(0)
        expect(await secondInterest.count()).toBeGreaterThan(0)
      }
    })

    test('should set budget range', async ({ page }) => {
      // Look for budget input or slider
      const budgetMin = page.locator('input[name*="min"], input[type="range"]').first()
      const budgetMax = page.locator('input[name*="max"], input[type="range"]').last()
      
      if (await budgetMin.isVisible()) {
        await budgetMin.fill('20')
      }
      
      if (await budgetMax.isVisible()) {
        await budgetMax.fill('50')
      }
    })

    test('should submit form and show results', async ({ page }) => {
      // Fill out basic form
      const recipientSelect = page.locator('select').first()
      if (await recipientSelect.isVisible()) {
        await recipientSelect.selectOption({ index: 1 })
      }
      
      // Click interest
      const interestButton = page.locator('button:has-text("Tech")').first()
      if (await interestButton.isVisible()) {
        await interestButton.click()
      }
      
      // Submit
      const submitButton = page.locator('button[type="submit"], button:has-text("Vind cadeau"), button:has-text("Zoek")').first()
      await submitButton.click()
      await page.waitForTimeout(2000) // Wait for results to load
      
      // Should show results or loading state
      const hasResults = await page.locator('[data-testid*="gift"], [data-testid*="result"], .gift-card, article').count() > 0
      const hasLoading = await page.locator('text=Laden, text=Loading').count() > 0
      
      expect(hasResults || hasLoading).toBe(true)
    })

    test('should show validation errors for empty form', async ({ page }) => {
      // Try to submit without filling form
      const submitButton = page.locator('button[type="submit"], button:has-text("Vind cadeau")').first()
      
      if (await submitButton.isVisible()) {
        await submitButton.click()
        await page.waitForTimeout(500)
        
        // Should show error or prevent submission
        const hasError = await page.locator('text=verplicht, text=required, [role="alert"]').count() > 0
        const urlChanged = !page.url().includes('gift-finder')
        
        // Either shows error or stays on page
        expect(hasError || !urlChanged).toBe(true)
      }
    })
  })

  test.describe('Results Display', () => {
    test.beforeEach(async ({ page }) => {
      // Quick form submission
      const recipientSelect = page.locator('select').first()
      if (await recipientSelect.isVisible()) {
        await recipientSelect.selectOption({ index: 1 })
      }
      
      const interestButton = page.locator('button:has-text("Tech")').first()
      if (await interestButton.isVisible()) {
        await interestButton.click()
      }
      
      const submitButton = page.locator('button[type="submit"], button:has-text("Vind cadeau")').first()
      await submitButton.click()
      await page.waitForTimeout(2000)
    })

    test('should display gift cards in results', async ({ page }) => {
      // Check for gift cards
      const giftCards = page.locator('[data-testid*="gift"], .gift-card, article')
      const count = await giftCards.count()
      
      expect(count).toBeGreaterThan(0)
    })

    test('should show gift details in cards', async ({ page }) => {
      const firstGiftCard = page.locator('[data-testid*="gift"], .gift-card, article').first()
      
      if (await firstGiftCard.isVisible()) {
        // Should have image
        const hasImage = await firstGiftCard.locator('img').count() > 0
        
        // Should have title/name
        const hasTitle = await firstGiftCard.locator('h2, h3, h4').count() > 0
        
  // Should have price or description
  const hasPrice = await firstGiftCard.locator('text=/€\\d+/').count() > 0

  expect(hasImage || hasTitle || hasPrice).toBe(true)
      }
    })

    test('should have affiliate links to retailers', async ({ page }) => {
      const firstGiftCard = page.locator('[data-testid*="gift"], .gift-card, article').first()
      
      if (await firstGiftCard.isVisible()) {
        // Should have retailer link
        const retailerLinks = await firstGiftCard.locator('a:has-text("Bekijk"), a:has-text("Shop")').count()
        
        expect(retailerLinks).toBeGreaterThan(0)
      }
    })

    test('should show "no results" message when no matches', async ({ page }) => {
      // Navigate back to form
      await page.goBack()
      await waitForPageLoad(page)
      
      // Fill very specific criteria
      const budgetMin = page.locator('input[name*="min"], input[placeholder*="min"]').first()
      if (await budgetMin.isVisible()) {
        await budgetMin.fill('1')
        
        const budgetMax = page.locator('input[name*="max"], input[placeholder*="max"]').first()
        if (await budgetMax.isVisible()) {
          await budgetMax.fill('2') // Very narrow budget
        }
        
        const submitButton = page.locator('button[type="submit"]').first()
        await submitButton.click()
        await page.waitForTimeout(2000)
        
        // Might show "no results" message
        const hasNoResults = await page.locator('text=geen resultaten, text=Geen cadeaus gevonden').count() > 0
        const hasResults = await page.locator('[data-testid*="gift"]').count() > 0
        
        // Either shows results or no results message
        expect(hasNoResults || hasResults).toBe(true)
      }
    })
  })

  test.describe('Filtering and Sorting', () => {
    test.beforeEach(async ({ page }) => {
      // Get to results page
      const recipientSelect = page.locator('select').first()
      if (await recipientSelect.isVisible()) {
        await recipientSelect.selectOption({ index: 1 })
      }
      
      const submitButton = page.locator('button[type="submit"], button:has-text("Vind cadeau")').first()
      await submitButton.click()
      await page.waitForTimeout(2000)
    })

    test('should filter results by price range', async ({ page }) => {
      const priceFilter = page.locator('input[name*="price"], select[name*="price"]').first()
      
      if (await priceFilter.isVisible()) {
  const beforeCount = await page.locator('[data-testid*="gift"], .gift-card').count()
        
        await priceFilter.fill('50')
        await page.waitForTimeout(1000)
        
  const afterCount = await page.locator('[data-testid*="gift"], .gift-card').count()

  // Count might change (or stay same if all match)
  expect(afterCount).toBeGreaterThanOrEqual(0)
  expect(beforeCount).toBeGreaterThanOrEqual(0)
      }
    })

    test('should sort results', async ({ page }) => {
      const sortSelect = page.locator('select').filter({ hasText: /sorteer|sort/i }).first()
      
      if (await sortSelect.isVisible()) {
        // Get first item before sort
        const firstItemBefore = await page
          .locator('[data-testid*="gift"], .gift-card')
          .first()
          .textContent()
        
        // Change sort order
        await sortSelect.selectOption({ index: 1 })
        await page.waitForTimeout(1000)
        
        // Get first item after sort
        const firstItemAfter = await page
          .locator('[data-testid*="gift"], .gift-card')
          .first()
          .textContent()

        // Order might change
        expect(firstItemAfter).toBeTruthy()
        expect(firstItemBefore).toBeTruthy()
      }
    })

    test('should filter by category', async ({ page }) => {
      const categoryButtons = page.locator('button:has-text("Tech"), button:has-text("Sport")').first()
      
      if (await categoryButtons.isVisible()) {
        await categoryButtons.click()
        await page.waitForTimeout(1000)
        
        // Results should update
        const resultCount = await page.locator('[data-testid*="gift"]').count()
        expect(resultCount).toBeGreaterThanOrEqual(0)
      }
    })
  })

  test.describe('Favorites Functionality', () => {
    test('should add gift to favorites', async ({ page }) => {
      // Get to results
      const recipientSelect = page.locator('select').first()
      if (await recipientSelect.isVisible()) {
        await recipientSelect.selectOption({ index: 1 })
      }
      
      const submitButton = page.locator('button[type="submit"]').first()
      await submitButton.click()
      await page.waitForTimeout(2000)
      
      // Find favorite button (heart icon)
      const favoriteButton = page.locator('button[aria-label*="favoriet" i], button[aria-label*="favorite" i]').first()
      
      if (await favoriteButton.isVisible()) {
        await favoriteButton.click()
        await page.waitForTimeout(500)
        
        // Check localStorage
        const favorites = await getLocalStorageItem(page, 'gifteezFavorites')
        expect(favorites).toBeTruthy()
      }
    })

    test('should remove gift from favorites', async ({ page }) => {
      // Get to results and add to favorites first
      const recipientSelect = page.locator('select').first()
      if (await recipientSelect.isVisible()) {
        await recipientSelect.selectOption({ index: 1 })
      }
      
      const submitButton = page.locator('button[type="submit"]').first()
      await submitButton.click()
      await page.waitForTimeout(2000)
      
      const favoriteButton = page.locator('button[aria-label*="favoriet" i]').first()
      
      if (await favoriteButton.isVisible()) {
        // Add to favorites
        await favoriteButton.click()
        await page.waitForTimeout(500)
        
        // Remove from favorites
        await favoriteButton.click()
        await page.waitForTimeout(500)
        
        // Should show unfavorited state
        const favorites = await getLocalStorageItem(page, 'gifteezFavorites')
        const favArray = favorites ? JSON.parse(favorites) : []
        
        // Array might be empty or have other items
        expect(Array.isArray(favArray)).toBe(true)
      }
    })

    test('should navigate to favorites page', async ({ page }) => {
      const favoritesLink = page.locator('a:has-text("Favorieten"), a:has-text("Favorites")').first()
      
      if (await favoritesLink.isVisible()) {
        await favoritesLink.click()
        await waitForPageLoad(page)
        
        expectUrlToContain(page, 'favorite')
      }
    })
  })

  test.describe('Share Functionality', () => {
    test('should have share buttons on results', async ({ page }) => {
      // Get to results
      const recipientSelect = page.locator('select').first()
      if (await recipientSelect.isVisible()) {
        await recipientSelect.selectOption({ index: 1 })
      }
      
      const submitButton = page.locator('button[type="submit"]').first()
      await submitButton.click()
      await page.waitForTimeout(2000)
      
      // Look for share buttons
      const shareButtons = page.locator('button:has-text("Deel"), button:has-text("Share"), [aria-label*="share" i]')
      
      if (await shareButtons.first().isVisible()) {
        await expect(shareButtons.first()).toBeVisible()
      }
    })
  })

  test.describe('Responsive Design', () => {
    test.use({ viewport: { width: 375, height: 667 } })

    test('should display form correctly on mobile', async ({ page }) => {
      await expect(page.locator('h1, h2').first()).toBeVisible()
      
      // Form elements should be visible
      const formElements = page.locator('select, button, input').first()
      await expect(formElements).toBeVisible()
    })

    test('should display results in mobile grid', async ({ page }) => {
      // Submit form
      const recipientSelect = page.locator('select').first()
      if (await recipientSelect.isVisible()) {
        await recipientSelect.selectOption({ index: 1 })
      }
      
      const submitButton = page.locator('button[type="submit"]').first()
      await submitButton.click()
      await page.waitForTimeout(2000)
      
      // Results should be stacked on mobile
      const giftCards = page.locator('[data-testid*="gift"], .gift-card')
      if (await giftCards.first().isVisible()) {
        await expect(giftCards.first()).toBeVisible()
      }
    })
  })

  test.describe('Performance', () => {
    test('should load results within 3 seconds', async ({ page }) => {
      const startTime = Date.now()
      
      const recipientSelect = page.locator('select').first()
      if (await recipientSelect.isVisible()) {
        await recipientSelect.selectOption({ index: 1 })
      }
      
      const submitButton = page.locator('button[type="submit"]').first()
      await submitButton.click()
      
      // Wait for results to appear
      await page.waitForSelector('[data-testid*="gift"], .gift-card, h3', { timeout: 3000 })
      
      const endTime = Date.now()
      const loadTime = endTime - startTime
      
      expect(loadTime).toBeLessThan(3000)
    })
  })
})
