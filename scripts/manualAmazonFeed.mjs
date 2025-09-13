#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';

/**
 * Manual Amazon Product Feed Creator
 * Voor het handmatig beheren van Amazon producten totdat PA-API beschikbaar is
 */
class ManualAmazonFeedCreator {
  static OUTPUT_FILE = '/home/kevin/Gifteez website/gifteez/data/amazonProducts.json';
  static SAMPLE_OUTPUT = '/home/kevin/Gifteez website/gifteez/data/amazonSample.json';

  /**
   * Template voor handmatige Amazon product entry
   */
  static createProductTemplate() {
    return {
      asin: 'B08N5WRWNW', // Amazon product ID
      name: 'Echo Dot (4e generatie) | Slimme luidspreker met Alexa | Antraciet',
      description: 'Onze populairste slimme luidspreker - Kompakt design met rijk geluid. Bedien je entertainment, smart home-apparaten en meer.',
      price: 59.99,
      originalPrice: 79.99,
      currency: 'EUR',
      image: 'https://m.media-amazon.com/images/I/714Rq4k05UL._AC_SL1000_.jpg',
      category: 'Smart Home',
      subcategory: 'Smart Speakers',
      affiliateLink: 'https://www.amazon.nl/dp/B08N5WRWNW?tag=gifteez77-21',
      inStock: true,
      prime: true,
      rating: 4.5,
      reviewCount: 50000,
      features: [
        'Alexa spraakbesturing',
        'Compact design',
        'Smart home hub',
        'Muziekstreaming'
      ],
      tags: ['smart-home', 'alexa', 'speaker', 'voice-control'],
      giftScore: 8, // 1-10 voor cadeau geschiktheid
      ageGroup: '18-65',
      occasion: ['verjaardag', 'kerstmis', 'housewarming'],
      priceRange: 'budget', // budget, mid-range, premium, luxury
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Populaire Amazon cadeau categorieën voor Nederland
   */
  static getPopularGiftCategories() {
    return [
      {
        category: 'Smart Home',
        products: [
          'Amazon Echo Dot',
          'Philips Hue lampen',
          'Smart thermostaat',
          'Ring deurbel',
          'TP-Link smart plugs'
        ]
      },
      {
        category: 'Electronics',
        products: [
          'Apple AirPods',
          'Kindle e-reader',
          'Fire TV Stick',
          'JBL speakers',
          'Anker powerbanks'
        ]
      },
      {
        category: 'Kitchen & Home',
        products: [
          'Instant Pot',
          'Ninja blender',
          'KitchenAid accessoires',
          'Nespresso machines',
          'Smart weegschaal'
        ]
      },
      {
        category: 'Health & Beauty',
        products: [
          'Oral-B elektrische tandenborstel',
          'Fitbit activity tracker',
          'Essential oils diffuser',
          'Massage gun',
          'Smart water bottle'
        ]
      },
      {
        category: 'Gaming & Entertainment',
        products: [
          'Nintendo Switch games',
          'Gaming headset',
          'Controller charging station',
          'VR headset',
          'Board games'
        ]
      }
    ];
  }

  /**
   * Genereer voorbeeld Amazon producten
   */
  static generateSampleProducts() {
    const sampleProducts = [
      {
        asin: 'B08N5WRWNW',
        name: 'Amazon Echo Dot (4e generatie) - Antraciet',
        description: 'Kompakte slimme luidspreker met Alexa. Bedien muziek, smart home-apparaten en meer met je stem.',
        price: 59.99,
        originalPrice: 79.99,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/714Rq4k05UL._AC_SL1000_.jpg',
        category: 'Smart Home',
        subcategory: 'Smart Speakers',
        affiliateLink: 'https://www.amazon.nl/dp/B08N5WRWNW?tag=gifteez77-21',
        inStock: true,
        prime: true,
        rating: 4.5,
        reviewCount: 45000,
        features: ['Alexa spraakbesturing', 'Compact design', 'Smart home hub'],
        tags: ['smart-home', 'alexa', 'speaker'],
        giftScore: 8,
        ageGroup: '18-65',
        occasion: ['verjaardag', 'kerstmis', 'housewarming'],
        priceRange: 'budget',
        lastUpdated: new Date().toISOString()
      },
      {
        asin: 'B09B8RRQTY',
        name: 'Apple AirPods (3e generatie)',
        description: 'Draadloze oordopjes met ruimtelijke audio en MagSafe oplaadcase. Tot 30 uur luistertijd.',
        price: 179.00,
        originalPrice: 199.00,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/61SUj2aKoEL._AC_SL1500_.jpg',
        category: 'Electronics',
        subcategory: 'Audio',
        affiliateLink: 'https://www.amazon.nl/dp/B09B8RRQTY?tag=gifteez77-21',
        inStock: true,
        prime: true,
        rating: 4.4,
        reviewCount: 25000,
        features: ['Ruimtelijke audio', 'MagSafe case', '30 uur batterij'],
        tags: ['audio', 'wireless', 'apple', 'premium'],
        giftScore: 9,
        ageGroup: '16-45',
        occasion: ['verjaardag', 'geslaagd', 'valentijn'],
        priceRange: 'mid-range',
        lastUpdated: new Date().toISOString()
      },
      {
        asin: 'B08GKXX4C9',
        name: 'Kindle Paperwhite (11e generatie)',
        description: 'Waterbestendige e-reader met 6.8" display en verstelbare warme licht. Wekenlange batterijduur.',
        price: 139.99,
        originalPrice: 159.99,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/61A1Zl6jOML._AC_SL1000_.jpg',
        category: 'Books & Reading',
        subcategory: 'E-Readers',
        affiliateLink: 'https://www.amazon.nl/dp/B08GKXX4C9?tag=gifteez77-21',
        inStock: true,
        prime: true,
        rating: 4.6,
        reviewCount: 75000,
        features: ['Waterbestendig', 'Warm licht', 'Wekenlange batterij'],
        tags: ['reading', 'e-reader', 'waterproof', 'books'],
        giftScore: 7,
        ageGroup: '25-65',
        occasion: ['verjaardag', 'kerstmis', 'moederdag'],
        priceRange: 'mid-range',
        lastUpdated: new Date().toISOString()
      },
      {
        asin: 'B08C1W5N87',
        name: 'Fire TV Stick 4K Max',
        description: 'Snelste Fire TV Stick met Wi-Fi 6 ondersteuning. Stream in 4K Ultra HD met Dolby Vision.',
        price: 54.99,
        originalPrice: 64.99,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/51TjJOTfslL._AC_SL1000_.jpg',
        category: 'Electronics',
        subcategory: 'Streaming',
        affiliateLink: 'https://www.amazon.nl/dp/B08C1W5N87?tag=gifteez77-21',
        inStock: true,
        prime: true,
        rating: 4.3,
        reviewCount: 30000,
        features: ['4K Ultra HD', 'Wi-Fi 6', 'Alexa Voice Remote'],
        tags: ['streaming', '4k', 'tv', 'entertainment'],
        giftScore: 8,
        ageGroup: '18-55',
        occasion: ['verjaardag', 'housewarming', 'kerstmis'],
        priceRange: 'budget',
        lastUpdated: new Date().toISOString()
      },
      {
        asin: 'B08DNPX8B7',
        name: 'JBL Clip 4 Draagbare Bluetooth Speaker',
        description: 'Ultraportable speaker met geïntegreerde karabijnhaak. IP67 waterdicht en stofdicht.',
        price: 59.99,
        originalPrice: 69.99,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/71FIgBem2XL._AC_SL1500_.jpg',
        category: 'Electronics',
        subcategory: 'Audio',
        affiliateLink: 'https://www.amazon.nl/dp/B08DNPX8B7?tag=gifteez77-21',
        inStock: true,
        prime: true,
        rating: 4.4,
        reviewCount: 15000,
        features: ['IP67 waterdicht', 'Karabijnhaak', '10 uur batterij'],
        tags: ['speaker', 'portable', 'waterproof', 'outdoor'],
        giftScore: 8,
        ageGroup: '16-45',
        occasion: ['verjaardag', 'sport', 'zomer'],
        priceRange: 'budget',
        lastUpdated: new Date().toISOString()
      }
    ];

    return sampleProducts;
  }

  /**
   * Converteer Amazon product naar DealItem format
   */
  static convertToGiftProduct(amazonProduct) {
    return {
      id: amazonProduct.asin,
      name: amazonProduct.name,
      price: amazonProduct.price,
      originalPrice: amazonProduct.originalPrice > amazonProduct.price ? amazonProduct.originalPrice : undefined,
      image: amazonProduct.image,
      description: amazonProduct.description,
      shortDescription: amazonProduct.description.substring(0, 100) + '...',
      category: amazonProduct.category,
      affiliateLink: amazonProduct.affiliateLink,
      isOnSale: amazonProduct.originalPrice > amazonProduct.price,
      lastUpdated: new Date(amazonProduct.lastUpdated),
      tags: amazonProduct.tags,
      giftScore: amazonProduct.giftScore,
      inStock: amazonProduct.inStock,
      prime: amazonProduct.prime,
      rating: amazonProduct.rating
    };
  }

  /**
   * Filter Amazon producten voor cadeaus
   */
  static filterForGifts(products, minScore = 7) {
    return products
      .filter(p => p.giftScore >= minScore)
      .filter(p => p.inStock)
      .filter(p => p.price >= 20 && p.price <= 500)
      .sort((a, b) => {
        // Sorteer op gift score, dan rating
        if (b.giftScore !== a.giftScore) {
          return b.giftScore - a.giftScore;
        }
        return (b.rating || 0) - (a.rating || 0);
      });
  }

  /**
   * Genereer Amazon product feed
   */
  static generateFeed() {
    console.log('📦 Generating Amazon Product Feed...');
    
    const sampleProducts = this.generateSampleProducts();
    const giftProducts = this.filterForGifts(sampleProducts);
    const convertedProducts = giftProducts.map(p => this.convertToGiftProduct(p));
    
    // Save full data
    writeFileSync(this.OUTPUT_FILE, JSON.stringify(sampleProducts, null, 2));
    
    // Save gift-optimized sample
    writeFileSync(this.SAMPLE_OUTPUT, JSON.stringify(convertedProducts, null, 2));
    
    console.log(`✅ Generated ${sampleProducts.length} Amazon products`);
    console.log(`🎁 ${giftProducts.length} products suitable for gifts`);
    console.log(`📁 Saved to: ${this.OUTPUT_FILE}`);
    console.log(`🎯 Gift sample: ${this.SAMPLE_OUTPUT}`);
    
    // Show product breakdown
    const categories = [...new Set(sampleProducts.map(p => p.category))];
    console.log('\n📊 Product Categories:');
    categories.forEach(cat => {
      const count = sampleProducts.filter(p => p.category === cat).length;
      console.log(`   ${cat}: ${count} products`);
    });
    
    // Show pricing breakdown
    const priceRanges = {
      budget: sampleProducts.filter(p => p.price < 100).length,
      midRange: sampleProducts.filter(p => p.price >= 100 && p.price < 300).length,
      premium: sampleProducts.filter(p => p.price >= 300).length
    };
    
    console.log('\n💰 Price Distribution:');
    console.log(`   Budget (<€100): ${priceRanges.budget} products`);
    console.log(`   Mid-range (€100-€300): ${priceRanges.midRange} products`);
    console.log(`   Premium (€300+): ${priceRanges.premium} products`);
    
    return {
      total: sampleProducts.length,
      gifts: giftProducts.length,
      categories: categories.length,
      avgGiftScore: giftProducts.reduce((sum, p) => sum + p.giftScore, 0) / giftProducts.length
    };
  }

  /**
   * Update prijzen van bestaande producten (simulatie)
   */
  static updatePrices() {
    console.log('💰 Updating Amazon prices...');
    
    try {
      const products = JSON.parse(readFileSync(this.OUTPUT_FILE, 'utf-8'));
      
      // Simuleer prijswijzigingen
      const updatedProducts = products.map(product => ({
        ...product,
        price: product.price * (0.95 + Math.random() * 0.1), // ±5% prijswijziging
        lastUpdated: new Date().toISOString()
      }));
      
      writeFileSync(this.OUTPUT_FILE, JSON.stringify(updatedProducts, null, 2));
      
      console.log(`✅ Updated prices for ${updatedProducts.length} products`);
      
    } catch (error) {
      console.error('❌ Error updating prices:', error.message);
    }
  }

  /**
   * Toon instructies voor handmatige producttoevoeging
   */
  static showInstructions() {
    console.log(`
🛠️  AMAZON PRODUCT FEED - HANDMATIGE SETUP
==========================================

1. AMAZON SITESTRIPE INSTALLEREN:
   - Ga naar: https://affiliate-program.amazon.nl/
   - Login met je Amazon Associates account
   - Download SiteStripe browser extensie

2. PRODUCTEN SELECTEREN:
   - Zoek populaire cadeau items op Amazon.nl
   - Klik SiteStripe → Get Link → Short Link
   - Kopieer ASIN (product ID) uit URL
   - Noteer: naam, prijs, afbeelding URL

3. PRODUCT TOEVOEGEN AAN FEED:
   - Gebruik template: ManualAmazonFeedCreator.createProductTemplate()
   - Vul alle velden in
   - Voeg toe aan array in generateSampleProducts()
   - Run: node scripts/manualAmazonFeed.mjs

4. AUTOMATISCHE INTEGRATIE:
   - Products worden geïmporteerd in website
   - Gecombineerd met Coolblue feed
   - Automatic gift scoring en filtering

AANBEVOLEN PRODUCTEN:
=====================
${this.getPopularGiftCategories().map(cat => 
  `${cat.category}:\n${cat.products.map(p => `  • ${p}`).join('\n')}`
).join('\n\n')}

VOLGENDE STAPPEN:
=================
1. Genereer initiële feed: node scripts/manualAmazonFeed.mjs
2. Test website integratie
3. Plan wekelijkse updates
4. Monitor affiliate performance
    `);
  }
}

// Command line interface
if (import.meta.url === new URL(process.argv[1], 'file://').href) {
  const command = process.argv[2];
  
  switch (command) {
    case 'generate':
      ManualAmazonFeedCreator.generateFeed();
      break;
      
    case 'update':
      ManualAmazonFeedCreator.updatePrices();
      break;
      
    case 'template':
      console.log('📋 Product Template:');
      console.log(JSON.stringify(ManualAmazonFeedCreator.createProductTemplate(), null, 2));
      break;
      
    case 'instructions':
      ManualAmazonFeedCreator.showInstructions();
      break;
      
    default:
      console.log(`
🚀 Manual Amazon Feed Creator

Commands:
  generate     - Generate sample Amazon product feed
  update       - Update product prices
  template     - Show product template
  instructions - Show setup instructions

Usage: node scripts/manualAmazonFeed.mjs [command]
      `);
      break;
  }
}
