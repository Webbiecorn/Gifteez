#!/usr/bin/env node

/**
 * Script to fetch Amazon products from Firebase that were added via admin panel
 * for the "Gift Sets voor Mannen 2025" blog post
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyDj5gOEG3GXF3aUGcPKuYE0gGBOUzcUC2M',
  authDomain: 'gifteez-7533b.firebaseapp.com',
  projectId: 'gifteez-7533b',
  storageBucket: 'gifteez-7533b.firebasestorage.app',
  messagingSenderId: '1028916628623',
  appId: '1:1028916628623:web:3c9c30a0b7d30e9b63e3a0',
  measurementId: 'G-LWRC93Z2J3',
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function fetchBlogProducts() {
  try {
    console.log('📦 Fetching Amazon products from Firebase...\n')

    const q = query(collection(db, 'amazonProducts'), orderBy('updatedAt', 'desc'))
    const snapshot = await getDocs(q)

    console.log(`✅ Found ${snapshot.size} products\n`)
    console.log('=' .repeat(80))

    const products = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      products.push({
        id: doc.id,
        ...data,
      })

      console.log(`\n📌 Product: ${data.name}`)
      console.log(`   ID: ${doc.id}`)
      console.log(`   ASIN: ${data.asin || 'N/A'}`)
      console.log(`   Price: ${data.price ? `€${data.price}` : 'N/A'}`)
      console.log(`   Image: ${data.image || data.imageLarge || 'N/A'}`)
      console.log(`   Link: ${data.affiliateLink?.substring(0, 80)}...`)
      console.log(`   Category: ${data.category || 'N/A'}`)
      console.log(`   In Stock: ${data.inStock !== false ? 'Yes' : 'No'}`)
      console.log('   ' + '-'.repeat(76))
    })

    console.log('\n' + '='.repeat(80))
    console.log(`\n📊 Total products: ${products.length}`)

    // Look for recently added products (likely the blog products)
    const recent = products.filter((p) => {
      const updated = p.updatedAt?.toDate?.() || new Date(p.updatedAt || 0)
      const hoursSince = (Date.now() - updated.getTime()) / (1000 * 60 * 60)
      return hoursSince < 24 // Products added in last 24 hours
    })

    if (recent.length > 0) {
      console.log(`\n🆕 Recently added (last 24h): ${recent.length} products`)
      recent.forEach((p) => {
        console.log(`   - ${p.name} (${p.id})`)
      })
    }

    // Export as JSON for easy use
    console.log('\n\n📝 JSON Export (for blogData.ts):')
    console.log('='.repeat(80))
    console.log(JSON.stringify(products, null, 2))
  } catch (error) {
    console.error('❌ Error fetching products:', error)
    process.exit(1)
  }
}

fetchBlogProducts()
