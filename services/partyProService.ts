import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from './firebase'
import { productCache } from './productCacheService'

/* eslint-disable no-console */

export interface PartyProProduct {
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
  source: 'partypro'
  originalPrice?: number
  currency?: string
  active?: boolean
  featured?: boolean
  createdAt?: string
  updatedAt?: string
}

/**
 * Service for loading PartyPro.nl party/celebration products
 */
export class PartyProService {
  private static products: PartyProProduct[] = []
  private static lastLoaded: Date | null = null
  private static isLoading = false
  private static loadingPromise: Promise<PartyProProduct[]> | null = null

  /**
   * Load products from Firebase
   */
  static async loadProducts(): Promise<PartyProProduct[]> {
    if (this.loadingPromise) {
      console.log('🎉 Already loading PartyPro products...')
      return this.loadingPromise
    }

    // Return cached if loaded recently (within 5 minutes)
    if (this.products.length > 0 && this.lastLoaded) {
      const cacheAge = Date.now() - this.lastLoaded.getTime()
      if (cacheAge < 5 * 60 * 1000) {
        console.log(`🎉 Using cached PartyPro products (${this.products.length} items)`)
        return this.products
      }
    }

    this.isLoading = true

    const loader = async (): Promise<PartyProProduct[]> => {
      // Check IndexedDB cache first (60 min TTL)
      const cacheKey = 'partypro-products'
      const cached = await productCache.get<PartyProProduct[]>(cacheKey)
      if (cached && cached.length > 0) {
        this.products = cached
        this.lastLoaded = new Date()
        this.isLoading = false
        console.log(`✅ Loaded ${cached.length} PartyPro products from cache`)
        return this.products
      }

      try {
        console.log('🎉 Loading PartyPro products from Firebase...')

        // Query products with source = 'partypro'
        const productsRef = collection(db, 'products')
        const q = query(productsRef, where('source', '==', 'partypro'), where('active', '==', true))

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
            merchant: data.merchant || 'PartyPro.nl',
            source: 'partypro',
            originalPrice: data.originalPrice,
            currency: data.currency || 'EUR',
            active: data.active !== false,
            featured: data.featured === true,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          } as PartyProProduct
        })

        this.lastLoaded = new Date()

        // Cache for 60 minutes
        await productCache.set(cacheKey, this.products, 60)

        console.log(`✅ Loaded ${this.products.length} PartyPro products`)

        // Log some stats
        const featured = this.products.filter((p) => p.featured).length
        const avgPrice = this.products.reduce((sum, p) => sum + p.price, 0) / this.products.length
        const avgScore =
          this.products.reduce((sum, p) => sum + (p.giftScore || 0), 0) / this.products.length

        console.log(
          `   📊 Stats: ${featured} featured | Avg price: €${avgPrice.toFixed(2)} | Avg score: ${avgScore.toFixed(2)}/10`
        )
      } catch (error) {
        console.warn('⚠️  Could not load PartyPro products:', error)

        // If Firebase fails, try to load from public folder
        try {
          // Add cache-busting timestamp to force fresh load
          const timestamp = new Date().getTime()
          const response = await fetch(`/data/partypro-import-ready.json?v=${timestamp}`)
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
          const localProducts = (await response.json()) as PartyProProduct[]

          this.products = localProducts.map((p) => ({
            ...p,
            source: 'partypro' as const,
          }))

          // Cache fallback data for 60 minutes
          await productCache.set(cacheKey, this.products, 60)

          this.lastLoaded = new Date()
          console.log(`📦 Loaded ${this.products.length} PartyPro products from local fallback`)
        } catch (fallbackError) {
          console.error('❌ Failed to load PartyPro products from fallback:', fallbackError)
          this.products = []
        }
      } finally {
        this.isLoading = false
      }

      return this.products
    }

    this.loadingPromise = loader().finally(() => {
      this.loadingPromise = null
    })

    return this.loadingPromise
  }

  /**
   * Get all products
   */
  static async getProducts(): Promise<PartyProProduct[]> {
    if (this.products.length === 0) {
      await this.loadProducts()
    }
    return this.products
  }

  /**
   * Detect subcategory from product name
   */
  static detectSubcategory(productName: string): string {
    const name = productName.toLowerCase()

    // Decoratie & Versiering
    if (
      name.includes('ballon') ||
      name.includes('balloon') ||
      name.includes('slingers') ||
      name.includes('banner') ||
      name.includes('versiering') ||
      name.includes('decoratie')
    ) {
      return 'Decoratie'
    }

    // Drinkspellen & Games
    if (
      name.includes('drinkspel') ||
      name.includes('beer pong') ||
      name.includes('bierpong') ||
      name.includes('drinking game') ||
      name.includes('spel')
    ) {
      return 'Drinkspellen'
    }

    // Party Gadgets
    if (
      name.includes('licht') ||
      name.includes('led') ||
      name.includes('disco') ||
      name.includes('speaker') ||
      name.includes('gadget')
    ) {
      return 'Party Gadgets'
    }

    // Servies & Tafel
    if (
      name.includes('bord') ||
      name.includes('beker') ||
      name.includes('glas') ||
      name.includes('tafelkleed') ||
      name.includes('servies') ||
      name.includes('plates') ||
      name.includes('cups')
    ) {
      return 'Servies & Tafel'
    }

    // Thema Feest
    if (
      name.includes('thema') ||
      name.includes('theme') ||
      name.includes('piraten') ||
      name.includes('hawaii') ||
      name.includes('disco') ||
      name.includes('neon')
    ) {
      return 'Thema Feest'
    }

    // Kostuum & Accessoires
    if (
      name.includes('kostuum') ||
      name.includes('costume') ||
      name.includes('masker') ||
      name.includes('mask') ||
      name.includes('hoed') ||
      name.includes('hat') ||
      name.includes('pruik')
    ) {
      return 'Kostuums'
    }

    // Confetti & Serpentine
    if (name.includes('confetti') || name.includes('serpentine') || name.includes('glitter')) {
      return 'Confetti'
    }

    return 'Overige'
  }

  /**
   * Get products grouped by subcategory
   */
  static async getProductsBySubcategory(): Promise<Record<string, PartyProProduct[]>> {
    const products = await this.getProducts()
    const grouped: Record<string, PartyProProduct[]> = {}

    products.forEach((product) => {
      const subcategory = this.detectSubcategory(product.name)
      if (!grouped[subcategory]) {
        grouped[subcategory] = []
      }
      grouped[subcategory].push(product)
    })

    return grouped
  }

  /**
   * Get products by specific subcategory name
   */
  static async getProductsBySubcategoryName(subcategoryName: string): Promise<PartyProProduct[]> {
    const grouped = await this.getProductsBySubcategory()
    return grouped[subcategoryName] || []
  }

  /**
   * Get subcategories with counts and emojis
   */
  static async getSubcategories(): Promise<Array<{ name: string; count: number; emoji: string }>> {
    const grouped = await this.getProductsBySubcategory()

    const emojiMap: Record<string, string> = {
      Decoratie: '🎈',
      Drinkspellen: '🍺',
      'Party Gadgets': '💡',
      'Servies & Tafel': '🍽️',
      'Thema Feest': '🎭',
      Kostuums: '👗',
      Confetti: '🎊',
      Overige: '🎉',
    }

    return Object.entries(grouped)
      .map(([name, products]) => ({
        name,
        count: products.length,
        emoji: emojiMap[name] || '🎉',
      }))
      .sort((a, b) => b.count - a.count)
  }

  /**
   * Clear cache (useful for testing)
   */
  static clearCache() {
    this.products = []
    this.lastLoaded = null
    this.loadingPromise = null
    this.isLoading = false
    productCache.delete('partypro-products')
  }
}

export default PartyProService
