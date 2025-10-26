#!/usr/bin/env node

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFile, writeFile, access, mkdir } from 'fs/promises'
import { constants as fsConstants } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * PartyPro.nl Product Importer
 * Downloads PartyPro feed from Awin and imports to Firebase
 */
class PartyProImporter {
  static AWIN_API_KEY = 'f9a87f48c21acebcd87fced8bb38eca5'
  static MERCHANT_ID = '102231' // PartyPro.nl
  static AFFILIATE_ID = '2566111'
  static DOWNLOAD_DIR = path.join(__dirname, '../data')
  static FEED_FILE = path.join(this.DOWNLOAD_DIR, 'partypro-feed.csv')
  static JSON_OUTPUT = path.join(this.DOWNLOAD_DIR, 'partypro-import-ready.json')
  static PUBLIC_JSON_OUTPUT = path.join(__dirname, '../public/data/partypro-import-ready.json')

  /**
   * Download PartyPro feed from Awin
   */
  static async downloadFeed() {
    console.log('🎉 Downloading PartyPro feed from Awin...')
    
    // Build feed URL for merchant 102231
    const feedUrl = `https://productdata.awin.com/datafeed/download/apikey/${this.AWIN_API_KEY}/language/nl/mid/${this.MERCHANT_ID}/columns/aw_deep_link,product_name,aw_product_id,merchant_product_id,merchant_image_url,description,merchant_category,search_price,merchant_name,merchant_id,category_name,aw_image_url,currency,delivery_cost,brand_name,colour,product_short_description,condition,in_stock,ean,mpn/format/csv/delimiter/%2C/compression/gzip/`

    try {
      const tempGzFile = this.FEED_FILE + '.gz'
      
      console.log('📡 Downloading from Awin API...')
      await execAsync(`curl -L -o "${tempGzFile}" "${feedUrl}"`)
      
      console.log('📦 Decompressing...')
      await execAsync(`gunzip -f "${tempGzFile}"`)
      
      const { stdout } = await execAsync(`wc -l "${this.FEED_FILE}"`)
      const lineCount = parseInt(stdout.split(' ')[0])
      
      console.log(`✅ Downloaded ${lineCount.toLocaleString()} products`)
      return true
    } catch (error) {
      console.error('❌ Download failed:', error.message)
      return false
    }
  }

  /**
   * Parse CSV and convert to JSON
   */
  static async parseFeedToJson() {
    console.log('🔄 Parsing CSV feed to JSON...')
    
    try {
      const csvContent = await readFile(this.FEED_FILE, 'utf-8')
      const lines = csvContent.split('\n')
      const headers = lines[0].split(',')
      
      const products = []
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue
        
        // Simple CSV parsing (may need improvement for complex fields)
        const values = line.split(',')
        const product = {}
        
        headers.forEach((header, index) => {
          product[header.trim()] = values[index]?.trim() || ''
        })
        
        // Skip if missing essential fields
        if (!product.product_name || !product.search_price) continue
        
        // Transform to our format
        const price = parseFloat(product.search_price) || 0
        if (price <= 0) continue
        
        const transformedProduct = {
          id: `partypro-${product.aw_product_id}-${products.length}`,
          name: product.product_name || '',
          price: parseFloat(product.search_price) || 0,
          image: product.merchant_image_url || product.aw_image_url || '',
          imageUrl: product.merchant_image_url || product.aw_image_url || '',
          // Store both image URLs for fallback
          awinImageUrl: product.aw_image_url || '',
          merchantImageUrl: product.merchant_image_url || '',
          affiliateLink: this.buildAffiliateLink(product.aw_deep_link),
          description: product.description || '',
          shortDescription: product.product_short_description?.substring(0, 150) || '',
          category: product.category_name || product.merchant_category || '',
          brand: product.brand_name || 'PartyPro',
          giftScore: 8,
          inStock: product.in_stock === 'Yes' || product.in_stock === '1',
          merchant: 'PartyPro.nl',
          source: 'partypro',
          currency: product.currency || 'EUR',
          active: true,
          featured: false,
          color: product.colour || '',
          ean: product.ean || '',
          mpn: product.mpn || '',
        }
        
        products.push(transformedProduct)
      }
      
      console.log(`✅ Parsed ${products.length} valid products`)
      
      // Save to data directory
      await writeFile(this.JSON_OUTPUT, JSON.stringify(products, null, 2))

      // Ensure public data directory exists and keep fallback in sync
      await mkdir(path.dirname(this.PUBLIC_JSON_OUTPUT), { recursive: true })
      await writeFile(this.PUBLIC_JSON_OUTPUT, JSON.stringify(products, null, 2))

      console.log(`💾 Saved to ${this.JSON_OUTPUT}`)
      console.log(`� Synced to ${this.PUBLIC_JSON_OUTPUT}`)
      
      return products
    } catch (error) {
      console.error('❌ Parsing failed:', error.message)
      return []
    }
  }

  /**
   * Build affiliate link with our affiliate ID
   */
  static buildAffiliateLink(deepLink) {
    if (!deepLink) return ''
    
    // If it's already an Awin link, return as-is
    if (deepLink.includes('awin1.com')) return deepLink
    
    // Build Awin affiliate link
    const encodedUrl = encodeURIComponent(deepLink)
    return `https://www.awin1.com/cread.php?awinmid=${this.MERCHANT_ID}&awinaffid=${this.AFFILIATE_ID}&ued=${encodedUrl}`
  }

  /**
   * Import products to Firebase
   */
  static async importToFirebase(products) {
    console.log('🔥 Importing to Firebase...')
    
    try {
      // Initialize Firebase Admin
      const serviceAccountPath = path.join(__dirname, '../gifteez-7533b-firebase-adminsdk.json')

      try {
        await access(serviceAccountPath, fsConstants.F_OK)
      } catch {
        console.warn('⚠️  Firebase credentials not found, skipping Firestore import step.')
        return 'skipped'
      }

      const serviceAccount = JSON.parse(await readFile(serviceAccountPath, 'utf-8'))
      
      initializeApp({
        credential: cert(serviceAccount)
      })
      
      const db = getFirestore()
      const batch = db.batch()
      let count = 0
      
      for (const product of products) {
        const docRef = db.collection('products').doc(product.id)
        batch.set(docRef, {
          ...product,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        
        count++
        
        // Commit in batches of 500 (Firestore limit)
        if (count % 500 === 0) {
          await batch.commit()
          console.log(`   ✓ Imported ${count}/${products.length} products`)
        }
      }
      
      // Commit remaining
      if (count % 500 !== 0) {
        await batch.commit()
      }
      
      console.log(`✅ Successfully imported ${count} products to Firebase!`)
      return true
    } catch (error) {
  console.error('❌ Firebase import failed:', error.message)
  return false
    }
  }

  /**
   * Main execution
   */
  static async run() {
    console.log('🎉 PartyPro.nl Product Importer')
    console.log('═══════════════════════════════════════\n')
    
    // Step 1: Download feed
    const downloaded = await this.downloadFeed()
    if (!downloaded) {
      console.error('❌ Failed to download feed')
      process.exit(1)
    }
    
    // Step 2: Parse to JSON
    const products = await this.parseFeedToJson()
    if (products.length === 0) {
      console.error('❌ No products to import')
      process.exit(1)
    }
    
    // Step 3: Import to Firebase
    console.log(`\n📊 Ready to import ${products.length} products`)
    console.log('⚠️  This will add products to Firebase (if credentials are available)')

    const autoConfirm =
      process.env.AUTO_CONFIRM === 'true' ||
      process.env.CI === 'true' ||
      process.argv.includes('--auto')

    if (!autoConfirm) {
      console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n')
      await new Promise(resolve => setTimeout(resolve, 5000))
    } else {
      console.log('⚙️  Auto-confirm enabled, continuing without delay.\n')
    }

    const imported = await this.importToFirebase(products)

    if (imported === true) {
  console.log('\n✨ Import complete!')
  console.log('🎉 PartyPro products are now available on your site')
      process.exit(0)
    }

    if (imported === 'skipped') {
      console.log('\nℹ️  Firebase import overgeslagen – JSON fallback is wel bijgewerkt.')
      process.exit(0)
    }

    process.exit(1)
  }
}

// Run if called directly
PartyProImporter.run().catch(console.error)

export default PartyProImporter
