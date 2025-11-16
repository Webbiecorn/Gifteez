import { expect } from '@playwright/test'
import { AUTOMATION_FLAG_STORAGE_KEY, AUTOMATION_GLOBAL_FLAG } from '../lib/automationEnvironment'
import type { Page } from '@playwright/test'

type CookiePreferencesForTests = {
  necessary: boolean
  analytics: boolean
  marketing: boolean
}

const COOKIE_CONSENT_STORAGE_KEY = 'gifteez_cookie_consent'
const COOKIE_CONSENT_VERSION = '1.0'
const DEFAULT_COOKIE_PREFERENCES: CookiePreferencesForTests = {
  necessary: true,
  analytics: true,
  marketing: false,
}

async function seedAutomationFlag(page: Page) {
  await page.addInitScript(
    ({ storageKey, globalKey }) => {
      try {
        window.localStorage.setItem(storageKey, 'true')
      } catch {
        // Ignore storage access errors
      }

      try {
        window.sessionStorage.setItem(storageKey, 'true')
      } catch {
        // Ignore storage access errors
      }

      ;(window as unknown as Record<string, unknown>)[globalKey] = true
      ;(globalThis as unknown as Record<string, unknown>)[globalKey] = true
    },
    { storageKey: AUTOMATION_FLAG_STORAGE_KEY, globalKey: AUTOMATION_GLOBAL_FLAG }
  )

  try {
    await page.evaluate(
      ({ storageKey, globalKey }) => {
        try {
          window.localStorage.setItem(storageKey, 'true')
        } catch {
          // Ignore
        }

        try {
          window.sessionStorage.setItem(storageKey, 'true')
        } catch {
          // Ignore
        }

        ;(window as unknown as Record<string, unknown>)[globalKey] = true
        ;(globalThis as unknown as Record<string, unknown>)[globalKey] = true
      },
      { storageKey: AUTOMATION_FLAG_STORAGE_KEY, globalKey: AUTOMATION_GLOBAL_FLAG }
    )
  } catch (error) {
    if (process.env.DEBUG_PLAYWRIGHT_WAIT === 'true') {
      console.warn('seedAutomationFlag evaluate failed:', error)
    }
  }
}

export async function markAutomationEnvironment(page: Page) {
  await seedAutomationFlag(page)
}

/**
 * Helper utilities for E2E tests
 */

/**
 * Wait for page to be fully loaded
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('domcontentloaded')

  try {
    await page.waitForLoadState('networkidle', { timeout: 5000 })
  } catch (error) {
    // Externe CDN-resources kunnen een networkidle-blokkade veroorzaken; ga in dat geval gewoon verder.
    if (process.env.DEBUG_PLAYWRIGHT_WAIT === 'true') {
      console.warn('waitForLoadState("networkidle") timeout:', error)
    }
  }
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
  await Promise.all([page.waitForLoadState('networkidle'), page.click(selector)])
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
export async function mockApiResponse(page: Page, urlPattern: string | RegExp, response: any) {
  await page.route(urlPattern, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
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
  await page.evaluate(({ k, v }) => localStorage.setItem(k, v), { k: key, v: value })
}

/**
 * Clear localStorage
 */
export async function clearLocalStorage(
  page: Page,
  options: { preserveCookieConsent?: boolean } = {}
) {
  const { preserveCookieConsent = true } = options

  await page.evaluate(
    ({ preserveConsent, consentKey }) => {
      if (preserveConsent && consentKey) {
        const consent = window.localStorage.getItem(consentKey)
        window.localStorage.clear()
        if (consent) {
          window.localStorage.setItem(consentKey, consent)
        }
        return
      }

      window.localStorage.clear()
    },
    {
      preserveConsent: preserveCookieConsent,
      consentKey: preserveCookieConsent ? COOKIE_CONSENT_STORAGE_KEY : null,
    }
  )
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
export async function hasMetaTag(page: Page, name: string, content: string): Promise<boolean> {
  const metaContent = await page.getAttribute(`meta[name="${name}"]`, 'content')
  return metaContent === content
}

/**
 * Get all links on page
 */
export async function getAllLinks(page: Page): Promise<string[]> {
  return page.evaluate(() => Array.from(document.querySelectorAll('a')).map((a) => a.href))
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

export async function ensureCookieConsent(page: Page, preferences = DEFAULT_COOKIE_PREFERENCES) {
  await markAutomationEnvironment(page)
  const consentData = {
    version: COOKIE_CONSENT_VERSION,
    timestamp: new Date().toISOString(),
    preferences,
  }

  const serializedConsent = JSON.stringify(consentData)

  await page.addInitScript(
    ({ key, value }) => {
      window.localStorage.setItem(key, value)
    },
    { key: COOKIE_CONSENT_STORAGE_KEY, value: serializedConsent }
  )

  try {
    await page.evaluate(
      ({ key, value }) => {
        window.localStorage.setItem(key, value)
      },
      { key: COOKIE_CONSENT_STORAGE_KEY, value: serializedConsent }
    )
  } catch (error) {
    if (process.env.DEBUG_PLAYWRIGHT_WAIT === 'true') {
      console.warn('ensureCookieConsent evaluate failed:', error)
    }
  }
}

const COOKIE_BANNER_TEXT_SELECTOR = 'text=/Cookie\\s+Voorkeuren/i'
const COOKIE_ACCEPT_BUTTON_SELECTOR =
  'button:has-text("Alles Accepteren"), button:has-text("Accepteer alles"), button:has-text("Accept all")'
const COOKIE_DECLINE_BUTTON_SELECTOR =
  'button:has-text("Alleen Noodzakelijk"), [aria-label*="sluiten" i], button:has-text("Alleen noodzakelijk")'

export async function dismissCookieBannerIfPresent(page: Page) {
  const bannerLocator = page.locator(COOKIE_BANNER_TEXT_SELECTOR).first()
  const bannerCount = await bannerLocator.count()

  if (bannerCount === 0) {
    return
  }

  if (!(await bannerLocator.isVisible())) {
    return
  }

  const acceptButton = page.locator(COOKIE_ACCEPT_BUTTON_SELECTOR).first()
  const declineButton = page.locator(COOKIE_DECLINE_BUTTON_SELECTOR).first()

  if (await acceptButton.isVisible()) {
    await acceptButton.click({ timeout: 2000 }).catch(() => {})
  } else if (await declineButton.isVisible()) {
    await declineButton.click({ timeout: 2000 }).catch(() => {})
  } else {
    await ensureCookieConsent(page)
  }

  await waitForAnimation(page, 300)
  await bannerLocator.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})
}

const MOBILE_MENU_BUTTON_SELECTOR = 'button[aria-label*="menu" i], button[aria-label*="Menu" i]'
const MOBILE_NAV_CONTAINER_SELECTOR =
  '[role="dialog"][aria-label*="mobiel" i], nav[aria-label="Mobiele navigatie"], nav[aria-label*="mobiele" i]'

const HEADER_NAV_SUBMENU_TARGETS: Record<string, RegExp> = {
  'nav-deals': /Alle Collecties/i,
  'nav-blog': /Alle Artikelen/i,
}

export async function openMobileMenuIfNeeded(page: Page) {
  if (!isMobileViewport(page)) {
    return
  }

  const mobileMenuButton = page.locator(MOBILE_MENU_BUTTON_SELECTOR).first()
  const mobileNav = page.locator(MOBILE_NAV_CONTAINER_SELECTOR).first()

  if (await mobileNav.isVisible()) {
    return
  }

  if (await mobileMenuButton.isVisible()) {
    await mobileMenuButton.click()
    await waitForAnimation(page, 300)
    await mobileNav
      .first()
      .waitFor({ state: 'visible', timeout: 2000 })
      .catch(() => {})
  }
}

function getHeaderNavLocator(page: Page, testId: string) {
  if (isMobileViewport(page)) {
    return page.locator(MOBILE_NAV_CONTAINER_SELECTOR).locator(`[data-testid="${testId}"]`).first()
  }

  return page.getByTestId(testId).first()
}

export async function clickHeaderNav(page: Page, testId: string) {
  await openMobileMenuIfNeeded(page)

  const navLocator = getHeaderNavLocator(page, testId)
  const submenuTarget = HEADER_NAV_SUBMENU_TARGETS[testId]

  if (isMobileViewport(page) && submenuTarget) {
    const isExpanded = (await navLocator.getAttribute('aria-expanded')) === 'true'

    if (!isExpanded) {
      await navLocator.click()
      await waitForAnimation(page, 200)
    }

    const submenuItem = page
      .locator(MOBILE_NAV_CONTAINER_SELECTOR)
      .locator('button, a')
      .filter({ hasText: submenuTarget })
      .first()

    await submenuItem.click()
    return
  }

  await navLocator.click()
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
  const hasMain = (await page.locator('main').count()) > 0
  const hasNav = (await page.locator('nav').count()) > 0

  expect(hasMain || hasNav).toBe(true)

  // Check all images have alt text
  const images = await page.locator('img').all()
  for (const img of images) {
    const alt = await img.getAttribute('alt')
    expect(alt !== null).toBe(true)
  }
}
