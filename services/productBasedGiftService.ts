import { Gift, GiftSearchParams, Retailer } from '../types';
import { DynamicProductService } from './dynamicProductService';

/**
 * Product-based Gift Service
 * Uses real Coolblue and Amazon product feeds to find gifts
 */
export class ProductBasedGiftService {
  private static feedbackSignals: Array<{
    comment: string;
    interests?: string;
    recipient?: string;
    occasion?: string;
    createdAt: number;
  }> = [];

  private static feedbackKeywordWeights: Record<string, number> = {};

  private static readonly FEEDBACK_KEYWORD_WHITELIST = [
    'duurzaam',
    'vegan',
    'man',
    'vrouw',
    'grooming',
    'sieraden',
    'budget',
    'eco',
    'sport',
    'tech',
    'kids',
    'kind',
    'wellness',
    'gaming'
  ];
  
  /**
   * Find gifts from real product feeds based on search criteria
   */
  static async findGifts(searchParams: GiftSearchParams): Promise<Gift[]> {
    console.log('🎁 Finding gifts from product feeds...', searchParams);
    
    // Ensure products are loaded
    await DynamicProductService.loadProducts();
    
    // Get all products from both sources
    const allProducts = DynamicProductService.getProducts();
    console.log(`📦 Searching through ${allProducts.length} total products`);
    
    // Filter and score products based on search criteria
    const relevantProducts = this.filterProductsBySearch(allProducts, searchParams);
    console.log(`✨ Found ${relevantProducts.length} relevant products`);
    
    // Convert products to Gift format
    const gifts = this.convertProductsToGifts(relevantProducts, searchParams);
    
    // Sort by relevance score (stored in first tag as score)
    gifts.sort((a, b) => {
      const aScore = parseFloat(a.tags?.[0] || '0');
      const bScore = parseFloat(b.tags?.[0] || '0');
      return bScore - aScore;
    });
    
    // Return top 8 results
    return gifts.slice(0, 8);
  }

  static registerFeedback(feedback: {
    comment: string;
    interests?: string;
    recipient?: string;
    occasion?: string;
    createdAt: number;
  }): void {
    if (!feedback?.comment) {
      return;
    }

    this.feedbackSignals.push(feedback);
    if (this.feedbackSignals.length > 100) {
      this.feedbackSignals = this.feedbackSignals.slice(-100);
    }

    this.rebuildFeedbackKeywordWeights();
  }

  private static rebuildFeedbackKeywordWeights(): void {
    const weights: Record<string, number> = {};

    this.feedbackSignals.forEach(entry => {
      const text = [entry.comment, entry.interests, entry.recipient, entry.occasion]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      this.FEEDBACK_KEYWORD_WHITELIST.forEach(keyword => {
        if (text.includes(keyword)) {
          weights[keyword] = (weights[keyword] || 0) + 1;
        }
      });
    });

    this.feedbackKeywordWeights = weights;
  }

  private static getFeedbackBoost(productText: string): number {
    let boost = 0;

    Object.entries(this.feedbackKeywordWeights).forEach(([keyword, weight]) => {
      if (productText.includes(keyword)) {
        boost += Math.min(weight, 5) * 0.3;
      }
    });

    return boost;
  }
  
  /**
   * Filter products based on search criteria
   */
  private static filterProductsBySearch(products: any[], searchParams: GiftSearchParams): any[] {
    const { recipient, budget, occasion, interests, filters } = searchParams;
    
    console.log(`🔍 Filtering ${products.length} products for search:`, {
      recipient, budget, occasion, interests
    });
    
    const filteredProducts = products.filter(product => {
      // Budget filter - allow 20% over budget
      if (product.price && product.price > budget * 1.2) {
        return false;
      }
      
      // Price range filter (if advanced filters applied)
      if (filters?.priceRange) {
        if (product.price < filters.priceRange.min || product.price > filters.priceRange.max) {
          return false;
        }
      }
      
      // Category filter (if advanced filters applied)
      if (filters?.categories && filters.categories.length > 0) {
        const productCategory = product.category || product.productCategory || '';
        if (!filters.categories.some(cat => productCategory.toLowerCase().includes(cat.toLowerCase()))) {
          return false;
        }
      }
      
      // For debugging: let's be more lenient with matching
      // If it's a Coolblue product and no specific filters, include it
      const isCoolblueProduct = product.source === 'coolblue' || 
                               (product.url && product.url.includes('coolblue')) ||
                               (product.affiliateLink && product.affiliateLink.includes('coolblue'));

      const isSustainablePartner = product.source === 'shop-like-you-give-a-damn' ||
        (product.url && product.url.includes('shoplikeyougiveadamn')) ||
        (product.affiliateLink && product.affiliateLink.includes('shoplikeyougiveadamn')) ||
        (product.merchant && product.merchant.toLowerCase().includes('shop like you give a damn'));
      
      // Basic relevance check - make more lenient for Coolblue products
      const searchTerms = [
        interests?.toLowerCase(),
        recipient?.toLowerCase(),
        occasion?.toLowerCase()
      ].filter(Boolean);
      
      if (searchTerms.length > 0) {
        const productText = [
          product.name,
          product.title,
          product.description,
          product.shortDescription,
          product.category,
          product.productCategory,
          product.tags?.join(' '),
          product.keywords?.join(' ')
        ].filter(Boolean).join(' ').toLowerCase();
        
        // More liberal matching for Coolblue products
        const hasDirectMatch = searchTerms.some(term => 
          productText.includes(term || '')
        );
        
        const hasRelevanceMatch = this.isRelevantForRecipient(productText, recipient) ||
                                 this.isRelevantForOccasion(productText, occasion) ||
                                 this.isRelevantForInterests(productText, interests);
        
        // For Coolblue products, be more lenient - include if it has any relevance
        if (isCoolblueProduct && (hasDirectMatch || hasRelevanceMatch || !searchTerms.length)) {
          return true;
        }

        // Sustainable partner preference: include SLYGAD products even bij beperkte matches
        if (filters?.preferredPartner === 'sustainable' && isSustainablePartner) {
          return true;
        }
        
        // For other products, require a match
        if (!hasDirectMatch && !hasRelevanceMatch && searchTerms.length > 0) {
          return false;
        }
      }
      
      if (filters?.preferredPartner === 'sustainable' && isSustainablePartner) {
        return true;
      }

      return true;
    });
    
    console.log(`✅ After filtering: ${filteredProducts.length} products matched`);
    
    return filteredProducts.map(product => ({
      ...product,
      relevanceScore: this.calculateRelevanceScore(product, searchParams)
    }));
  }
  
  /**
   * Calculate relevance score for a product
   */
  private static calculateRelevanceScore(product: any, searchParams: GiftSearchParams): number {
  let score = 0;
  const { recipient, budget, occasion, interests, filters } = searchParams;
    
    const productText = [
      product.name,
      product.title,
      product.description,
      product.category,
      product.productCategory,
      product.tags?.join(' '),
      product.keywords?.join(' ')
    ].filter(Boolean).join(' ').toLowerCase();
    
    // Interest matching (high weight)
    if (interests) {
      const interestTerms = interests.toLowerCase().split(',').map(t => t.trim());
      interestTerms.forEach(term => {
        if (productText.includes(term)) {
          score += 10;
        }
      });
    }
    
    // Recipient matching
    if (recipient && this.isRelevantForRecipient(productText, recipient)) {
      score += 5;
    }
    
    // Occasion matching
    if (occasion && this.isRelevantForOccasion(productText, occasion)) {
      score += 5;
    }
    
    // Budget fit bonus (prefer products close to budget)
    if (product.price) {
      const budgetRatio = product.price / budget;
      if (budgetRatio >= 0.3 && budgetRatio <= 1.0) {
        score += 3;
      }
    }
    
    // Quality indicators
    if (product.rating && product.rating >= 4.0) {
      score += 2;
    }
    
    if (product.reviewCount && product.reviewCount > 100) {
      score += 1;
    }
    
    // Gift suitability
    if (product.giftScore && product.giftScore >= 7) {
      score += 3;
    }

    const isSlygadProduct = product.source === 'shop-like-you-give-a-damn' ||
      (product.url && product.url.toLowerCase().includes('shoplikeyougiveadamn')) ||
      (product.affiliateLink && product.affiliateLink.toLowerCase().includes('shoplikeyougiveadamn')) ||
      (product.merchant && product.merchant.toLowerCase().includes('shop like you give a damn'));

    if (filters?.preferredPartner === 'sustainable') {
      if (isSlygadProduct) {
        score += 4;
      } else if (!product.sustainability) {
        score -= 1;
      }
    }

    score += this.getFeedbackBoost(productText);
    
    return score;
  }
  
  /**
   * Check if product is relevant for recipient (Dutch + English)
   */
  private static isRelevantForRecipient(productText: string, recipient: string): boolean {
    const recipientMap: Record<string, string[]> = {
      'partner': ['romantic', 'couple', 'valentine', 'anniversary', 'love', 'romantisch', 'koppel', 'liefde', 'relatie'],
      'vriend(in)': ['fun', 'social', 'friend', 'party', 'trendy', 'leuk', 'gezellig', 'vrienden', 'feest', 'hip'],
      'familielid': ['family', 'traditional', 'practical', 'home', 'familie', 'praktisch', 'thuis', 'huis'],
      'collega': ['professional', 'office', 'business', 'practical', 'professioneel', 'kantoor', 'werk', 'zakelijk'],
      'kind': ['kids', 'children', 'toy', 'educational', 'fun', 'game', 'kinderen', 'speelgoed', 'educatief', 'spel', 'junior'],
      'man': ['man', 'men', 'male', 'heren', 'gentlemen', 'jongens', 'boys', 'mannelijk'],
      'vrouw': ['vrouw', 'women', 'female', 'dames', 'ladies', 'meisjes', 'girls', 'vrouwelijk']
    };
    
    const keywords = recipientMap[recipient.toLowerCase()] || [];
    return keywords.some(keyword => productText.includes(keyword));
  }
  
  /**
   * Check if product is relevant for occasion (Dutch + English)
   */
  private static isRelevantForOccasion(productText: string, occasion: string): boolean {
    const occasionMap: Record<string, string[]> = {
      'verjaardag': ['birthday', 'celebration', 'party', 'special', 'verjaardag', 'feest', 'viering', 'speciaal'],
      'kerstmis': ['christmas', 'holiday', 'winter', 'festive', 'december', 'kerst', 'feestdagen', 'winterdag'],
      'valentijnsdag': ['valentine', 'romantic', 'love', 'couple', 'valentijn', 'romantisch', 'liefde', 'romantiek'],
      'jubileum': ['anniversary', 'milestone', 'celebration', 'special', 'jubileum', 'mijlpaal', 'viering'],
      'zomaar': ['surprise', 'spontaneous', 'just because', 'thoughtful', 'verrassing', 'spontaan', 'attent', 'lief']
    };
    
    const keywords = occasionMap[occasion.toLowerCase()] || [];
    return keywords.some(keyword => productText.includes(keyword));
  }
  
  /**
   * Check if product is relevant for interests (Dutch + English)
   */
  private static isRelevantForInterests(productText: string, interests?: string): boolean {
    if (!interests) return false;
    
    const interestTerms = interests.toLowerCase().split(',').map(t => t.trim());
    
    // Create expanded terms with Dutch translations
    const expandedTerms = interestTerms.flatMap(term => {
      const translations: Record<string, string[]> = {
        'tech': ['technologie', 'gadgets', 'electronica', 'electronics'],
        'koken': ['cooking', 'kitchen', 'food', 'culinary', 'keuken', 'eten'],
        'sport': ['fitness', 'exercise', 'workout', 'sports', 'sporten', 'bewegen'],
        'muziek': ['music', 'audio', 'sound', 'muziek', 'geluid'],
        'games': ['gaming', 'console', 'pc', 'spellen', 'gamen'],
        'boeken': ['books', 'reading', 'literature', 'lezen', 'literatuur'],
        'reizen': ['travel', 'vacation', 'trip', 'vakantie', 'reis'],
        'mode': ['fashion', 'clothing', 'style', 'kleding', 'stijl'],
        'beauty': ['cosmetics', 'skincare', 'makeup', 'cosmetica', 'verzorging'],
        'tuinieren': ['gardening', 'plants', 'garden', 'tuin', 'planten']
      };
      
      return [term, ...(translations[term] || [])];
    });
    
    return expandedTerms.some(term => productText.includes(term));
  }
  
  /**
   * Convert products to Gift format
   */
  private static convertProductsToGifts(products: any[], searchParams: GiftSearchParams): Gift[] {
    return products.map(product => {
      const retailerName = this.resolveRetailerName(product);

      const retailer: Retailer = {
        name: retailerName,
        affiliateLink: product.affiliateLink || this.generateRetailerUrl(product, retailerName)
      };
      
      return {
        productName: product.name || product.title || 'Product',
        description: this.generateGiftDescription(product, searchParams),
        priceRange: this.formatPriceRange(product.price, product.originalPrice),
        retailers: [retailer],
        imageUrl: product.image || product.imageUrl || '',
        category: product.category || product.productCategory || 'Algemeen',
        tags: [
          (typeof product.relevanceScore === 'number' ? product.relevanceScore : 0).toString(),
          ...(product.tags || [])
        ],
        rating: product.rating || 4.0,
        reviews: product.reviewCount || 0,
        deliverySpeed: retailerName === 'Amazon.nl' ? 'fast' : 'standard',
        giftType: this.determineGiftType(product),
        sustainability: product.sustainability || false,
        personalization: product.personalization || false,
        ageGroup: product.ageGroup || this.inferAgeGroup(searchParams.recipient),
        gender: 'unisex',
        popularity: product.giftScore || 5,
        availability: product.inStock !== false ? 'in-stock' : 'out-of-stock',
        relevanceScore: typeof product.relevanceScore === 'number' ? product.relevanceScore : undefined
      } as Gift;
    });
  }

  private static resolveRetailerName(product: any): string {
    const source = (product.source || '').toString().toLowerCase();
    const merchant = (product.merchant || '').toString().toLowerCase();
    const link = (product.affiliateLink || product.url || '').toString().toLowerCase();

    if (source === 'amazon' || link.includes('amazon')) {
      return 'Amazon.nl';
    }

    if (source === 'coolblue' || link.includes('coolblue')) {
      return 'Coolblue.nl';
    }

    if (source === 'shop-like-you-give-a-damn' || merchant.includes('shop like you give a damn') || link.includes('shoplikeyougiveadamn')) {
      return 'Shop Like You Give A Damn';
    }

    if (merchant) {
      return merchant;
    }

    return 'Gifteez Partner';
  }
  
  /**
   * Generate appropriate gift description in Dutch
   */
  private static generateGiftDescription(product: any, searchParams: GiftSearchParams): string {
    let baseDescription = product.description || product.shortDescription || product.name || 'Geweldig cadeau';
    
    // Truncate to reasonable length
    const maxLength = 120;
    if (baseDescription.length > maxLength) {
      baseDescription = baseDescription.substring(0, maxLength) + '...';
    }
    
    // Add Dutch context for recipient if not already mentioned
    const recipientInDutch = this.getRecipientInDutch(searchParams.recipient);
    const lowerDescription = baseDescription.toLowerCase();
    
    if (!lowerDescription.includes(recipientInDutch.toLowerCase()) && 
        !lowerDescription.includes(searchParams.recipient.toLowerCase())) {
      baseDescription = `Perfect voor ${recipientInDutch.toLowerCase()}. ${baseDescription}`;
    }
    
    return baseDescription;
  }
  
  /**
   * Get Dutch translation for recipient
   */
  private static getRecipientInDutch(recipient: string): string {
    const translations: Record<string, string> = {
      'partner': 'je partner',
      'vriend(in)': 'een vriend(in)',
      'familielid': 'een familielid',
      'collega': 'een collega',
      'kind': 'kinderen',
      'man': 'een man',
      'vrouw': 'een vrouw'
    };
    
    return translations[recipient.toLowerCase()] || recipient;
  }
  
  /**
   * Format price
   */
  private static formatPrice(price?: number): string {
    if (!price) return 'Prijs op aanvraag';
    return `€${price.toFixed(2)}`;
  }
  
  /**
   * Format price range
   */
  private static formatPriceRange(price?: number, originalPrice?: number): string {
    if (!price) return '€ Prijs op aanvraag';
    
    if (originalPrice && originalPrice > price) {
      return `€${price.toFixed(2)} (was €${originalPrice.toFixed(2)})`;
    }
    
    return `€${price.toFixed(2)}`;
  }
  
  /**
   * Generate retailer URL
   */
  private static generateRetailerUrl(product: any, retailer: string): string {
    if (product.affiliateLink) {
      return product.affiliateLink;
    }
    
    if (product.url) {
      return product.url;
    }
    
    // Fallback to search URL
    const searchTerm = encodeURIComponent(product.name || product.title || '');
    if (retailer === 'Amazon.nl') {
      return `https://www.amazon.nl/s?k=${searchTerm}`;
    }

    if (retailer === 'Coolblue.nl') {
      return `https://www.coolblue.nl/zoeken?query=${searchTerm}`;
    }

    if (retailer === 'Shop Like You Give A Damn') {
      return `https://www.shoplikeyougiveadamn.com/search?q=${searchTerm}`;
    }

    return `https://www.google.com/search?q=${searchTerm}`;
  }
  
  /**
   * Determine gift type from product (Dutch labels)
   */
  private static determineGiftType(product: any): 'physical' | 'experience' | 'digital' | 'subscription' {
    const category = (product.category || product.productCategory || '').toLowerCase();
    
    // Check for digital products
    if (category.includes('software') || category.includes('digital') || 
        category.includes('ebook') || category.includes('download')) {
      return 'digital';
    }
    
    // Check for subscriptions
    if (category.includes('subscription') || category.includes('service') || 
        category.includes('abonnement') || category.includes('dienst')) {
      return 'subscription';
    }
    
    // Check for experiences
    if (category.includes('experience') || category.includes('ticket') || 
        category.includes('course') || category.includes('ervaring') || 
        category.includes('cursus') || category.includes('workshop')) {
      return 'experience';
    }
    
    // Default to physical
    return 'physical';
  }
  
  /**
   * Infer age group from recipient
   */
  private static inferAgeGroup(recipient: string): string {
    if (recipient.toLowerCase().includes('kind')) return '0-12';
    if (recipient.toLowerCase().includes('tiener')) return '13-17';
    return '18+';
  }
}
