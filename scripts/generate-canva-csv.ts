#!/usr/bin/env npx tsx
/**
 * Canva Bulk Create CSV Generator
 * Haalt producten direct uit de PROGRAMMATIC_INDEX.
 */

import fs from 'fs'
import path from 'path'
import { PROGRAMMATIC_INDEX } from '../data/programmatic/index.ts'

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
  if (slug.includes('thuiswerk'))
    return ['#thuiswerken', '#homeoffice', '#ergonomisch', ...base].join(' ')
  if (slug.includes('nachtlezer')) return ['#boeken', '#lezen', '#leeslamp', ...base].join(' ')
  if (slug.includes('tech') || slug.includes('gamer'))
    return ['#techgadgets', '#gadgets', '#gaming', ...base].join(' ')
  if (slug.includes('kerst')) return ['#kerst', '#kerstcadeau', '#christmas', ...base].join(' ')
  if (slug.includes('duurzaam'))
    return ['#duurzaam', '#sustainable', '#ecofriendly', ...base].join(' ')
  return ['#cadeau', '#cadeaus', ...base].join(' ')
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function generateCanvaCSV(config: (typeof PROGRAMMATIC_INDEX)[string]): string {
  const rows: string[][] = []
  const emoji = getEmoji(config.slug)
  const audience = extractAudience(config.title)
  const hashtags = generateHashtags(config.slug)
  const baseUrl = `https://gifteez.nl/cadeaugidsen/${config.slug}`

  rows.push(['title', 'subtitle', 'price', 'cta', 'link', 'hashtags', 'image_url'])

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

  const productCount = config.curatedProducts?.length || 15
  rows.push([
    `${productCount} Slimme Cadeaus voor ${audience}`,
    'Complete gids 2025 - Van budget tot premium',
    '',
    'Bekijk de gids →',
    `${baseUrl}?utm_source=pinterest&utm_medium=pin&utm_campaign=${config.slug}-gids`,
    hashtags,
    '',
  ])

  rows.push([
    'Op zoek naar het perfecte cadeau?',
    `Voor ${audience}?`,
    '',
    `Ontdek ${productCount}+ ideeën →`,
    `${baseUrl}?utm_source=pinterest&utm_medium=pin&utm_campaign=${config.slug}-question`,
    hashtags,
    '',
  ])

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

  return rows.map((row) => row.map(escapeCSV).join(',')).join('\n')
}

async function main() {
  console.log('🎨 Canva Bulk Create CSV Generator\n')

  const args = process.argv.slice(2)
  const slugArg = args.find((a) => a.startsWith('--slug='))
  const targetSlug = slugArg?.split('=')[1]

  const outputDir = path.join(process.cwd(), 'public', 'pinterest', 'canva')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  let generated = 0

  for (const [slug, config] of Object.entries(PROGRAMMATIC_INDEX)) {
    if (targetSlug && slug !== targetSlug) continue
    if (!config.curatedProducts?.length) {
      console.log(`⏭️  ${slug}: Geen curatedProducts, skip`)
      continue
    }

    const csv = generateCanvaCSV(config)
    const outputPath = path.join(outputDir, `${slug}.csv`)
    fs.writeFileSync(outputPath, csv)

    const rowCount = config.curatedProducts.length + 2 + (config.quickScan?.personas?.length || 0)
    console.log(`✅ ${slug}: CSV gegenereerd (${rowCount} rows)`)
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
