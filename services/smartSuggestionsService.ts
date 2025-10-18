import { DealItem } from '../types';

export interface ProductSuggestion {
  product: DealItem;
  score: number; // 0-100 confidence score
  reasons: string[]; // Why this product was suggested
}

/**
 * Smart Suggestions Service
 * Analyzes category context and suggests relevant products
 */
export class SmartSuggestionsService {
  
  /**
   * Get product suggestions for a category based on:
   * - Category title keywords
   * - Existing products in category
   * - Gift scores
   * - Product metadata
   */
  static getSuggestionsForCategory(
    categoryTitle: string,
    existingProductIds: string[],
    allProducts: DealItem[],
    maxSuggestions: number = 10
  ): ProductSuggestion[] {
    
    // Filter out products already in category
    const availableProducts = allProducts.filter(p => !existingProductIds.includes(p.id));
    
    // Get keywords from category title
    const keywords = this.extractKeywords(categoryTitle);
    
    // Get themes from existing products
    const existingProducts = allProducts.filter(p => existingProductIds.includes(p.id));
    const categoryThemes = this.analyzeProductThemes(existingProducts);
    
    // Score each available product
    const scoredProducts = availableProducts.map(product => {
      const score = this.calculateMatchScore(product, keywords, categoryThemes, existingProducts);
      const reasons = this.generateReasons(product, keywords, categoryThemes, score);
      
      return {
        product,
        score,
        reasons
      };
    });
    
    // Sort by score and return top N
    return scoredProducts
      .filter(s => s.score > 20) // Minimum threshold
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSuggestions);
  }
  
  /**
   * Extract meaningful keywords from category title
   */
  private static extractKeywords(title: string): string[] {
    const normalized = title.toLowerCase();
    
    // Remove common filler words
    const stopWords = ['de', 'het', 'een', 'voor', 'van', 'en', 'top', 'beste', 'deal', 'deals'];
    const words = normalized.split(/\s+/).filter(word => 
      word.length > 2 && !stopWords.includes(word)
    );
    
    return words;
  }
  
  /**
   * Analyze themes from existing products in category
   */
  private static analyzeProductThemes(products: DealItem[]): {
    tags: string[];
    priceRange: { min: number; max: number };
    avgGiftScore: number;
    commonWords: string[];
  } {
    if (products.length === 0) {
      return {
        tags: [],
        priceRange: { min: 0, max: 1000 },
        avgGiftScore: 7,
        commonWords: []
      };
    }
    
    // Extract all tags
    const allTags = products.flatMap(p => p.tags || []);
    const tags = [...new Set(allTags)];
    
    // Calculate price range (convert string to number)
    const prices = products.map(p => parseFloat(p.price.replace(/[^0-9.]/g, '')));
    const priceRange = {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
    
    // Calculate average gift score
    const giftScores = products.map(p => p.giftScore || 7);
    const avgGiftScore = giftScores.reduce((sum, s) => sum + s, 0) / giftScores.length;
    
    // Extract common words from product names
    const allWords = products
      .flatMap(p => p.name.toLowerCase().split(/\s+/))
      .filter(word => word.length > 3);
    
    const wordFrequency = allWords.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const commonWords = Object.entries(wordFrequency)
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
    
    return { tags, priceRange, avgGiftScore, commonWords };
  }
  
  /**
   * Calculate match score for a product (0-100)
   */
  private static calculateMatchScore(
    product: DealItem,
    keywords: string[],
    themes: ReturnType<typeof SmartSuggestionsService.analyzeProductThemes>,
    existingProducts: DealItem[]
  ): number {
    let score = 0;
    
    // Base score from gift score (0-30 points)
    const giftScore = product.giftScore || 7;
    score += (giftScore / 10) * 30;
    
    // Keyword matching in name (0-25 points)
    const productNameLower = product.name.toLowerCase();
    const matchedKeywords = keywords.filter(kw => productNameLower.includes(kw));
    score += (matchedKeywords.length / Math.max(keywords.length, 1)) * 25;
    
    // Tag matching (0-20 points)
    const productTags = product.tags || [];
    const tagMatches = productTags.filter(tag => themes.tags.includes(tag)).length;
    if (tagMatches > 0) {
      score += Math.min(tagMatches * 10, 20);
    }
    
    // Price range similarity (0-15 points)
    if (themes.priceRange.max > 0) {
      const productPrice = parseFloat(product.price.replace(/[^0-9.]/g, ''));
      const priceDiff = Math.abs(productPrice - (themes.priceRange.min + themes.priceRange.max) / 2);
      const priceScore = Math.max(0, 1 - (priceDiff / themes.priceRange.max));
      score += priceScore * 15;
    }
    
    // Common words matching (0-10 points)
    const productWords = product.name.toLowerCase().split(/\s+/);
    const commonWordMatches = productWords.filter(w => themes.commonWords.includes(w)).length;
    score += Math.min(commonWordMatches * 3, 10);
    
    // Bonus: on sale products (0-5 points)
    if (product.isOnSale) {
      score += 5;
    }
    
    // Penalty: very different gift score (-10 points)
    const giftScoreDiff = Math.abs(giftScore - themes.avgGiftScore);
    if (giftScoreDiff > 2) {
      score -= 10;
    }
    
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Generate human-readable reasons for suggestion
   */
  private static generateReasons(
    product: DealItem,
    keywords: string[],
    themes: ReturnType<typeof SmartSuggestionsService.analyzeProductThemes>,
    score: number
  ): string[] {
    const reasons: string[] = [];
    
    // Gift score
    const giftScore = product.giftScore || 7;
    if (giftScore >= 8) {
      reasons.push(`Hoge cadeau-score (${giftScore}/10)`);
    }
    
    // Keyword match
    const productNameLower = product.name.toLowerCase();
    const matchedKeywords = keywords.filter(kw => productNameLower.includes(kw));
    if (matchedKeywords.length > 0) {
      reasons.push(`Past bij: ${matchedKeywords.join(', ')}`);
    }
    
    // Tag match
    const productTags = product.tags || [];
    const tagMatches = productTags.filter(tag => themes.tags.includes(tag));
    if (tagMatches.length > 0) {
      reasons.push(`Tags: ${tagMatches.slice(0, 2).join(', ')}`);
    }
    
    // Price range
    const productPrice = parseFloat(product.price.replace(/[^0-9.]/g, ''));
    if (!isNaN(productPrice) && productPrice >= themes.priceRange.min && productPrice <= themes.priceRange.max) {
      reasons.push(`Passende prijs (€${Math.round(themes.priceRange.min)}-€${Math.round(themes.priceRange.max)})`);
    }
    
    // Sale/discount
    if (product.isOnSale && product.originalPrice) {
      const originalPriceNum = parseFloat(product.originalPrice.replace(/[^0-9.]/g, ''));
      if (!isNaN(originalPriceNum) && !isNaN(productPrice)) {
        const discount = Math.round((1 - productPrice / originalPriceNum) * 100);
        reasons.push(`${discount}% korting`);
      }
    }
    
    // Common words
    const productWords = product.name.toLowerCase().split(/\s+/);
    const commonMatches = productWords.filter(w => themes.commonWords.includes(w));
    if (commonMatches.length > 0) {
      reasons.push(`Gerelateerd aan: ${commonMatches.slice(0, 2).join(', ')}`);
    }
    
    // Default if no specific reasons
    if (reasons.length === 0) {
      reasons.push(`Match score: ${Math.round(score)}%`);
    }
    
    return reasons.slice(0, 3); // Max 3 reasons for readability
  }
  
  /**
   * Get suggestions based on similar products (collaborative filtering)
   */
  static getSimilarProducts(
    productId: string,
    allProducts: DealItem[],
    maxSuggestions: number = 5
  ): DealItem[] {
    const targetProduct = allProducts.find(p => p.id === productId);
    if (!targetProduct) return [];
    
    const scored = allProducts
      .filter(p => p.id !== productId)
      .map(p => ({
        product: p,
        similarity: this.calculateSimilarity(targetProduct, p)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, maxSuggestions);
    
    return scored.map(s => s.product);
  }
  
  /**
   * Calculate similarity between two products
   */
  private static calculateSimilarity(p1: DealItem, p2: DealItem): number {
    let similarity = 0;
    
    // Tag match (0-40 points)
    const tags1 = new Set(p1.tags || []);
    const tags2 = new Set(p2.tags || []);
    const tagIntersection = [...tags1].filter(t => tags2.has(t)).length;
    if (tagIntersection > 0) {
      similarity += Math.min(tagIntersection * 20, 40);
    }
    
    // Price similarity (within 30%) (0-20 points)
    const price1 = parseFloat(p1.price.replace(/[^0-9.]/g, ''));
    const price2 = parseFloat(p2.price.replace(/[^0-9.]/g, ''));
    if (!isNaN(price1) && !isNaN(price2)) {
      const priceDiff = Math.abs(price1 - price2) / Math.max(price1, price2);
      if (priceDiff < 0.3) similarity += 20;
    }
    
    // Gift score similarity (0-20 points)
    const scoreDiff = Math.abs((p1.giftScore || 7) - (p2.giftScore || 7));
    similarity += (1 - scoreDiff / 10) * 20;
    
    // Name word overlap (0-20 points)
    const words1 = new Set(p1.name.toLowerCase().split(/\s+/));
    const words2 = new Set(p2.name.toLowerCase().split(/\s+/));
    const intersection = [...words1].filter(w => words2.has(w)).length;
    const union = new Set([...words1, ...words2]).size;
    similarity += (intersection / union) * 20;
    
    return similarity;
  }
}

export default SmartSuggestionsService;
