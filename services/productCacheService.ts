/**
 * ProductCacheService
 *
 * Caches product feeds in IndexedDB with TTL for faster repeat visits
 * Implements stale-while-revalidate pattern
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

class ProductCacheService {
  private dbName = 'gifteez-cache'
  private dbVersion = 1
  private storeName = 'product-feeds'
  private db: IDBDatabase | null = null

  /**
   * Initialize IndexedDB
   */
  async init(): Promise<void> {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      console.warn('IndexedDB not available')
      return
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName)
        }
      }
    })
  }

  /**
   * Get cached data
   * Returns null if expired or not found
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.db) await this.init()
    if (!this.db) return null

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(key)

      request.onsuccess = () => {
        const entry = request.result as CacheEntry<T> | undefined

        if (!entry) {
          resolve(null)
          return
        }

        // Check if expired
        const now = Date.now()
        if (now - entry.timestamp > entry.ttl) {
          // Expired - delete and return null
          this.delete(key)
          resolve(null)
          return
        }

        resolve(entry.data)
      }

      request.onerror = () => resolve(null)
    })
  }

  /**
   * Set cached data with TTL
   * @param key Cache key
   * @param data Data to cache
   * @param ttlMinutes TTL in minutes (default: 60 min = 1 hour)
   */
  async set<T>(key: string, data: T, ttlMinutes: number = 60): Promise<void> {
    if (!this.db) await this.init()
    if (!this.db) return

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000, // Convert to milliseconds
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.put(entry, key)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Delete cached entry
   */
  async delete(key: string): Promise<void> {
    if (!this.db) await this.init()
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(key)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    if (!this.db) await this.init()
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get all cache keys
   */
  async getAllKeys(): Promise<string[]> {
    if (!this.db) await this.init()
    if (!this.db) return []

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.getAllKeys()

      request.onsuccess = () => resolve(request.result as string[])
      request.onerror = () => resolve([])
    })
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{ keys: number; size: number }> {
    const keys = await this.getAllKeys()

    // Rough estimate: each key + entry ~1KB
    const estimatedSize = keys.length * 1024

    return {
      keys: keys.length,
      size: estimatedSize,
    }
  }
}

// Singleton instance
export const productCache = new ProductCacheService()

export default ProductCacheService
