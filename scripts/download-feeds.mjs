#!/usr/bin/env node
/**
 * Feed Download Helper
 * Script om meerdere AWIN/affiliate feeds te downloaden en te normaliseren
 * 
 * Usage:
 *   node scripts/download-feeds.mjs
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { resolve } from 'path'

const FEEDS_DIR = resolve('./data/feeds')

// Ensure feeds directory exists
if (!existsSync(FEEDS_DIR)) {
  mkdirSync(FEEDS_DIR, { recursive: true })
  console.log('✓ Created feeds directory')
}

console.log(`
📦 Feed Download Helper
${'='.repeat(60)}

Je huidige feed setup:
- Coolblue (AWIN): ✅ 65k producten (fashion/lifestyle)

Aanbevolen feeds om toe te voegen:

1. Bol.com via AWIN
   - Breed assortiment
   - Tech, gaming, boeken, speelgoed
   - Nederlandse retailer
   - AWIN Advertiser ID: 2527

2. MediaMarkt via AWIN  
   - Elektronica & gadgets
   - Gaming hardware
   - Smart home producten
   - AWIN Advertiser ID: 2706

3. Coolblue Native Feed (optional)
   - Directe feed zonder AWIN
   - Betere data kwaliteit
   - Snellere updates

${'='.repeat(60)}

STAPPEN OM FEEDS TOE TE VOEGEN:

1. Download feed via AWIN dashboard
   → https://ui.awin.com/merchant-profile/
   → Zoek merchant
   → Download CSV feed

2. Plaats in data/feeds/
   → data/feeds/bol-feed.csv
   → data/feeds/mediamarkt-feed.csv

3. Update build script
   → Uncomment feed paths in scripts/build-programmatic-indices.mts

4. Run build
   → npm run classifier:build

${'='.repeat(60)}

TIP: Voor automatische downloads, gebruik AWIN API:
https://wiki.awin.com/index.php/Product_Feeds

Je huidige API credentials zijn in je .env file.

`)

console.log('📁 Huidige feeds:')
console.log('  - coolblue-feed.csv (65k products)')
console.log('  - coolblue-test-500.csv (test feed)')
console.log('')
console.log('💡 Volgende stap: Download feeds via AWIN dashboard')
console.log('   en plaats ze in data/feeds/')
