#!/usr/bin/env node

/**
 * AWIN Selective Feed Downloader
 *
 * Reads data/awin/feedlist.summary.json, applies filters, and downloads only the selected feeds.
 * Defaults:
 *  - countries: NL, BE
 *  - languages: nl, en
 *  - maxAgeHours: 48
 *  - limit: 25
 *  - outDir: data/awin/downloads
 *  - dryRun: false
 *
 * Usage examples:
 *  node scripts/awin-selective-download.mjs
 *  node scripts/awin-selective-download.mjs --countries=NL,BE --languages=nl,en --maxAgeHours=24 --limit=10
 *  node scripts/awin-selective-download.mjs --outDir=data/awin/downloads --dryRun=true
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SUMMARY_FILE = path.join(__dirname, '../data/awin/feedlist.summary.json')

function parseArgs() {
  const args = {}
  for (const a of process.argv.slice(2)) {
    const [k, v] = a.split('=')
    if (k && v !== undefined) args[k.replace(/^--/, '')] = v
  }
  return args
}

function readSummary() {
  const raw = fs.readFileSync(SUMMARY_FILE, 'utf8')
  return JSON.parse(raw)
}

function toList(val, fallback) {
  if (!val) return fallback
  return String(val)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function parseAwinDate(s) {
  // Input like "2025-11-02 03:02:50"; treat as UTC if no timezone supplied
  if (!s || typeof s !== 'string') return null
  const iso = s.replace(' ', 'T') + 'Z'
  const d = new Date(iso)
  return isNaN(d.getTime()) ? null : d
}

function maskUrl(u) {
  try {
    const url = new URL(u)
    url.pathname = url.pathname.replace(/\/([0-9a-f]{16,})/gi, '/***')
    return url.toString()
  } catch {
    return u
  }
}

function normalizeLangToken(s) {
  const t = String(s || '').trim().toLowerCase()
  const map = {
    english: 'en', en: 'en',
    dutch: 'nl', nederlands: 'nl', nl: 'nl',
    german: 'de', deutsch: 'de', de: 'de',
    french: 'fr', francais: 'fr', fr: 'fr',
    danish: 'da', da: 'da',
    norwegian: 'no', no: 'no',
    swedish: 'sv', sv: 'sv',
    finnish: 'fi', fi: 'fi',
    polish: 'pl', pl: 'pl',
    portuguese: 'pt', pt: 'pt',
    italian: 'it', it: 'it',
    spanish: 'es', es: 'es'
  }
  return map[t] || t
}

async function downloadTo(url, dest) {
  const res = await fetch(url)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Download failed: ${res.status} ${res.statusText} ${text.slice(0, 200)}`)
  }
  const buf = Buffer.from(await res.arrayBuffer())
  await fs.promises.mkdir(path.dirname(dest), { recursive: true })
  await fs.promises.writeFile(dest, buf)
}

async function main() {
  const args = parseArgs()
  const countries = toList(args.countries, ['NL', 'BE'])
  const languages = toList(args.languages, ['nl', 'en', 'EN', 'NL'])
  const maxAgeHours = Number(args.maxAgeHours || 48)
  const limit = Number(args.limit || 25)
  const outDir = args.outDir || 'data/awin/downloads'
  const dryRun = String(args.dryRun || '').toLowerCase() === 'true'
  const whitelistFids = toList(args.whitelistFids, [])

  const summary = readSummary()
  const now = new Date()

  const targetLangs = languages.map((L) => normalizeLangToken(L))

  const candidates = (summary.feeds || []).filter((f) => {
    if (!f.exampleUrl) return false
    if (countries.length && !countries.includes(String(f.country || '').toUpperCase())) return false
    const feedLang = normalizeLangToken(f.language)
    if (targetLangs.length && !targetLangs.includes(feedLang)) return false
    const d = parseAwinDate(f.lastUpdated)
    if (d) {
      const ageH = (now.getTime() - d.getTime()) / 36e5
      if (ageH > maxAgeHours) return false
    }
    if (whitelistFids.length && !whitelistFids.includes(String(f.feedId))) return false
    return true
  })

  const selected = candidates.slice(0, limit)

  console.log(`🎯 Selected ${selected.length} feeds (of ${candidates.length} candidates) for download`) 
  for (const f of selected) {
    const destName = `${f.feedId || 'unknown'}.csv.gz`
    const dest = path.join(outDir, destName)
    if (dryRun) {
      console.log(` - [DRY-RUN] ${f.advertiserName} (mid=${f.advertiserId}, fid=${f.feedId}, ${f.country}/${f.language}) → ${path.relative(process.cwd(), dest)} :: ${maskUrl(f.exampleUrl)}`)
      continue
    }
    try {
      console.log(`⬇️  Downloading ${f.advertiserName} (fid=${f.feedId}) → ${path.relative(process.cwd(), dest)} :: ${maskUrl(f.exampleUrl)}`)
      await downloadTo(f.exampleUrl, dest)
      console.log(`✅ Saved ${dest}`)
    } catch (e) {
      console.warn(`⚠️  Failed ${f.feedId}: ${e.message}`)
    }
  }

  if (dryRun) {
    console.log('ℹ️ Dry run complete. Use --dryRun=false to perform downloads.')
  }
}

main().catch((e) => {
  console.error('❌ Error:', e.message)
  process.exit(1)
})
