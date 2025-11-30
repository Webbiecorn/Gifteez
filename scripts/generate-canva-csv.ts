#!/usr/bin/env npx tsx
/**
 * Canva Bulk Create CSV Generator
 *
 * Genereert CSV bestanden die direct in Canva Pro's Bulk Create kunnen worden geüpload.
 *
 * Gebruik:
 *   npx tsx scripts/generate-canva-csv.ts
 *   npx tsx scripts/generate-canva-csv.ts --slug=cadeaus-voor-thuiswerkers
 */

import fs from 'fs'
import path from 'path'

interface CuratedProduct {
  title: string
  price: number
  currency: string
  image: string
  affiliateLink: string
  merchant: string
  reason: string
}

interface ProgrammaticConfig {
  slug: string
  title: string
  intro: string
  curatedProducts?: CuratedProduct[]
  quickScan?: {
    personas?: Array<{
      id: string
      label: string
      summary: string
    }>
  }
}

// Emoji mapping voor categorieën
const CATEGORY_EMOJIS: Record<string, string> = {
  thuiswerkers: '🏠',
  nachtlezers: '📚',
  tech: '💻',
  gamer: '🎮',
  kerst: '🎄',
  sinterklaas: '🎁',
  duurzaam: '🌱',
  wellness: '💆',
  mode: '👗',
  sieraden: '💎',
  default: '🎁',
}

function getEmoji(slug: string): string {
  for (const [key, emoji] of Object.entries(CATEGORY_EMOJIS)) {
    if (slug.includes(key)) return emoji
  }
  return CATEGORY_EMOJIS.default
}

function extractAudience(title: string): string {
  const match = title.match(/voor\s+(.+?)(?:\s+\(|\s+onder|\s*$)/i)
  return match ? match[1] : 'je dierbaren'
}

function generateHashtags(slug: string): string {
  const base = ['#cadeautip', '#gifteez']

  if (slug.includes('thuiswerk')) {
    return ['#thuiswerken', '#homeoffice', '#ergonomisch', ...base].join(' ')
  }
  if (slug.includes('nachtlezer') || slug.includes('lees')) {
    return ['#boeken', '#lezen', '#leeslamp', ...base].join(' ')
  }
  if (slug.includes('tech') || slug.includes('gamer')) {
    return ['#techgadgets', '#gadgets', '#gaming', ...base].join(' ')
  }
  if (slug.includes('kerst')) {
    return ['#kerst', '#kerstcadeau', '#christmas', ...base].join(' ')
  }
  if (slug.includes('duurzaam')) {
    return ['#duurzaam', '#sustainable', '#ecofriendly', ...base].join(' ')
  }

  return ['#cadeau', '#cadeaus', ...base].join(' ')
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

async function generateCanvaCSV(config: ProgrammaticConfig): Promise<string> {
  const rows: string[][] = []
  const emoji = getEmoji(config.slug)
  const audience = extractAudience(config.title)
  const hashtags = generateHashtags(config.slug)
  const baseUrl = `https://gifteez.nl/cadeaugidsen/${config.slug}`

  // Header
  rows.push(['title', 'subtitle', 'price', 'cta', 'link', 'hashtags', 'image_url'])

  // Product pins
  if (config.curatedProducts) {
    for (const product of config.curatedProducts.slice(0, 10)) {
      const priceStr = `€${product.price.toFixed(2).replace('.', ',')}`
      rows.push([
        `${emoji} ${product.title}`,
        product.reason,
        priceStr,
        'Bekijk op Gifteez →',
        `${baseUrl}?utm_source=pinterest&utm_medium=pin&utm_campaign=${config.slug}`,
        hashtags,
        product.image || '',
      ])
    }
  }

  // List pin
  const productCount = config.curatedProducts?.length || 15
  rows.push([
    `${productCount} Slimme Cadeaus voor ${audience}`,
    `Complete gids 2025 - Van budget tot premium`,
    '',
    'Bekijk de gids →',
    `${baseUrl}?utm_source=pinterest&utm_medium=pin&utm_campaign=${config.slug}-gids`,
    hashtags,
    '',
  ])

  // Question pin
  rows.push([
    `Op zoek naar het perfecte cadeau?`,
    `Voor ${audience}?`,
    '',
    `Ontdek ${productCount}+ ideeën →`,
    `${baseUrl}?utm_source=pinterest&utm_medium=pin&utm_campaign=${config.slug}-question`,
    hashtags,
    '',
  ])

  // Persona pins
  if (config.quickScan?.personas) {
    for (const persona of config.quickScan.personas) {
      rows.push([
        persona.label,
        persona.summary,
        '',
        'Bekijk aanbevelingen →',
        `${baseUrl}?utm_source=pinterest&utm_medium=pin&utm_campaign=${config.slug}-${persona.id}`,
        hashtags,
        '',
      ])
    }
  }

  // Convert to CSV
  return rows.map((row) => row.map(escapeCSV).join(',')).join('\n')
}

async function main() {
  console.log('🎨 Canva Bulk Create CSV Generator\n')

  const args = process.argv.slice(2)
  const slugArg = args.find((a) => a.startsWith('--slug='))
  const targetSlug = slugArg?.split('=')[1]

  // Read programmatic config
  const configPath = path.join(process.cwd(), 'data', 'programmatic', 'index.ts')
  const configContent = fs.readFileSync(configPath, 'utf-8')

  // Extract configs (simplified parsing)
  const slugMatches = [...configContent.matchAll(/slug:\s*['"]([^'"]+)['"]/g)]
  const slugs = slugMatches.map((m) => m[1]).filter((s) => !s.includes('test'))

  const outputDir = path.join(process.cwd(), 'public', 'pinterest', 'canva')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  let generated = 0

  for (const slug of slugs) {
    if (targetSlug && slug !== targetSlug) continue

    // Create a config object based on known slugs
    const config: ProgrammaticConfig = {
      slug,
      title: `Cadeaus voor ${slug.replace(/-/g, ' ')}`,
      intro: '',
      curatedProducts: [],
      quickScan: { personas: [] },
    }

    // Special handling for thuiswerkers
    if (slug === 'cadeaus-voor-thuiswerkers') {
      config.title = 'De beste cadeaus voor thuiswerkers (2025)'
      config.curatedProducts = [
        {
          title: 'Logitech MX Master 3S Muis',
          price: 89.99,
          currency: 'EUR',
          image: 'https://m.media-amazon.com/images/I/61ni3t1ryQL._AC_SL1500_.jpg',
          affiliateLink: '',
          merchant: 'Amazon',
          reason: 'Beste ergonomische muis - 70 dagen batterij',
        },
        {
          title: 'BenQ ScreenBar Monitor Lamp',
          price: 99.0,
          currency: 'EUR',
          image: 'https://m.media-amazon.com/images/I/51uB1oUzXQL._AC_SL1000_.jpg',
          affiliateLink: '',
          merchant: 'Amazon',
          reason: 'Geen reflectie op scherm',
        },
        {
          title: 'Fellowes Memory Foam Polssteun',
          price: 24.95,
          currency: 'EUR',
          image: 'https://m.media-amazon.com/images/I/71DLB8bYpQL._AC_SL1500_.jpg',
          affiliateLink: '',
          merchant: 'Amazon',
          reason: 'Voorkomt RSI - Memory foam',
        },
        {
          title: 'HUANUO Monitorstandaard',
          price: 28.99,
          currency: 'EUR',
          image: 'https://m.media-amazon.com/images/I/71OqIpBJWRL._AC_SL1500_.jpg',
          affiliateLink: '',
          merchant: 'Amazon',
          reason: 'Scherm op ooghoogte',
        },
        {
          title: 'UGREEN USB-C Hub 7-in-1',
          price: 34.99,
          currency: 'EUR',
          image: 'https://m.media-amazon.com/images/I/61qHSaYvhCL._AC_SL1500_.jpg',
          affiliateLink: '',
          merchant: 'Amazon',
          reason: 'Alle poorten die je nodig hebt',
        },
        {
          title: 'Logitech K380 Toetsenbord',
          price: 39.99,
          currency: 'EUR',
          image: 'https://m.media-amazon.com/images/I/51yjnAAqnZL._AC_SL1500_.jpg',
          affiliateLink: '',
          merchant: 'Amazon',
          reason: 'Compact, stil, 3 apparaten',
        },
        {
          title: 'Ember Mok 2',
          price: 99.95,
          currency: 'EUR',
          image: 'https://m.media-amazon.com/images/I/61lS+ZG6GnL._AC_SL1500_.jpg',
          affiliateLink: '',
          merchant: 'Amazon',
          reason: 'Perfecte koffietemperatuur',
        },
        {
          title: 'Philips Hue Play Light Bar',
          price: 54.99,
          currency: 'EUR',
          image: 'https://m.media-amazon.com/images/I/61Nf-g3XQ+L._AC_SL1500_.jpg',
          affiliateLink: '',
          merchant: 'Amazon',
          reason: '16 miljoen kleuren',
        },
        {
          title: 'Bose QuietComfort Earbuds',
          price: 79.0,
          currency: 'EUR',
          image: 'https://m.media-amazon.com/images/I/51QnVhfpq+L._AC_SL1500_.jpg',
          affiliateLink: '',
          merchant: 'Amazon',
          reason: 'Beste noise-cancelling',
        },
        {
          title: 'Ergonomische Voetsteun',
          price: 32.99,
          currency: 'EUR',
          image: 'https://m.media-amazon.com/images/I/71tJrZvTD9L._AC_SL1500_.jpg',
          affiliateLink: '',
          merchant: 'Amazon',
          reason: 'Verbetert zithouding',
        },
      ]
      config.quickScan = {
        personas: [
          {
            id: 'productiviteit',
            label: 'De Productiviteit-Freak',
            summary: 'Gadgets die werk efficiënter maken',
          },
          { id: 'comfort', label: 'De Comfort-Zoeker', summary: 'Ergonomie voor de hele werkdag' },
          { id: 'sfeer', label: 'De Sfeer-Creator', summary: 'Mooie werkplek = betere focus' },
        ],
      }
    }

    // Special handling for nachtlezers
    if (slug === 'cadeaus-voor-nachtlezers') {
      config.title = 'De beste cadeaus voor nachtlezers (2025)'
      config.curatedProducts = [
        {
          title: 'Gritin LED Leeslamp Budget',
          price: 11.95,
          currency: 'EUR',
          image: 'https://m.media-amazon.com/images/I/81n7M-T19NL._AC_SL1500_.jpg',
          affiliateLink: '',
          merchant: 'Amazon',
          reason: 'Budget optie - 60 uur batterij',
        },
        {
          title: 'Glocusent Halslamp',
          price: 14.99,
          currency: 'EUR',
          image: 'https://m.media-amazon.com/images/I/61Psf4CwnML._AC_SL1500_.jpg',
          affiliateLink: '',
          merchant: 'Amazon',
          reason: 'Handenvrij lezen - amber licht',
        },
        {
          title: 'Gritin 3-Temp Premium',
          price: 19.99,
          currency: 'EUR',
          image: 'https://m.media-amazon.com/images/I/71XfibZzmZL._AC_SL1500_.jpg',
          affiliateLink: '',
          merchant: 'Amazon',
          reason: '3 kleurtemperaturen - 80 uur batterij',
        },
      ]
      config.quickScan = {
        personas: [
          {
            id: 'gezellig',
            label: 'De Gezellige Lezer',
            summary: 'Warme plaid, thee en amberkleurig licht',
          },
          { id: 'bed', label: 'De Bed-lezer', summary: 'Stil en geen lichtlek' },
          { id: 'focus', label: 'De Focus-lezer', summary: 'Geen blauw licht, lange batterij' },
        ],
      }
    }

    // Skip if no products
    if (!config.curatedProducts?.length) {
      console.log(`⏭️  ${slug}: Geen producten gevonden, skip`)
      continue
    }

    const csv = await generateCanvaCSV(config)
    const outputPath = path.join(outputDir, `${slug}.csv`)
    fs.writeFileSync(outputPath, csv)

    console.log(`✅ ${slug}: CSV gegenereerd (${config.curatedProducts.length + 3} rows)`)
    generated++
  }

  console.log(`\n📊 ${generated} CSV bestanden gegenereerd`)
  console.log(`📁 Output: public/pinterest/canva/`)
  console.log('\n📋 Volgende stappen:')
  console.log('   1. Download CSV van public/pinterest/canva/')
  console.log('   2. Open Canva → Apps → Bulk Create')
  console.log('   3. Upload je Pinterest Pin template')
  console.log('   4. Koppel de CSV kolommen aan je design elementen')
  console.log('   5. Genereer alle pins in één klik!')
}

main().catch(console.error)
