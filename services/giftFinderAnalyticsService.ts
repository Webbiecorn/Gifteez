/**
 * Privacy-friendly analytics service for GiftFinder
 * Logs events locally (localStorage) to improve recommendations
 * No external tracking, no personal data
 */

export interface FilterEvent {
  occasion?: string;
  recipient?: string;
  budgetMin?: number;
  budgetMax?: number;
  interests?: string[];
  timestamp: number;
  sessionId: string;
}

export interface ClickEvent {
  productName: string;
  position: number; // Position in results (1-indexed)
  relevanceScore?: number;
  budgetFit?: number;
  occasionFit?: number;
  personaFit?: number;
  trendScore?: number;
  timestamp: number;
  sessionId: string;
}

export interface AnalyticsData {
  filterEvents: FilterEvent[];
  clickEvents: ClickEvent[];
  sessionId: string;
  lastUpdated: number;
}

const STORAGE_KEY = 'gifteez_giftfinder_analytics';
const MAX_EVENTS_PER_TYPE = 100; // Keep last 100 events per type
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * Get or create session ID
 */
function getSessionId(): string {
  const stored = sessionStorage.getItem('gifteez_session_id');
  if (stored) return stored;
  
  const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem('gifteez_session_id', newId);
  return newId;
}

/**
 * Get current analytics data from localStorage
 */
function getAnalyticsData(): AnalyticsData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {
        filterEvents: [],
        clickEvents: [],
        sessionId: getSessionId(),
        lastUpdated: Date.now()
      };
    }
    
    const data = JSON.parse(stored) as AnalyticsData;
    
    // Update session if expired
    if (Date.now() - data.lastUpdated > SESSION_DURATION) {
      data.sessionId = getSessionId();
    }
    
    return data;
  } catch (error) {
    console.warn('Failed to read analytics data:', error);
    return {
      filterEvents: [],
      clickEvents: [],
      sessionId: getSessionId(),
      lastUpdated: Date.now()
    };
  }
}

/**
 * Save analytics data to localStorage
 */
function saveAnalyticsData(data: AnalyticsData): void {
  try {
    // Trim to max events
    data.filterEvents = data.filterEvents.slice(-MAX_EVENTS_PER_TYPE);
    data.clickEvents = data.clickEvents.slice(-MAX_EVENTS_PER_TYPE);
    data.lastUpdated = Date.now();
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save analytics data:', error);
  }
}

/**
 * Log filter change event
 */
export function logFilterEvent(
  occasion?: string,
  recipient?: string,
  budgetMin?: number,
  budgetMax?: number,
  interests?: string[]
): void {
  const data = getAnalyticsData();
  
  const event: FilterEvent = {
    occasion,
    recipient,
    budgetMin,
    budgetMax,
    interests,
    timestamp: Date.now(),
    sessionId: data.sessionId
  };
  
  data.filterEvents.push(event);
  saveAnalyticsData(data);
}

/**
 * Log product click event
 */
export function logClickEvent(
  productName: string,
  position: number,
  scores?: {
    relevanceScore?: number;
    budgetFit?: number;
    occasionFit?: number;
    personaFit?: number;
    trendScore?: number;
  }
): void {
  const data = getAnalyticsData();
  
  const event: ClickEvent = {
    productName,
    position,
    relevanceScore: scores?.relevanceScore,
    budgetFit: scores?.budgetFit,
    occasionFit: scores?.occasionFit,
    personaFit: scores?.personaFit,
    trendScore: scores?.trendScore,
    timestamp: Date.now(),
    sessionId: data.sessionId
  };
  
  data.clickEvents.push(event);
  saveAnalyticsData(data);
}

/**
 * Get analytics insights (for future ML improvements)
 */
export function getAnalyticsInsights() {
  const data = getAnalyticsData();
  
  // Most popular occasions
  const occasionCounts = new Map<string, number>();
  data.filterEvents.forEach(event => {
    if (event.occasion) {
      occasionCounts.set(event.occasion, (occasionCounts.get(event.occasion) || 0) + 1);
    }
  });
  
  // Most popular recipients
  const recipientCounts = new Map<string, number>();
  data.filterEvents.forEach(event => {
    if (event.recipient) {
      recipientCounts.set(event.recipient, (recipientCounts.get(event.recipient) || 0) + 1);
    }
  });
  
  // Most popular interests
  const interestCounts = new Map<string, number>();
  data.filterEvents.forEach(event => {
    event.interests?.forEach(interest => {
      interestCounts.set(interest, (interestCounts.get(interest) || 0) + 1);
    });
  });
  
  // Average budget
  const budgetValues = data.filterEvents
    .filter(e => e.budgetMin && e.budgetMax)
    .map(e => (e.budgetMin! + e.budgetMax!) / 2);
  const avgBudget = budgetValues.length > 0
    ? budgetValues.reduce((sum, val) => sum + val, 0) / budgetValues.length
    : 0;
  
  // Click-through rate by position
  const clicksByPosition = new Map<number, number>();
  data.clickEvents.forEach(event => {
    clicksByPosition.set(event.position, (clicksByPosition.get(event.position) || 0) + 1);
  });
  
  // Products with highest scores that got clicked
  const highScoringClicks = data.clickEvents
    .filter(e => e.relevanceScore && e.relevanceScore > 0.7)
    .length;
  
  const totalClicks = data.clickEvents.length;
  const highScoreClickRate = totalClicks > 0 ? highScoringClicks / totalClicks : 0;
  
  return {
    totalFilterEvents: data.filterEvents.length,
    totalClickEvents: data.clickEvents.length,
    topOccasions: Array.from(occasionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5),
    topRecipients: Array.from(recipientCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5),
    topInterests: Array.from(interestCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10),
    averageBudget: Math.round(avgBudget),
    clicksByPosition: Array.from(clicksByPosition.entries())
      .sort((a, b) => a[0] - b[0]),
    highScoreClickRate,
    sessionId: data.sessionId
  };
}

/**
 * Clear all analytics data (for privacy/testing)
 */
export function clearAnalytics(): void {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem('gifteez_session_id');
}

/**
 * Export analytics data (for admin review)
 */
export function exportAnalytics(): AnalyticsData {
  return getAnalyticsData();
}
