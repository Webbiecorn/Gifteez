#!/usr/bin/env node

import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Select Top 1000 Products with diversity
 */
class Top1000Selector {
  static INPUT_FILE = path.join(__dirname, '../data/shop-like-you-give-a-damn-curated.json');
  static OUTPUT_FILE = path.join(__dirname, '../data/shop-like-you-give-a-damn-top1000.json');
  static TARGET_COUNT = 1000;

  static async selectTop1000() {
    console.log('🎯 Selecting Top 1000 Products');
    console.log('════════════════════════════════\n');
    
    // Read curated products
    const data = await readFile(this.INPUT_FILE, 'utf-8');
    const allProducts = JSON.parse(data);
    
    console.log(`📦 Total curated products: ${allProducts.length.toLocaleString()}`);
    
    // Categorize products
    const categories = {
      jewelry: [],
      bags: [],
      accessories: [],
      beauty: [],
      home: [],
      watches: [],
      other: []
    };
    
    allProducts.forEach(product => {
      const name = product.name.toLowerCase();
      const cat = product.category.toLowerCase();
      
      if (name.includes('sieraden') || name.includes('jewelry') || name.includes('ketting') || 
          name.includes('armband') || name.includes('oorbel') || name.includes('ring')) {
        categories.jewelry.push(product);
      } else if (name.includes('tas') || name.includes('bag') || name.includes('rugzak') || 
                 name.includes('portemonnee') || name.includes('wallet')) {
        categories.bags.push(product);
      } else if (name.includes('horloge') || name.includes('watch')) {
        categories.watches.push(product);
      } else if (name.includes('verzorging') || name.includes('beauty') || name.includes('skincare') ||
                 name.includes('creme') || name.includes('serum')) {
        categories.beauty.push(product);
      } else if (cat.includes('home') || cat.includes('woon') || name.includes('kussen') || 
                 name.includes('deken') || name.includes('kaars')) {
        categories.home.push(product);
      } else if (name.includes('sjaal') || name.includes('scarf') || name.includes('riem') ||
                 name.includes('zonnebril') || name.includes('hoed') || name.includes('muts')) {
        categories.accessories.push(product);
      } else {
        categories.other.push(product);
      }
    });
    
    console.log('\n📊 Category Distribution:');
    Object.entries(categories).forEach(([cat, products]) => {
      console.log(`   ${cat}: ${products.length.toLocaleString()}`);
    });
    
    // Determine allocation (aim for diversity)
    const allocation = {
      jewelry: 200,    // Sieraden are great gifts
      bags: 150,       // Tassen zijn populair
      watches: 100,    // Horloges zijn premium gifts
      beauty: 150,     // Verzorging sets zijn perfecte cadeaus
      home: 100,       // Home decor items
      accessories: 150, // Accessoires
      other: 150       // Diverse items
    };
    
    console.log('\n🎯 Target Allocation:');
    Object.entries(allocation).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count}`);
    });
    
    // Select top products from each category
    const selected = [];
    
    Object.entries(categories).forEach(([catName, products]) => {
      const target = allocation[catName];
      const sorted = products.sort((a, b) => b.giftScore - a.giftScore);
      const topProducts = sorted.slice(0, target);
      selected.push(...topProducts);
      console.log(`   ✓ Selected ${topProducts.length} from ${catName}`);
    });
    
    // If we're under 1000, fill with highest scoring remaining
    if (selected.length < this.TARGET_COUNT) {
      const remaining = allProducts
        .filter(p => !selected.includes(p))
        .sort((a, b) => b.giftScore - a.giftScore)
        .slice(0, this.TARGET_COUNT - selected.length);
      
      selected.push(...remaining);
      console.log(`   ✓ Added ${remaining.length} highest scoring products to reach ${this.TARGET_COUNT}`);
    }
    
    // Final sort by gift score
    selected.sort((a, b) => b.giftScore - a.giftScore);
    
    console.log(`\n✨ Final selection: ${selected.length} products`);
    
    // Statistics
    const priceRange = {
      under25: selected.filter(p => p.price < 25).length,
      '25-50': selected.filter(p => p.price >= 25 && p.price < 50).length,
      '50-100': selected.filter(p => p.price >= 50 && p.price < 100).length,
      over100: selected.filter(p => p.price >= 100).length
    };
    
    console.log(`\n💰 Price Distribution:`);
    Object.entries(priceRange).forEach(([range, count]) => {
      console.log(`   €${range}: ${count} (${((count/selected.length)*100).toFixed(1)}%)`);
    });
    
    const avgPrice = selected.reduce((sum, p) => sum + p.price, 0) / selected.length;
    const avgScore = selected.reduce((sum, p) => sum + p.giftScore, 0) / selected.length;
    
    console.log(`\n📈 Averages:`);
    console.log(`   Price: €${avgPrice.toFixed(2)}`);
    console.log(`   Gift Score: ${avgScore.toFixed(2)}/10`);
    
    // Save
    await writeFile(this.OUTPUT_FILE, JSON.stringify(selected, null, 2));
    console.log(`\n💾 Saved to: ${this.OUTPUT_FILE}`);
    
    console.log('\n🏆 Top 10 Selected Products:');
    selected.slice(0, 10).forEach((p, i) => {
      console.log(`   ${i + 1}. [${p.giftScore.toFixed(1)}★] €${p.price.toFixed(2)} - ${p.name.substring(0, 60)}...`);
    });
    
    return selected;
  }

  static async run() {
    try {
      await this.selectTop1000();
      
      console.log('\n✨ Next step: Import to Firebase!');
      console.log('   Run: node scripts/import-shop-like-you-give-a-damn.mjs\n');
      
      process.exit(0);
    } catch (error) {
      console.error('❌ Error:', error.message);
      console.error(error);
      process.exit(1);
    }
  }
}

Top1000Selector.run();
