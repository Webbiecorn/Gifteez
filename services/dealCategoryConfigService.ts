import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db, firebaseEnabled } from './firebase'

export interface CategoryBlockConfig {
  id: string
  title: string
  itemIds: string[]
  description?: string
}

export interface DealCategoryConfig {
  categories: CategoryBlockConfig[]
  updatedAt?: string
  version?: number
}

const COLLECTION = 'dealCategoryBlocks'
const DOCUMENT_ID = 'current'
const LOCAL_STORAGE_KEY = 'gifteez_manual_deal_categories_v1'
const CONFIG_VERSION = 1

const hasWindow = typeof window !== 'undefined'

const generateRandomId = (): string => {
  if (typeof globalThis !== 'undefined' && globalThis.crypto && 'randomUUID' in globalThis.crypto) {
    return (globalThis.crypto as Crypto).randomUUID().replace(/-/g, '').slice(0, 12)
  }
  return Math.random().toString(36).slice(2, 14)
}

const slugify = (value: string): string => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}

export const createCategoryId = (title?: string): string => {
  const base = title && title.trim().length ? slugify(title) : 'categorie'
  return `${base || 'categorie'}-${generateRandomId()}`
}

const normaliseCategory = (category: any, fallbackIndex: number): CategoryBlockConfig => {
  const title =
    typeof category?.title === 'string' && category.title.trim().length
      ? category.title.trim()
      : `Categorie ${fallbackIndex + 1}`
  const rawItems = Array.isArray(category?.itemIds) ? category.itemIds : []
  const itemIds = rawItems
    .map((item) => {
      if (typeof item === 'string') {
        return item.trim()
      }
      if (item && typeof item === 'object' && typeof item.id === 'string') {
        return item.id.trim()
      }
      return ''
    })
    .filter((id) => id.length > 0)

  const description =
    typeof category?.description === 'string' && category.description.trim().length
      ? category.description.trim()
      : undefined

  const id =
    typeof category?.id === 'string' && category.id.trim().length
      ? category.id.trim()
      : createCategoryId(title)

  const normalised: CategoryBlockConfig = {
    id,
    title,
    itemIds,
  }

  if (description) {
    normalised.description = description
  }

  return normalised
}

const normaliseConfig = (data: unknown): DealCategoryConfig | null => {
  if (!data || typeof data !== 'object' || !('categories' in data)) {
    return null
  }

  const categoriesRaw = Array.isArray((data as any).categories) ? (data as any).categories : []
  const categories = categoriesRaw.map((category, index) => normaliseCategory(category, index))

  return {
    categories,
    updatedAt: typeof (data as any).updatedAt === 'string' ? (data as any).updatedAt : undefined,
    version: typeof (data as any).version === 'number' ? (data as any).version : undefined,
  }
}

const readLocalConfig = (): DealCategoryConfig | null => {
  if (!hasWindow) {
    return null
  }

  try {
    const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!stored) {
      return null
    }
    const parsed = JSON.parse(stored)
    return normaliseConfig(parsed)
  } catch (error) {
    console.warn('Kon lokale categorieconfig niet lezen:', error)
    return null
  }
}

const writeLocalConfig = (config: DealCategoryConfig): void => {
  if (!hasWindow) {
    return
  }
  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config))
  } catch (error) {
    console.warn('Kon lokale categorieconfig niet opslaan:', error)
  }
}

export const DealCategoryConfigService = {
  async load(): Promise<DealCategoryConfig | null> {
    // Always try to fetch fresh data from Firebase first
    if (firebaseEnabled && db) {
      try {
        const ref = doc(db, COLLECTION, DOCUMENT_ID)
        const snapshot = await getDoc(ref)
        if (snapshot.exists()) {
          const config = normaliseConfig(snapshot.data()) ?? null
          if (config) {
            // Update localStorage with fresh data
            writeLocalConfig(config)
            return config
          }
        }
      } catch (error) {
        console.warn('Kon categorieconfig niet ophalen uit Firestore:', error)
      }
    }

    // Only use localStorage as fallback if Firebase fails
    return readLocalConfig()
  },

  async save(config: DealCategoryConfig): Promise<DealCategoryConfig> {
    // Normalize and validate the config before saving
    const normalizedConfig = normaliseConfig(config)
    if (!normalizedConfig) {
      throw new Error('Invalid config provided to save')
    }

    const payload: DealCategoryConfig = {
      categories: normalizedConfig.categories,
      updatedAt: new Date().toISOString(),
      version: CONFIG_VERSION,
    }

    // Save to Firebase
    if (firebaseEnabled && db) {
      try {
        const ref = doc(db, COLLECTION, DOCUMENT_ID)
        await setDoc(ref, payload, { merge: false })
        console.log('✅ Categorieën opgeslagen in Firebase:', payload.categories.length)
      } catch (error) {
        console.error('Kon categorieconfig niet opslaan in Firestore:', error)
        throw error
      }
    }

    // Also save to localStorage as backup
    writeLocalConfig(payload)
    return payload
  },

  async clearAll(): Promise<void> {
    // Leeg de categorieën in Firestore en localStorage
    const payload: DealCategoryConfig = {
      categories: [],
      updatedAt: new Date().toISOString(),
      version: CONFIG_VERSION,
    }
    if (firebaseEnabled && db) {
      try {
        const ref = doc(db, COLLECTION, DOCUMENT_ID)
        await setDoc(ref, payload, { merge: false })
      } catch (error) {
        console.error('Kon categorieconfig niet wissen in Firestore:', error)
        throw error
      }
    }
    writeLocalConfig(payload)
  },

  clearCache(): void {
    // Also clear localStorage to prevent stale data on hard refresh
    if (hasWindow) {
      try {
        window.localStorage.removeItem(LOCAL_STORAGE_KEY)
        console.log('🗑️  DealCategoryConfig cache and localStorage cleared')
      } catch (error) {
        console.warn('Kon lokale cache niet wissen:', error)
      }
    }
  },
}
