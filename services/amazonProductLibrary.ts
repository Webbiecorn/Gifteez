import { db, firebaseEnabled } from './firebase';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { withAffiliate } from './affiliate';

type AmazonProductSource = 'firestore' | 'local';

export interface AmazonProductInput {
  asin: string;
  name: string;
  affiliateLink: string;
  description?: string;
  shortDescription?: string;
  image?: string;
  imageLarge?: string;
  price?: number;
  originalPrice?: number;
  currency?: string;
  category?: string;
  tags?: string[];
  prime?: boolean;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  giftScore?: number;
}

export interface AmazonProduct extends AmazonProductInput {
  id: string;
  source: AmazonProductSource;
  createdAt?: string;
  updatedAt?: string;
}

type Listener = (products: AmazonProduct[]) => void;

const COLLECTION = 'amazonProducts';
const LOCAL_STORAGE_KEY = 'gifteez_amazon_products_v1';
const FALLBACK_ENDPOINT = '/data/amazonSample.json';

const listeners = new Set<Listener>();
let cachedProducts: AmazonProduct[] = [];
let unsubscribeFirestore: (() => void) | null = null;
let loadingPromise: Promise<AmazonProduct[]> | null = null;

const hasWindow = typeof window !== 'undefined';

const normaliseAffiliateLink = (url: string): string => {
  if (!url) {
    return url;
  }
  return withAffiliate(url.trim());
};

const ensureArray = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const cleaned = value
    .map((item) => (typeof item === 'string' ? item.trim() : String(item)))
    .filter((item) => item.length > 0);
  return cleaned.length ? cleaned : undefined;
};

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim().length) {
    const parsed = Number.parseFloat(value.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const timestampToIso = (value: unknown): string | undefined => {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Timestamp) return value.toDate().toISOString();
  return undefined;
};

const normaliseProduct = (
  data: Partial<AmazonProductInput & { id?: string }>,
  id?: string,
  source: AmazonProductSource = 'local'
): AmazonProduct => {
  const asin = String(data.asin ?? data.id ?? '').trim();
  const name = String(data.name ?? '').trim();
  const affiliateLink = normaliseAffiliateLink(String(data.affiliateLink ?? '').trim());

  if (!asin || !name || !affiliateLink) {
    throw new Error('Ongeldige Amazon productdata: ASIN, naam en affiliate link zijn verplicht.');
  }

  const tags = ensureArray(data.tags);

  return {
    id: id ?? asin,
    asin,
    name,
    affiliateLink,
    description: data.description?.trim() || undefined,
    shortDescription: data.shortDescription?.trim() || undefined,
    image: data.image?.trim() || undefined,
    imageLarge: data.imageLarge?.trim() || undefined,
    price: toNumber(data.price),
    originalPrice: toNumber(data.originalPrice),
    currency: data.currency ?? 'EUR',
    category: data.category?.trim() || undefined,
    tags,
    prime: Boolean(data.prime),
    rating: toNumber(data.rating),
    reviewCount: toNumber(data.reviewCount),
    inStock: data.inStock ?? true,
    giftScore: toNumber(data.giftScore),
    source,
  };
};

const docToProduct = (snapshot: QueryDocumentSnapshot<DocumentData>): AmazonProduct => {
  const data = snapshot.data();
  const product = normaliseProduct(data as Partial<AmazonProductInput>, snapshot.id, 'firestore');
  product.createdAt = timestampToIso(data.createdAt ?? data.created_at);
  product.updatedAt = timestampToIso(data.updatedAt ?? data.updated_at ?? data.lastUpdated);
  return product;
};

const sortByUpdated = (items: AmazonProduct[]): AmazonProduct[] =>
  items.slice().sort((a, b) => {
    const timeA = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
    const timeB = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
    return timeB - timeA;
  });

const writeLocal = (items: AmazonProduct[]): void => {
  if (!hasWindow) return;
  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.warn('Kon Amazon producten niet lokaal opslaan:', error);
  }
};

const readLocal = (): AmazonProduct[] => {
  if (!hasWindow) return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => {
        try {
          return normaliseProduct(item as Partial<AmazonProductInput>, item.id, 'local');
        } catch {
          return null;
        }
      })
      .filter((item): item is AmazonProduct => item !== null);
  } catch (error) {
    console.warn('Kon lokale Amazon producten niet lezen:', error);
    return [];
  }
};

const emitChange = (): void => {
  const payload = sortByUpdated(cachedProducts);
  listeners.forEach((listener) => listener(payload));
};

const ensureFirestoreSubscription = (): void => {
  if (!firebaseEnabled || !db || unsubscribeFirestore) {
    return;
  }

  const q = query(collection(db, COLLECTION), orderBy('updatedAt', 'desc'));
  unsubscribeFirestore = onSnapshot(q, (snapshot) => {
    cachedProducts = snapshot.docs.map(docToProduct);
    emitChange();
  }, (error) => {
    console.warn('Realtime Amazon feed kon niet worden geladen:', error);
  });
};

const loadFromFirestore = async (): Promise<AmazonProduct[]> => {
  if (!firebaseEnabled || !db) {
    return loadFromFallback();
  }

  const snapshot = await getDocs(query(collection(db, COLLECTION), orderBy('updatedAt', 'desc')));
  const products = snapshot.docs.map(docToProduct);
  cachedProducts = products;
  ensureFirestoreSubscription();
  return sortByUpdated(products);
};

const loadFromFallback = async (): Promise<AmazonProduct[]> => {
  if (hasWindow) {
    const local = readLocal();
    if (local.length) {
      cachedProducts = local;
      return sortByUpdated(local);
    }
  }

  try {
    const res = await fetch(FALLBACK_ENDPOINT, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Fallback request mislukte: ${res.status}`);
    const data = (await res.json()) as Partial<AmazonProductInput & { id?: string }>[];
    const products = data
      .map((item) => {
        try {
          return normaliseProduct(item, item.id ?? item.asin, 'local');
        } catch (error) {
          console.warn('Ongeldig Amazon product in fallback feed:', error, item);
          return null;
        }
      })
      .filter((item): item is AmazonProduct => item !== null);
    cachedProducts = products;
    return sortByUpdated(products);
  } catch (error) {
    console.warn('Kon fallback Amazon producten niet laden:', error);
    cachedProducts = [];
    return [];
  }
};

export const AmazonProductLibrary = {
  async loadProducts(force = false): Promise<AmazonProduct[]> {
    if (!force && cachedProducts.length) {
      return sortByUpdated(cachedProducts);
    }

    if (loadingPromise) {
      return loadingPromise;
    }

    loadingPromise = firebaseEnabled ? loadFromFirestore() : loadFromFallback();

    try {
      const items = await loadingPromise;
      return items;
    } finally {
      loadingPromise = null;
    }
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    if (cachedProducts.length) {
      listener(sortByUpdated(cachedProducts));
    } else {
      this.loadProducts().catch((error) => {
        console.warn('Kon Amazon producten niet laden voor subscriber:', error);
      });
    }

    return () => {
      listeners.delete(listener);
      if (listeners.size === 0 && unsubscribeFirestore) {
        unsubscribeFirestore();
        unsubscribeFirestore = null;
      }
    };
  },

  async create(product: AmazonProductInput): Promise<void> {
    const normalised = normaliseProduct(product, product.asin, firebaseEnabled && db ? 'firestore' : 'local');

    if (firebaseEnabled && db) {
      const payload: Record<string, unknown> = {
        ...normalised,
        source: 'firestore',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      delete payload.id;
      await addDoc(collection(db, COLLECTION), payload);
      return;
    }

    const now = new Date().toISOString();
    const local = readLocal();
    const exists = local.some((item) => item.asin === normalised.asin);
    const entry: AmazonProduct = { ...normalised, source: 'local', createdAt: now, updatedAt: now };
    const merged: AmazonProduct[] = exists
      ? local.map((item) => (item.asin === normalised.asin ? { ...entry, createdAt: item.createdAt ?? now } : item))
      : [...local, entry];
    cachedProducts = merged;
    writeLocal(merged);
    emitChange();
  },

  async update(id: string, updates: Partial<AmazonProductInput>): Promise<void> {
    const existing = cachedProducts.find((item) => item.id === id) ?? readLocal().find((item) => item.id === id);
    if (!existing) {
      throw new Error('Amazon product niet gevonden voor update.');
    }

    const mergedInput: AmazonProductInput = {
      asin: updates.asin ?? existing.asin,
      name: updates.name ?? existing.name,
      affiliateLink: updates.affiliateLink ?? existing.affiliateLink,
      description: updates.description ?? existing.description,
      shortDescription: updates.shortDescription ?? existing.shortDescription,
      image: updates.image ?? existing.image,
      imageLarge: updates.imageLarge ?? existing.imageLarge,
      price: updates.price ?? existing.price,
      originalPrice: updates.originalPrice ?? existing.originalPrice,
      currency: updates.currency ?? existing.currency,
      category: updates.category ?? existing.category,
      tags: updates.tags ?? existing.tags,
      prime: updates.prime ?? existing.prime,
      rating: updates.rating ?? existing.rating,
      reviewCount: updates.reviewCount ?? existing.reviewCount,
      inStock: updates.inStock ?? existing.inStock,
      giftScore: updates.giftScore ?? existing.giftScore,
    };

    const normalised = normaliseProduct(
      mergedInput,
      existing.id,
      firebaseEnabled && db ? 'firestore' : 'local'
    );

    if (firebaseEnabled && db) {
      const ref = doc(db, COLLECTION, id);
      const payload: Record<string, unknown> = {
        ...normalised,
        source: 'firestore',
        updatedAt: serverTimestamp(),
      };
      delete payload.id;
      await updateDoc(ref, payload);
      return;
    }

    const now = new Date().toISOString();
    const local = readLocal();
    const merged: AmazonProduct[] = local.map((item) =>
      item.id === id ? { ...item, ...normalised, source: 'local', updatedAt: now } : item
    );
    cachedProducts = merged;
    writeLocal(merged);
    emitChange();
  },

  async remove(id: string): Promise<void> {
    if (firebaseEnabled && db) {
      await deleteDoc(doc(db, COLLECTION, id));
      return;
    }

    const local = readLocal().filter((item) => item.id !== id);
    cachedProducts = local;
    writeLocal(local);
    emitChange();
  },
};
