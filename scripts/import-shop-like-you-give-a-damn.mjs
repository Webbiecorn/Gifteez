#!/usr/bin/env node

import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Generate import commands for Shop Like You Give A Damn products
 * This creates a JSON file that can be imported via the admin interface
 */
class ProductExporter {
  static INPUT_FILE = path.join(__dirname, '../data/shop-like-you-give-a-damn-top1000.json');
  static OUTPUT_FILE = path.join(__dirname, '../data/shop-like-you-give-a-damn-import-ready.json');

  static async prepareForImport() {
    console.log('� Preparing Products for Import');
    console.log('═══════════════════════════════════\n');
    
    // Read products
    const data = await readFile(this.INPUT_FILE, 'utf-8');
    const products = JSON.parse(data);
    
    console.log(`✅ Loaded ${products.length} products`);
    
    // Transform to import format
    const importReady = products.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      imageUrl: product.image, // Alias
      affiliateLink: product.affiliateLink,
      description: product.description,
      shortDescription: product.description?.substring(0, 200) + '...',
      category: 'Duurzame & Vegan Cadeaus',
      tags: product.tags,
      brand: product.brand,
      giftScore: product.giftScore,
      inStock: product.inStock,
      merchant: product.merchant,
      source: product.source,
      color: product.color,
      material: product.material,
      originalPrice: product.originalPrice,
      currency: product.currency || 'EUR',
      active: true,
      featured: product.giftScore >= 9.5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    
    // Save
    await writeFile(this.OUTPUT_FILE, JSON.stringify(importReady, null, 2));
    
    console.log(`💾 Saved import-ready file: ${this.OUTPUT_FILE}`);
    console.log(`\n📊 Statistics:`);
    console.log(`   Total products: ${importReady.length}`);
    console.log(`   Featured (score ≥9.5): ${importReady.filter(p => p.featured).length}`);
    console.log(`   Average price: €${(importReady.reduce((sum, p) => sum + p.price, 0) / importReady.length).toFixed(2)}`);
    console.log(`   Average gift score: ${(importReady.reduce((sum, p) => sum + p.giftScore, 0) / importReady.length).toFixed(2)}/10`);
    
    // Price ranges
    console.log(`\n� Price Distribution:`);
    console.log(`   €10-€50: ${importReady.filter(p => p.price >= 10 && p.price < 50).length}`);
    console.log(`   €50-€100: ${importReady.filter(p => p.price >= 50 && p.price < 100).length}`);
    console.log(`   €100+: ${importReady.filter(p => p.price >= 100).length}`);
    
    return importReady;
  }

  static async run() {
    try {
      await this.prepareForImport();
      
      console.log('\n✨ MANUAL IMPORT INSTRUCTIONS:');
      console.log('════════════════════════════════\n');
      console.log('Option 1: Use the Amazon Product Manager in Admin');
      console.log('   1. Go to Admin → Amazon Products');
      console.log('   2. Import the JSON file\n');
      console.log('Option 2: Add import functionality to admin');
      console.log('   - Create a bulk import feature');
      console.log('   - Upload the JSON file');
      console.log('   - Products will be added to Firebase\n');
      console.log('✨ Next: Create "Duurzame & Vegan Cadeaus" category in DealCategoryManager\n');
      
      process.exit(0);
    } catch (error) {
      console.error('\n❌ Error:', error.message);
      console.error(error.stack);
      process.exit(1);
    }
  }
}

import { writeFile } from 'fs/promises';
ProductExporter.run();
