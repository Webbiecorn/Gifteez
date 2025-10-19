// Product Feed Service for Coolblue Awin Integration
// Handles automatic import and processing of Coolblue product data

export interface CoolblueProduct {
  aw_deep_link: string
  product_name: string
  aw_product_id: string
  merchant_product_id: string
  merchant_image_url: string
  description: string
  merchant_category: string
  search_price: number
  merchant_name: string
  merchant_id: string
  category_name: string
  category_id: string
  aw_image_url: string
  currency: string
  store_price: number
  delivery_cost: number
  merchant_deep_link: string
  language: string
  last_updated: string
  display_price: string
  data_feed_id: string
  product_short_description: string
  promotional_text: string
}

export interface GiftProduct {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  description: string
  shortDescription: string
  category: string
  affiliateLink: string
  isOnSale: boolean
  lastUpdated: Date
  tags: string[]
  giftScore: number // 1-10 rating for gift appropriateness
}

export class ProductFeedService {
  private static readonly FEED_URL =
    'https://productdata.awin.com/datafeed/download/apikey/API_KEY/language/nl/fid/96636/columns/aw_deep_link,product_name,aw_product_id,merchant_product_id,merchant_image_url,description,merchant_category,search_price,merchant_name,merchant_id,category_name,category_id,aw_image_url,currency,store_price,delivery_cost,merchant_deep_link,language,last_updated,display_price,data_feed_id,product_short_description,promotional_text/format/csv/delimiter/,/compression/gzip/'

  private static readonly GIFT_CATEGORIES = [
    'audio',
    'gaming',
    'smart home',
    'fitness',
    'beauty',
    'coffee',
    'electronics',
    'gadgets',
    'accessories',
    'tools',
    'kitchen',
  ]

  private static readonly GIFT_KEYWORDS = [
    'headset',
    'speaker',
    'coffee',
    'watch',
    'fitness',
    'gaming',
    'smart',
    'bluetooth',
    'wireless',
    'portable',
    'premium',
  ]

  /**
   * Parse CSV line into CoolblueProduct object
   */
  static parseCsvLine(line: string): CoolblueProduct | null {
    try {
      // Handle CSV parsing with proper quote handling
      const fields = this.parseCSVLine(line)

      if (fields.length < 23) return null

      return {
        aw_deep_link: fields[0] || '',
        product_name: fields[1] || '',
        aw_product_id: fields[2] || '',
        merchant_product_id: fields[3] || '',
        merchant_image_url: fields[4] || '',
        description: fields[5] || '',
        merchant_category: fields[6] || '',
        search_price: parseFloat(fields[7]) || 0,
        merchant_name: fields[8] || '',
        merchant_id: fields[9] || '',
        category_name: fields[10] || '',
        category_id: fields[11] || '',
        aw_image_url: fields[12] || '',
        currency: fields[13] || 'EUR',
        store_price: parseFloat(fields[14]) || 0,
        delivery_cost: parseFloat(fields[15]) || 0,
        merchant_deep_link: fields[16] || '',
        language: fields[17] || 'nl',
        last_updated: fields[18] || '',
        display_price: fields[19] || '',
        data_feed_id: fields[20] || '',
        product_short_description: fields[21] || '',
        promotional_text: fields[22] || '',
      }
    } catch (error) {
      console.error('Error parsing CSV line:', error)
      return null
    }
  }

  /**
   * Proper CSV parsing with quote handling
   */
  private static parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      const nextChar = line[i + 1]

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"'
          i++ // Skip next quote
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }

    result.push(current.trim())
    return result
  }

  /**
   * Convert CoolblueProduct to GiftProduct with gift scoring
   */
  static convertToGiftProduct(product: CoolblueProduct): GiftProduct {
    const giftScore = this.calculateGiftScore(product)

    return {
      id: product.aw_product_id,
      name: product.product_name,
      price: product.search_price,
      originalPrice: product.store_price > product.search_price ? product.store_price : undefined,
      image: product.merchant_image_url || product.aw_image_url,
      description: product.description,
      shortDescription: product.product_short_description,
      category: product.merchant_category || product.category_name,
      affiliateLink: product.aw_deep_link,
      isOnSale: product.store_price > product.search_price,
      lastUpdated: new Date(product.last_updated || Date.now()),
      tags: this.extractTags(product),
      giftScore,
    }
  }

  /**
   * Calculate gift appropriateness score (1-10)
   */
  private static calculateGiftScore(product: CoolblueProduct): number {
    let score = 5 // Base score

    const name = product.product_name.toLowerCase()
    const category = (product.merchant_category || product.category_name || '').toLowerCase()
    const description = product.description.toLowerCase()

    // Boost score for gift-appropriate categories
    if (this.GIFT_CATEGORIES.some((cat) => category.includes(cat))) {
      score += 2
    }

    // Boost score for gift keywords in name
    const keywordMatches = this.GIFT_KEYWORDS.filter(
      (keyword) => name.includes(keyword) || description.includes(keyword)
    ).length
    score += Math.min(keywordMatches * 0.5, 2)

    // Boost score for appropriate price range (€20-€500)
    if (product.search_price >= 20 && product.search_price <= 500) {
      score += 1
    }

    // Boost for premium brands
    const premiumBrands = ['apple', 'sony', 'samsung', 'lg', 'philips', 'dyson', 'bose', 'jbl']
    if (premiumBrands.some((brand) => name.includes(brand))) {
      score += 1
    }

    // Reduce score for very technical/niche items
    const technicalTerms = ['driver', 'cable', 'adapter', 'mount', 'case', 'parts']
    if (technicalTerms.some((term) => name.includes(term))) {
      score -= 1
    }

    return Math.max(1, Math.min(10, Math.round(score)))
  }

  /**
   * Extract relevant tags from product data
   */
  private static extractTags(product: CoolblueProduct): string[] {
    const tags: string[] = []
    const text =
      `${product.product_name} ${product.description} ${product.merchant_category}`.toLowerCase()

    // Add category tags
    if (product.merchant_category) {
      tags.push(product.merchant_category)
    }

    // Add feature tags
    const features = ['wireless', 'bluetooth', 'smart', 'portable', 'premium', 'gaming', 'fitness']
    features.forEach((feature) => {
      if (text.includes(feature)) {
        tags.push(feature)
      }
    })

    // Add price range tag
    if (product.search_price < 50) tags.push('budget')
    else if (product.search_price < 150) tags.push('mid-range')
    else tags.push('premium')

    return [...new Set(tags)] // Remove duplicates
  }

  /**
   * Filter products suitable for gifts
   */
  static filterGiftProducts(products: GiftProduct[], minScore: number = 6): GiftProduct[] {
    return products
      .filter((product) => product.giftScore >= minScore)
      .filter((product) => product.price >= 15) // Minimum gift price
      .filter((product) => product.price <= 1000) // Maximum gift price
      .sort((a, b) => b.giftScore - a.giftScore) // Sort by gift score
  }

  /**
   * Get trending gift categories
   */
  static getTrendingCategories(products: GiftProduct[]): { category: string; count: number }[] {
    const categoryCount = new Map<string, number>()

    products.forEach((product) => {
      const category = product.category || 'Overig'
      categoryCount.set(category, (categoryCount.get(category) || 0) + 1)
    })

    return Array.from(categoryCount.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }

  /**
   * Process CSV file and return gift products
   */
  static async processCsvFile(filePath: string): Promise<GiftProduct[]> {
    try {
      // In browser environment, this would use File API
      // For now, we'll return a structure for the implementation
      const products: GiftProduct[] = []

      // This would be implemented with actual file reading
      console.log(`Processing CSV file: ${filePath}`)

      return products
    } catch (error) {
      console.error('Error processing CSV file:', error)
      throw new Error('Failed to process product feed')
    }
  }
}
