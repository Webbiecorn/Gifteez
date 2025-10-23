import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { withAffiliate } from './affiliate'
import { db, firebaseEnabled } from './firebase'

const ASIN_REGEX = /^[A-Z0-9]{10}$/

const slugToTitle = (value?: string): string | undefined => {
  if (!value) return undefined
  const cleaned = decodeURIComponent(value)
    .replace(/\.html?$/i, '')
    .replace(/[^a-z0-9\s\-+_]/gi, ' ')
    .replace(/[+_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!cleaned) {
    return undefined
  }

  return cleaned
    .split(' ')
    .filter(Boolean)
    .map((word) => {
      if (word.length <= 2) {
        return word.toLowerCase()
      }
      return `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`
    })
    .join(' ')
}

const hashString = (input: string): string => {
  let hash = 0
  if (!input) {
    return 'amazon-temp'
  }
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0
  }
  return `amazon-${hash.toString(36).padStart(6, '0')}`
}

export interface ParsedAmazonLink {
  asin?: string
  title?: string
  canonical?: string
  host?: string
  fallbackId: string
}

export const parseAmazonAffiliateLink = (rawLink: string): ParsedAmazonLink => {
  const fallbackId = hashString(rawLink || String(Date.now()))

  if (!rawLink) {
    return { fallbackId }
  }

  let url: URL
  try {
    url = new URL(rawLink)
  } catch {
    try {
      url = new URL(`https://${rawLink}`)
    } catch {
      return { fallbackId }
    }
  }

  const segments = url.pathname.split('/').filter(Boolean)
  let asin: string | undefined

  for (const segment of segments) {
    const candidate = segment.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
    if (ASIN_REGEX.test(candidate)) {
      asin = candidate
      break
    }
  }

  if (!asin) {
    const paramAsin = url.searchParams.get('asin') || url.searchParams.get('ASIN')
    if (paramAsin && ASIN_REGEX.test(paramAsin.toUpperCase())) {
      asin = paramAsin.toUpperCase()
    }
  }

  let title: string | undefined
  const lowerSegments = segments.map((segment) => segment.toLowerCase())
  const dpIndex = lowerSegments.indexOf('dp')

  if (dpIndex >= 0) {
    if (!asin && dpIndex + 1 < segments.length) {
      const candidate = segments[dpIndex + 1].replace(/[^A-Za-z0-9]/g, '').toUpperCase()
      if (ASIN_REGEX.test(candidate)) {
        asin = candidate
      }
    }
    if (dpIndex > 0) {
      title = slugToTitle(segments[dpIndex - 1])
    }
  }

  if (!title) {
    const gpIndex = lowerSegments.indexOf('gp')
    if (gpIndex >= 0) {
      if (!asin && gpIndex + 2 < segments.length && lowerSegments[gpIndex + 1] === 'product') {
        const candidate = segments[gpIndex + 2].replace(/[^A-Za-z0-9]/g, '').toUpperCase()
        if (ASIN_REGEX.test(candidate)) {
          asin = candidate
        }
      }
      if (gpIndex > 0) {
        title = slugToTitle(segments[gpIndex - 1])
      }
    }
  }

  if (!title) {
    const fallbackSegment = segments.find((segment) => {
      const lower = segment.toLowerCase()
      if (lower === 'dp' || lower === 'gp' || lower === 'product') {
        return false
      }
      const candidate = segment.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
      if (ASIN_REGEX.test(candidate)) {
        return false
      }
      return true
    })
    title = slugToTitle(fallbackSegment ?? '')
  }

  const canonical = asin ? `https://${url.host}/dp/${asin}` : undefined

  return {
    asin,
    title,
    canonical,
    host: url.host,
    fallbackId,
  }
}

type AmazonProductSource = 'firestore' | 'local'

export interface AmazonProductInput {
  asin: string
  name: string
  affiliateLink: string
  description?: string
  shortDescription?: string
  image?: string
  imageLarge?: string
  price?: number
  originalPrice?: number
  currency?: string
  category?: string
  tags?: string[]
  prime?: boolean
  rating?: number
  reviewCount?: number
  inStock?: boolean
  giftScore?: number
}

export interface AmazonProduct extends AmazonProductInput {
  id: string
  source: AmazonProductSource
  createdAt?: string
  updatedAt?: string
}

// eslint-disable-next-line no-unused-vars
type Listener = (items: AmazonProduct[]) => void

const COLLECTION = 'amazonProducts'
const LOCAL_STORAGE_KEY = 'gifteez_amazon_products_v1'
const FALLBACK_ENDPOINT = '/data/amazonSample.json'

const listeners = new Set<Listener>()
let cachedProducts: AmazonProduct[] = []
let unsubscribeFirestore: (() => void) | null = null
let loadingPromise: Promise<AmazonProduct[]> | null = null

const hasWindow = typeof window !== 'undefined'

const normaliseAffiliateLink = (url: string): string => {
  if (!url) {
    return url
  }
  return withAffiliate(url.trim())
}

const ensureArray = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) return undefined
  const cleaned = value
    .map((item) => (typeof item === 'string' ? item.trim() : String(item)))
    .filter((item) => item.length > 0)
  return cleaned.length ? cleaned : undefined
}

const compactFirestoreData = (input: Record<string, unknown>): Record<string, unknown> => {
  const output: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) {
      output[key] = value
    }
  }
  return output
}

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string' && value.trim().length) {
    const parsed = Number.parseFloat(value.replace(',', '.'))
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return undefined
}

const timestampToIso = (value: unknown): string | undefined => {
  if (!value) return undefined
  if (typeof value === 'string') return value
  if (value instanceof Date) return value.toISOString()
  if (value instanceof Timestamp) return value.toDate().toISOString()
  return undefined
}

const normaliseProduct = (
  data: Partial<AmazonProductInput & { id?: string }>,
  id?: string,
  source: AmazonProductSource = 'local'
): AmazonProduct => {
  const rawAffiliate = String(data.affiliateLink ?? '').trim()
  const affiliateLink = normaliseAffiliateLink(rawAffiliate)
  const parsed = parseAmazonAffiliateLink(affiliateLink)

  const providedAsin = String(data.asin ?? data.id ?? '').trim()
  const resolvedAsin = (providedAsin || parsed.asin || parsed.fallbackId).toUpperCase()
  const providedName = String(data.name ?? '').trim()
  const resolvedName = providedName || parsed.title || `Amazon product ${resolvedAsin}`

  if (!affiliateLink) {
    throw new Error('Ongeldige Amazon productdata: Affiliate link is verplicht.')
  }

  if (!resolvedAsin) {
    throw new Error(
      'Kon geen unieke identifier voor het Amazon product bepalen. Voeg een ASIN of geldige link toe.'
    )
  }

  if (!resolvedName) {
    throw new Error('Kon geen productnaam afleiden. Vul handmatig een naam in.')
  }

  const tags = ensureArray(data.tags)

  return {
    id: id ?? resolvedAsin,
    asin: resolvedAsin,
    name: resolvedName,
    affiliateLink,
    description: data.description?.trim() || undefined,
    shortDescription: data.shortDescription?.trim() || undefined,
    image: data.image?.trim() || undefined,
    imageLarge: data.imageLarge?.trim() || undefined,
    price: toNumber(data.price),
    originalPrice: toNumber(data.originalPrice),
    currency: data.currency ?? 'EUR',
    category: data.category?.trim() || undefined,
    tags,
    prime: Boolean(data.prime),
    rating: toNumber(data.rating),
    reviewCount: toNumber(data.reviewCount),
    inStock: data.inStock ?? true,
    giftScore: toNumber(data.giftScore),
    source,
  }
}

const docToProduct = (snapshot: QueryDocumentSnapshot<DocumentData>): AmazonProduct => {
  const data = snapshot.data()
  const product = normaliseProduct(data as Partial<AmazonProductInput>, snapshot.id, 'firestore')
  product.createdAt = timestampToIso(data.createdAt ?? data.created_at)
  product.updatedAt = timestampToIso(data.updatedAt ?? data.updated_at ?? data.lastUpdated)
  return product
}

const sortByUpdated = (items: AmazonProduct[]): AmazonProduct[] =>
  items.slice().sort((a, b) => {
    const timeA = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime()
    const timeB = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime()
    return timeB - timeA
  })

const writeLocal = (items: AmazonProduct[]): void => {
  if (!hasWindow) return
  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items))
  } catch (error) {
    console.warn('Kon Amazon producten niet lokaal opslaan:', error)
  }
}

const readLocal = (): AmazonProduct[] => {
  if (!hasWindow) return []
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((item) => {
        try {
          return normaliseProduct(item as Partial<AmazonProductInput>, item.id, 'local')
        } catch {
          return null
        }
      })
      .filter((item): item is AmazonProduct => item !== null)
  } catch (error) {
    console.warn('Kon lokale Amazon producten niet lezen:', error)
    return []
  }
}

const emitChange = (): void => {
  const payload = sortByUpdated(cachedProducts)
  listeners.forEach((listener) => listener(payload))
}

const ensureFirestoreSubscription = (): void => {
  if (!firebaseEnabled || !db || unsubscribeFirestore) {
    return
  }

  const q = query(collection(db, COLLECTION), orderBy('updatedAt', 'desc'))
  unsubscribeFirestore = onSnapshot(
    q,
    (snapshot) => {
      cachedProducts = snapshot.docs.map(docToProduct)
      emitChange()
    },
    (error) => {
      console.warn('Realtime Amazon feed kon niet worden geladen:', error)
    }
  )
}

const loadFromFirestore = async (): Promise<AmazonProduct[]> => {
  if (!firebaseEnabled || !db) {
    return loadFromFallback()
  }

  const snapshot = await getDocs(query(collection(db, COLLECTION), orderBy('updatedAt', 'desc')))
  const products = snapshot.docs.map(docToProduct)
  cachedProducts = products
  ensureFirestoreSubscription()
  return sortByUpdated(products)
}

const loadFromFallback = async (): Promise<AmazonProduct[]> => {
  if (hasWindow) {
    const local = readLocal()
    if (local.length) {
      cachedProducts = local
      return sortByUpdated(local)
    }
  }

  try {
    const res = await fetch(FALLBACK_ENDPOINT, { cache: 'no-store' })
    if (!res.ok) throw new Error(`Fallback request mislukte: ${res.status}`)
    const data = (await res.json()) as Partial<AmazonProductInput & { id?: string }>[]
    const products = data
      .map((item) => {
        try {
          return normaliseProduct(item, item.id ?? item.asin, 'local')
        } catch (error) {
          console.warn('Ongeldig Amazon product in fallback feed:', error, item)
          return null
        }
      })
      .filter((item): item is AmazonProduct => item !== null)
    cachedProducts = products
    return sortByUpdated(products)
  } catch (error) {
    console.warn('Kon fallback Amazon producten niet laden:', error)
    cachedProducts = []
    return []
  }
}

export const AmazonProductLibrary = {
  async loadProducts(force = false): Promise<AmazonProduct[]> {
    if (!force && cachedProducts.length) {
      return sortByUpdated(cachedProducts)
    }

    if (loadingPromise) {
      return loadingPromise
    }

    loadingPromise = firebaseEnabled ? loadFromFirestore() : loadFromFallback()

    try {
      const items = await loadingPromise
      return items
    } finally {
      loadingPromise = null
    }
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    if (cachedProducts.length) {
      listener(sortByUpdated(cachedProducts))
    } else {
      this.loadProducts().catch((error) => {
        console.warn('Kon Amazon producten niet laden voor subscriber:', error)
      })
    }

    return () => {
      listeners.delete(listener)
      if (listeners.size === 0 && unsubscribeFirestore) {
        unsubscribeFirestore()
        unsubscribeFirestore = null
      }
    }
  },

  async create(product: AmazonProductInput): Promise<void> {
    const normalised = normaliseProduct(
      product,
      product.asin,
      firebaseEnabled && db ? 'firestore' : 'local'
    )

    if (firebaseEnabled && db) {
      // Extract fields to exclude from Firestore payload
      const {
        id: _id,
        source: _source,
        createdAt: _createdAt,
        updatedAt: _updatedAt,
        ...rest
      } = normalised
      void _id
      void _source
      void _createdAt
      void _updatedAt // Mark as intentionally unused
      const payload = compactFirestoreData({
        ...rest,
        source: 'firestore',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      const docRef = await addDoc(collection(db, COLLECTION), payload)

      // Immediately add to cache and emit change for instant UI update
      const newProduct: AmazonProduct = {
        ...normalised,
        id: docRef.id,
        source: 'firestore',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      cachedProducts = [newProduct, ...cachedProducts]
      emitChange()
      return
    }

    const now = new Date().toISOString()
    const local = readLocal()
    const exists = local.some((item) => item.asin === normalised.asin)
    const entry: AmazonProduct = { ...normalised, source: 'local', createdAt: now, updatedAt: now }
    const merged: AmazonProduct[] = exists
      ? local.map((item) =>
          item.asin === normalised.asin ? { ...entry, createdAt: item.createdAt ?? now } : item
        )
      : [...local, entry]
    cachedProducts = merged
    writeLocal(merged)
    emitChange()
  },

  async update(id: string, updates: Partial<AmazonProductInput>): Promise<void> {
    const existing =
      cachedProducts.find((item) => item.id === id) ?? readLocal().find((item) => item.id === id)
    if (!existing) {
      throw new Error('Amazon product niet gevonden voor update.')
    }

    const mergedInput: AmazonProductInput = {
      asin: updates.asin ?? existing.asin,
      name: updates.name ?? existing.name,
      affiliateLink: updates.affiliateLink ?? existing.affiliateLink,
      description: updates.description ?? existing.description,
      shortDescription: updates.shortDescription ?? existing.shortDescription,
      image: updates.image ?? existing.image,
      imageLarge: updates.imageLarge ?? existing.imageLarge,
      price: updates.price ?? existing.price,
      originalPrice: updates.originalPrice ?? existing.originalPrice,
      currency: updates.currency ?? existing.currency,
      category: updates.category ?? existing.category,
      tags: updates.tags ?? existing.tags,
      prime: updates.prime ?? existing.prime,
      rating: updates.rating ?? existing.rating,
      reviewCount: updates.reviewCount ?? existing.reviewCount,
      inStock: updates.inStock ?? existing.inStock,
      giftScore: updates.giftScore ?? existing.giftScore,
    }

    const normalised = normaliseProduct(
      mergedInput,
      existing.id,
      firebaseEnabled && db ? 'firestore' : 'local'
    )

    if (firebaseEnabled && db) {
      const ref = doc(db, COLLECTION, id)
      // Extract fields to exclude from Firestore payload
      const {
        id: _id,
        source: _source,
        createdAt: _createdAt,
        updatedAt: _updatedAt,
        ...rest
      } = normalised
      void _id
      void _source
      void _createdAt
      void _updatedAt // Mark as intentionally unused
      const payload = compactFirestoreData({
        ...rest,
        source: 'firestore',
        updatedAt: serverTimestamp(),
      })
      await updateDoc(ref, payload)

      // Immediately update cache and emit change for instant UI update
      const now = new Date().toISOString()
      cachedProducts = cachedProducts.map((item) =>
        item.id === id
          ? {
              ...normalised,
              id,
              source: 'firestore',
              createdAt: item.createdAt ?? now,
              updatedAt: now,
            }
          : item
      )
      emitChange()
      return
    }

    const now = new Date().toISOString()
    const local = readLocal()
    const base = (local.length ? local : cachedProducts).slice()

    let updated = false
    const merged = base.map((item) => {
      if (item.id !== id) {
        return item
      }
      updated = true
      return {
        ...item,
        ...normalised,
        createdAt: item.createdAt ?? now,
        updatedAt: now,
      } satisfies AmazonProduct
    })

    const finalItems = updated
      ? merged
      : [
          ...merged,
          {
            ...normalised,
            source: 'local',
            createdAt: now,
            updatedAt: now,
          } satisfies AmazonProduct,
        ]

    cachedProducts = finalItems
    writeLocal(finalItems)
    emitChange()
  },

  async remove(id: string): Promise<void> {
    if (firebaseEnabled && db) {
      await deleteDoc(doc(db, COLLECTION, id))

      // Immediately remove from cache and emit change for instant UI update
      cachedProducts = cachedProducts.filter((item) => item.id !== id)
      emitChange()
      return
    }

    const local = readLocal().filter((item) => item.id !== id)
    cachedProducts = local
    writeLocal(local)
    emitChange()
  },
}
