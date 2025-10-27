import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from './firebase'
import { productCache } from './productCacheService'

/* eslint-disable no-console */

export interface SLYGADProduct {
  id: string
  name: string
  price: number
  image: string
  imageUrl: string
  affiliateLink: string
  description?: string
  shortDescription?: string
  category?: string
  tags?: string[]
  brand?: string
  giftScore?: number
  inStock?: boolean
  merchant?: string
  source: 'shop-like-you-give-a-damn'
  color?: string
  material?: string
  originalPrice?: number
  currency?: string
  active?: boolean
  featured?: boolean
  createdAt?: string
  updatedAt?: string
}

/**
 * Service for loading Shop Like You Give A Damn sustainable/vegan products
 */
export class ShopLikeYouGiveADamnService {
  private static products: SLYGADProduct[] = []
  private static lastLoaded: Date | null = null
  private static isLoading = false

  /**
   * Load products from Firebase
   */
  static async loadProducts(): Promise<SLYGADProduct[]> {
    if (this.isLoading) {
      console.log('🌱 Already loading SLYGAD products...')
      return this.products
    }

    // Return cached if loaded recently (within 5 minutes)
    if (this.products.length > 0 && this.lastLoaded) {
      const cacheAge = Date.now() - this.lastLoaded.getTime()
      if (cacheAge < 5 * 60 * 1000) {
        console.log(`🌱 Using cached SLYGAD products (${this.products.length} items)`)
        return this.products
      }
    }

    this.isLoading = true

    // Check IndexedDB cache first (60 min TTL)
    const cacheKey = 'slygad-products'
    const cached = await productCache.get<SLYGADProduct[]>(cacheKey)
    if (cached && cached.length > 0) {
      this.products = cached
      this.lastLoaded = new Date()
      this.isLoading = false
      console.log(`✅ Loaded ${cached.length} SLYGAD products from cache`)
      return this.products
    }

    try {
      console.log('🌱 Loading Shop Like You Give A Damn products from Firebase...')

      // Query products with source = 'shop-like-you-give-a-damn'
      const productsRef = collection(db, 'products')
      const q = query(
        productsRef,
        where('source', '==', 'shop-like-you-give-a-damn'),
        where('active', '==', true)
      )

      const querySnapshot = await getDocs(q)

      this.products = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          name: data.name || '',
          price: typeof data.price === 'number' ? data.price : parseFloat(data.price) || 0,
          image: data.image || data.imageUrl || '',
          imageUrl: data.imageUrl || data.image || '',
          affiliateLink: data.affiliateLink || '',
          description: data.description,
          shortDescription: data.shortDescription || data.description?.substring(0, 200),
          category: data.category,
          tags: Array.isArray(data.tags) ? data.tags : [],
          brand: data.brand,
          giftScore: typeof data.giftScore === 'number' ? data.giftScore : 8,
          inStock: data.inStock !== false,
          merchant: data.merchant || 'Shop Like You Give A Damn',
          source: 'shop-like-you-give-a-damn',
          color: data.color,
          material: data.material,
          originalPrice: data.originalPrice,
          currency: data.currency || 'EUR',
          active: data.active !== false,
          featured: data.featured === true,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        } as SLYGADProduct
      })

      this.lastLoaded = new Date()

      // Cache for 60 minutes
      await productCache.set(cacheKey, this.products, 60)

      console.log(`✅ Loaded ${this.products.length} Shop Like You Give A Damn products`)

      // Log some stats
      const featured = this.products.filter((p) => p.featured).length
      const avgPrice = this.products.reduce((sum, p) => sum + p.price, 0) / this.products.length
      const avgScore =
        this.products.reduce((sum, p) => sum + (p.giftScore || 0), 0) / this.products.length

      console.log(
        `   📊 Stats: ${featured} featured | Avg price: €${avgPrice.toFixed(2)} | Avg score: ${avgScore.toFixed(2)}/10`
      )
    } catch (error) {
      console.warn('⚠️  Could not load Shop Like You Give A Damn products:', error)

      // If Firebase fails, try to load from public folder (no bundle bloat)
      try {
        // Add cache-busting timestamp to force fresh load
        const timestamp = new Date().getTime()
        const response = await fetch(`/data/shop-like-you-give-a-damn-import-ready.json?v=${timestamp}`)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        const localProducts = (await response.json()) as SLYGADProduct[]

        this.products = localProducts.map((p) => ({
          ...p,
          source: 'shop-like-you-give-a-damn' as const,
        }))

        // Cache fallback data for 60 minutes
        await productCache.set(cacheKey, this.products, 60)

        this.lastLoaded = new Date()
        console.log(`📦 Loaded ${this.products.length} SLYGAD products from local fallback`)
      } catch (fallbackError) {
        console.error('❌ Failed to load SLYGAD products from fallback:', fallbackError)
        this.products = []
      }
    } finally {
      this.isLoading = false
    }

    return this.products
  }

  /**
   * Get cached products
   */
  static getProducts(): SLYGADProduct[] {
    return this.products
  }

  /**
   * Get featured products
   */
  static getFeaturedProducts(limit: number = 10): SLYGADProduct[] {
    return this.products
      .filter((p) => p.featured)
      .sort((a, b) => (b.giftScore || 0) - (a.giftScore || 0))
      .slice(0, limit)
  }

  /**
   * Search products by category
   */
  static getProductsByCategory(category: string, limit: number = 20): SLYGADProduct[] {
    return this.products
      .filter((p) => p.category?.toLowerCase().includes(category.toLowerCase()))
      .sort((a, b) => (b.giftScore || 0) - (a.giftScore || 0))
      .slice(0, limit)
  }

  /**
   * Search products by tags
   */
  static getProductsByTags(tags: string[], limit: number = 20): SLYGADProduct[] {
    const lowerTags = tags.map((t) => t.toLowerCase())

    return this.products
      .filter((p) => {
        const productTags = (p.tags || []).map((t) => t.toLowerCase())
        return lowerTags.some((tag) => productTags.includes(tag))
      })
      .sort((a, b) => (b.giftScore || 0) - (a.giftScore || 0))
      .slice(0, limit)
  }

  /**
   * Search products by price range
   */
  static getProductsByPriceRange(min: number, max: number, limit: number = 20): SLYGADProduct[] {
    return this.products
      .filter((p) => p.price >= min && p.price <= max)
      .sort((a, b) => (b.giftScore || 0) - (a.giftScore || 0))
      .slice(0, limit)
  }

  /**
   * Detect subcategory from product name
   */
  static detectSubcategory(productName: string): string {
    const lower = productName.toLowerCase()
    
    // Jewelry categories
    if (lower.includes('ring')) return 'Ringen'
    if (lower.includes('ketting') || lower.includes('necklace')) return 'Kettingen'
    if (lower.includes('oorbel') || lower.includes('earring')) return 'Oorbellen'
    if (lower.includes('armband') || lower.includes('bracelet')) return 'Armbanden'
    
    // Yoga & Wellness
    if (lower.includes('yoga') || lower.includes('peshtemal')) return 'Yoga & Wellness'
    if (lower.includes('waterfles') || lower.includes('bottle')) return 'Drinkflessen'
    
    // Accessories
    if (lower.includes('tas') || lower.includes('bag')) return 'Tassen'
    if (lower.includes('portemonnee') || lower.includes('wallet')) return 'Portemonnees'
    
    // Default
    return 'Overige'
  }

  /**
   * Get products grouped by subcategory
   */
  static getProductsBySubcategory(): Record<string, SLYGADProduct[]> {
    const grouped: Record<string, SLYGADProduct[]> = {}
    
    this.products.forEach(product => {
      const subcategory = this.detectSubcategory(product.name)
      if (!grouped[subcategory]) {
        grouped[subcategory] = []
      }
      grouped[subcategory].push(product)
    })
    
    return grouped
  }

  /**
   * Get products from a specific subcategory
   */
  static getProductsBySubcategoryName(subcategoryName: string): SLYGADProduct[] {
    return this.products.filter(product => 
      this.detectSubcategory(product.name) === subcategoryName
    )
  }

  /**
   * Get available subcategories with product counts
   */
  static getSubcategories(): Array<{ name: string; count: number; emoji: string }> {
    const grouped = this.getProductsBySubcategory()
    
    const emojiMap: Record<string, string> = {
      'Ringen': '💍',
      'Kettingen': '📿',
      'Oorbellen': '✨',
      'Armbanden': '🔗',
      'Yoga & Wellness': '🧘',
      'Drinkflessen': '💧',
      'Tassen': '👜',
      'Portemonnees': '👛',
      'Overige': '🎁'
    }
    
    return Object.entries(grouped)
      .map(([name, products]) => ({
        name,
        count: products.length,
        emoji: emojiMap[name] || '🌱'
      }))
      .filter(cat => cat.count > 0)
      .sort((a, b) => b.count - a.count)
  }

  /**
   * Clear cache
   */
  static clearCache(): void {
    this.products = []
    this.lastLoaded = null
    console.log('🗑️  SLYGAD product cache cleared')
  }
}
