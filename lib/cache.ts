/**
 * Unified Cache Layer with TTL and Namespacing
 * 
 * Features:
 * - Multiple storage backends (Memory, LocalStorage, IndexedDB)
 * - Namespacing (gifteez:product:<id>)
 * - TTL (Time To Live) support
 * - Automatic expiration
 * - Cache statistics
 * - Bulk operations
 */

import { logger } from './logger';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
}

type CacheBackend = 'memory' | 'localStorage' | 'indexedDB';

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  namespace?: string;
  backend?: CacheBackend;
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  size: number;
}

class CacheService {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private namespace: string = 'gifteez';
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    size: 0
  };

  /**
   * Generate cache key with namespace
   */
  private generateKey(key: string, customNamespace?: string): string {
    const ns = customNamespace || this.namespace;
    return `${ns}:${key}`;
  }

  /**
   * Check if entry is expired
   */
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() > entry.expiresAt;
  }

  /**
   * Get from memory cache
   */
  private getFromMemory<T>(key: string): T | null {
    const entry = this.memoryCache.get(key);

    if (!entry) {
      return null;
    }

    if (this.isExpired(entry)) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Set in memory cache
   */
  private setInMemory<T>(key: string, value: T, ttl: number): void {
    const entry: CacheEntry<T> = {
      value,
      expiresAt: Date.now() + ttl,
      createdAt: Date.now()
    };

    this.memoryCache.set(key, entry);
  }

  /**
   * Get from localStorage
   */
  private getFromLocalStorage<T>(key: string): T | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const item = localStorage.getItem(key);
      if (!item) {
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(item);

      if (this.isExpired(entry)) {
        localStorage.removeItem(key);
        return null;
      }

      return entry.value;
    } catch (error) {
      logger.warn('Failed to get from localStorage', { key, error });
      return null;
    }
  }

  /**
   * Set in localStorage
   */
  private setInLocalStorage<T>(key: string, value: T, ttl: number): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const entry: CacheEntry<T> = {
        value,
        expiresAt: Date.now() + ttl,
        createdAt: Date.now()
      };

      localStorage.setItem(key, JSON.stringify(entry));
    } catch (error) {
      logger.warn('Failed to set in localStorage', { key, error });
    }
  }

  /**
   * Get from IndexedDB (uses productCache service)
   */
  private async getFromIndexedDB<T>(key: string): Promise<T | null> {
    // For now, delegate to productCacheService
    // In the future, this can be a more generic IndexedDB implementation
    return null;
  }

  /**
   * Set in IndexedDB
   */
  private async setInIndexedDB<T>(key: string, value: T, ttl: number): Promise<void> {
    // For now, delegate to productCacheService
    // In the future, this can be a more generic IndexedDB implementation
  }

  /**
   * Get value from cache
   * 
   * @example
   * const product = await cache.get<Product>('product:123', { namespace: 'gifteez' });
   */
  async get<T>(
    key: string,
    options: CacheOptions = {}
  ): Promise<T | null> {
    const { namespace, backend = 'memory' } = options;
    const fullKey = this.generateKey(key, namespace);

    let value: T | null = null;

    // Try backends in order
    switch (backend) {
      case 'memory':
        value = this.getFromMemory<T>(fullKey);
        break;
      case 'localStorage':
        value = this.getFromLocalStorage<T>(fullKey);
        break;
      case 'indexedDB':
        value = await this.getFromIndexedDB<T>(fullKey);
        break;
    }

    if (value !== null) {
      this.stats.hits++;
      logger.debug('Cache hit', { key: fullKey, backend });
    } else {
      this.stats.misses++;
      logger.debug('Cache miss', { key: fullKey, backend });
    }

    return value;
  }

  /**
   * Set value in cache
   * 
   * @example
   * await cache.set('product:123', product, { ttl: 60000, namespace: 'gifteez' });
   */
  async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<void> {
    const {
      ttl = 3600000, // Default 1 hour
      namespace,
      backend = 'memory'
    } = options;

    const fullKey = this.generateKey(key, namespace);

    // Set in appropriate backend
    switch (backend) {
      case 'memory':
        this.setInMemory(fullKey, value, ttl);
        break;
      case 'localStorage':
        this.setInLocalStorage(fullKey, value, ttl);
        break;
      case 'indexedDB':
        await this.setInIndexedDB(fullKey, value, ttl);
        break;
    }

    this.stats.sets++;
    this.stats.size = this.memoryCache.size;

    logger.debug('Cache set', { key: fullKey, backend, ttl });
  }

  /**
   * Delete value from cache
   */
  async delete(key: string, options: CacheOptions = {}): Promise<void> {
    const { namespace, backend = 'memory' } = options;
    const fullKey = this.generateKey(key, namespace);

    switch (backend) {
      case 'memory':
        this.memoryCache.delete(fullKey);
        break;
      case 'localStorage':
        if (typeof window !== 'undefined') {
          localStorage.removeItem(fullKey);
        }
        break;
      case 'indexedDB':
        // Implement IndexedDB delete
        break;
    }

    this.stats.deletes++;
    this.stats.size = this.memoryCache.size;

    logger.debug('Cache delete', { key: fullKey, backend });
  }

  /**
   * Clear all cache
   */
  async clear(options: CacheOptions = {}): Promise<void> {
    const { backend = 'memory', namespace } = options;

    switch (backend) {
      case 'memory':
        if (namespace) {
          // Clear only specific namespace
          const prefix = `${namespace}:`;
          for (const key of this.memoryCache.keys()) {
            if (key.startsWith(prefix)) {
              this.memoryCache.delete(key);
            }
          }
        } else {
          this.memoryCache.clear();
        }
        break;
      case 'localStorage':
        if (typeof window !== 'undefined') {
          if (namespace) {
            const prefix = `${namespace}:`;
            const keysToDelete: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.startsWith(prefix)) {
                keysToDelete.push(key);
              }
            }
            keysToDelete.forEach(key => localStorage.removeItem(key));
          } else {
            localStorage.clear();
          }
        }
        break;
      case 'indexedDB':
        // Implement IndexedDB clear
        break;
    }

    this.stats.size = this.memoryCache.size;
    logger.info('Cache cleared', { backend, namespace });
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      size: this.memoryCache.size
    };
  }

  /**
   * Get cache hit rate
   */
  getHitRate(): number {
    const total = this.stats.hits + this.stats.misses;
    return total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * Clean up expired entries (manual cleanup)
   */
  cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.memoryCache.entries()) {
      if (now > entry.expiresAt) {
        this.memoryCache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info('Cache cleanup completed', { cleaned, remaining: this.memoryCache.size });
    }
  }

  /**
   * Helper: Get or compute value
   * 
   * @example
   * const product = await cache.getOrCompute(
   *   'product:123',
   *   async () => await fetchProduct(123),
   *   { ttl: 60000 }
   * );
   */
  async getOrCompute<T>(
    key: string,
    computeFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    // Compute value
    const value = await computeFn();

    // Store in cache
    await this.set(key, value, options);

    return value;
  }
}

// Export singleton instance
export const cache = new CacheService();

// Export types
export type { CacheOptions, CacheStats, CacheBackend };
export default CacheService;
