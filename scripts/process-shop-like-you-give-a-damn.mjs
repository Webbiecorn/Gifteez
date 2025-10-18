#!/usr/bin/env node

import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import { writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Shop Like You Give A Damn Product Processor
 * Filters and selects the best gift products for Gifteez
 */
class ShopLikeYouGiveADamnProcessor {
  static INPUT_FILE = path.join(__dirname, '../data/new-partner-feed.csv');
  static OUTPUT_FILE = path.join(__dirname, '../data/shop-like-you-give-a-damn-curated.json');
  
  static PRICE_MIN = 10;
  static PRICE_MAX = 150;
  
  // Categories we want (gift-worthy items)
  static GIFT_CATEGORIES = [
    'sieraden', 'jewelry', 'jewellery', 'ketting', 'armband', 'oorbellen', 'ring',
    'tas', 'bag', 'rugzak', 'backpack', 'schoudertas', 'portemonnee', 'wallet',
    'accessoires', 'accessories', 'sjaal', 'scarf', 'riem', 'belt', 'zonnebril', 'sunglasses',
    'verzorging', 'skincare', 'bodycare', 'beauty', 'cosmetica',
    'home', 'decor', 'kussen', 'pillow', 'deken', 'blanket', 'kaars', 'candle',
    'horloge', 'watch', 'hoed', 'hat', 'muts', 'beanie',
    'giftset', 'cadeau', 'gift'
  ];
  
  // Categories/keywords to exclude
  static EXCLUDE_KEYWORDS = [
    'ondergoed', 'underwear', 'lingerie', 'bh', 'bra', 'slipje', 'panties', 'boxer',
    'sokken', 'socks', 'kousen', 'tights',
    'basic t-shirt', 'basic shirt', 'plain tee',
    'legging', 'yoga pants',
    'sportbeha', 'sports bra',
    'badpak', 'swimsuit', 'bikini bottom'
  ];

  static products = [];
  static stats = {
    total: 0,
    priceFiltered: 0,
    categoryFiltered: 0,
    excluded: 0,
    selected: 0
  };

  /**
   * Parse CSV line
   */
  static parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    return values;
  }

  /**
   * Extract price from string
   */
  static extractPrice(priceStr) {
    if (!priceStr) return 0;
    // Remove currency symbols and convert to number
    const cleaned = priceStr.toString().replace(/[€$£,]/g, '').trim();
    return parseFloat(cleaned) || 0;
  }

  /**
   * Check if product is in gift category
   */
  static isGiftCategory(categoryPath, productName, description) {
    const searchText = `${categoryPath} ${productName} ${description}`.toLowerCase();
    
    // Check if it matches any gift category
    return this.GIFT_CATEGORIES.some(cat => searchText.includes(cat));
  }

  /**
   * Check if product should be excluded
   */
  static shouldExclude(productName, description, categoryPath) {
    const searchText = `${categoryPath} ${productName} ${description}`.toLowerCase();
    
    return this.EXCLUDE_KEYWORDS.some(keyword => searchText.includes(keyword));
  }

  /**
   * Calculate gift score based on various factors
   */
  static calculateGiftScore(product) {
    let score = 5; // Base score
    
    const name = product.name.toLowerCase();
    const desc = (product.description || '').toLowerCase();
    
    // Bonus for gift-related keywords
    if (name.includes('cadeau') || name.includes('gift')) score += 2;
    if (desc.includes('perfect cadeau') || desc.includes('perfect gift')) score += 1;
    
    // Bonus for sustainable keywords
    if (name.includes('duurzaam') || name.includes('sustainable')) score += 1;
    if (name.includes('vegan') || name.includes('biologisch') || name.includes('organic')) score += 1;
    if (desc.includes('gerecycled') || desc.includes('recycled')) score += 0.5;
    
    // Bonus for complete product info
    if (product.image) score += 1;
    if (product.brand) score += 0.5;
    if (product.description && product.description.length > 100) score += 0.5;
    
    // Price sweet spot bonus (€20-€80 is ideal for gifts)
    if (product.price >= 20 && product.price <= 80) score += 1;
    
    // Cap at 10
    return Math.min(10, score);
  }

  /**
   * Process a product row
   */
  static processProduct(values, headers) {
    this.stats.total++;
    
    const product = {};
    headers.forEach((header, index) => {
      product[header] = values[index] || '';
    });

    // Extract key fields
    const name = product.product_name || '';
    const price = this.extractPrice(product.search_price || product.display_price);
    const categoryPath = product.merchant_product_category_path || product.merchant_category || '';
    const description = product.product_short_description || product.description || '';
    const brand = product.brand_name || '';
    
    // Filter 1: Price range
    if (price < this.PRICE_MIN || price > this.PRICE_MAX) {
      this.stats.priceFiltered++;
      return null;
    }
    
    // Filter 2: Must be in gift category
    if (!this.isGiftCategory(categoryPath, name, description)) {
      this.stats.categoryFiltered++;
      return null;
    }
    
    // Filter 3: Exclude unwanted items
    if (this.shouldExclude(name, description, categoryPath)) {
      this.stats.excluded++;
      return null;
    }
    
    // Build clean product object
    const cleanProduct = {
      id: product.aw_product_id || `slygad-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name,
      price: price,
      originalPrice: this.extractPrice(product.rrp_price) || price,
      currency: product.currency || 'EUR',
      image: product.aw_image_url || product.merchant_image_url || product.large_image || '',
      affiliateLink: product.aw_deep_link || product.merchant_deep_link || '',
      description: description,
      brand: brand,
      category: categoryPath,
      merchant: 'Shop Like You Give A Damn',
      merchantId: product.merchant_id || '',
      tags: ['duurzaam', 'vegan', 'ethisch', 'sustainable'],
      inStock: product.in_stock === '1' || product.stock_status === 'in stock',
      material: product['Fashion:material'] || '',
      color: product.colour || '',
      giftScore: 0, // Will be calculated
      source: 'shop-like-you-give-a-damn',
      lastUpdated: new Date().toISOString()
    };
    
    // Calculate gift score
    cleanProduct.giftScore = this.calculateGiftScore(cleanProduct);
    
    this.stats.selected++;
    return cleanProduct;
  }

  /**
   * Process the CSV feed
   */
  static async processFeed() {
    console.log('🌱 Shop Like You Give A Damn Processor');
    console.log('═════════════════════════════════════\n');
    console.log(`📁 Reading: ${this.INPUT_FILE}`);
    console.log(`💰 Price range: €${this.PRICE_MIN} - €${this.PRICE_MAX}`);
    console.log(`🎁 Gift categories: ${this.GIFT_CATEGORIES.slice(0, 8).join(', ')}...\n`);
    
    const fileStream = createReadStream(this.INPUT_FILE);
    const rl = createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let headers = [];
    let isFirstLine = true;

    for await (const line of rl) {
      if (isFirstLine) {
        headers = this.parseCSVLine(line);
        isFirstLine = false;
        continue;
      }
      
      const values = this.parseCSVLine(line);
      const product = this.processProduct(values, headers);
      
      if (product) {
        this.products.push(product);
      }
      
      // Progress indicator
      if (this.stats.total % 1000 === 0) {
        process.stdout.write(`\r📊 Processed: ${this.stats.total} | Selected: ${this.stats.selected}`);
      }
    }
    
    console.log(`\n\n✅ Processing complete!`);
    console.log(`\n📈 Statistics:`);
    console.log(`   Total products: ${this.stats.total.toLocaleString()}`);
    console.log(`   Filtered by price: ${this.stats.priceFiltered.toLocaleString()}`);
    console.log(`   Filtered by category: ${this.stats.categoryFiltered.toLocaleString()}`);
    console.log(`   Excluded (basics/underwear): ${this.stats.excluded.toLocaleString()}`);
    console.log(`   ✨ Selected: ${this.stats.selected.toLocaleString()}`);
    
    // Sort by gift score
    this.products.sort((a, b) => b.giftScore - a.giftScore);
    
    // Show top products
    console.log(`\n🏆 Top 10 Products by Gift Score:`);
    this.products.slice(0, 10).forEach((p, i) => {
      console.log(`   ${i + 1}. [${p.giftScore.toFixed(1)}★] €${p.price.toFixed(2)} - ${p.name.substring(0, 60)}...`);
    });
    
    // Save to JSON
    await writeFile(this.OUTPUT_FILE, JSON.stringify(this.products, null, 2));
    console.log(`\n💾 Saved to: ${this.OUTPUT_FILE}`);
    
    // Category breakdown
    const categoryCount = {};
    this.products.forEach(p => {
      const mainCat = p.category.split('/')[0] || 'Uncategorized';
      categoryCount[mainCat] = (categoryCount[mainCat] || 0) + 1;
    });
    
    console.log(`\n📦 Category Breakdown:`);
    Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .forEach(([cat, count]) => {
        console.log(`   ${cat}: ${count}`);
      });
    
    return this.products;
  }

  /**
   * Main execution
   */
  static async run() {
    try {
      await this.processFeed();
      
      console.log('\n✨ Next steps:');
      console.log('1. Review the curated products in:', this.OUTPUT_FILE);
      console.log('2. Run import script to add to Firebase');
      console.log('3. Create "Duurzame & Vegan Cadeaus" category in admin\n');
      
      process.exit(0);
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  }
}

// Run
ShopLikeYouGiveADamnProcessor.run();
