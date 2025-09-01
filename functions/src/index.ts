import * as functions from 'firebase-functions';
import express, { Request, Response } from 'express';
import cors, { CorsOptionsDelegate } from 'cors';
import rateLimit from 'express-rate-limit';
import { getItem, searchItems } from './amazon.js';

// Basic in-memory cache (ephemeral). For production, consider Firestore/Redis.
type CacheEntry = { value: any; expiresAt: number };
const cache = new Map<string, CacheEntry>();
const TTL_MS = 1000 * 60 * 60; // 1 hour

function getCache<T>(key: string): T | null {
  const now = Date.now();
  const ent = cache.get(key);
  if (!ent) return null;
  if (ent.expiresAt < now) { cache.delete(key); return null; }
  return ent.value as T;
}

function setCache(key: string, value: any, ttlMs = TTL_MS) {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

const app = express();
const allowedOrigins = [
  'http://localhost:5173',
  'https://gifteez.nl',
  'https://www.gifteez.nl'
];
const corsDelegate: CorsOptionsDelegate = (origin, cb) => {
  if (!origin || typeof origin !== 'string') return cb(null, { origin: true });
  if (allowedOrigins.includes(origin as string)) return cb(null, { origin: true });
  return cb(null, { origin: false });
};
app.use(cors(corsDelegate));
app.use(express.json());

// Simple rate limiter per IP
app.use(rateLimit({ windowMs: 60_000, max: 60 }));

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.get('/api/amazon-search', async (req: Request, res: Response) => {
  try {
    const { q, page, minPrice, maxPrice, sort, prime } = req.query;
    const keywords = String(q || '').trim();
    if (!keywords) return res.status(400).json({ error: 'Missing q (keywords)' });
    const key = `search:${keywords}:${page||1}:${minPrice||''}:${maxPrice||''}:${sort||''}:${prime||''}`;
    const cached = getCache<any>(key);
    if (cached) return res.json({ ...cached, cached: true });
    const data = await searchItems({
      keywords,
      page: page ? Number(page) : 1,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sort: sort ? String(sort) : undefined,
      prime: prime === 'true'
    });
    setCache(key, data);
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Unknown error' });
  }
});

app.get('/api/amazon-item/:asin', async (req: Request, res: Response) => {
  try {
    const asin = String(req.params.asin || '').trim();
    if (!asin) return res.status(400).json({ error: 'Missing asin' });
    const key = `item:${asin}`;
    const cached = getCache<any>(key);
    if (cached) return res.json({ ...cached, cached: true });
    const data = await getItem(asin);
    setCache(key, data);
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Unknown error' });
  }
});

export const api = functions.region('europe-west1').https.onRequest(app);
