// Gebruik v1 compat layer zodat 1st Gen deployment behouden blijft terwijl firebase-functions@6 is geïnstalleerd.
import * as functions from 'firebase-functions/v1';
import express, { Request, Response } from 'express';
import cors, { CorsOptionsDelegate } from 'cors';
import rateLimit from 'express-rate-limit';
import { getItem, searchItems, isPaapiConfigured } from './amazon.js';
import { Resend } from 'resend';

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
// Handle JSON size limit for contact form safety
app.use(express.urlencoded({ extended: true }));

// Initialize Resend lazily (only if API key provided)
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Basic structured logging & timing
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const dur = Date.now() - start;
    // Gebruik console.log; Firebase vangt stdout op als log entry
    console.log(JSON.stringify({
      level: 'info',
      msg: 'req',
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration_ms: dur,
      ua: req.get('user-agent') || '',
      ip: req.ip
    }));
  });
  next();
});

// Simple rate limiter per IP
app.use(rateLimit({ windowMs: 60_000, max: 60 }));

app.get('/api/health', (_req: Request, res: Response) => {
  res.set('Cache-Control', 'public, max-age=30');
  res.json({ ok: true, time: new Date().toISOString() });
});

// POST /api/contact – send contact form email
app.post('/api/contact', async (req: Request, res: Response) => {
  try {
    if (!resend) {
      return res.status(503).json({ error: 'Email service not configured' });
    }
    const { name, email, subject, message, _honeypot, _ts } = req.body || {};
    // Honeypot / spam checks
    if (_honeypot) return res.status(400).json({ error: 'Spam detected' });
    const receivedAt = Date.now();
    if (!_ts || typeof _ts !== 'number' || receivedAt - _ts < 1500) {
      return res.status(400).json({ error: 'Too fast' });
    }
    // Validate fields
    const errors: Record<string,string> = {};
    function reqStr(v: any){ return typeof v === 'string' ? v.trim() : ''; }
    const vName = reqStr(name);
    const vEmail = reqStr(email);
    const vSubject = reqStr(subject);
    const vMessage = reqStr(message);
    if(!vName) errors.name = 'Naam is verplicht';
    if(!vEmail || !/\S+@\S+\.\S+/.test(vEmail)) errors.email = 'Ongeldig e-mailadres';
    if(!vSubject) errors.subject = 'Onderwerp is verplicht';
    if(!vMessage) errors.message = 'Bericht is verplicht';
    if(Object.keys(errors).length) return res.status(400).json({ errors });

    // Basic length guards
    if(vMessage.length > 5000) return res.status(400).json({ error: 'Bericht te lang' });

    const html = `<h2>Nieuw contactformulier bericht</h2>
      <p><strong>Naam:</strong> ${escapeHtml(vName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(vEmail)}</p>
      <p><strong>Onderwerp:</strong> ${escapeHtml(vSubject)}</p>
      <p><strong>Bericht:</strong><br/>${escapeHtml(vMessage).replace(/\n/g,'<br/>')}</p>
      <hr/><p style="font-size:12px;color:#666">Verzonden ${new Date().toISOString()}</p>`;

    const fromAddress = process.env.CONTACT_FROM || 'contact@gifteez.nl';
    const toAddress = process.env.CONTACT_TO || 'info@gifteez.nl';

    await resend.emails.send({
      from: `Gifteez Contact <${fromAddress}>`,
      to: [toAddress],
      replyTo: vEmail,
      subject: `[Contact] ${vSubject}`.slice(0,200),
      html
    });

    res.json({ ok: true });
  } catch(e: any){
    console.error('contact_error', e);
    res.status(500).json({ error: 'Server error' });
  }
});

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
    if (cached) {
      res.set('Cache-Control', 'public, max-age=300');
      return res.json({ ...cached, cached: true });
    }
    const data = await searchItems({
      keywords,
      page: page ? Number(page) : 1,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sort: sort ? String(sort) : undefined,
      prime: prime === 'true'
    });
    setCache(key, data);
  res.set('Cache-Control', 'public, max-age=300');
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
    if (cached) {
      res.set('Cache-Control', 'public, max-age=600');
      return res.json({ ...cached, cached: true });
    }
    const data = await getItem(asin);
    setCache(key, data);
  res.set('Cache-Control', 'public, max-age=600');
  res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Unknown error' });
  }
});

// 404 fallback voor alle overige /api routes
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }
  return res.status(404).send('Not found');
});

// Export 1st gen HTTPS function (upgrade to 2nd gen vereist aparte nieuwe naam / migratiepad)
export const api = functions
  .region('europe-west1')
  .https.onRequest(app);

// Helper to escape HTML
function escapeHtml(str: string){
  return str.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c] as string));
}
