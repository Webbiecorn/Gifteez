import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore'
import { db } from './firebase'
import type { NewsletterSubscriber } from './emailNotificationService'

export class NewsletterService {
  private static readonly COLLECTION_NAME = 'newsletter_subscribers'

  static async addSubscriber(subscriber: Omit<NewsletterSubscriber, 'id'>): Promise<string> {
    try {
      // Check if email already exists
      const existingSubscriber = await this.getSubscriberByEmail(subscriber.email)
      if (existingSubscriber) {
        // Reactivate if was unsubscribed
        if (!existingSubscriber.isActive) {
          await this.updateSubscriber(existingSubscriber.id, { isActive: true })
          return existingSubscriber.id
        }
        throw new Error('Email is already subscribed')
      }

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), subscriber)
      return docRef.id
    } catch (error) {
      console.error('Error adding subscriber:', error)
      throw error
    }
  }

  static async updateSubscriber(id: string, updates: Partial<NewsletterSubscriber>): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id)
      await updateDoc(docRef, updates)
    } catch (error) {
      console.error('Error updating subscriber:', error)
      throw error
    }
  }

  static async removeSubscriber(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id)
      await deleteDoc(docRef)
    } catch (error) {
      console.error('Error removing subscriber:', error)
      throw error
    }
  }

  static async unsubscribeByEmail(email: string): Promise<boolean> {
    try {
      const subscriber = await this.getSubscriberByEmail(email)
      if (subscriber) {
        await this.updateSubscriber(subscriber.id, { isActive: false })
        return true
      }
      return false
    } catch (error) {
      console.error('Error unsubscribing:', error)
      return false
    }
  }

  static async getSubscriberByEmail(email: string): Promise<NewsletterSubscriber | null> {
    try {
      const q = query(collection(db, this.COLLECTION_NAME), where('email', '==', email), limit(1))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]
        return { id: doc.id, ...doc.data() } as NewsletterSubscriber
      }
      return null
    } catch (error) {
      console.error('Error getting subscriber by email:', error)
      return null
    }
  }

  static async getAllActiveSubscribers(): Promise<NewsletterSubscriber[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('isActive', '==', true),
        orderBy('subscribedAt', 'desc')
      )
      const querySnapshot = await getDocs(q)

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as NewsletterSubscriber[]
    } catch (error) {
      console.error('Error getting active subscribers:', error)
      return []
    }
  }

  static async getSubscribersByFrequency(
    frequency: 'immediate' | 'daily' | 'weekly'
  ): Promise<NewsletterSubscriber[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('isActive', '==', true),
        where('preferences.frequency', '==', frequency)
      )
      const querySnapshot = await getDocs(q)

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as NewsletterSubscriber[]
    } catch (error) {
      console.error('Error getting subscribers by frequency:', error)
      return []
    }
  }

  static async getSubscribersByCategory(category: string): Promise<NewsletterSubscriber[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('isActive', '==', true),
        where('preferences.categories', 'array-contains', category)
      )
      const querySnapshot = await getDocs(q)

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as NewsletterSubscriber[]
    } catch (error) {
      console.error('Error getting subscribers by category:', error)
      return []
    }
  }

  static async updateSubscriberPreferences(
    email: string,
    preferences: Partial<NewsletterSubscriber['preferences']>
  ): Promise<boolean> {
    try {
      const subscriber = await this.getSubscriberByEmail(email)
      if (subscriber) {
        const updatedPreferences = { ...subscriber.preferences, ...preferences }
        await this.updateSubscriber(subscriber.id, { preferences: updatedPreferences })
        return true
      }
      return false
    } catch (error) {
      console.error('Error updating subscriber preferences:', error)
      return false
    }
  }

  static async getSubscriberStats(): Promise<{
    total: number
    active: number
    inactive: number
    frequencyBreakdown: Record<string, number>
    recentSignups: number
  }> {
    try {
      const allSubscribers = await this.getAllSubscribers()
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

      const stats = {
        total: allSubscribers.length,
        active: allSubscribers.filter((s) => s.isActive).length,
        inactive: allSubscribers.filter((s) => !s.isActive).length,
        frequencyBreakdown: {
          immediate: 0,
          daily: 0,
          weekly: 0,
        },
        recentSignups: allSubscribers.filter((s) => new Date(s.subscribedAt) >= oneWeekAgo).length,
      }

      allSubscribers.forEach((subscriber) => {
        if (subscriber.isActive) {
          stats.frequencyBreakdown[subscriber.preferences.frequency]++
        }
      })

      return stats
    } catch (error) {
      console.error('Error getting subscriber stats:', error)
      return {
        total: 0,
        active: 0,
        inactive: 0,
        frequencyBreakdown: { immediate: 0, daily: 0, weekly: 0 },
        recentSignups: 0,
      }
    }
  }

  private static async getAllSubscribers(): Promise<NewsletterSubscriber[]> {
    try {
      const q = query(collection(db, this.COLLECTION_NAME), orderBy('subscribedAt', 'desc'))
      const querySnapshot = await getDocs(q)

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as NewsletterSubscriber[]
    } catch (error) {
      console.error('Error getting all subscribers:', error)
      return []
    }
  }
}

export default NewsletterService
