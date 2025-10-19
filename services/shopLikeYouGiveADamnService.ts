import { collection, getDocs, query, where, limit as firestoreLimit } from 'firebase/firestore'
import { db } from './firebase'
import { productCache } from './productCacheService'

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
      return
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
        const response = await fetch('/data/shop-like-you-give-a-damn-import-ready.json')
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        const localProducts = await response.json()

        this.products = (localProducts as any[]).map((p) => ({
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
   * Clear cache
   */
  static clearCache(): void {
    this.products = []
    this.lastLoaded = null
    console.log('🗑️  SLYGAD product cache cleared')
  }
}
