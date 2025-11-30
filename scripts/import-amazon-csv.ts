#!/usr/bin/env npx tsx
/**
 * Import Amazon Products from CSV
 *
 * Converts a CSV with imageUrl, priceText, affiliateUrl columns
 * into the curatedProducts format for programmatic configs.
 *
 * Usage:
 *   npx tsx scripts/import-amazon-csv.ts <csv-file> <guide-slug>
 *
 * Example:
 *   npx tsx scripts/import-amazon-csv.ts ~/products.csv cadeaus-voor-thuiswerkers
 */

import fs from 'fs'
import path from 'path'

interface ParsedProduct {
  imageUrl: string
  price: number
  affiliateUrl: string
  title: string
}

// Product titles mapping (order matches the CSV)
const THUISWERKERS_TITLES = [
  {
    title: 'Logitech MX Master 3S Muis',
    reason: 'Beste ergonomische muis - stil scrollen, 70 dagen batterij',
  },
  {
    title: 'Anker PowerConf S500 Speakerphone',
    reason: 'Kristalheldere calls - perfect voor meetings',
  },
  {
    title: 'UGREEN USB-C Hub 7-in-1',
    reason: 'Alle poorten die je nodig hebt - HDMI, USB-A, SD-kaart',
  },
  {
    title: 'Logitech K380 Bluetooth Toetsenbord',
    reason: 'Compact, stil en werkt met 3 apparaten tegelijk',
  },
  {
    title: 'BenQ ScreenBar Monitor Lamp',
    reason: 'Geen reflectie op scherm - automatische helderheid',
  },
  {
    title: 'Fellowes Ergonomische Polssteun',
    reason: 'Memory foam voor dagelijks comfort - voorkomt RSI',
  },
  {
    title: 'HUANUO Monitorstandaard met Lade',
    reason: 'Verhoogt scherm naar ooghoogte - extra opbergruimte',
  },
  {
    title: 'Ergonomische Voetsteun Verstelbaar',
    reason: 'Verbetert houding - 6 hoogtes instelbaar',
  },
  {
    title: 'Ember Mok 2 - Temperatuurregeling',
    reason: 'Houdt koffie/thee op perfecte temperatuur - premium cadeau',
  },
  { title: 'Kunstplant Set voor Bureau', reason: 'Groen op je bureau zonder onderhoud' },
  {
    title: 'Philips Hue Play Light Bar',
    reason: 'Sfeerverlichting achter je monitor - 16 miljoen kleuren',
  },
  {
    title: 'Stanley Quencher Tumbler 1.2L',
    reason: 'Houdt drinken koud/warm - 1.2L = genoeg voor hele dag',
  },
  {
    title: 'Bose QuietComfort Earbuds II',
    reason: 'Beste noise-cancelling voor focus - 6 uur batterij',
  },
  {
    title: 'Theragun Mini Massagepistool',
    reason: 'Compacte massage voor nek en schouders na lang zitten',
  },
  {
    title: 'Ergonomisch Bureaustoelkussen',
    reason: 'Memory foam voor je onderrug - past op elke stoel',
  },
  {
    title: 'Cable Management Box',
    reason: 'Opgeruimd bureau = opgeruimd hoofd - verbergt alle kabels',
  },
  {
    title: 'LED Bureaulamp met USB',
    reason: '5 kleurtemperaturen, 10 helderheden - USB oplaadpoort',
  },
  {
    title: 'Laptop Standaard Aluminium',
    reason: 'Verhoogt laptop naar ooghoogte - koelt beter af',
  },
  { title: 'Webcam Cover 6-Pack', reason: 'Privacy in één klik - past op elke laptop/tablet' },
  {
    title: 'Desktop Whiteboard met Standaard',
    reason: 'Snelle notities zonder papier - altijd in zicht',
  },
]

function parsePrice(priceText: string): number {
  // Handle formats like "74,9", "133,82", "39,99", "39", etc.
  const cleaned = priceText.replace(/[€\s]/g, '').replace(',', '.')
  return parseFloat(cleaned)
}

function extractTitle(affiliateUrl: string): string {
  // Try to extract product name from URL
  try {
    const url = new URL(affiliateUrl)
    const pathParts = url.pathname.split('/')
    const productSlug = pathParts.find(
      (p) => p.length > 20 && !p.startsWith('dp') && !p.startsWith('B0')
    )
    if (productSlug) {
      return productSlug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    }
  } catch {
    // ignore
  }
  return 'Product'
}

function parseCSVContent(content: string): ParsedProduct[] {
  const products: ParsedProduct[] = []

  // The CSV seems to have a broken format - let's parse it differently
  // Looking for patterns: https://m.media-amazon.com/images/... followed by price and affiliate URL

  const imagePattern = /https:\/\/m\.media-amazon\.com\/images\/I\/[^,\s]+/g
  const images = content.match(imagePattern) || []

  // Split by image URLs to get sections
  const sections = content.split(/https:\/\/m\.media-amazon\.com\/images\/I\/[^,\s]+/)

  for (let i = 1; i < sections.length && i <= images.length; i++) {
    const section = sections[i]
    const imageUrl = images[i - 1]

    // Extract price - look for pattern like "74,9" or "133,82" or just "39"
    const priceMatch = section.match(/["']?(\d+(?:,\d+)?)["']?/)
    const price = priceMatch ? parsePrice(priceMatch[1]) : 0

    // Extract affiliate URL
    const affiliateMatch = section.match(
      /(https:\/\/www\.amazon\.nl\/[^\s]+tag=gifteez77-21[^\s]*)/
    )
    const affiliateUrl = affiliateMatch ? affiliateMatch[1].replace(/\s+/g, '') : ''

    if (imageUrl && price > 0 && affiliateUrl) {
      products.push({
        imageUrl,
        price,
        affiliateUrl,
        title: extractTitle(affiliateUrl),
      })
    }
  }

  return products
}

function generateCuratedProducts(
  products: ParsedProduct[],
  titles: typeof THUISWERKERS_TITLES
): string {
  const lines: string[] = ['    curatedProducts: [']

  for (let i = 0; i < products.length && i < titles.length; i++) {
    const product = products[i]
    const titleInfo = titles[i]

    lines.push('      {')
    lines.push(`        title: '${titleInfo.title}',`)
    lines.push(`        price: ${product.price},`)
    lines.push(`        currency: 'EUR',`)
    lines.push(`        image: '${product.imageUrl}',`)
    lines.push(`        affiliateLink:`)
    lines.push(`          '${product.affiliateUrl}',`)
    lines.push(`        merchant: 'Amazon',`)
    lines.push(`        reason: '${titleInfo.reason}',`)
    lines.push(`      },`)
  }

  lines.push('    ],')

  return lines.join('\n')
}

async function main() {
  const args = process.argv.slice(2)

  if (args.length < 1) {
    console.log('Usage: npx tsx scripts/import-amazon-csv.ts <csv-file> [guide-slug]')
    console.log(
      'Example: npx tsx scripts/import-amazon-csv.ts ~/products.csv cadeaus-voor-thuiswerkers'
    )
    process.exit(1)
  }

  const csvPath = args[0]
  const guideSlug = args[1] || 'cadeaus-voor-thuiswerkers'

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ File not found: ${csvPath}`)
    process.exit(1)
  }

  console.log(`📂 Reading CSV: ${csvPath}`)
  const content = fs.readFileSync(csvPath, 'utf-8')

  console.log(`🔍 Parsing products...`)
  const products = parseCSVContent(content)

  console.log(`\n✅ Found ${products.length} products:\n`)

  products.forEach((p, i) => {
    const titleInfo = THUISWERKERS_TITLES[i]
    console.log(`${i + 1}. ${titleInfo?.title || 'Unknown'}`)
    console.log(`   💰 €${p.price.toFixed(2)}`)
    console.log(`   🖼️  ${p.imageUrl.substring(0, 60)}...`)
    console.log(`   🔗 ${p.affiliateUrl.substring(0, 60)}...`)
    console.log('')
  })

  // Generate the TypeScript code
  const tsCode = generateCuratedProducts(products, THUISWERKERS_TITLES)

  // Write to a temp file
  const outputPath = path.join(process.cwd(), `curated-products-${guideSlug}.txt`)
  fs.writeFileSync(outputPath, tsCode)

  console.log(`\n📝 TypeScript code written to: ${outputPath}`)
  console.log('\nCopy this into your programmatic config to replace the curatedProducts array.')
}

main().catch(console.error)
