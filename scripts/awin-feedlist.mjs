#!/usr/bin/env node

/**
 * AWIN FeedList Downloader
 *
 * Fetches your publisher feed list with last update time, language, region, and a sample download URL.
 * Can be used in automation to only download updated feeds or bootstrap multiple advertiser feeds at once.
 *
 * Usage:
 *   node scripts/awin-feedlist.mjs
 *   AWIN_PUBLISHER_ID=2566111 AWIN_API_KEY=xxxx node scripts/awin-feedlist.mjs
 *   node scripts/awin-feedlist.mjs --url="https://ui.awin.com/productdata-darwin-download/publisher/<pub>/<key>/1/feedList"
 *
 * Output:
 *   Saves the raw payload and a normalized summary into data/awin/
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const OUT_DIR = path.join(__dirname, '../data/awin')
const RAW_FILE = path.join(OUT_DIR, 'feedlist.raw.json')
const SUMMARY_FILE = path.join(OUT_DIR, 'feedlist.summary.json')

function getEnv(name, fallbacks = []) {
  if (process.env[name]) return process.env[name]
  for (const fb of fallbacks) {
    if (process.env[fb]) return process.env[fb]
  }
  return ''
}

function parseArgs() {
  const args = {}
  for (const a of process.argv.slice(2)) {
    const [k, v] = a.split('=')
    if (k && v) args[k.replace(/^--/, '')] = v
  }
  return args
}

function buildUrl() {
  const args = parseArgs()
  if (args.url) return args.url

  const publisherId = getEnv('AWIN_PUBLISHER_ID', ['VITE_AWIN_PUBLISHER_ID'])
  const apiKey = getEnv('AWIN_API_KEY', ['VITE_AWIN_API_KEY'])

  if (!publisherId || !apiKey) {
    console.error('Missing AWIN credentials. Provide either:')
    console.error(' - AWIN_PUBLISHER_ID and AWIN_API_KEY environment variables, or')
    console.error(' - VITE_AWIN_PUBLISHER_ID and VITE_AWIN_API_KEY (fallback), or')
    console.error(' - --url="<full feedList URL>"')
    process.exit(1)
  }

  return `https://ui.awin.com/productdata-darwin-download/publisher/${publisherId}/${apiKey}/1/feedList`
}

async function fetchFeedList(url) {
  const res = await fetch(url, {
    headers: { Accept: 'application/json, text/plain, */*' },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`FeedList request failed: ${res.status} ${res.statusText} ${text.substring(0, 200)}`)
  }
  const text = await res.text()

  // Try JSON parse; fall back to CSV-like text handling
  try {
    return { raw: JSON.parse(text), format: 'json' }
  } catch {
    return { raw: text, format: 'text' }
  }
}

function normalize(raw) {
  // AWIN feedList typically returns an array of feeds or an object containing feeds
  const asArray = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.feeds)
    ? raw.feeds
    : Array.isArray(raw?.data)
    ? raw.data
    : []

  const feeds = asArray.map((f) => ({
    feedId: String(f.feedId || f.fid || f.data_feed_id || ''),
    advertiserId: String(f.advertiserId || f.merchant_id || f.mid || ''),
    advertiserName: f.advertiserName || f.merchant || f.merchant_name || '',
    country: f.country || f.programmeRegion || f.region || '',
    language: f.language || f.lang || '',
    lastUpdated: f.lastUpdated || f.last_updated || f.updatedAt || '',
    // Some payloads include a direct example URL; otherwise omit
    exampleUrl: f.exampleUrl || f.example_download_url || f.url || undefined,
  }))

  return feeds.filter((x) => x.feedId || x.advertiserId || x.advertiserName)
}

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true })
}

async function saveJson(file, obj) {
  await fs.promises.writeFile(file, JSON.stringify(obj, null, 2), 'utf8')
}

function maskUrl(u) {
  if (!u) return u
  try {
    const url = new URL(u)
    // Replace key-like segments with *** for safety
    url.pathname = url.pathname.replace(/\/([0-9a-f]{16,})/gi, '/***')
    return url.toString()
  } catch {
    return u
  }
}

async function main() {
  console.log('🔎 Fetching AWIN feed list…')
  const url = buildUrl()
  console.log('URL:', maskUrl(url))

  const { raw, format } = await fetchFeedList(url)

  await ensureDir(OUT_DIR)
  await saveJson(RAW_FILE, raw)

  if (format === 'json') {
    const summary = normalize(raw)
    await saveJson(SUMMARY_FILE, {
      fetchedAt: new Date().toISOString(),
      count: summary.length,
      feeds: summary,
    })

    // Pretty-print summary to console
    console.log(`✅ Retrieved ${summary.length} feeds`)
    for (const f of summary.slice(0, 10)) {
      console.log(` - ${f.advertiserName || 'Unknown'} (mid=${f.advertiserId || '?'}, fid=${f.feedId || '?'}, lang=${f.language || '?'}, region=${f.country || '?'}, updated=${f.lastUpdated || '?'})`)
    }
    if (summary.length > 10) console.log(` … and ${summary.length - 10} more`)
    console.log(`📄 Saved raw → ${path.relative(process.cwd(), RAW_FILE)}`)
    console.log(`📄 Saved summary → ${path.relative(process.cwd(), SUMMARY_FILE)}`)
  } else {
    // Text/CSV fallback: attempt to parse CSV
    console.warn('ℹ️ Feed list was not JSON. Attempting CSV parse…')
    try {
      const text = typeof raw === 'string' ? raw : ''
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
      // Some feeds prepend a generated timestamp line without headers; skip if it has < 5 commas
      const dataLines = lines.filter((l) => (l.match(/,/g) || []).length >= 5)

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
        return out.map((s) => s.replace(/^"|"$/g, ''))
      }

      const rows = dataLines.map(parseCsvLine)
      const feeds = []
      for (const r of rows) {
        // Expected column guess (no header present):
        // 0: advertiserId, 1: advertiserName, 2: country, 3: status, 4: type, 5: feedId,
        // 6: feedTitleOrSource, 7: language, 8: category (optional), 9: lastUpdated, 10: lastProcessed,
        // 11: productCount, 12: downloadUrl
        if ((r[5] || '').toLowerCase() === 'feed id' || (r[0] || '').toLowerCase() === 'advertiser id') {
          continue // skip header row
        }
        const feed = {
          feedId: String(r[5] || ''),
          advertiserId: String(r[0] || ''),
          advertiserName: r[1] || '',
          country: r[2] || '',
          language: r[7] || '',
          lastUpdated: r[9] || '',
          exampleUrl: r[12] || undefined,
        }
        if (feed.feedId || feed.advertiserId || feed.advertiserName) {
          feeds.push(feed)
        }
      }

      await saveJson(SUMMARY_FILE, {
        fetchedAt: new Date().toISOString(),
        count: feeds.length,
        feeds,
      })

      console.log(`✅ Parsed ${feeds.length} feeds from CSV`)
      for (const f of feeds.slice(0, 10)) {
        console.log(` - ${f.advertiserName || 'Unknown'} (mid=${f.advertiserId || '?'}, fid=${f.feedId || '?'}, lang=${f.language || '?'}, region=${f.country || '?'}, updated=${f.lastUpdated || '?'})`)
      }
      if (feeds.length > 10) console.log(` … and ${feeds.length - 10} more`)
      console.log(`📄 Saved raw → ${path.relative(process.cwd(), RAW_FILE)}`)
      console.log(`📄 Saved summary → ${path.relative(process.cwd(), SUMMARY_FILE)}`)
    } catch (e) {
      console.warn('⚠️ CSV parse failed:', e.message)
      console.log(`📄 Saved raw → ${path.relative(process.cwd(), RAW_FILE)}`)
    }
  }
}

main().catch((err) => {
  console.error('❌ Failed to fetch AWIN feed list:', err.message)
  process.exit(1)
})
