import { Page, expect } from '@playwright/test'

/**
 * Helper utilities for E2E tests
 */

/**
 * Wait for page to be fully loaded
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle')
  await page.waitForLoadState('domcontentloaded')
}

/**
 * Navigate to a specific page and wait for load
 */
export async function navigateTo(page: Page, path: string) {
  await page.goto(path)
  await waitForPageLoad(page)
}

/**
 * Check if element is visible and enabled
 */
export async function isInteractable(page: Page, selector: string): Promise<boolean> {
  const element = page.locator(selector)
  const isVisible = await element.isVisible()
  const isEnabled = await element.isEnabled()
  return isVisible && isEnabled
}

/**
 * Wait for element to be visible with timeout
 */
export async function waitForElement(page: Page, selector: string, timeout = 10000) {
  await page.waitForSelector(selector, { state: 'visible', timeout })
}

/**
 * Scroll element into view
 */
export async function scrollIntoView(page: Page, selector: string) {
  await page.locator(selector).scrollIntoViewIfNeeded()
}

/**
 * Get element text content
 */
export async function getTextContent(page: Page, selector: string): Promise<string> {
  const element = page.locator(selector)
  return (await element.textContent()) || ''
}

/**
 * Check if page has specific text
 */
export async function hasText(page: Page, text: string): Promise<boolean> {
  return page.locator(`text=${text}`).isVisible()
}

/**
 * Wait for navigation to complete
 */
export async function waitForNavigation(page: Page) {
  await page.waitForLoadState('networkidle')
}

/**
 * Click and wait for navigation
 */
export async function clickAndWaitForNavigation(page: Page, selector: string) {
  await Promise.all([
    page.waitForLoadState('networkidle'),
    page.click(selector)
  ])
}

/**
 * Fill form field and wait for input
 */
export async function fillField(page: Page, selector: string, value: string) {
  await page.fill(selector, value)
  await page.waitForTimeout(100) // Small delay for input processing
}

/**
 * Select dropdown option
 */
export async function selectOption(page: Page, selector: string, value: string) {
  await page.selectOption(selector, value)
  await page.waitForTimeout(100)
}

/**
 * Check if URL matches pattern
 */
export function expectUrlToContain(page: Page, pattern: string) {
  expect(page.url()).toContain(pattern)
}

/**
 * Check if URL matches exact path
 */
export function expectUrlToBe(page: Page, url: string) {
  expect(page.url()).toBe(url)
}

/**
 * Take screenshot with name
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `e2e-screenshots/${name}.png`, fullPage: true })
}

/**
 * Wait for API response
 */
export async function waitForApiResponse(page: Page, urlPattern: string | RegExp) {
  await page.waitForResponse(urlPattern)
}

/**
 * Mock API response
 */
export async function mockApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  response: any
) {
  await page.route(urlPattern, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response)
    })
  })
}

/**
 * Get localStorage item
 */
export async function getLocalStorageItem(page: Page, key: string): Promise<string | null> {
  return page.evaluate((k) => localStorage.getItem(k), key)
}

/**
 * Set localStorage item
 */
export async function setLocalStorageItem(page: Page, key: string, value: string) {
  await page.evaluate(
    ({ k, v }) => localStorage.setItem(k, v),
    { k: key, v: value }
  )
}

/**
 * Clear localStorage
 */
export async function clearLocalStorage(page: Page) {
  await page.evaluate(() => localStorage.clear())
}

/**
 * Wait for element count
 */
export async function waitForElementCount(
  page: Page,
  selector: string,
  count: number,
  timeout = 10000
) {
  await page.waitForFunction(
    ({ sel, cnt }) => document.querySelectorAll(sel).length === cnt,
    { sel: selector, cnt: count },
    { timeout }
  )
}

/**
 * Get element count
 */
export async function getElementCount(page: Page, selector: string): Promise<number> {
  return page.locator(selector).count()
}

/**
 * Check if element has class
 */
export async function hasClass(page: Page, selector: string, className: string): Promise<boolean> {
  const element = page.locator(selector)
  const classes = await element.getAttribute('class')
  return classes?.includes(className) || false
}

/**
 * Wait for element to have text
 */
export async function waitForElementText(
  page: Page,
  selector: string,
  text: string,
  timeout = 10000
) {
  await page.waitForFunction(
    ({ sel, txt }) => {
      const el = document.querySelector(sel)
      return el?.textContent?.includes(txt)
    },
    { sel: selector, txt: text },
    { timeout }
  )
}

/**
 * Check if page has meta tag with content
 */
export async function hasMetaTag(
  page: Page,
  name: string,
  content: string
): Promise<boolean> {
  const metaContent = await page.getAttribute(`meta[name="${name}"]`, 'content')
  return metaContent === content
}

/**
 * Get all links on page
 */
export async function getAllLinks(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('a')).map((a) => a.href)
  )
}

/**
 * Check if link is external
 */
export function isExternalLink(url: string, baseUrl: string): boolean {
  try {
    const urlObj = new URL(url)
    const baseUrlObj = new URL(baseUrl)
    return urlObj.hostname !== baseUrlObj.hostname
  } catch {
    return false
  }
}

/**
 * Retry action with exponential backoff
 */
export async function retryWithBackoff<T>(
  action: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | null = null

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await action()
    } catch (error) {
      lastError = error as Error
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}

/**
 * Check if page is mobile viewport
 */
export function isMobileViewport(page: Page): boolean {
  const viewport = page.viewportSize()
  return viewport ? viewport.width < 768 : false
}

/**
 * Wait for animation to complete
 */
export async function waitForAnimation(page: Page, duration = 500) {
  await page.waitForTimeout(duration)
}

/**
 * Hover over element
 */
export async function hoverElement(page: Page, selector: string) {
  await page.hover(selector)
  await page.waitForTimeout(100)
}

/**
 * Press key combination
 */
export async function pressKeys(page: Page, keys: string) {
  await page.keyboard.press(keys)
}

/**
 * Check accessibility (basic check)
 */
export async function checkBasicAccessibility(page: Page) {
  // Check for main landmarks
  const hasMain = await page.locator('main').count() > 0
  const hasNav = await page.locator('nav').count() > 0
  
  expect(hasMain || hasNav).toBe(true)
  
  // Check all images have alt text
  const images = await page.locator('img').all()
  for (const img of images) {
    const alt = await img.getAttribute('alt')
    expect(alt !== null).toBe(true)
  }
}
