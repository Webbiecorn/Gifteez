import { collection, addDoc, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore'
import { db, firebaseEnabled } from './firebase'

export type ActivityType =
  | 'category_created'
  | 'category_updated'
  | 'category_deleted'
  | 'product_added'
  | 'product_removed'
  | 'products_bulk_added'
  | 'products_bulk_removed'
  | 'config_saved'
  | 'blog_created'
  | 'blog_updated'
  | 'blog_deleted'

export interface ActivityLogEntry {
  id?: string
  type: ActivityType
  description: string
  user?: string
  metadata?: Record<string, any>
  timestamp: Date
  createdAt?: Timestamp
}

const COLLECTION_NAME = 'adminActivityLog'
const LOCAL_STORAGE_KEY = 'gifteez_activity_log_v1'
const MAX_LOCAL_ENTRIES = 50
const MAX_LOAD_ENTRIES = 100

class ActivityLogService {
  /**
   * Log an activity
   */
  static async logActivity(
    type: ActivityType,
    description: string,
    metadata?: Record<string, any>,
    user?: string
  ): Promise<void> {
    const entry: ActivityLogEntry = {
      type,
      description,
      user: user || 'Admin',
      metadata,
      timestamp: new Date(),
    }

    // Try Firebase first
    if (firebaseEnabled && db) {
      try {
        await addDoc(collection(db, COLLECTION_NAME), {
          ...entry,
          createdAt: Timestamp.now(),
        })
        console.log('✅ Activity logged to Firebase:', type)
      } catch (error) {
        console.warn('⚠️ Could not log to Firebase, using localStorage:', error)
        this.logToLocalStorage(entry)
      }
    } else {
      // Fallback to localStorage
      this.logToLocalStorage(entry)
    }
  }

  /**
   * Log to localStorage as fallback
   */
  private static logToLocalStorage(entry: ActivityLogEntry): void {
    if (typeof window === 'undefined') return

    try {
      const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY)
      const entries: ActivityLogEntry[] = stored ? JSON.parse(stored) : []

      entries.unshift(entry) // Add to beginning

      // Keep only last N entries
      const trimmed = entries.slice(0, MAX_LOCAL_ENTRIES)

      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(trimmed))
      console.log('✅ Activity logged to localStorage:', entry.type)
    } catch (error) {
      console.error('❌ Could not log to localStorage:', error)
    }
  }

  /**
   * Get recent activities
   */
  static async getRecentActivities(maxEntries: number = 50): Promise<ActivityLogEntry[]> {
    // Try Firebase first
    if (firebaseEnabled && db) {
      try {
        const q = query(
          collection(db, COLLECTION_NAME),
          orderBy('createdAt', 'desc'),
          limit(Math.min(maxEntries, MAX_LOAD_ENTRIES))
        )

        const snapshot = await getDocs(q)
        const activities = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            type: data.type,
            description: data.description,
            user: data.user || 'Admin',
            metadata: data.metadata,
            timestamp: data.createdAt?.toDate() || new Date(data.timestamp),
          } as ActivityLogEntry
        })

        console.log(`✅ Loaded ${activities.length} activities from Firebase`)
        return activities
      } catch (error) {
        console.warn('⚠️ Could not load from Firebase, using localStorage:', error)
        return this.getFromLocalStorage(maxEntries)
      }
    }

    // Fallback to localStorage
    return this.getFromLocalStorage(maxEntries)
  }

  /**
   * Get from localStorage
   */
  private static getFromLocalStorage(maxEntries: number): ActivityLogEntry[] {
    if (typeof window === 'undefined') return []

    try {
      const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY)
      if (!stored) return []

      const entries: ActivityLogEntry[] = JSON.parse(stored)

      // Convert string dates back to Date objects
      const parsed = entries.map((entry) => ({
        ...entry,
        timestamp: new Date(entry.timestamp),
      }))

      return parsed.slice(0, maxEntries)
    } catch (error) {
      console.error('❌ Could not load from localStorage:', error)
      return []
    }
  }

  /**
   * Clear all activities (for testing/admin)
   */
  static clearLocalStorage(): void {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.removeItem(LOCAL_STORAGE_KEY)
      console.log('✅ Activity log cleared from localStorage')
    } catch (error) {
      console.error('❌ Could not clear localStorage:', error)
    }
  }

  /**
   * Get activity icon
   */
  static getActivityIcon(type: ActivityType): string {
    const icons: Record<ActivityType, string> = {
      category_created: '➕',
      category_updated: '✏️',
      category_deleted: '🗑️',
      product_added: '📦',
      product_removed: '❌',
      products_bulk_added: '📦📦',
      products_bulk_removed: '🗑️🗑️',
      config_saved: '💾',
      blog_created: '📝',
      blog_updated: '✏️',
      blog_deleted: '🗑️',
    }
    return icons[type] || '📌'
  }

  /**
   * Get activity color
   */
  static getActivityColor(type: ActivityType): string {
    if (type.includes('delete') || type.includes('removed')) return 'red'
    if (type.includes('add') || type.includes('created')) return 'green'
    if (type.includes('update')) return 'blue'
    return 'gray'
  }
}

export default ActivityLogService
