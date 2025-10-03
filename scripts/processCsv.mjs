#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';

/**
 * Product Feed Processing Functions
 */
class ProductFeedService {
  static GIFT_CATEGORIES = [
    'audio', 'gaming', 'smart home', 'fitness', 'beauty', 'coffee',
    'electronics', 'gadgets', 'accessories', 'tools', 'kitchen'
  ];

  static GIFT_KEYWORDS = [
    'headset', 'speaker', 'coffee', 'watch', 'fitness', 'gaming',
    'smart', 'bluetooth', 'wireless', 'portable', 'premium'
  ];

  /**
   * Proper CSV parsing with quote handling
   */
  static parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  /**
   * Parse CSV line into product object
   */
  static parseCsvLine(line, headers) {
    try {
      const fields = this.parseCSVLine(line);
      
      if (!headers || fields.length < headers.length) return null;

      const record = {};
      headers.forEach((header, index) => {
        record[header] = (fields[index] || '').trim();
      });

      return {
        aw_deep_link: record['aw_deep_link'] || '',
        product_name: record['product_name'] || '',
        aw_product_id: record['aw_product_id'] || '',
        merchant_product_id: record['merchant_product_id'] || '',
        merchant_image_url: record['merchant_image_url'] || '',
        description: record['description'] || '',
        merchant_category: record['merchant_category'] || '',
        merchant_product_category_path: record['merchant_product_category_path'] || '',
        category_name: record['category_name'] || '',
        category_id: record['category_id'] || '',
        search_price: parseFloat(record['search_price']) || 0,
        store_price: parseFloat(record['store_price']) || 0,
        delivery_cost: parseFloat(record['delivery_cost']) || 0,
        merchant_name: record['merchant_name'] || '',
        merchant_id: record['merchant_id'] || '',
        aw_image_url: record['aw_image_url'] || '',
        merchant_deep_link: record['merchant_deep_link'] || '',
        currency: record['currency'] || 'EUR',
        language: record['language'] || 'nl',
        last_updated: record['last_updated'] || '',
        display_price: record['display_price'] || '',
        data_feed_id: record['data_feed_id'] || '',
        product_short_description: record['product_short_description'] || '',
        promotional_text: record['promotional_text'] || '',
        brand_name: record['brand_name'] || '',
        keywords: record['keywords'] || '',
        product_type: record['product_type'] || ''
      };
    } catch (error) {
      console.error('Error parsing CSV line:', error);
      return null;
    }
  }

  /**
   * Convert product to gift product with gift scoring
   */
  static convertToGiftProduct(product) {
    const giftScore = this.calculateGiftScore(product);

    const category = product.merchant_category
      || product.category_name
      || product.product_type
      || (product.merchant_product_category_path
        ? product.merchant_product_category_path.split('>').pop().trim()
        : '')
      || 'Overig';

    return {
      id: product.aw_product_id,
      name: product.product_name,
      price: product.search_price,
      originalPrice: product.store_price > product.search_price ? product.store_price : undefined,
      image: product.merchant_image_url || product.aw_image_url,
      description: product.description,
      shortDescription: product.product_short_description,
      category,
      affiliateLink: product.aw_deep_link,
      isOnSale: product.store_price > product.search_price,
      lastUpdated: new Date(product.last_updated || Date.now()),
      tags: this.extractTags(product),
      giftScore
    };
  }

  /**
   * Calculate gift appropriateness score (1-10)
   */
  static calculateGiftScore(product) {
    let score = 5; // Base score
    
    const name = product.product_name.toLowerCase();
    const category = (product.merchant_category || product.category_name || '').toLowerCase();
    const description = product.description.toLowerCase();
    
    // Boost score for gift-appropriate categories
    if (this.GIFT_CATEGORIES.some(cat => category.includes(cat))) {
      score += 2;
    }
    
    // Boost score for gift keywords in name
    const keywordMatches = this.GIFT_KEYWORDS.filter(keyword => 
      name.includes(keyword) || description.includes(keyword)
    ).length;
    score += Math.min(keywordMatches * 0.5, 2);
    
    // Boost score for appropriate price range (€20-€500)
    if (product.search_price >= 20 && product.search_price <= 500) {
      score += 1;
    }
    
    // Boost for premium brands
    const premiumBrands = ['apple', 'sony', 'samsung', 'lg', 'philips', 'dyson', 'bose', 'jbl'];
    if (premiumBrands.some(brand => name.includes(brand))) {
      score += 1;
    }
    
    // Reduce score for very technical/niche items
    const technicalTerms = ['driver', 'cable', 'adapter', 'mount', 'case', 'parts'];
    if (technicalTerms.some(term => name.includes(term))) {
      score -= 1;
    }
    
    return Math.max(1, Math.min(10, Math.round(score)));
  }

  /**
   * Extract relevant tags from product data
   */
  static extractTags(product) {
  const tags = [];
  const text = `${product.product_name} ${product.description} ${product.merchant_category} ${product.category_name} ${product.merchant_product_category_path} ${product.product_type}`.toLowerCase();
    
    // Add category tags
    if (product.merchant_category) {
      tags.push(product.merchant_category);
    }
    
    // Add feature tags
    const features = ['wireless', 'bluetooth', 'smart', 'portable', 'premium', 'gaming', 'fitness'];
    features.forEach(feature => {
      if (text.includes(feature)) {
        tags.push(feature);
      }
    });
    
    // Add price range tag
    if (product.search_price < 50) tags.push('budget');
    else if (product.search_price < 150) tags.push('mid-range');
    else tags.push('premium');
    
    return [...new Set(tags)]; // Remove duplicates
  }

  /**
   * Filter products suitable for gifts
   */
  static filterGiftProducts(products, minScore = 6) {
    return products
      .filter(product => product.giftScore >= minScore)
      .filter(product => product.price >= 15) // Minimum gift price
      .filter(product => product.price <= 1000) // Maximum gift price
      .sort((a, b) => b.giftScore - a.giftScore); // Sort by gift score
  }

  /**
   * Get trending gift categories
   */
  static getTrendingCategories(products) {
    const categoryCount = new Map();
    
    products.forEach(product => {
      const category = product.category || 'Overig';
      categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
    });
    
    return Array.from(categoryCount.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }
}

/**
 * CSV Processor for Coolblue Product Feed
 * Processes the downloaded CSV and generates gift products
 */
class CsvProcessor {
  static INPUT_FILE = '/home/kevin/Downloads/datafeed_2566111.csv';
  static OUTPUT_FILE = '/home/kevin/Gifteez website/gifteez/data/importedProducts.json';
  static SAMPLE_OUTPUT = '/home/kevin/Gifteez website/gifteez/data/sampleProducts.json';

  static async processFile() {
    console.log('🚀 Starting Coolblue product feed processing...');
    
    try {
      // Read CSV file
      console.log('📄 Reading CSV file...');
      const csvContent = readFileSync(this.INPUT_FILE, 'utf-8');
      const lines = csvContent.split('\n');
      const headers = ProductFeedService.parseCSVLine(lines[0]);
      
      console.log(`📊 Found ${lines.length} lines in CSV`);
      
      // Skip header line
      const dataLines = lines.slice(1).filter(line => line.trim());
      console.log(`💽 Processing ${dataLines.length} product lines...`);
      
      const products = [];
      let processed = 0;
      let errors = 0;
      
      // Process each line
      for (const line of dataLines) {
        try {
          const coolblueProduct = ProductFeedService.parseCsvLine(line, headers);
          if (coolblueProduct) {
            const giftProduct = ProductFeedService.convertToGiftProduct(coolblueProduct);
            products.push(giftProduct);
            processed++;
          }
        } catch (error) {
          errors++;
          if (errors < 5) { // Log first few errors
            console.warn(`⚠️  Error processing line: ${error}`);
          }
        }
        
        // Progress indicator
        if (processed % 1000 === 0) {
          console.log(`⏳ Processed ${processed} products...`);
        }
      }
      
      console.log(`✅ Successfully processed ${processed} products`);
      console.log(`❌ Errors encountered: ${errors}`);
      
      // Filter for gift-appropriate products
      console.log('🎁 Filtering for gift-appropriate products...');
      const giftProducts = ProductFeedService.filterGiftProducts(products, 6);
      
      console.log(`🎯 Found ${giftProducts.length} gift-appropriate products`);
      
      // Get category statistics
      const categories = ProductFeedService.getTrendingCategories(giftProducts);
      console.log('📈 Top gift categories:');
      categories.slice(0, 5).forEach(({ category, count }) => {
        console.log(`   ${category}: ${count} products`);
      });
      
      // Save all products
      console.log('💾 Saving product data...');
      writeFileSync(this.OUTPUT_FILE, JSON.stringify(giftProducts, null, 2));
      
      // Save sample for development
      const sampleProducts = giftProducts.slice(0, 50);
      writeFileSync(this.SAMPLE_OUTPUT, JSON.stringify(sampleProducts, null, 2));
      
      console.log(`✨ Processing complete!`);
      console.log(`📁 Full data saved to: ${this.OUTPUT_FILE}`);
      console.log(`🔬 Sample data saved to: ${this.SAMPLE_OUTPUT}`);
      
      // Show some example products
      console.log('\n🎁 Sample gift products:');
      sampleProducts.slice(0, 5).forEach(product => {
        console.log(`   ${product.name} - €${product.price} (Score: ${product.giftScore})`);
      });
      
      return {
        totalProcessed: processed,
        totalErrors: errors,
        giftProducts: giftProducts.length,
        categories: categories.length
      };
      
    } catch (error) {
      console.error('💥 Fatal error processing CSV:', error);
      throw error;
    }
  }
  
  static async testSampleProducts() {
    console.log('\n🧪 Testing sample products...');
    
    try {
      const sampleData = readFileSync(this.SAMPLE_OUTPUT, 'utf-8');
      const products = JSON.parse(sampleData);
      
      console.log(`📊 Loaded ${products.length} sample products`);
      
      // Test different price ranges
      const priceRanges = [
        { min: 0, max: 50, name: 'Budget (€0-€50)' },
        { min: 50, max: 150, name: 'Mid-range (€50-€150)' },
        { min: 150, max: 500, name: 'Premium (€150-€500)' },
        { min: 500, max: Infinity, name: 'Luxury (€500+)' }
      ];
      
      priceRanges.forEach(range => {
        const count = products.filter(p => p.price >= range.min && p.price < range.max).length;
        console.log(`   ${range.name}: ${count} products`);
      });
      
      // Test gift scores
      const scoreRanges = [
        { min: 8, name: 'Excellent gifts (8-10)' },
        { min: 6, name: 'Good gifts (6-7)' },
        { min: 4, name: 'Fair gifts (4-5)' },
        { min: 0, name: 'Poor gifts (1-3)' }
      ];
      
      console.log('\n🎯 Gift score distribution:');
      scoreRanges.forEach(range => {
        const count = products.filter(p => p.giftScore >= range.min && 
          (range.min === 0 || p.giftScore < range.min + 2)).length;
        console.log(`   ${range.name}: ${count} products`);
      });
      
    } catch (error) {
      console.error('❌ Error testing sample products:', error);
    }
  }
}

// Run the processor
if (import.meta.url === new URL(process.argv[1], 'file://').href) {
  CsvProcessor.processFile()
    .then(results => {
      console.log('\n📈 Processing Results:');
      console.log(`   Total processed: ${results.totalProcessed}`);
      console.log(`   Gift products: ${results.giftProducts}`);
      console.log(`   Categories: ${results.categories}`);
      console.log(`   Errors: ${results.totalErrors}`);
      
      return CsvProcessor.testSampleProducts();
    })
    .catch(error => {
      console.error('Failed to process CSV:', error);
      process.exit(1);
    });
}
