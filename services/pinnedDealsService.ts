export async function clearAllPinnedDeals(): Promise<void> {
  // Leeg pinned deals in Firestore en localStorage
  if (firebaseEnabled && db) {
    try {
      const ref = doc(db, 'pinnedDeals', 'current');
      await setDoc(ref, { deals: [], updatedAt: new Date().toISOString() }, { merge: false });
    } catch (error) {
      console.error('Kon pinned deals niet wissen in Firestore:', error);
      throw error;
    }
  }
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem('gifteez-admin-pinned-deals');
    } catch (error) {
      console.warn('Kon pinned deals niet wissen uit localStorage:', error);
    }
  }
  cachedPinnedDeals = [];
}
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, firebaseEnabled } from './firebase';
import type { DealItem } from '../types';

export interface PinnedDealEntry {
  id: string;
  deal: DealItem;
  pinnedAt: number;
}

const COLLECTION = 'pinnedDeals';
const DOCUMENT_ID = 'current';
const LOCAL_STORAGE_KEY = 'gifteez-admin-pinned-deals';
const CONFIG_VERSION = 1;
const DEFAULT_PRODUCT_PLACEHOLDER = '/images/amazon-placeholder.png';

const hasWindow = typeof window !== 'undefined';

let cachedPinnedDeals: PinnedDealEntry[] | null | undefined;
let loadPromise: Promise<PinnedDealEntry[]> | null = null;

const normaliseDealItem = (rawDeal: any): DealItem | null => {
  if (!rawDeal || typeof rawDeal !== 'object') {
    return null;
  }

  const id = typeof rawDeal.id === 'string' ? rawDeal.id.trim() : '';
  const name = typeof rawDeal.name === 'string' ? rawDeal.name.trim() : '';
  const description = typeof rawDeal.description === 'string' ? rawDeal.description : '';
  const imageCandidate = typeof rawDeal.imageUrl === 'string' ? rawDeal.imageUrl : (typeof rawDeal.image === 'string' ? rawDeal.image : null);
  const imageUrl = imageCandidate && imageCandidate.trim().length ? imageCandidate : DEFAULT_PRODUCT_PLACEHOLDER;

  let price = '';
  if (typeof rawDeal.price === 'string') {
    price = rawDeal.price.trim();
  } else if (typeof rawDeal.price === 'number') {
    price = `€${rawDeal.price.toFixed(2)}`;
  }

  const affiliateLink = typeof rawDeal.affiliateLink === 'string' ? rawDeal.affiliateLink.trim() : '';

  if (!id || !name || !price || !affiliateLink) {
    return null;
  }

  const deal: DealItem = {
    id,
    name,
    description,
    imageUrl,
    price,
    affiliateLink,
  };

  if (typeof rawDeal.originalPrice === 'string') {
    deal.originalPrice = rawDeal.originalPrice;
  } else if (typeof rawDeal.originalPrice === 'number') {
    deal.originalPrice = `€${rawDeal.originalPrice.toFixed(2)}`;
  }

  if (typeof rawDeal.isOnSale === 'boolean') {
    deal.isOnSale = rawDeal.isOnSale;
  }

  if (Array.isArray(rawDeal.tags)) {
    deal.tags = rawDeal.tags.filter((tag: unknown): tag is string => typeof tag === 'string');
  }

  if (typeof rawDeal.giftScore === 'number' && Number.isFinite(rawDeal.giftScore)) {
    deal.giftScore = rawDeal.giftScore;
  }

  return deal;
};

const normaliseEntry = (raw: any): PinnedDealEntry | null => {
  const dealSource = raw?.deal ?? raw;
  const deal = normaliseDealItem(dealSource);
  if (!deal) {
    return null;
  }

  const id = typeof raw?.id === 'string' && raw.id.trim().length ? raw.id.trim() : deal.id;
  if (!id) {
    return null;
  }

  const pinnedAt = typeof raw?.pinnedAt === 'number' && Number.isFinite(raw.pinnedAt) ? raw.pinnedAt : Date.now();

  return {
    id,
    deal,
    pinnedAt,
  };
};

const normaliseList = (raw: unknown): PinnedDealEntry[] => {
  if (!Array.isArray(raw)) {
    return [];
  }

  const seen = new Set<string>();
  const entries: PinnedDealEntry[] = [];

  raw.forEach((entry) => {
    const normalised = normaliseEntry(entry);
    if (!normalised) {
      return;
    }
    if (seen.has(normalised.id)) {
      return;
    }
    seen.add(normalised.id);
    entries.push(normalised);
  });

  entries.sort((a, b) => b.pinnedAt - a.pinnedAt);
  return entries;
};

const readLocal = (): PinnedDealEntry[] => {
  if (!hasWindow) {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored);
    return normaliseList(parsed);
  } catch (error) {
    console.warn('Kon vastgezette deals niet lezen uit localStorage:', error);
    return [];
  }
};

const writeLocal = (entries: PinnedDealEntry[]): void => {
  if (!hasWindow) {
    return;
  }

  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.warn('Kon vastgezette deals niet opslaan in localStorage:', error);
  }
};

export const PinnedDealsService = {
  async load(forceReload: boolean = false): Promise<PinnedDealEntry[]> {
    if (!forceReload && cachedPinnedDeals) {
      return cachedPinnedDeals;
    }

    if (!forceReload && loadPromise) {
      return loadPromise;
    }

    loadPromise = (async () => {
      let entries: PinnedDealEntry[] = [];

      if (firebaseEnabled && db) {
        try {
          const ref = doc(db, COLLECTION, DOCUMENT_ID);
          const snapshot = await getDoc(ref);
          if (snapshot.exists()) {
            const data = snapshot.data();
            entries = normaliseList((data as any)?.deals ?? []);
          }
        } catch (error) {
          console.warn('Kon vastgezette deals niet laden uit Firestore:', error);
        }
      }

      if (!entries.length) {
        entries = readLocal();
      }

      cachedPinnedDeals = entries;
      loadPromise = null;

      if (entries.length) {
        writeLocal(entries);
      }

      return entries;
    })();

    return loadPromise;
  },

  getCachedPinnedDeals(): PinnedDealEntry[] {
    if (!cachedPinnedDeals) {
      cachedPinnedDeals = readLocal();
    }

    return cachedPinnedDeals ? [...cachedPinnedDeals] : [];
  },

  async save(entries: PinnedDealEntry[]): Promise<PinnedDealEntry[]> {
    const normalised = normaliseList(entries);
    const payload = {
      version: CONFIG_VERSION,
      updatedAt: new Date().toISOString(),
      deals: normalised.map((entry) => ({
        id: entry.id,
        pinnedAt: entry.pinnedAt,
        deal: entry.deal,
      })),
    };

    if (firebaseEnabled && db) {
      try {
        const ref = doc(db, COLLECTION, DOCUMENT_ID);
        await setDoc(ref, payload, { merge: false });
      } catch (error) {
        console.error('Kon vastgezette deals niet opslaan in Firestore:', error);
        throw error;
      }
    }

    writeLocal(normalised);
    cachedPinnedDeals = normalised;
    return normalised;
  },

  clearCache(): void {
    cachedPinnedDeals = undefined;
    loadPromise = null;
  },

  getLocalStorageKey(): string {
    return LOCAL_STORAGE_KEY;
  },
};
