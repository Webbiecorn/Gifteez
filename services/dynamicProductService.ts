import { DealItem, DealCategory } from '../types';
import CoolblueFeedService, { CoolblueProduct } from './coolblueFeedService';
import { AmazonProductLibrary, type AmazonProduct } from './amazonProductLibrary';

/**
 * Dynamic Product Service for Gifteez
 * Loads and manages products from multiple feeds (Coolblue + Amazon)
 */
export class DynamicProductService {
  private static coolblueProducts: CoolblueProduct[] = [];
  private static amazonProducts: any[] = [];
  private static lastUpdated: Date | null = null;
  private static isLoading = false;

  /**
   * Load products from multiple sources
   */
  static async loadProducts(): Promise<void> {
    if (this.isLoading) return;
    
    this.isLoading = true;
    
    try {
      console.log('📦 Loading products from multiple sources...');
      
      // Load Coolblue products (managed feed)
      try {
        const coolblueData = await CoolblueFeedService.loadProducts();
        this.coolblueProducts = coolblueData;
        console.log(`🔵 Loaded ${this.coolblueProducts.length} Coolblue products via feed service`);
      } catch (error) {
        console.warn('⚠️  Could not load Coolblue products:', error);
        this.coolblueProducts = [];
      }
      
      // Load Amazon products (manual feed)
      try {
        const amazonData = await AmazonProductLibrary.loadProducts();
        this.amazonProducts = amazonData.map((product: AmazonProduct) => ({
          ...product,
          id: product.id ?? product.asin,
          image: product.image ?? product.imageLarge,
          imageUrl: product.imageLarge ?? product.image,
          shortDescription: product.shortDescription ?? product.description,
        }));
        console.log(`🟠 Loaded ${this.amazonProducts.length} Amazon products`);
      } catch (error) {
        console.warn('⚠️  Could not load Amazon products:', error);
        this.amazonProducts = [];
      }
      
      this.lastUpdated = new Date();
      
      const totalProducts = this.coolblueProducts.length + this.amazonProducts.length;
      console.log(`📊 Total products loaded: ${totalProducts} (${this.coolblueProducts.length} Coolblue + ${this.amazonProducts.length} Amazon)`);
      
    } catch (error) {
      console.warn('⚠️  Error loading products:', error);
      
      // Load fallback data
      try {
        const { default: sampleData } = await import('../data/sampleProducts.json');
        this.coolblueProducts = sampleData;
        this.amazonProducts = [];
        this.lastUpdated = new Date();
        console.log(`📦 Loaded ${this.coolblueProducts.length} products from fallback data`);
      } catch (importError) {
        console.error('❌ Failed to load any product data:', importError);
        this.coolblueProducts = [];
        this.amazonProducts = [];
      }
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Get all products from both sources (public method)
   */
  static getProducts(): any[] {
    return this.getAllProducts();
  }

  /**
   * Get all products from both sources (internal method)
   */
  private static getAllProducts(): any[] {
    return [...this.coolblueProducts, ...this.amazonProducts];
  }

  /**
   * Get products by source
   */
  static getProductsBySource(source: 'coolblue' | 'amazon' | 'all' = 'all'): any[] {
    switch (source) {
      case 'coolblue':
        return this.coolblueProducts;
      case 'amazon':
        return this.amazonProducts;
      case 'all':
      default:
        return this.getAllProducts();
    }
  }

  /**
   * Convert feed product to DealItem format
   */
  private static convertToDealItem(product: any): DealItem {
    // Image selection priority list – we anticipate future expansion of the feeds:
    // 1. product.image (current field for both Coolblue & Amazon)
    // 2. product.imageUrl
    // 3. First entry in product.images array
    // 4. Derived transformation if we detect a Coolblue Bynder base id
    // 5. Local placeholder
    const placeholder = '/images/amazon-placeholder.png'; // Re‑use existing generic placeholder
    const imagesArray: string[] = Array.isArray(product.images) ? product.images : [];

    let chosenImage: string | undefined = (
      product.image ||
      product.imageUrl ||
      imagesArray.find((src: string) => !!src)
    );

    // Basic sanitation: ensure it's a non-empty string and looks like a URL
    if (typeof chosenImage !== 'string' || chosenImage.trim().length === 0) {
      chosenImage = undefined;
    }

    // If it's a Coolblue Bynder transform URL but very large, optionally normalize to a reasonable size
    // (Current feeds already request 800x800 PNG @ quality=100; keep as-is to leverage CDN caching.)
    // We could downscale to e.g. 600px for performance, but we'll keep original to avoid extra variants.

    if (!chosenImage) {
      chosenImage = placeholder;
    }

    // Guard for malformed price values
    const priceNumber = typeof product.price === 'number' && !isNaN(product.price) ? product.price : 0;

    const description = product.shortDescription
      || (typeof product.description === 'string' ? (product.description.substring(0, 140) + (product.description.length > 140 ? '…' : '')) : '');

    return {
      id: String(product.id),
      name: product.name,
      description,
      imageUrl: chosenImage,
      price: `€${priceNumber.toFixed(2)}`,
      affiliateLink: product.affiliateLink,
      originalPrice: typeof product.originalPrice === 'number' ? `€${product.originalPrice.toFixed(2)}` : undefined,
      isOnSale: !!product.isOnSale,
      tags: product.tags,
      giftScore: product.giftScore
    };
  }

  /**
   * Get extra Coolblue deals to pad a list to a desired length.
   * This only considers Coolblue products and excludes already used ids.
   */
  static getAdditionalCoolblueDeals(excludeIds: string[], limit: number): DealItem[] {
    if (limit <= 0) return [];
    // We assume products are already loaded if another public getter was called, but ensure anyway.
    // (No await here to keep sync usage after initial awaited calls.)
    const exclude = new Set(excludeIds);
    const candidates = this.coolblueProducts
      .filter(p => !exclude.has(p.id))
      // Basic sanity checks
      .filter(p => typeof p.price === 'number' && p.price > 0)
      // Prefer higher giftScore, then items on sale, then lower price for value
      .sort((a, b) => {
        if (a.isOnSale !== b.isOnSale) return a.isOnSale ? -1 : 1;
        if (b.giftScore !== a.giftScore) return (b.giftScore || 0) - (a.giftScore || 0);
        return a.price - b.price;
      })
      .slice(0, limit);

    return candidates.map(p => this.convertToDealItem(p));
  }

  /**
   * Get deal of the week (highest scoring premium product from both sources)
   */
  static async getDealOfTheWeek(): Promise<DealItem> {
    await this.loadProducts();
    
    const allProducts = this.getAllProducts();
    
    if (allProducts.length === 0) {
      return this.getFallbackDealOfTheWeek();
    }

    // Find the best premium deal (price 150-500, highest gift score)
    const premiumDeals = allProducts
      .filter(p => p.price >= 150 && p.price <= 500)
      .filter(p => p.giftScore >= 8)
      .sort((a, b) => {
        // Sort by gift score first, then by popularity indicators
        if (b.giftScore !== a.giftScore) {
          return b.giftScore - a.giftScore;
        }
        // If gift scores are equal, prefer products on sale
        if (a.isOnSale !== b.isOnSale) {
          return a.isOnSale ? -1 : 1;
        }
        return 0;
      });

    if (premiumDeals.length > 0) {
      return this.convertToDealItem(premiumDeals[0]);
    }

    // Fallback to any high-scoring product
    const topDeals = allProducts
      .filter(p => p.giftScore >= 7)
      .sort((a, b) => b.giftScore - a.giftScore);

    if (topDeals.length > 0) {
      return this.convertToDealItem(topDeals[0]);
    }

    return this.getFallbackDealOfTheWeek();
  }

  /**
   * Get top 10 deals across all categories
   */
  static async getTop10Deals(): Promise<DealItem[]> {
    await this.loadProducts();
    
    if (this.getAllProducts().length === 0) {
      return this.getFallbackTop10Deals();
    }

    // Get diverse selection of top deals
    const categories = ['audio', 'gaming', 'smart', 'fitness', 'coffee', 'electronics'];
    const dealsPerCategory = Math.floor(10 / categories.length);
    const deals: any[] = [];

    // Get deals from each category
    for (const category of categories) {
      const categoryDeals = this.getAllProducts()
        .filter(p => {
          const categoryText = (p.category || '').toLowerCase();
          const nameText = p.name.toLowerCase();
          const tagText = (p.tags || []).join(' ').toLowerCase();
          return categoryText.includes(category) || 
                 nameText.includes(category) || 
                 tagText.includes(category);
        })
        .filter(p => p.giftScore >= 6)
        .filter(p => p.price >= 20 && p.price <= 800)
        .sort((a, b) => {
          // Prefer products on sale
          if (a.isOnSale !== b.isOnSale) {
            return a.isOnSale ? -1 : 1;
          }
          return b.giftScore - a.giftScore;
        })
        .slice(0, dealsPerCategory);

      deals.push(...categoryDeals);
    }

    // Fill remaining slots with best remaining products
    const usedIds = new Set(deals.map(d => d.id));
    const remainingSlots = 10 - deals.length;
    
    if (remainingSlots > 0) {
      const additionalDeals = this.getAllProducts()
        .filter(p => !usedIds.has(p.id))
        .filter(p => p.giftScore >= 6)
        .sort((a, b) => b.giftScore - a.giftScore)
        .slice(0, remainingSlots);
      
      deals.push(...additionalDeals);
    }

    // Convert to DealItem format and ensure we have exactly 10
    const topDeals = deals.slice(0, 10).map(p => this.convertToDealItem(p));
    
    // If we don't have enough, fill with fallback data
    if (topDeals.length < 10) {
      const fallback = this.getFallbackTop10Deals();
      return [...topDeals, ...fallback.slice(topDeals.length)];
    }

    return topDeals;
  }

  /**
   * Get categorized deals
   */
  static async getDealCategories(): Promise<DealCategory[]> {
    await this.loadProducts();
    
    if (this.getAllProducts().length === 0) {
      return this.getFallbackCategories();
    }

    const categories: DealCategory[] = [];

    // Tech Gadgets Category
    const techProducts = this.getAllProducts()
      .filter(p => {
        const text = `${p.name} ${p.category} ${(p.tags || []).join(' ')}`.toLowerCase();
        return text.includes('audio') || text.includes('speaker') || 
               text.includes('headset') || text.includes('bluetooth') ||
               text.includes('smart') || text.includes('tech');
      })
      .filter(p => p.giftScore >= 7)
      .filter(p => p.price >= 50 && p.price <= 500)
      .sort((a, b) => b.giftScore - a.giftScore)
      .slice(0, 4);

    if (techProducts.length > 0) {
      categories.push({
        title: 'Top Tech Gadgets',
        items: techProducts.map(p => this.convertToDealItem(p))
      });
    }

    // Kitchen & Home Category
    const kitchenProducts = this.getAllProducts()
      .filter(p => {
        const text = `${p.name} ${p.category} ${(p.tags || []).join(' ')}`.toLowerCase();
        return text.includes('coffee') || text.includes('kitchen') || 
               text.includes('keuken') || text.includes('home') ||
               text.includes('vaatwasser') || text.includes('senseo');
      })
      .filter(p => p.giftScore >= 6)
      .sort((a, b) => b.giftScore - a.giftScore)
      .slice(0, 4);

    if (kitchenProducts.length > 0) {
      categories.push({
        title: 'Beste Keukenaccessoires',
        items: kitchenProducts.map(p => this.convertToDealItem(p))
      });
    }

    // Sustainable & Lifestyle Category
    const lifestyleProducts = this.getAllProducts()
      .filter(p => {
        const text = `${p.name} ${p.category} ${(p.tags || []).join(' ')}`.toLowerCase();
        return text.includes('portable') || text.includes('fitness') || 
               text.includes('sport') || text.includes('lifestyle') ||
               text.includes('health') || text.includes('wellness');
      })
      .filter(p => p.giftScore >= 6)
      .filter(p => p.price >= 15 && p.price <= 200)
      .sort((a, b) => b.giftScore - a.giftScore)
      .slice(0, 4);

    if (lifestyleProducts.length > 0) {
      categories.push({
        title: 'Populaire Lifestyle Producten',
        items: lifestyleProducts.map(p => this.convertToDealItem(p))
      });
    }

    // If we don't have enough categories, add fallback
    if (categories.length < 3) {
      const fallback = this.getFallbackCategories();
      categories.push(...fallback.slice(categories.length));
    }

    return categories;
  }

  /**
   * Search products by keyword
   */
  static async searchProducts(query: string, limit: number = 20): Promise<DealItem[]> {
    await this.loadProducts();
    
    if (this.getAllProducts().length === 0 || !query.trim()) {
      return [];
    }

    const searchTerm = query.toLowerCase().trim();
    
    const results = this.getAllProducts()
      .filter(p => {
        const text = `${p.name} ${p.description} ${p.category} ${(p.tags || []).join(' ')}`.toLowerCase();
        return text.includes(searchTerm);
      })
      .filter(p => p.giftScore >= 5)
      .sort((a, b) => {
        // Prioritize name matches
        const aNameMatch = a.name.toLowerCase().includes(searchTerm);
        const bNameMatch = b.name.toLowerCase().includes(searchTerm);
        
        if (aNameMatch !== bNameMatch) {
          return aNameMatch ? -1 : 1;
        }
        
        return b.giftScore - a.giftScore;
      })
      .slice(0, limit);

    return results.map(p => this.convertToDealItem(p));
  }

  /**
   * Get products by price range
   */
  static async getProductsByPriceRange(minPrice: number, maxPrice: number, limit: number = 20): Promise<DealItem[]> {
    await this.loadProducts();
    
    if (this.getAllProducts().length === 0) {
      return [];
    }

    const results = this.getAllProducts()
      .filter(p => p.price >= minPrice && p.price <= maxPrice)
      .filter(p => p.giftScore >= 6)
      .sort((a, b) => {
        // Prefer products on sale
        if (a.isOnSale !== b.isOnSale) {
          return a.isOnSale ? -1 : 1;
        }
        return b.giftScore - a.giftScore;
      })
      .slice(0, limit);

    return results.map(p => this.convertToDealItem(p));
  }

  /**
   * Get statistics about loaded products
   */
  static getStats() {
    return {
      totalProducts: this.getAllProducts().length,
      lastUpdated: this.lastUpdated,
      averageGiftScore: this.getAllProducts().length > 0 
        ? this.getAllProducts().reduce((sum, p) => sum + p.giftScore, 0) / this.getAllProducts().length 
        : 0,
      priceRanges: {
        budget: this.getAllProducts().filter(p => p.price < 50).length,
        midRange: this.getAllProducts().filter(p => p.price >= 50 && p.price < 150).length,
        premium: this.getAllProducts().filter(p => p.price >= 150).length
      }
    };
  }

  // Fallback methods for when dynamic data is not available
  private static getFallbackDealOfTheWeek(): DealItem {
    return {
      id: 'deal-001',
      name: 'Whirlpool WH7IPC15BM60 Maxispace',
      description: 'Inbouw vaatwasser met Maxi Space technologie en PowerClean sproeiarm.',
      imageUrl: 'https://image.coolblue.nl/max/1400xauto/products/2189781',
      price: '€629,00',
      affiliateLink: 'https://www.coolblue.nl/product/966434/whirlpool-wh7ipc15bm60-maxispace.html'
    };
  }

  private static getFallbackTop10Deals(): DealItem[] {
    return [
      { id: 'top-01', name: 'Sonos Roam SL Speaker', description: 'Grootse draagbare Bluetooth speaker met uitstekende geluidskwaliteit.', imageUrl: 'https://m.media-amazon.com/images/I/51x24PzVnoL._AC_SL1000_.jpg', price: '€234,95', affiliateLink: 'https://www.amazon.nl/Sonos-grootse-lichtgewicht-draagbare-speaker/dp/B09PNSV48L/' },
      { id: 'top-02', name: 'JBL Live 770NC Koptelefoon', description: 'Draadloze noise-cancelling koptelefoon met superieure geluidskwaliteit.', imageUrl: 'https://image.coolblue.nl/max/1400xauto/products/1962259', price: '€118,00', affiliateLink: 'https://www.coolblue.nl/product/934400/jbl-live-770nc-zwart.html' },
      // Add more fallback items as needed
    ];
  }

  private static getFallbackCategories(): DealCategory[] {
    return [
      {
        title: 'Top Tech Gadgets',
        items: this.getFallbackTop10Deals().slice(0, 3)
      }
    ];
  }
}
