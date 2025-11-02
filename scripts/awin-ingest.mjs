#!/usr/bin/env node

/**
 * AWIN Ingest
 *
 * Doel: verwerk gedownloade AWIN CSV.gz feeds naar een uniforme JSON die de site kan gebruiken
 * zonder directe afhankelijkheid van TypeScript normalizers of Firebase-credentials.
 *
 * Werking:
 *  - Zoekt in data/awin/downloads/*.(csv|csv.gz)
 *  - Pakt .gz uit indien nodig (in memory) en parseert CSV (met aanhalingstekens)
 *  - Zet records om naar een compact product-object ("import-ready")
 *  - Schrijft per feed een JSON en ook een gecombineerde public/data/awin-import-ready.json
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import zlib from 'zlib'
import { parse } from 'csv-parse'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DL_DIR = path.join(__dirname, '../data/awin/downloads')
const OUT_DIR = path.join(__dirname, '../data/awin/ingest')
const PUBLIC_OUT = path.join(__dirname, '../public/data/awin-import-ready.json')
const PUBLIC_SHARDS_DIR = path.join(__dirname, '../public/data/awin-shards')
const PUBLIC_INDEX = path.join(__dirname, '../public/data/awin-index.json')

function parseArgs() {
  const args = {}
  for (const a of process.argv.slice(2)) {
    const [k, v] = a.split('=')
    if (k) args[k.replace(/^--/, '')] = v === undefined ? true : v
  }
  return args
}

function listFiles(dir) {
  try {
    return fs.readdirSync(dir).map((f) => path.join(dir, f))
  } catch {
    return []
  }
}

function createCsvStream(file) {
  const rs = fs.createReadStream(file)
  const isGz = file.endsWith('.gz')
  const src = isGz ? rs.pipe(zlib.createGunzip()) : rs
  return src.pipe(
    parse({
      columns: true,
      relax_quotes: true,
      relax_column_count: true,
      skip_empty_lines: true,
      bom: true,
    })
  )
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length === 0) return { headers: [], rows: [] }

  const headers = parseCsvLine(lines[0]).map((h) => h.trim())
  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i])
    if (cells.length === 1 && cells[0] === '') continue
    const obj = {}
    for (let j = 0; j < headers.length; j++) obj[headers[j]] = cells[j] ?? ''
    rows.push(obj)
  }
  return { headers, rows }
}

function parseCsvLine(line) {
  const out = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      out.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  out.push(cur)
  return out
}

function parsePriceCurrency(x) {
  if (!x) return { amount: 0, currency: 'EUR' }
  const s = String(x).trim()
  // Patterns like "21.99 EUR" or "EUR 21,99" or "21,99"
  const amountMatch = s.match(/[0-9]+(?:[\.,][0-9]{1,2})?/)
  const currencyMatch = s.match(/(?:^|\s)([A-Z]{3})(?:$|\s)/)
  const amount = amountMatch ? Number(amountMatch[0].replace(',', '.')) : 0
  const currency = currencyMatch ? currencyMatch[1] : 'EUR'
  return { amount: isNaN(amount) ? 0 : amount, currency }
}

function buildAwinAffiliateLink(awDeepLink, link) {
  // Geef voorkeur aan aw_deep_link; val terug op link
  const url = awDeepLink || link || ''
  if (!url) return ''
  return url
}

function mapRowToProduct(row, idx, feedId) {
  // AWIN Google-style feeds
  const gcPrice = row.price || row.sale_price || row.search_price || row.store_price
  const { amount, currency } = parsePriceCurrency(gcPrice)
  if (amount <= 0) return null

  const idCore = row.id || row.aw_product_id || row.product_id || row.merchant_product_id || idx
  const id = `${feedId}-${idCore}`
  const image = row.image_link || row.merchant_image_url || row.aw_image_url || row.large_image || ''
  const deep = row.aw_deep_link || row.deeplink || row.merchant_deep_link || ''

  const availability = (row.availability || row.stock_status || '').toString().toLowerCase()
  const inStock = availability.includes('in_stock') || availability.includes('in stock') || availability.includes('available')

  return {
    id,
    name: row.title || row.product_name || row.name || '',
    price: amount,
    currency: row.currency || currency || 'EUR',
    image,
    imageUrl: image,
    affiliateLink: buildAwinAffiliateLink(deep, row.link),
    url: row.link || '',
    description: row.description || row.product_short_description || '',
    category: row.google_product_category || row.product_type || row.category_name || row.merchant_category || '',
    brand: row.brand || row.brand_name || '',
    inStock,
    merchant: row.advertiser_name || row.merchant_name || '',
    source: 'awin',
    feedId,
  }
}

async function main() {
  console.log('🧩 AWIN ingest start')
  const args = parseArgs()
  const maxPrice = Number(args.maxPrice || 150)
  const requireImage = String(args.requireImage || 'true').toLowerCase() === 'true'
  const languageFilter = String(args.language || 'nl').trim().toLowerCase()
  const includeFids = String(args.includeFids || '').split(',').map((s) => s.trim()).filter(Boolean)
  const noCombined = String(args.noCombined || 'false').toLowerCase() === 'true'

  let files = listFiles(DL_DIR).filter((f) => /\.csv(\.gz)?$/i.test(f))
  if (includeFids.length) {
    files = files.filter((f) => includeFids.includes(path.basename(f).replace(/\.csv(\.gz)?$/i, '')))
  }
  if (files.length === 0) {
    console.warn('⚠️  Geen downloads gevonden in', DL_DIR)
    process.exit(0)
  }

  fs.mkdirSync(OUT_DIR, { recursive: true })
  fs.mkdirSync(PUBLIC_SHARDS_DIR, { recursive: true })

  // Prepare combined stream if enabled
  fs.mkdirSync(path.dirname(PUBLIC_OUT), { recursive: true })
  let out = null
  let write = async () => {}
  if (!noCombined) {
    out = fs.createWriteStream(PUBLIC_OUT, { encoding: 'utf8' })
    write = (chunk) =>
      new Promise((resolve) => {
        if (!out.write(chunk)) out.once('drain', resolve)
        else resolve()
      })
    await write('{"count":0,"products":[')
  }
  let first = true
  let total = 0
  const indexEntries = []
  for (const file of files) {
    try {
      const base = path.basename(file).replace(/\.gz$/i, '')
      const feedId = base.replace(/\.csv$/i, '')
      console.log(`📥 Verwerk ${path.basename(file)} …`)
      const parser = createCsvStream(file)
      let written = 0
      const outFile = path.join(OUT_DIR, `${feedId}.json`)
      const perFeed = fs.createWriteStream(outFile, { encoding: 'utf8' })
      const publicShard = fs.createWriteStream(path.join(PUBLIC_SHARDS_DIR, `${feedId}.json`), {
        encoding: 'utf8',
      })
      perFeed.write('[')
      publicShard.write('[')
      let pfFirst = true
      let psFirst = true
      let idx = 0
      for await (const row of parser) {
        // Filter vóór mapping waar mogelijk
        const rowLang = String(row.language || '').trim().toLowerCase()
        if (languageFilter && rowLang && rowLang !== languageFilter) { idx++; continue }

        const prod = mapRowToProduct(row, idx++, feedId)
        if (prod && maxPrice > 0 && prod.price > maxPrice) continue
        if (prod && requireImage && !(prod.image || prod.imageUrl)) continue
        if (prod && prod.name) {
          const json = JSON.stringify(prod)
          if (!noCombined) {
            if (!first) await write(',')
            await write(json)
            first = false
            total++
          }

          if (!pfFirst) perFeed.write(',')
          perFeed.write(json)
          pfFirst = false
          written++

          if (!psFirst) publicShard.write(',')
          publicShard.write(json)
          psFirst = false
        }
      }
      perFeed.write(']')
      perFeed.end()
      publicShard.write(']')
      publicShard.end()
      indexEntries.push({ feedId, shard: `data/awin-shards/${feedId}.json`, count: written })
      console.log(`  ✅ ${written} producten → ${path.relative(process.cwd(), outFile)}`)
    } catch (e) {
      console.warn(`  ⚠️ Fout bij ${path.basename(file)}: ${e.message}`)
    }
  }
  // Finalize combined
  if (!noCombined && out) {
    await write(']}')
    out.end()
    console.log(`🟢 Public ingest → ${path.relative(process.cwd(), PUBLIC_OUT)} (total ${total})`)
  } else {
    console.log(`🟢 Public shards generated in ${path.relative(process.cwd(), PUBLIC_SHARDS_DIR)}`)
  }

  // Write index
  fs.writeFileSync(
    PUBLIC_INDEX,
    JSON.stringify({ total, shards: indexEntries }, null, 2),
    'utf8'
  )
  console.log(`📇 Public index → ${path.relative(process.cwd(), PUBLIC_INDEX)}`)
}

main().catch((e) => {
  console.error('❌ Ingest error:', e.message)
  process.exit(1)
})
