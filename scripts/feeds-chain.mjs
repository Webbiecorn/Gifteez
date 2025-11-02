#!/usr/bin/env node

/**
 * Feeds Chain Runner
 *
 * Orchestrates: list (optional) → selective download → ingest
 *
 * Usage examples:
 *  node scripts/feeds-chain.mjs --skipList=true --countries=NL,BE --languages=nl,en --maxAgeHours=72 --limit=10
 *  node scripts/feeds-chain.mjs --url="<AWIN feedList URL>" --countries=NL,BE --languages=nl,en --limit=50
 *
 * CLI flags (all optional):
 *  --url=<feedListUrl>            If present, will (re)generate feedlist summary
 *  --skipList=true|false          Skip feed list step (default: false if url/env present, true otherwise)
 *  --countries=NL,BE
 *  --languages=nl,en
 *  --maxAgeHours=48
 *  --limit=25
 *  --outDir=data/awin/downloads
 *  --dryRun=true|false            Pass-through to downloader (default false)
 *  --whitelistFids=F951,F1655     Restrict downloads to these AWIN feed IDs (optional)
 *  --maxPrice=150                 Ingest filter: only products <= this price
 *  --requireImage=true            Ingest filter: require image
 *  --language=nl                  Ingest filter: only this language if present
 */

import { exec as _exec } from 'node:child_process'
import { promisify } from 'node:util'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const exec = promisify(_exec)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function parseArgs() {
  const args = {}
  for (const a of process.argv.slice(2)) {
    const [k, v] = a.split('=')
    if (k) args[k.replace(/^--/, '')] = v === undefined ? true : v
  }
  return args
}

function exists(p) {
  try { fs.accessSync(p); return true } catch { return false }
}

async function run(cmd) {
  console.log('▶️', cmd)
  const { stdout, stderr } = await exec(cmd)
  if (stdout) process.stdout.write(stdout)
  if (stderr) process.stderr.write(stderr)
}

async function main() {
  const args = parseArgs()
  const url = args.url || process.env.AWIN_FEEDLIST_URL || ''
  let skipList = String(args.skipList ?? '').toLowerCase() === 'true'

  const summaryFile = path.join(__dirname, '../data/awin/feedlist.summary.json')

  // Decide whether to run feedlist step
  if (!skipList) {
    if (url) {
      await run(`node scripts/awin-feedlist.mjs --url="${url}"`)
    } else if (exists(summaryFile)) {
      console.log('ℹ️ No URL provided; existing summary found. Skipping feed list step.')
    } else {
      console.log('ℹ️ No URL and no summary.json; attempting env-based feed list…')
      await run('node scripts/awin-feedlist.mjs')
    }
  } else {
    console.log('⏭️  Skip feed list step')
  }

  const countries = args.countries || 'NL,BE'
  const languages = args.languages || 'nl,en'
  const maxAgeHours = args.maxAgeHours || '48'
  const limit = args.limit || '25'
  const outDir = args.outDir || 'data/awin/downloads'
  const dryRun = String(args.dryRun || 'false')
  const whitelistFids = args.whitelistFids || ''

  await run(`node scripts/awin-selective-download.mjs --countries=${countries} --languages=${languages} --maxAgeHours=${maxAgeHours} --limit=${limit} --outDir=${outDir} --dryRun=${dryRun} ${whitelistFids ? `--whitelistFids=${whitelistFids}` : ''}`.trim())
  const ingestMaxPrice = args.maxPrice || '150'
  const ingestRequireImage = String(args.requireImage || 'true')
  const ingestLanguage = args.language || 'nl'
  const includeFids = whitelistFids
  const noCombined = String(args.noCombined || 'false')
  await run(`node scripts/awin-ingest.mjs --maxPrice=${ingestMaxPrice} --requireImage=${ingestRequireImage} --language=${ingestLanguage} ${includeFids ? `--includeFids=${includeFids}` : ''} --noCombined=${noCombined}`.trim())

  console.log('✅ Feeds chain completed')
}

main().catch((e) => {
  console.error('❌ Chain failed:', e.message)
  process.exit(1)
})
