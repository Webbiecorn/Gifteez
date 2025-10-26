#!/usr/bin/env node

/**
 * Mobile Screenshot Tester
 * 
 * Maakt screenshots van verschillende pagina's op mobiele resoluties
 * om responsive design te valideren.
 * 
 * Usage:
 *   node scripts/mobile-screenshot-test.mjs
 */

import { chromium } from 'playwright'
import path from 'path'
import { fileURLToPath } from 'url'
import { mkdir } from 'fs/promises'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const screenshotsDir = path.join(__dirname, '../screenshots')

// Test configuratie
const BASE_URL = 'http://localhost:5173'
const ROUTES_TO_TEST = [
  { name: 'homepage', path: '/' },
  { name: 'deals', path: '/deals' },
  { name: 'category-tech', path: '/deals/category/tech-gadgets' },
  { name: 'category-lifestyle', path: '/deals/category/lifestyle' },
]

// Mobiele viewports
const VIEWPORTS = [
  { name: 'iphone-se', width: 375, height: 667 }, // iPhone SE
  { name: 'iphone-12', width: 390, height: 844 }, // iPhone 12/13/14
  { name: 'iphone-14-pro-max', width: 430, height: 932 }, // iPhone 14 Pro Max
  { name: 'samsung-s20', width: 360, height: 800 }, // Samsung Galaxy S20
  { name: 'tablet', width: 768, height: 1024 }, // iPad Mini
]

async function takeScreenshots() {
  console.log('📱 Mobile Screenshot Tester')
  console.log('═══════════════════════════════════════\n')

  // Maak screenshots directory aan
  await mkdir(screenshotsDir, { recursive: true })
  console.log(`📂 Screenshots directory: ${screenshotsDir}\n`)

  // Start browser
  console.log('🌐 Starting browser...')
  const browser = await chromium.launch()

  try {
    for (const viewport of VIEWPORTS) {
      console.log(`\n📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})`)
      console.log('─────────────────────────────────────')

      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 2, // Retina display
      })

      const page = await context.newPage()

      for (const route of ROUTES_TO_TEST) {
        try {
          const url = `${BASE_URL}${route.path}`
          console.log(`  📸 ${route.name}... `, { end: '' })

          // Navigeer naar pagina
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 })

          // Wacht voor images en animaties
          await page.waitForTimeout(2000)

          // Maak screenshot
          const filename = `${viewport.name}-${route.name}.png`
          const filepath = path.join(screenshotsDir, filename)
          await page.screenshot({
            path: filepath,
            fullPage: true,
          })

          console.log(`✅ ${filename}`)
        } catch (error) {
          console.log(`❌ ${error.message}`)
        }
      }

      await context.close()
    }
  } finally {
    await browser.close()
  }

  console.log('\n✨ Screenshot testing complete!')
  console.log(`📂 Screenshots saved to: ${screenshotsDir}`)
}

// Check of dev server draait
async function checkServerRunning() {
  try {
    const response = await fetch(BASE_URL)
    return response.ok
  } catch {
    return false
  }
}

// Main
;(async () => {
  // Check of server draait
  const serverRunning = await checkServerRunning()
  if (!serverRunning) {
    console.error(`❌ Dev server niet bereikbaar op ${BASE_URL}`)
    console.error('   Start eerst de dev server met: npm run dev')
    process.exit(1)
  }

  await takeScreenshots()
})().catch((error) => {
  console.error('\n❌ Error:', error.message)
  process.exit(1)
})
