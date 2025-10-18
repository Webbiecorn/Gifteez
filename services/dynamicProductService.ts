import { DealItem, DealCategory } from '../types';
import CoolblueFeedService, { CoolblueProduct } from './coolblueFeedService';
import { AmazonProductLibrary, type AmazonProduct } from './amazonProductLibrary';
import { DealCategoryConfigService, type DealCategoryConfig } from './dealCategoryConfigService';
import { PinnedDealsService } from './pinnedDealsService';

const DEFAULT_PRODUCT_PLACEHOLDER = '/images/amazon-placeholder.png';

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

      try {
        await PinnedDealsService.load();
      } catch (error) {
        console.warn('⚠️  Kon vastgezette deals niet synchroniseren tijdens laden:', error);
      }
      
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
   * Clear all cached products and force reload
   */
  static clearCache(): void {
    this.coolblueProducts = [];
    this.amazonProducts = [];
    this.lastUpdated = null;
    this.isLoading = false;
    PinnedDealsService.clearCache();
    console.log('🗑️  DynamicProductService cache cleared');
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
  const placeholder = DEFAULT_PRODUCT_PLACEHOLDER; // Re‑use existing generic placeholder
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

  private static getPinnedDeals(limit: number = 4): DealItem[] {
    if (limit <= 0) {
      return [];
    }

    const entries = PinnedDealsService.getCachedPinnedDeals();
    if (!entries.length) {
      return [];
    }

    const uniqueDeals: DealItem[] = [];
    const seen = new Set<string>();

    for (const entry of entries) {
      const deal = entry?.deal;
      if (!deal?.id || seen.has(deal.id)) {
        continue;
      }

      uniqueDeals.push(deal);
      seen.add(deal.id);

      if (uniqueDeals.length >= limit) {
        break;
      }
    }

    return uniqueDeals;
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

    const allProducts = this.getAllProducts();

    if (!allProducts.length) {
      return this.getFallbackTop10Deals();
    }

    const MAX_TOTAL = 10;
    const DEFAULT_GROUP_LIMIT = 2;
    const GROUP_LIMITS: Record<string, number> = {
      tech: 3,
      smartHome: 2,
      kitchen: 3,
      lifestyle: 3,
      gaming: 2,
      kids: 2,
      outdoor: 2,
      beauty: 2,
      wellness: 2,
      general: 4
    };
    const DOMAIN_LIMITS: Record<string, number | null> = {
      coolblue: 6,
      amazon: 5,
      bol: 3,
      other: 3,
      default: 6
    };
    const BUCKET_TARGETS: Record<string, number> = {
      tech: 2,
      smartHome: 1,
      kitchen: 2,
      lifestyle: 2,
      gaming: 1,
      kids: 1,
      outdoor: 1,
      beauty: 1,
      wellness: 1
    };
    const BUCKET_PRIORITY = ['tech', 'smartHome', 'kitchen', 'lifestyle', 'gaming', 'kids', 'beauty', 'wellness', 'outdoor', 'general'];

    const keywordMatchers: Array<{ id: string; keywords: string[] }> = [
      { id: 'kids', keywords: ['kids', 'kind', 'kinder', 'speelgoed', 'lego', 'puzzel', 'familie', 'baby'] },
      { id: 'gaming', keywords: ['gaming', 'game', 'switch', 'playstation', 'xbox', 'nintendo', 'console', 'pc gaming', 'vr'] },
      { id: 'kitchen', keywords: ['keuken', 'kitchen', 'coffee', 'koffie', 'espresso', 'airfryer', 'keukenmachine', 'blender', 'oven', 'bak', 'barista', 'pan', 'vaatwasser'] },
      { id: 'smartHome', keywords: ['smart home', 'slimme lamp', 'hue', 'philips hue', 'thermostaat', 'ring', 'security', 'sensor', 'rookmelder', 'videodeurbel', 'robotstofzuiger'] },
      { id: 'lifestyle', keywords: ['fitness', 'sport', 'wellness', 'gezondheid', 'health', 'mindfulness', 'relax', 'yoga', 'energie', 'sleep', 'wearable', 'smartwatch'] },
      { id: 'beauty', keywords: ['beauty', 'verzorging', 'haar', 'hair', 'skin', 'skincare', 'gezicht', 'parfum', 'makeup', 'make-up', 'schoonheid'] },
      { id: 'outdoor', keywords: ['outdoor', 'bbq', 'barbecue', 'camping', 'tuin', 'garden', 'wandelen', 'hiken', 'travel', 'reis', 'fiets', 'bike'] },
      { id: 'tech', keywords: ['audio', 'speaker', 'koptelefoon', 'headset', 'bluetooth', 'soundbar', 'laptop', 'tablet', 'camera', 'wearable', 'earbuds', 'monitor', 'smartphone', 'tech'] },
      { id: 'wellness', keywords: ['massage', 'theragun', 'spa', 'wellness', 'relax'] },
    ];

    const normaliseText = (product: any): string => {
      const parts = [
        product.name,
        product.category,
        product.description,
        product.shortDescription,
        Array.isArray(product.tags) ? product.tags.join(' ') : ''
      ]
        .filter(Boolean)
        .map((value: string) => value.toString().toLowerCase());

      return parts.join(' ');
    };

    const detectBucket = (product: any): string => {
      const text = normaliseText(product);
      for (const matcher of keywordMatchers) {
        if (matcher.keywords.some((keyword) => text.includes(keyword))) {
          return matcher.id;
        }
      }
      return 'general';
    };

    const detectDomain = (link: unknown): string => {
      if (typeof link !== 'string') {
        return 'other';
      }
      const value = link.toLowerCase();
      if (value.includes('amazon.')) {
        return 'amazon';
      }
      if (value.includes('coolblue.')) {
        return 'coolblue';
      }
      if (value.includes('bol.')) {
        return 'bol';
      }
      return 'other';
    };

    const computeScore = (product: any): number => {
      const giftScore = typeof product.giftScore === 'number' ? product.giftScore : 0;
      const ratingScore = typeof product.rating === 'number' ? Math.min(3, (product.rating / 5) * 3) : 0;
      const reviewBoost = typeof product.reviewCount === 'number' ? Math.min(1.5, Math.log10(product.reviewCount + 1)) : 0;
      const saleBoost = product.isOnSale ? 1.5 : 0;
      return giftScore + ratingScore + reviewBoost + saleBoost;
    };

    type ProductMeta = {
      product: any;
      bucket: string;
      domain: string;
      score: number;
      price: number;
      isOnSale: boolean;
    };

    const parsePrice = (value: unknown): number => {
      if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
      }
      if (typeof value === 'string') {
        const normalised = value.replace(/[^0-9.,]/g, '').replace(',', '.');
        const parsed = Number.parseFloat(normalised);
        if (Number.isFinite(parsed)) {
          return parsed;
        }
      }
      return 0;
    };

    const productMetas: ProductMeta[] = allProducts.map((product: any) => ({
      product,
      bucket: detectBucket(product),
      domain: detectDomain(product.affiliateLink),
      score: computeScore(product),
      price: parsePrice(product.price),
      isOnSale: Boolean(product.isOnSale)
    }));

    const metasByBucket = new Map<string, ProductMeta[]>();
    for (const meta of productMetas) {
      const list = metasByBucket.get(meta.bucket) ?? [];
      list.push(meta);
      metasByBucket.set(meta.bucket, list);
    }

    for (const list of metasByBucket.values()) {
      list.sort((a, b) => {
        if (a.isOnSale !== b.isOnSale) {
          return a.isOnSale ? -1 : 1;
        }
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return a.price - b.price;
      });
    }

    const selected: Array<ProductMeta & { locked?: boolean }> = [];
    const usedIds = new Set<string>();
    const bucketCounts = new Map<string, number>();
    const domainCounts = new Map<string, number>();

    const increment = (map: Map<string, number>, key: string) => {
      map.set(key, (map.get(key) ?? 0) + 1);
    };

    const decrement = (map: Map<string, number>, key: string) => {
      const next = (map.get(key) ?? 0) - 1;
      if (next <= 0) {
        map.delete(key);
      } else {
        map.set(key, next);
      }
    };

    const addMeta = (meta: ProductMeta, options: { lock?: boolean; force?: boolean } = {}): boolean => {
      if (selected.length >= MAX_TOTAL) {
        return false;
      }

      const id = meta?.product?.id != null ? String(meta.product.id) : '';
      if (!id || usedIds.has(id)) {
        return false;
      }

      const bucketLimit = GROUP_LIMITS[meta.bucket] ?? DEFAULT_GROUP_LIMIT;
      const domainLimit = DOMAIN_LIMITS[meta.domain] ?? DOMAIN_LIMITS.default;

      if (!options.force) {
        if (bucketLimit !== null && (bucketCounts.get(meta.bucket) ?? 0) >= bucketLimit) {
          return false;
        }
        if (domainLimit !== null && (domainCounts.get(meta.domain) ?? 0) >= domainLimit) {
          return false;
        }
      }

      selected.push({ ...meta, locked: options.lock ?? false });
      usedIds.add(id);
      increment(bucketCounts, meta.bucket);
      increment(domainCounts, meta.domain);
      return true;
    };

    const removeMetaAt = (index: number): void => {
      if (index < 0 || index >= selected.length) {
        return;
      }
      const removed = selected.splice(index, 1)[0];
      if (!removed) {
        return;
      }
      const id = removed?.product?.id != null ? String(removed.product.id) : '';
      if (id) {
        usedIds.delete(id);
      }
      decrement(bucketCounts, removed.bucket);
      decrement(domainCounts, removed.domain);
    };

    for (const bucket of BUCKET_PRIORITY) {
      if (selected.length >= MAX_TOTAL) {
        break;
      }
      const target = BUCKET_TARGETS[bucket] ?? 0;
      if (!target) {
        continue;
      }
      const list = metasByBucket.get(bucket);
      if (!list?.length) {
        continue;
      }
      let added = 0;
      for (const meta of list) {
        if (addMeta(meta, { lock: added === 0 })) {
          added += 1;
        }
        if (selected.length >= MAX_TOTAL || added >= target) {
          break;
        }
      }
    }

    if (selected.length < MAX_TOTAL) {
      const remainingMetas = productMetas
        .filter((meta) => !usedIds.has(meta?.product?.id != null ? String(meta.product.id) : ''))
        .sort((a, b) => {
          const domainWeightA = a.domain === 'amazon' ? 1 : 0;
          const domainWeightB = b.domain === 'amazon' ? 1 : 0;
          if (domainWeightA !== domainWeightB) {
            return domainWeightB - domainWeightA;
          }
          if (b.score !== a.score) {
            return b.score - a.score;
          }
          return a.price - b.price;
        });

      for (const meta of remainingMetas) {
        if (addMeta(meta)) {
          if (selected.length >= MAX_TOTAL) {
            break;
          }
        }
      }
    }

    if (selected.length < MAX_TOTAL) {
      const fallbackMetas = productMetas
        .filter((meta) => !usedIds.has(meta?.product?.id != null ? String(meta.product.id) : ''))
        .sort((a, b) => b.score - a.score);
      for (const meta of fallbackMetas) {
        if (addMeta(meta, { force: true })) {
          if (selected.length >= MAX_TOTAL) {
            break;
          }
        }
      }
    }

    const minAmazon = Math.min(3, this.amazonProducts.length);
    const amazonCount = selected.filter((meta) => meta.domain === 'amazon').length;

    if (amazonCount < minAmazon) {
      const needed = minAmazon - amazonCount;
      const amazonCandidates = productMetas
        .filter((meta) => meta.domain === 'amazon' && !usedIds.has(meta?.product?.id != null ? String(meta.product.id) : ''))
        .sort((a, b) => b.score - a.score);

      for (let i = 0; i < needed && i < amazonCandidates.length; i += 1) {
        const replaceable = selected
          .map((meta, index) => ({ meta, index }))
          .filter(({ meta }) => meta.domain !== 'amazon' && !meta.locked)
          .sort((a, b) => a.meta.score - b.meta.score);

        if (!replaceable.length) {
          break;
        }

        removeMetaAt(replaceable[0].index);
        addMeta(amazonCandidates[i], { force: true });
      }
    }

    if (!selected.length) {
      return this.getFallbackTop10Deals();
    }

    const finalDeals = selected
      .sort((a, b) => {
        if (a.domain !== b.domain) {
          if (a.domain === 'amazon') return -1;
          if (b.domain === 'amazon') return 1;
        }
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        if (a.isOnSale !== b.isOnSale) {
          return a.isOnSale ? -1 : 1;
        }
        return a.price - b.price;
      })
      .slice(0, MAX_TOTAL)
      .map((meta) => this.convertToDealItem(meta.product));

    if (finalDeals.length < MAX_TOTAL) {
      const fallback = this.getFallbackTop10Deals();
      const seen = new Set(finalDeals.map((deal) => deal.id));
      for (const item of fallback) {
        if (finalDeals.length >= MAX_TOTAL) {
          break;
        }
        if (seen.has(item.id)) {
          continue;
        }
        finalDeals.push(item);
        seen.add(item.id);
      }
    }

    return finalDeals;
  }

  /**
   * Get categorized deals
   */
  static async getDealCategories(): Promise<DealCategory[]> {
    await this.loadProducts();

    let manualConfig: DealCategoryConfig | null = null;
    try {
      manualConfig = await DealCategoryConfigService.load();
    } catch (error) {
      console.warn('Kon handmatige categoriebesturing niet laden:', error);
    }

    // Build smart categories as fallback (no caching to ensure fresh data)
    const getFallback = () => this.buildSmartCategories();

    if (manualConfig?.categories?.length) {
      const manualCategories = this.buildCategoriesFromConfig(manualConfig, getFallback);
      if (manualCategories.length) {
        return manualCategories;
      }
    }

    return getFallback();
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

  static async findDealItemById(id: string): Promise<DealItem | null> {
    if (!id) {
      return null;
    }

    await this.loadProducts();

    const productMatch = this.getAllProducts().find((product) => String(product.id) === id);
    if (productMatch) {
      return this.convertToDealItem(productMatch);
    }

    const pinnedMatch = this.getPinnedDeals(50).find((deal) => deal.id === id);
    if (pinnedMatch) {
      return pinnedMatch;
    }

    const fallbackMatch = [...this.getFallbackTop10Deals(), this.getFallbackDealOfTheWeek()].find((deal) => deal.id === id);
    if (fallbackMatch) {
      return fallbackMatch;
    }

    return null;
  }

  /**
   * Get statistics about loaded products
   */
  static getStats() {
    const products = this.getAllProducts();
    const totalProducts = products.length;

    const scoreTotals = products.reduce(
      (acc, product) => {
        const value = typeof product.giftScore === 'number' ? product.giftScore : null;
        if (value !== null && !Number.isNaN(value)) {
          acc.sum += value;
          acc.count += 1;
        }
        return acc;
      },
      { sum: 0, count: 0 }
    );

    const averageGiftScore = scoreTotals.count > 0 ? scoreTotals.sum / scoreTotals.count : 0;

    const priceRanges = products.reduce(
      (acc, product) => {
        const priceValue = typeof product.price === 'number' ? product.price : Number.NaN;
        if (Number.isNaN(priceValue)) {
          return acc;
        }

        if (priceValue < 50) acc.budget += 1;
        else if (priceValue < 150) acc.midRange += 1;
        else acc.premium += 1;

        return acc;
      },
      { budget: 0, midRange: 0, premium: 0 }
    );

    return {
      totalProducts,
      lastUpdated: this.lastUpdated,
      averageGiftScore,
      priceRanges
    };
  }

  private static buildDealItemMap(): Map<string, DealItem> {
    const map = new Map<string, DealItem>();

    const push = (deal?: DealItem | null) => {
      if (!deal || !deal.id || map.has(deal.id)) {
        return;
      }
      map.set(deal.id, deal);
    };

    this.getAllProducts().forEach((product) => {
      const deal = this.convertToDealItem(product);
      push(deal);
    });

    this.getPinnedDeals(50).forEach(push);
    this.getFallbackTop10Deals().forEach(push);
    push(this.getFallbackDealOfTheWeek());

    return map;
  }

  private static buildCategoriesFromConfig(
    config: DealCategoryConfig,
    getFallback: () => DealCategory[]
  ): DealCategory[] {
    if (!config.categories.length) {
      return [];
    }

    const itemMap = this.buildDealItemMap();
    const fallbackCategories = getFallback();
    const fallbackByTitle = new Map<string, { index: number; category: DealCategory }>(
      fallbackCategories.map((category, index) => [category.title.toLowerCase(), { index, category }])
    );
    const usedFallbackIndexes = new Set<number>();

    const takeFallbackByTitle = (title: string): DealCategory | null => {
      if (!title) {
        return null;
      }
      const match = fallbackByTitle.get(title.toLowerCase());
      if (!match || usedFallbackIndexes.has(match.index)) {
        return null;
      }
      usedFallbackIndexes.add(match.index);
      return match.category;
    };

    const takeNextFallback = (): DealCategory | null => {
      for (let index = 0; index < fallbackCategories.length; index += 1) {
        if (usedFallbackIndexes.has(index)) {
          continue;
        }
        usedFallbackIndexes.add(index);
        return fallbackCategories[index];
      }
      return null;
    };

    const manualCategories: DealCategory[] = [];

    for (const categoryConfig of config.categories) {
      const seen = new Set<string>();
      const items: DealItem[] = [];

      categoryConfig.itemIds.forEach((rawId) => {
        const id = typeof rawId === 'string' ? rawId.trim() : '';
        if (!id || seen.has(id)) {
          return;
        }
        const deal = itemMap.get(id);
        if (deal && deal.id && !seen.has(deal.id)) {
          items.push(deal);
          seen.add(deal.id);
        }
      });

      if (!items.length) {
        const fallbackForTitle = takeFallbackByTitle(categoryConfig.title);
        if (fallbackForTitle) {
          fallbackForTitle.items.forEach((deal) => {
            if (deal.id && !seen.has(deal.id)) {
              items.push(deal);
              seen.add(deal.id);
            }
          });
        }
      }

      if (!items.length) {
        const fallbackCategory = takeNextFallback();
        if (fallbackCategory) {
          fallbackCategory.items.forEach((deal) => {
            if (deal.id && !seen.has(deal.id)) {
              items.push(deal);
              seen.add(deal.id);
            }
          });
        }
      }

      if (items.length) {
        manualCategories.push({
          title: categoryConfig.title,
          items,
        });
      }
    }

    return manualCategories;
  }

  private static buildSmartCategories(): DealCategory[] {
    if (this.getAllProducts().length === 0) {
      console.log('⚠️ No products available, using fallback categories');
      return this.getFallbackCategories();
    }

    console.log(`📦 Building smart categories from ${this.getAllProducts().length} products`);
    const categories: DealCategory[] = [];
    const pinnedKitchenDeals = this.getPinnedDeals(4).filter((deal) => {
      const text = `${deal.name} ${deal.description}`.toLowerCase();
      return text.includes('keuken') || text.includes('kitchen') || text.includes('coffee') || text.includes('koffie');
    });
    const usedDealIds = new Set<string>();

    const registerUsedDeal = (deal?: DealItem | null) => {
      if (!deal?.id) {
        return;
      }
      usedDealIds.add(deal.id);
    };

    pinnedKitchenDeals.forEach(registerUsedDeal);

    const selectDeals = (candidates: any[], limit: number): DealItem[] => {
      if (limit <= 0) {
        return [];
      }

      const items: DealItem[] = [];
      for (const product of candidates) {
        const productId = String(product.id);
        if (usedDealIds.has(productId)) {
          continue;
        }

        const deal = this.convertToDealItem(product);
        if (!deal?.id || usedDealIds.has(deal.id)) {
          continue;
        }

        items.push(deal);
        usedDealIds.add(deal.id);

        if (items.length >= limit) {
          break;
        }
      }

      return items;
    };

    const techCandidates = this.getAllProducts()
      .filter(p => {
        const text = `${p.name} ${p.category} ${(p.tags || []).join(' ')}`.toLowerCase();
        return text.includes('audio') || text.includes('speaker') || 
               text.includes('headset') || text.includes('bluetooth') ||
               text.includes('smart') || text.includes('tech');
      })
      .filter(p => p.giftScore >= 7)
      .filter(p => p.price >= 50 && p.price <= 500)
      .sort((a, b) => b.giftScore - a.giftScore);

    const techCategoryItems = selectDeals(techCandidates, 4);

    if (techCategoryItems.length > 0) {
      techCategoryItems.forEach(registerUsedDeal);
      categories.push({
        title: 'Top Tech Gadgets',
        items: techCategoryItems
      });
      console.log(`✅ Added 'Top Tech Gadgets' with ${techCategoryItems.length} items`);
    } else {
      console.log('⚠️ No tech items found');
    }

    const kitchenLimit = 4;
  const kitchenItems: DealItem[] = [...pinnedKitchenDeals];

    if (kitchenItems.length < kitchenLimit) {
      const kitchenCandidates = this.getAllProducts()
        .filter(p => {
          const text = `${p.name} ${p.category} ${(p.tags || []).join(' ')}`.toLowerCase();
          return text.includes('coffee') || text.includes('kitchen') || 
                 text.includes('keuken') || text.includes('home') ||
                 text.includes('vaatwasser') || text.includes('senseo') ||
                 text.includes('keukenmachine') || text.includes('airfryer');
        })
        .filter(p => p.giftScore >= 6)
        .sort((a, b) => b.giftScore - a.giftScore);

      const needed = kitchenLimit - kitchenItems.length;
      const extraKitchen = selectDeals(kitchenCandidates, needed);
      kitchenItems.push(...extraKitchen);
    }

    if (kitchenItems.length > 0) {
      kitchenItems.forEach(registerUsedDeal);
      categories.push({
        title: 'Beste Keukenaccessoires',
        items: kitchenItems
      });
      console.log(`✅ Added 'Beste Keukenaccessoires' with ${kitchenItems.length} items`);
    } else {
      console.log('⚠️ No kitchen items found');
    }

    const lifestyleKeywords = [
      'portable',
      'fitness',
      'sport',
      'lifestyle',
      'health',
      'wellness',
      'beauty',
      'verzorging',
      'zorg',
      'yoga',
      'mindfulness',
      'massage',
      'outdoor',
      'wandelen',
      'care',
      'selfcare',
      'energie',
      'relax'
    ];

    const lifestyleCandidates = this.getAllProducts()
      .filter(p => {
        const text = `${p.name} ${p.category} ${(p.tags || []).join(' ')}`.toLowerCase();
        return lifestyleKeywords.some(keyword => text.includes(keyword));
      })
      .filter(p => p.giftScore >= 6)
      .filter(p => p.price >= 20 && p.price <= 350)
      .sort((a, b) => {
        if (a.isOnSale !== b.isOnSale) {
          return a.isOnSale ? -1 : 1;
        }
        if ((b.giftScore || 0) !== (a.giftScore || 0)) {
          return (b.giftScore || 0) - (a.giftScore || 0);
        }
        return a.price - b.price;
      });

    const lifestyleItems = selectDeals(lifestyleCandidates, 4);

    if (lifestyleItems.length > 0) {
      categories.push({
        title: 'Populaire Lifestyle Producten',
        items: lifestyleItems
      });
      console.log(`✅ Added 'Populaire Lifestyle Producten' with ${lifestyleItems.length} items`);
    } else {
      console.log('⚠️ No lifestyle items found');
    }

    console.log(`📊 Total categories built: ${categories.length}`);
    
    if (categories.length < 3) {
      const fallback = this.getFallbackCategories();
      categories.push(...fallback.slice(categories.length));
      console.log(`📦 Added ${fallback.slice(categories.length).length} fallback categories`);
    }

    return categories;
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
      {
        id: 'top-01',
        name: 'Sonos Roam SL Speaker',
        description: 'Compacte Bluetooth-speaker met verrassend vol geluid en waterdichte behuizing.',
        imageUrl: 'https://m.media-amazon.com/images/I/51x24PzVnoL._AC_SL1000_.jpg',
        price: '€234,95',
        affiliateLink: 'https://www.amazon.nl/dp/B09PNSV48L/?tag=gifteez77-21'
      },
      {
        id: 'top-02',
        name: 'JBL Live 770NC Koptelefoon',
        description: 'Comfortabele over-ear koptelefoon met adaptieve noise cancelling en 65 uur speeltijd.',
        imageUrl: 'https://image.coolblue.nl/max/1400xauto/products/1962259',
        price: '€118,00',
        affiliateLink: 'https://www.coolblue.nl/product/934400/jbl-live-770nc-zwart.html'
      },
      {
        id: 'top-03',
        name: 'Nintendo Switch Lite Turquoise',
        description: 'Lichtgewicht handheld console om overal je favoriete games te spelen.',
        imageUrl: 'https://image.coolblue.nl/max/1400xauto/products/1433030',
        price: '€219,00',
        affiliateLink: 'https://www.coolblue.nl/product/840605/nintendo-switch-lite-turquoise.html'
      },
      {
        id: 'top-04',
        name: 'Philips Hue White & Color Ambiance Starter Kit',
        description: 'Smart verlichting met bridge en 3 lampen voor sfeervolle verlichting in huis.',
        imageUrl: 'https://m.media-amazon.com/images/I/81Md1GZ9vXL._AC_SL1500_.jpg',
        price: '€189,99',
        affiliateLink: 'https://www.amazon.nl/dp/B09G9LGQY3/?tag=gifteez77-21'
      },
      {
        id: 'top-05',
        name: 'Sage Barista Express Espressomachine',
        description: 'Volautomatische espressomachine met ingebouwde molen voor versgemalen koffie.',
        imageUrl: 'https://m.media-amazon.com/images/I/71gxdTM5WDL._AC_SL1500_.jpg',
        price: '€649,00',
        affiliateLink: 'https://www.amazon.nl/dp/B00G6IJ5NI/?tag=gifteez77-21'
      },
      {
        id: 'top-06',
        name: 'Garmin Venu Sq 2 Smartwatch',
        description: 'Stijlvolle smartwatch met AMOLED-scherm en uitgebreide health tracking.',
        imageUrl: 'https://image.coolblue.nl/max/1400xauto/products/1990337',
        price: '€259,00',
        affiliateLink: 'https://www.coolblue.nl/product/939902/garmin-venu-sq-2-zwart.html'
      },
      {
        id: 'top-07',
        name: 'Theragun Mini Massage Gun',
        description: 'Krachtige compacte massagegun voor spierherstel en ontspanning onderweg.',
        imageUrl: 'https://m.media-amazon.com/images/I/61iydRki0KL._AC_SL1500_.jpg',
        price: '€199,00',
        affiliateLink: 'https://www.amazon.nl/dp/B08HS45D69/?tag=gifteez77-21'
      },
      {
        id: 'top-08',
        name: 'LEGO Icons Bloemenboeket',
        description: 'Creatief bouwproject en blijvend boeket in één – ideaal cadeau voor thuis.',
        imageUrl: 'https://m.media-amazon.com/images/I/81tf-fY2FuL._AC_SL1500_.jpg',
        price: '€49,99',
        affiliateLink: 'https://www.amazon.nl/dp/B08HVXZW5K/?tag=gifteez77-21'
      },
      {
        id: 'top-09',
        name: 'Weber Spirit II E-210 GBS',
        description: 'Duurzame 2-pits gasbarbecue met gietijzeren rooster voor zomerse grillavonden.',
        imageUrl: 'https://image.coolblue.nl/max/1400xauto/products/1105189',
        price: '€499,00',
        affiliateLink: 'https://www.coolblue.nl/product/810743/weber-spirit-ii-e-210-gbs-zwart.html'
      },
      {
        id: 'top-10',
        name: 'Fujifilm Instax Mini 12',
        description: 'Direct-klaar camera voor creatieve snapshots tijdens feestjes en trips.',
        imageUrl: 'https://m.media-amazon.com/images/I/71lE2vDn0L._AC_SL1500_.jpg',
        price: '€79,99',
        affiliateLink: 'https://www.amazon.nl/dp/B0BWN6L62N/?tag=gifteez77-21'
      }
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
