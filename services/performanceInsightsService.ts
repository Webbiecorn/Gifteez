import { collection, addDoc, getDocs, query, where, orderBy, limit, Timestamp, updateDoc, doc, increment } from 'firebase/firestore';
import { db, firebaseEnabled } from './firebase';

export interface ProductMetrics {
  productId: string;
  impressions: number;
  clicks: number;
  ctr: number; // Click-through rate (clicks / impressions)
  lastUpdated: Date;
}

export interface TrendingProduct {
  productId: string;
  productName: string;
  score: number; // Trending score based on recent activity
  impressions7d: number;
  clicks7d: number;
  impressions30d: number;
  clicks30d: number;
  ctr7d: number;
  ctr30d: number;
}

export interface PerformanceEvent {
  productId: string;
  eventType: 'impression' | 'click';
  timestamp: Date;
  source?: string; // e.g., 'deals-page', 'gift-finder', 'category-block'
  userId?: string;
}

const COLLECTION_EVENTS = 'productPerformanceEvents';
const COLLECTION_METRICS = 'productMetrics';
const LOCAL_STORAGE_KEY = 'gifteez_performance_cache_v1';

interface LocalCacheData {
  impressions: number;
  clicks: number;
  events: Array<{ type: 'impression' | 'click'; timestamp: number }>;
}

interface LocalCache {
  [productId: string]: LocalCacheData;
}

interface PendingEvent {
  productId: string;
  eventType: 'impression' | 'click';
  source?: string;
  userId?: string;
  timestamp: number;
}

/**
 * Performance Insights Service
 * Tracks product impressions, clicks, and calculates trending products
 */
export class PerformanceInsightsService {
  private static pendingEvents: PendingEvent[] = [];
  private static flushTimer: ReturnType<typeof setTimeout> | null = null;
  private static readonly BATCH_SIZE = 10;
  private static readonly FLUSH_INTERVAL = 5000; // 5 seconds
  private static isProcessing = false;
  private static isInitialized = false;

  /**
   * Initialize the service (sets up page unload handler)
   */
  static init(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Flush pending events when page is about to unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        // Use sendBeacon for reliable delivery on page unload
        if (this.pendingEvents.length > 0 && navigator.sendBeacon) {
          // For now, just mark as processed so they don't pile up
          // You could implement a beacon endpoint if needed
          this.pendingEvents = [];
        }
      });

      // Flush on visibility change (tab switch)
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && this.pendingEvents.length > 0) {
          this.flushEvents();
        }
      });
    }
  }
  /**
   * Track a product impression (view)
   */
  static async trackImpression(
    productId: string,
    source?: string,
    userId?: string
  ): Promise<void> {
    // Always track locally for immediate updates
    this.trackEventLocally(productId, 'impression');
    
    // Add to batch queue instead of immediate write
    if (firebaseEnabled && db) {
      this.queueEvent({
        productId,
        eventType: 'impression',
        source: source || 'unknown',
        userId: userId || 'anonymous',
        timestamp: Date.now()
      });
    }
  }
  
  /**
   * Track a product click (affiliate link click)
   */
  static async trackClick(
    productId: string,
    source?: string,
    userId?: string
  ): Promise<void> {
    // Always track locally
    this.trackEventLocally(productId, 'click');
    
    // Add to batch queue instead of immediate write
    if (firebaseEnabled && db) {
      this.queueEvent({
        productId,
        eventType: 'click',
        source: source || 'unknown',
        userId: userId || 'anonymous',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Queue an event for batched processing
   */
  private static queueEvent(event: PendingEvent): void {
    this.pendingEvents.push(event);

    // Log for debugging
    if (this.pendingEvents.length === 1) {
      console.log('[PerformanceInsights] Batching enabled - events will be flushed in', this.FLUSH_INTERVAL / 1000, 'seconds or when batch reaches', this.BATCH_SIZE);
    }

    // Schedule flush if not already scheduled
    if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => {
        this.flushEvents();
      }, this.FLUSH_INTERVAL);
    }

    // Flush immediately if batch is full
    if (this.pendingEvents.length >= this.BATCH_SIZE) {
      if (this.flushTimer) {
        clearTimeout(this.flushTimer);
        this.flushTimer = null;
      }
      console.log('[PerformanceInsights] Batch full, flushing', this.pendingEvents.length, 'events now');
      this.flushEvents();
    }
  }

  /**
   * Flush pending events to Firestore
   */
  private static async flushEvents(): Promise<void> {
    if (this.isProcessing || this.pendingEvents.length === 0) {
      return;
    }

    this.isProcessing = true;
    const eventsToProcess = [...this.pendingEvents];
    this.pendingEvents = [];

    console.log('[PerformanceInsights] Flushing', eventsToProcess.length, 'events to Firestore');

    try {
      // Write events in smaller batches to avoid overwhelming Firestore
      const batchSize = 5;
      for (let i = 0; i < eventsToProcess.length; i += batchSize) {
        const batch = eventsToProcess.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(async (event) => {
            try {
              await addDoc(collection(db!, COLLECTION_EVENTS), {
                productId: event.productId,
                eventType: event.eventType,
                timestamp: Timestamp.fromMillis(event.timestamp),
                source: event.source,
                userId: event.userId
              });
            } catch (error) {
              // Silently fail individual events to not block the batch
              console.warn('Failed to write event:', error);
            }
          })
        );

        // Small delay between batches to respect rate limits
        if (i + batchSize < eventsToProcess.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      // Update metrics in aggregate (less writes)
      await this.updateMetricsBatch(eventsToProcess);
    } catch (error) {
      console.error('Error flushing events:', error);
    } finally {
      this.isProcessing = false;
      this.flushTimer = null;
    }
  }

  /**
   * Update metrics for multiple events in batch
   */
  private static async updateMetricsBatch(events: PendingEvent[]): Promise<void> {
    if (!firebaseEnabled || !db) return;

    // Aggregate events by product
    const productCounts = new Map<string, { impressions: number; clicks: number }>();
    
    for (const event of events) {
      const counts = productCounts.get(event.productId) || { impressions: 0, clicks: 0 };
      if (event.eventType === 'impression') {
        counts.impressions++;
      } else {
        counts.clicks++;
      }
      productCounts.set(event.productId, counts);
    }

    // Update each product's metrics
    for (const [productId, counts] of productCounts.entries()) {
      try {
        const q = query(
          collection(db, COLLECTION_METRICS),
          where('productId', '==', productId),
          limit(1)
        );
        
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          await addDoc(collection(db, COLLECTION_METRICS), {
            productId,
            impressions: counts.impressions,
            clicks: counts.clicks,
            lastUpdated: Timestamp.now()
          });
        } else {
          const docRef = doc(db, COLLECTION_METRICS, snapshot.docs[0].id);
          const updates: any = { lastUpdated: Timestamp.now() };
          if (counts.impressions > 0) {
            updates.impressions = increment(counts.impressions);
          }
          if (counts.clicks > 0) {
            updates.clicks = increment(counts.clicks);
          }
          await updateDoc(docRef, updates);
        }
      } catch (error) {
        console.warn(`Failed to update metrics for ${productId}:`, error);
      }
    }
  }
  
  /**
   * Get metrics for a specific product
   */
  static async getProductMetrics(productId: string): Promise<ProductMetrics | null> {
    if (!firebaseEnabled || !db) {
      return this.getLocalMetrics(productId);
    }
    
    try {
      const q = query(
        collection(db, COLLECTION_METRICS),
        where('productId', '==', productId),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      
      const data = snapshot.docs[0].data();
      return {
        productId: data.productId,
        impressions: data.impressions || 0,
        clicks: data.clicks || 0,
        ctr: data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0,
        lastUpdated: data.lastUpdated?.toDate() || new Date()
      };
    } catch (error) {
      console.error('Error getting product metrics:', error);
      return this.getLocalMetrics(productId);
    }
  }
  
  /**
   * Get trending products based on recent activity
   */
  static async getTrendingProducts(
    days: 7 | 30 = 7,
    maxResults: number = 10
  ): Promise<TrendingProduct[]> {
    if (!firebaseEnabled || !db) {
      return this.getLocalTrending(days, maxResults);
    }
    
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const q = query(
        collection(db, COLLECTION_EVENTS),
        where('timestamp', '>=', Timestamp.fromDate(cutoffDate)),
        orderBy('timestamp', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      // Aggregate events by product
      const productStats = new Map<string, {
        impressions: number;
        clicks: number;
        name: string;
      }>();
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const stats = productStats.get(data.productId) || {
          impressions: 0,
          clicks: 0,
          name: data.productName || data.productId
        };
        
        if (data.eventType === 'impression') {
          stats.impressions++;
        } else if (data.eventType === 'click') {
          stats.clicks++;
        }
        
        productStats.set(data.productId, stats);
      });
      
      // Calculate trending scores and get 30d data
      const trending: TrendingProduct[] = [];
      for (const [productId, stats] of productStats.entries()) {
        const ctr = stats.impressions > 0 ? (stats.clicks / stats.impressions) * 100 : 0;
        
        // Trending score: weighted combination of impressions, clicks, and CTR
        const score = (stats.impressions * 0.3) + (stats.clicks * 5) + (ctr * 2);
        
        // Get 30d data if we're looking at 7d
        let impressions30d = stats.impressions;
        let clicks30d = stats.clicks;
        let ctr30d = ctr;
        
        if (days === 7) {
          const metrics30d = await this.getMetricsForPeriod(productId, 30);
          impressions30d = metrics30d.impressions;
          clicks30d = metrics30d.clicks;
          ctr30d = metrics30d.impressions > 0 ? (metrics30d.clicks / metrics30d.impressions) * 100 : 0;
        }
        
        trending.push({
          productId,
          productName: stats.name,
          score,
          impressions7d: days === 7 ? stats.impressions : 0,
          clicks7d: days === 7 ? stats.clicks : 0,
          impressions30d,
          clicks30d,
          ctr7d: days === 7 ? ctr : 0,
          ctr30d
        });
      }
      
      // Sort by score and return top results
      return trending
        .sort((a, b) => b.score - a.score)
        .slice(0, maxResults);
    } catch (error) {
      console.error('Error getting trending products:', error);
      return this.getLocalTrending(days, maxResults);
    }
  }
  
  /**
   * Get all product metrics (for admin dashboard)
   */
  static async getAllMetrics(): Promise<ProductMetrics[]> {
    if (!firebaseEnabled || !db) {
      return this.getAllLocalMetrics();
    }
    
    try {
      const q = query(
        collection(db, COLLECTION_METRICS),
        orderBy('clicks', 'desc'),
        limit(100)
      );
      
      const snapshot = await getDocs(q);
      const metrics: ProductMetrics[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        metrics.push({
          productId: data.productId,
          impressions: data.impressions || 0,
          clicks: data.clicks || 0,
          ctr: data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0,
          lastUpdated: data.lastUpdated?.toDate() || new Date()
        });
      });
      
      return metrics;
    } catch (error) {
      console.error('Error getting all metrics:', error);
      return this.getAllLocalMetrics();
    }
  }
  
  /**
   * Get metrics for a specific period
   */
  private static async getMetricsForPeriod(
    productId: string,
    days: number
  ): Promise<{ impressions: number; clicks: number }> {
    if (!firebaseEnabled || !db) {
      return { impressions: 0, clicks: 0 };
    }
    
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const q = query(
        collection(db, COLLECTION_EVENTS),
        where('productId', '==', productId),
        where('timestamp', '>=', Timestamp.fromDate(cutoffDate))
      );
      
      const snapshot = await getDocs(q);
      let impressions = 0;
      let clicks = 0;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.eventType === 'impression') impressions++;
        if (data.eventType === 'click') clicks++;
      });
      
      return { impressions, clicks };
    } catch (error) {
      console.error('Error getting period metrics:', error);
      return { impressions: 0, clicks: 0 };
    }
  }
  
  // ============= LOCAL STORAGE FALLBACKS =============
  
  private static trackEventLocally(productId: string, eventType: 'impression' | 'click'): void {
    try {
      const cache = this.getLocalCache();
      const key = `${productId}`;
      
      if (!cache[key]) {
        cache[key] = { impressions: 0, clicks: 0, events: [] };
      }
      
      if (eventType === 'impression') {
        cache[key].impressions++;
      } else {
        cache[key].clicks++;
      }
      
      cache[key].events.push({
        type: eventType,
        timestamp: Date.now()
      });
      
      // Keep only last 100 events per product
      if (cache[key].events.length > 100) {
        cache[key].events = cache[key].events.slice(-100);
      }
      
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Error tracking locally:', error);
    }
  }
  
  private static getLocalMetrics(productId: string): ProductMetrics | null {
    const cache = this.getLocalCache();
    const data = cache[productId];
    
    if (!data) return null;
    
    return {
      productId,
      impressions: data.impressions || 0,
      clicks: data.clicks || 0,
      ctr: data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0,
      lastUpdated: new Date()
    };
  }
  
  private static getAllLocalMetrics(): ProductMetrics[] {
    const cache = this.getLocalCache();
    return Object.entries(cache).map(([productId, data]: [string, LocalCacheData]) => ({
      productId,
      impressions: data.impressions || 0,
      clicks: data.clicks || 0,
      ctr: data.impressions > 0 ? ((data.clicks || 0) / data.impressions) * 100 : 0,
      lastUpdated: new Date()
    }));
  }
  
  private static getLocalTrending(days: number, maxResults: number): TrendingProduct[] {
    const cache = this.getLocalCache();
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    const trending: TrendingProduct[] = [];
    
    for (const [productId, data] of Object.entries(cache) as [string, LocalCacheData][]) {
      const recentEvents = data.events.filter(e => e.timestamp > cutoff);
      const impressions = recentEvents.filter(e => e.type === 'impression').length;
      const clicks = recentEvents.filter(e => e.type === 'click').length;
      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
      const score = (impressions * 0.3) + (clicks * 5) + (ctr * 2);
      
      trending.push({
        productId,
        productName: productId,
        score,
        impressions7d: days === 7 ? impressions : 0,
        clicks7d: days === 7 ? clicks : 0,
        impressions30d: impressions,
        clicks30d: clicks,
        ctr7d: days === 7 ? ctr : 0,
        ctr30d: ctr
      });
    }
    
    return trending
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);
  }
  
  private static getLocalCache(): LocalCache {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error reading local cache:', error);
      return {};
    }
  }
}

export default PerformanceInsightsService;
