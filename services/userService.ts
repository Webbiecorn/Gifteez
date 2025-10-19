import { doc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from './firebase'
import type { User, UserPreferences, NotificationSettings, Gift } from '../types'

export class UserService {
  static async updateUserPreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<void> {
    if (!db) throw new Error('Firebase not initialized')

    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      preferences: preferences,
      lastActive: new Date().toISOString(),
    })
  }

  static async updateNotificationSettings(
    userId: string,
    settings: Partial<NotificationSettings>
  ): Promise<void> {
    if (!db) throw new Error('Firebase not initialized')

    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      notifications: settings,
      lastActive: new Date().toISOString(),
    })
  }

  static async syncFavorites(userId: string, localFavorites: Gift[]): Promise<Gift[]> {
    if (!db) throw new Error('Firebase not initialized')

    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      throw new Error('User not found')
    }

    const userData = userDoc.data() as User
    const cloudFavorites = userData.favorites || []

    // Merge favorites - prioritize cloud favorites for conflicts
    const mergedFavorites = this.mergeFavorites(localFavorites, cloudFavorites)

    // Update cloud with merged favorites
    await updateDoc(userRef, {
      favorites: mergedFavorites,
      favoritesSyncedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    })

    return mergedFavorites
  }

  static mergeFavorites(localFavorites: Gift[], cloudFavorites: Gift[]): Gift[] {
    const merged: Gift[] = [...cloudFavorites]

    // Add local favorites that don't exist in cloud
    localFavorites.forEach((localGift) => {
      const exists = cloudFavorites.some(
        (cloudGift) => cloudGift.productName === localGift.productName
      )

      if (!exists) {
        merged.push(localGift)
      }
    })

    // Remove duplicates based on product name
    return merged.filter(
      (gift, index, array) => index === array.findIndex((g) => g.productName === gift.productName)
    )
  }

  static getFavoritesByCategory(favorites: Gift[]): Record<string, Gift[]> {
    const categorized: Record<string, Gift[]> = {}

    favorites.forEach((gift) => {
      const category = gift.category || 'Overig'
      if (!categorized[category]) {
        categorized[category] = []
      }
      categorized[category].push(gift)
    })

    return categorized
  }

  static exportFavorites(favorites: Gift[]): string {
    const exportData = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      source: 'Gifteez',
      favorites: favorites.map((gift) => ({
        productName: gift.productName,
        description: gift.description,
        priceRange: gift.priceRange,
        imageUrl: gift.imageUrl,
        category: gift.category,
        tags: gift.tags,
        exportedAt: new Date().toISOString(),
      })),
    }

    return JSON.stringify(exportData, null, 2)
  }

  static async importFavorites(jsonData: string): Promise<Gift[]> {
    try {
      const data = JSON.parse(jsonData)

      if (!data.favorites || !Array.isArray(data.favorites)) {
        throw new Error('Invalid export format')
      }

      return data.favorites.map((item: any) => ({
        productName: item.productName,
        description: item.description,
        priceRange: item.priceRange,
        imageUrl: item.imageUrl,
        retailers: item.retailers || [],
        category: item.category,
        tags: item.tags || [],
      }))
    } catch (error) {
      throw new Error('Failed to parse favorites data')
    }
  }

  static async updateAvatar(userId: string, avatarUrl: string): Promise<void> {
    if (!db) throw new Error('Firebase not initialized')

    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      avatar: avatarUrl,
      lastActive: new Date().toISOString(),
    })
  }

  static getDefaultPreferences(): UserPreferences {
    return {
      currency: 'EUR',
      language: 'nl',
      theme: 'light',
      emailNotifications: true,
      pushNotifications: false,
      favoriteCategories: [],
      priceRange: {
        min: 10,
        max: 500,
      },
    }
  }

  static getDefaultNotificationSettings(): NotificationSettings {
    return {
      newBlogPosts: true,
      giftRecommendations: true,
      priceDrops: false,
      weeklyDigest: true,
    }
  }

  static async getUserStats(userId: string): Promise<{
    favoriteCount: number
    profileCount: number
    memberSince: string
    lastActive: string
    topCategories: string[]
  }> {
    if (!db) throw new Error('Firebase not initialized')

    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      throw new Error('User not found')
    }

    const userData = userDoc.data() as User
    const categorized = this.getFavoritesByCategory(userData.favorites || [])
    const topCategories = Object.entries(categorized)
      .sort(([, a], [, b]) => b.length - a.length)
      .slice(0, 3)
      .map(([category]) => category)

    return {
      favoriteCount: userData.favorites?.length || 0,
      profileCount: userData.profiles?.length || 0,
      memberSince: userData.createdAt || 'Unknown',
      lastActive: userData.lastActive || 'Unknown',
      topCategories,
    }
  }
}

export default UserService
