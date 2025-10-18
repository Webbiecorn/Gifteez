import { Gift, AdvancedFilters } from '../types';
import { ProductBasedGiftService } from './productBasedGiftService';

const STORAGE_KEY = 'gifteez_giftfinder_relevance_feedback_v1';

export interface RelevanceFeedbackPayload {
  comment: string;
  recipient: string;
  budget: number;
  occasion: string;
  interests: string;
  filters?: Partial<AdvancedFilters>;
  sampleResults?: Gift[];
}

export interface StoredRelevanceFeedback extends RelevanceFeedbackPayload {
  createdAt: number;
}

export function getStoredFeedback(): StoredRelevanceFeedback[] {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredRelevanceFeedback[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('⚠️  Kon opgeslagen feedback niet lezen:', error);
    return [];
  }
}

export async function submitRelevanceFeedback(payload: RelevanceFeedbackPayload): Promise<void> {
  const entry: StoredRelevanceFeedback = {
    ...payload,
    createdAt: Date.now(),
  };

  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    const existing = getStoredFeedback();
    const updated = [...existing, entry].slice(-50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (error) {
    console.warn('⚠️  Kon feedback niet opslaan in localStorage:', error);
  }

  try {
    ProductBasedGiftService.registerFeedback(entry);
  } catch (error) {
    console.error('⚠️  Kon feedback niet doorgeven aan scoringservice:', error);
  }

  // Dispatch a custom event for other listeners (analytics / monitoring)
  try {
    if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
      const event = new CustomEvent('gifteez:giftfinder-feedback', { detail: entry });
      window.dispatchEvent(event);
    }
  } catch (error) {
    console.warn('⚠️  Kon feedback-event niet verzenden:', error);
  }

  console.info('📨 GiftFinder feedback ingestuurd naar scoringservice', entry);
}
