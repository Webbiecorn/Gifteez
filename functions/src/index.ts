import * as functions from 'firebase-functions';
import express, { Request, Response } from 'express';
import cors, { CorsOptionsDelegate } from 'cors';
import rateLimit from 'express-rate-limit';
import { getItem, searchItems, isPaapiConfigured } from './amazon.js';

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

// Outbound redirect helper to avoid ad blockers breaking direct affiliate links
// Only allows a safe-list of hosts and will ensure Amazon tag presence.
// Shared redirect handler logic
function handleAffiliateRedirect(req: Request, res: Response) {
  try {
    const to = String(req.query.to || '');
    if (!to) return res.status(400).send('Missing to');
    const url = new URL(to);
    if (!/^https?:$/.test(url.protocol)) return res.status(400).send('Invalid protocol');
    const host = url.hostname.toLowerCase();
    const allowed = ['amazon.nl', 'www.amazon.nl', 'bol.com', 'www.bol.com'];
    if (!allowed.includes(host)) return res.status(400).send('Host not allowed');

    // If Amazon, enforce associate tag
    if (host.endsWith('amazon.nl')) {
      const partnerTag = process.env.PAAPI_PARTNER_TAG || 'gifteez77-21';
      if (!url.searchParams.has('tag')) url.searchParams.set('tag', partnerTag);
    }
    // 302 Found redirect
    res.redirect(302, url.toString());
  } catch (e: any) {
    res.status(400).send('Bad request');
  }
}

// Backwards-compatible path
app.get('/api/out', (req: Request, res: Response) => handleAffiliateRedirect(req, res));
// New, less blocker-prone path
app.get('/api/visit', (req: Request, res: Response) => handleAffiliateRedirect(req, res));

app.get('/api/amazon-search', async (req: Request, res: Response) => {
  try {
    if (!isPaapiConfigured()) {
      return res.json({ items: [], fetchedAtISO: new Date().toISOString(), disabled: true });
    }
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
    if (!isPaapiConfigured()) {
      return res.json({ item: null, fetchedAtISO: new Date().toISOString(), disabled: true });
    }
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

// Export HTTPS function without Secret Manager binding; code handles missing secrets gracefully.
export const api = functions
  .region('europe-west1')
  .https.onRequest(app);

// Dedicated 404 function to deliver an actual 404 HTTP status (can be targeted via rewrite to /404)
export const notFound = functions
  .region('europe-west1')
  .https.onRequest((_req, res) => {
    res.status(404).set('Cache-Control', 'public, max-age=60').send(`<!DOCTYPE html><html lang="nl"><head><meta charset='UTF-8'><title>404 - Pagina niet gevonden</title><meta name='robots' content='noindex, follow'><meta name='viewport' content='width=device-width,initial-scale=1'><style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,sans-serif;margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f8fafc;color:#334155;padding:2rem;text-align:center}h1{font-size:4rem;margin:.2em 0;color:#e11d48}p{max-width:40rem;margin:0 auto 1.2rem;line-height:1.5}a{display:inline-block;margin:.35rem .45rem;padding:.8rem 1.3rem;border-radius:999px;font-weight:600;text-decoration:none}a.primary{background:#e11d48;color:#fff}a.secondary{background:#f1f5f9;color:#e11d48}a.primary:hover{background:#be123c}a.secondary:hover{background:#e2e8f0}</style></head><body><main><h1>404</h1><p>De pagina die je zoekt bestaat niet. Gebruik de links hieronder om verder te gaan.</p><div><a class='primary' href='/'>Home</a><a class='secondary' href='/giftfinder'>GiftFinder</a><a class='secondary' href='/blog'>Blogs</a><a class='secondary' href='/deals'>Deals</a></div></main></body></html>`);
  });
