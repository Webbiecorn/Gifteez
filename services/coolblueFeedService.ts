import BlogService from './blogService'
import { productCache } from './productCacheService'
import type { BlogPostData } from './blogService'

export interface CoolblueProduct {
  id: string
  name: string
  price: number
  image?: string
  imageUrl?: string
  description?: string
  shortDescription?: string
  category?: string
  affiliateLink?: string
  isOnSale?: boolean
  lastUpdated?: string
  tags?: string[]
  giftScore?: number
  originalPrice?: number
}

export interface CoolblueFeedMeta {
  source?: string
  importedAt: string
  total: number
  hasCustomFeed: boolean
}

interface StoredFeedPayload {
  version: number
  products: CoolblueProduct[]
  meta: CoolblueFeedMeta
}

const STORAGE_KEY = 'gifteez_coolblue_feed_v1'
const hasWindow = typeof window !== 'undefined'

const DEFAULT_AUTHOR = {
  name: 'Gifteez Productteam',
  avatarUrl: 'https://i.pravatar.cc/150?u=gifteez-productteam',
}

const ensureSentence = (text: string): string => {
  if (!text) return ''
  const trimmed = text.trim()
  if (!trimmed) return ''
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`
}

const toPriceString = (price: number | undefined): string | undefined => {
  if (typeof price !== 'number' || Number.isNaN(price) || price <= 0) {
    return undefined
  }
  return `€${price.toFixed(2)}`
}

const normaliseDescription = (value?: string): string | undefined => {
  if (typeof value !== 'string') {
    return undefined
  }
  const trimmed = value.trim()
  return trimmed.length ? trimmed : undefined
}

const normaliseTags = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) {
    return undefined
  }
  const tags = value
    .map((tag) => (typeof tag === 'string' ? tag.trim() : String(tag)))
    .filter((tag) => tag.length > 0)
  return tags.length ? tags : undefined
}

const resolveImage = (product: CoolblueProduct): string | undefined => {
  if (product.image && product.image.startsWith('http')) {
    return product.image
  }
  if (product.imageUrl && product.imageUrl.startsWith('http')) {
    return product.imageUrl
  }
  return undefined
}

const fallbackCategory = 'Productgids'

const generateProductId = (rawId?: unknown): string => {
  if (rawId) {
    return String(rawId)
  }
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `coolblue-${crypto.randomUUID()}`
  }
  return `coolblue-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

const normaliseProduct = (raw: any): CoolblueProduct => {
  const parsedPrice =
    typeof raw?.price === 'number'
      ? raw.price
      : typeof raw?.price === 'string'
        ? Number.parseFloat(raw.price.replace(',', '.'))
        : 0

  const parsedOriginalPrice =
    typeof raw?.originalPrice === 'number'
      ? raw.originalPrice
      : typeof raw?.originalPrice === 'string'
        ? Number.parseFloat(raw.originalPrice.replace(',', '.'))
        : undefined

  const product: CoolblueProduct = {
    id: generateProductId(raw?.id),
    name:
      typeof raw?.name === 'string' ? raw.name.trim() : String(raw?.title ?? 'Onbekend product'),
    price: Number.isFinite(parsedPrice) ? Number(parsedPrice) : 0,
    image: typeof raw?.image === 'string' ? raw.image : undefined,
    imageUrl: typeof raw?.imageUrl === 'string' ? raw.imageUrl : undefined,
    description: normaliseDescription(raw?.description),
    shortDescription: normaliseDescription(raw?.shortDescription),
    category:
      typeof raw?.category === 'string' && raw.category.trim().length
        ? raw.category.trim()
        : undefined,
    affiliateLink: typeof raw?.affiliateLink === 'string' ? raw.affiliateLink : undefined,
    isOnSale: Boolean(raw?.isOnSale),
    lastUpdated: typeof raw?.lastUpdated === 'string' ? raw.lastUpdated : undefined,
    tags: normaliseTags(raw?.tags),
    giftScore: typeof raw?.giftScore === 'number' ? raw.giftScore : undefined,
    originalPrice: Number.isFinite(parsedOriginalPrice as number) ? parsedOriginalPrice : undefined,
  }

  const image = resolveImage(product)
  if (image) {
    product.imageUrl = image
  }

  return product
}

const buildExcerpt = (product: CoolblueProduct): string => {
  if (product.shortDescription) {
    const parts = product.shortDescription
      .replace(/\s+/g, ' ')
      .split('. ')
      .map((part) => part.trim())
      .filter((part) => part.length > 0)
      .slice(0, 2)
      .map(ensureSentence)

    if (parts.length) {
      return parts.join(' ')
    }
  }

  if (product.description) {
    const words = product.description.split(/\s+/).slice(0, 40).join(' ')
    return ensureSentence(words)
  }

  return `Ontdek waarom ${product.name} een perfect cadeau is.`
}

const buildBulletPoints = (product: CoolblueProduct): string | undefined => {
  const source = product.shortDescription ?? product.description
  if (!source) return undefined

  const bullets = source
    .split('.')
    .map((item) => item.replace(/\n/g, ' ').trim())
    .filter((item) => item.length > 0)
    .slice(0, 5)
    .map((item) => `- ${item.charAt(0).toUpperCase()}${item.slice(1)}`)

  return bullets.length ? bullets.join('\n') : undefined
}

const defaultMeta: CoolblueFeedMeta = {
  importedAt: new Date().toISOString(),
  source: 'bundled-feed',
  total: 0,
  hasCustomFeed: false,
}

export class CoolblueFeedService {
  private static cachedProducts: CoolblueProduct[] | null = null
  private static cachedMeta: CoolblueFeedMeta = { ...defaultMeta }

  private static writeToStorage(payload: StoredFeedPayload) {
    if (!hasWindow) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch (error) {
      console.warn('Kon Coolblue productfeed niet opslaan:', error)
    }
  }

  private static readFromStorage(): StoredFeedPayload | null {
    if (!hasWindow) return null
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw) as StoredFeedPayload
      if (!parsed || !Array.isArray(parsed.products)) {
        return null
      }
      parsed.meta = {
        ...defaultMeta,
        ...parsed.meta,
        importedAt: parsed.meta?.importedAt ?? defaultMeta.importedAt,
        total: parsed.products.length,
        hasCustomFeed: true,
      }
      return parsed
    } catch (error) {
      console.warn('Kon Coolblue productfeed niet lezen:', error)
      return null
    }
  }

  private static applyCache(products: CoolblueProduct[], meta: Partial<CoolblueFeedMeta> = {}) {
    this.cachedProducts = products
    this.cachedMeta = {
      ...defaultMeta,
      total: products.length,
      hasCustomFeed: meta.hasCustomFeed ?? this.cachedMeta.hasCustomFeed ?? false,
      importedAt: meta.importedAt ?? new Date().toISOString(),
      source: meta.source ?? defaultMeta.source,
    }
  }

  static getMeta(): CoolblueFeedMeta {
    return { ...this.cachedMeta, total: this.cachedProducts?.length ?? this.cachedMeta.total }
  }

  /**
   * Clear the cached products to force reload from source
   */
  static clearCache(): void {
    this.cachedProducts = null
  }

  static async loadProducts(): Promise<CoolblueProduct[]> {
    if (this.cachedProducts) {
      return this.cachedProducts
    }

    const stored = this.readFromStorage()
    if (stored) {
      const normalised = stored.products.map(normaliseProduct)
      this.applyCache(normalised, stored.meta)
      return normalised
    }

    // Check IndexedDB cache first (60 min TTL)
    const cacheKey = 'coolblue-products'
    const cached = await productCache.get<CoolblueProduct[]>(cacheKey)
    if (cached) {
      const normalised = cached.map(normaliseProduct)
      this.applyCache(normalised, {
        source: 'cache',
        importedAt: new Date().toISOString(),
        total: normalised.length,
        hasCustomFeed: false,
      })
      return normalised
    }

    try {
      // Fetch from public folder instead of bundling (saves ~2MB in bundle)
      const response = await fetch('/data/importedProducts.json')
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const rawProducts = await response.json()
      const products = Array.isArray(rawProducts) ? rawProducts : []

      // Cache for 60 minutes
      await productCache.set(cacheKey, products, 60)

      const normalised = products.map(normaliseProduct)
      this.applyCache(normalised, {
        source: 'bundled-feed',
        importedAt: new Date().toISOString(),
        hasCustomFeed: false,
      })
      return normalised
    } catch (error) {
      console.warn('Kon standaard Coolblue productfeed niet laden:', error)
      this.applyCache([], { source: 'empty', hasCustomFeed: false })
      return []
    }
  }

  static async searchProducts(query: string): Promise<CoolblueProduct[]> {
    const products = await this.loadProducts()
    const term = query.trim().toLowerCase()
    if (!term) {
      return products.slice(0, 50)
    }

    return products
      .filter((product) => {
        const haystack =
          `${product.name} ${product.description ?? ''} ${product.category ?? ''} ${(product.tags ?? []).join(' ')}`.toLowerCase()
        return haystack.includes(term)
      })
      .slice(0, 100)
  }

  static saveProducts(rawProducts: any[], meta: Partial<CoolblueFeedMeta> = {}) {
    const normalised = rawProducts.map(normaliseProduct)
    this.applyCache(normalised, {
      ...meta,
      hasCustomFeed: true,
      importedAt: meta.importedAt ?? new Date().toISOString(),
    })

    const payload: StoredFeedPayload = {
      version: 1,
      products: normalised,
      meta: this.cachedMeta,
    }

    this.writeToStorage(payload)
  }

  static clearStoredFeed() {
    if (hasWindow) {
      window.localStorage.removeItem(STORAGE_KEY)
    }
    this.cachedProducts = null
    this.cachedMeta = { ...defaultMeta, total: 0 }
  }

  static async resetToBundled(): Promise<CoolblueProduct[]> {
    this.clearStoredFeed()
    return this.loadProducts()
  }

  static generateBlogPostTemplate(product: CoolblueProduct): BlogPostData {
    const now = new Date().toISOString()
    const image = resolveImage(product)
    const excerpt = buildExcerpt(product)
    const bulletPoints = buildBulletPoints(product)
    const price = toPriceString(product.price)
    const originalPrice = toPriceString(product.originalPrice)

    const sections: string[] = []

    sections.push(`# ${product.name}: ons cadeau verdict`)
    if (image) {
      sections.push(`![${product.name}](${image})`)
    }

    if (product.description) {
      sections.push(ensureSentence(product.description))
    }

    if (bulletPoints) {
      sections.push('## Waarom dit een topcadeau is')
      sections.push(bulletPoints)
    }

    const detailLines: string[] = []
    if (price) {
      detailLines.push(`- Prijs bij Coolblue: ${price}`)
    }
    if (originalPrice && originalPrice !== price) {
      detailLines.push(`- Adviesprijs: ${originalPrice}`)
    }
    if (product.tags && product.tags.length) {
      detailLines.push(`- Tags: ${product.tags.join(', ')}`)
    }

    if (detailLines.length) {
      sections.push('## Cadeau in het kort')
      sections.push(detailLines.join('\n'))
    }

    if (product.affiliateLink) {
      sections.push('## Shop direct bij Coolblue')
      sections.push(`[Bekijk ${product.name} bij Coolblue](${product.affiliateLink})`)
    }

    sections.push('## Gifteez tip')
    sections.push(
      "Pas deze blogpost verder aan met eigen ervaringen, foto's en gebruiksscenario's zodat hij perfect aansluit bij jouw doelgroep."
    )

    const category = product.category || (product.tags && product.tags[0]) || fallbackCategory

    return {
      slug: BlogService.generateSlug(`${product.name} cadeau review`),
      title: `${product.name}: cadeautip & review`,
      excerpt,
      content: sections.join('\n\n'),
      imageUrl: undefined,
      category,
      tags: product.tags && product.tags.length ? product.tags.slice(0, 8) : undefined,
      author: DEFAULT_AUTHOR,
      publishedDate: now,
      isDraft: true,
      seo: {
        metaTitle: `${product.name} review & cadeau inspiratie`,
        metaDescription: excerpt,
        keywords: [product.name, 'cadeau', 'review', 'Coolblue', category].filter(
          Boolean
        ) as string[],
        ogTitle: `${product.name} – cadeau inspiratie via Gifteez`,
        ogDescription: excerpt,
        ogImage: image,
      },
    }
  }

  static generateMultiProductTemplate(products: CoolblueProduct[]): BlogPostData {
    const selection = products.filter(Boolean)
    if (!selection.length) {
      throw new Error('Geen producten geselecteerd voor het genereren van een blogpost.')
    }

    const uniqueSelection = selection.filter(
      (product, index, array) =>
        array.findIndex((candidate) => candidate?.id === product?.id) === index
    )

    if (uniqueSelection.length === 1) {
      return this.generateBlogPostTemplate(uniqueSelection[0])
    }

    const limitedSelection = uniqueSelection.slice(0, 10)

    const now = new Date().toISOString()
    const topCount = limitedSelection.length
    const primaryCategory =
      limitedSelection[0]?.category || limitedSelection[0]?.tags?.[0] || undefined
    const heading = primaryCategory
      ? `Top ${topCount} cadeautips voor ${primaryCategory}`
      : `Top ${topCount} cadeautips vanuit de Coolblue feed`
    const slug = BlogService.generateSlug(
      `${primaryCategory ?? 'cadeaus'} top ${topCount} cadeautips`
    )
    const excerpt = primaryCategory
      ? `Onze ${topCount} favoriete cadeaus uit de Coolblue feed voor ${primaryCategory.toLowerCase()}. Vul de intro en hero-afbeelding later zelf aan.`
      : `Onze ${topCount} favoriete cadeaus uit de Coolblue feed. Voeg later zelf een passende hero-afbeelding toe.`
    const heroImage = resolveImage(limitedSelection[0])

    const sections: string[] = []
    sections.push(`# ${heading}`)
    sections.push(
      'Deze selectie komt rechtstreeks uit de Coolblue feed. Voeg in de editor zelf een pakkende inleiding, hero-afbeelding en persoonlijke ervaring toe voor het beste resultaat.'
    )

    limitedSelection.forEach((product, index) => {
      const position = index + 1
      const image = resolveImage(product)
      const bulletPoints = buildBulletPoints(product)
      const price = toPriceString(product.price)
      const originalPrice = toPriceString(product.originalPrice)

      sections.push(`## ${position}. ${product.name}`)
      if (image) {
        sections.push(`![${product.name}](${image})`)
      }
      if (product.description) {
        sections.push(ensureSentence(product.description))
      }
      if (bulletPoints) {
        sections.push('### Waarom dit cadeau werkt')
        sections.push(bulletPoints)
      }

      const detailLines: string[] = []
      if (price) {
        detailLines.push(`- Prijs bij Coolblue: ${price}`)
      }
      if (originalPrice && originalPrice !== price) {
        detailLines.push(`- Adviesprijs: ${originalPrice}`)
      }
      if (product.tags && product.tags.length) {
        detailLines.push(`- Tags: ${product.tags.join(', ')}`)
      }

      if (detailLines.length) {
        sections.push('### In het kort')
        sections.push(detailLines.join('\n'))
      }

      if (product.affiliateLink) {
        sections.push(`[Bekijk ${product.name} bij Coolblue](${product.affiliateLink})`)
      }
    })

    sections.push('## Maak het artikel eigen')
    sections.push(
      'Schrijf een persoonlijke intro, voeg een hero-afbeelding toe die het thema vangt en sluit af met een duidelijke call-to-action. Optimaliseer daarna de SEO-instellingen via de editor.'
    )

    return {
      slug,
      title: heading,
      excerpt,
      content: sections.join('\n\n'),
      imageUrl: undefined,
      category: primaryCategory ?? fallbackCategory,
      tags: (() => {
        const candidates = Array.from(
          new Set(
            limitedSelection
              .flatMap((product) => product.tags ?? [])
              .concat(primaryCategory ? [primaryCategory] : [])
          )
        ).slice(0, 10)
        return candidates.length ? candidates : undefined
      })(),
      author: DEFAULT_AUTHOR,
      publishedDate: now,
      isDraft: true,
      seo: {
        metaTitle: heading,
        metaDescription: excerpt,
        keywords: Array.from(
          new Set(
            limitedSelection
              .map((product) => product.name)
              .concat(primaryCategory ?? [])
              .filter(Boolean)
          )
        ) as string[],
        ogTitle: heading,
        ogDescription: excerpt,
        ogImage: heroImage,
      },
    }
  }
}

export default CoolblueFeedService
