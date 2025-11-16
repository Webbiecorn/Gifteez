// Gebruik v1 compat layer zodat 1st Gen deployment behouden blijft terwijl firebase-functions@6 is geïnstalleerd.
import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import { initializeApp, getApps } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import * as functions from 'firebase-functions/v1'
import { Resend } from 'resend'
import { getItem, searchItems, isPaapiConfigured } from './amazon.js'
import type { CorsOptionsDelegate } from 'cors'
import type { Request, Response } from 'express'

// Export email functions
export {
  onNewsletterSubscribe,
  sendNewsletterCampaign,
  sendGiftFinderResults,
  onContactFormSubmit,
} from './email.js'

// Basic in-memory cache (ephemeral). For production, consider Firestore/Redis.
type CacheEntry<T> = { value: T; expiresAt: number }
const cache = new Map<string, CacheEntry<unknown>>()
const TTL_MS = 1000 * 60 * 60 // 1 hour
const adminApp = getApps().length ? getApps()[0]! : initializeApp()
const firestore = getFirestore(adminApp)
const COLLECTION_EVENTS = 'productPerformanceEvents'

type SourceBucket = {
  impressions: number
  clicks: number
  uniqueProducts: Set<string>
  lastEvent?: Date
}

function getCache<T>(key: string): T | null {
  const now = Date.now()
  const entry = cache.get(key)
  if (!entry) return null
  if (entry.expiresAt < now) {
    cache.delete(key)
    return null
  }
  return entry.value as T
}

function setCache<T>(key: string, value: T, ttlMs = TTL_MS) {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs })
}

const app = express()
const allowedOrigins = ['http://localhost:5173', 'https://gifteez.nl', 'https://www.gifteez.nl']
const corsDelegate: CorsOptionsDelegate = (origin, cb) => {
  if (!origin || typeof origin !== 'string') return cb(null, { origin: true })
  if (allowedOrigins.includes(origin as string)) return cb(null, { origin: true })
  return cb(null, { origin: false })
}
app.use(cors(corsDelegate))
app.use(express.json())
// Handle JSON size limit for contact form safety
app.use(express.urlencoded({ extended: true }))

// Initialize Resend lazily (only if API key provided)
const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

// Basic structured logging & timing
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const dur = Date.now() - start
    // Gebruik console.log; Firebase vangt stdout op als log entry
    console.log(
      JSON.stringify({
        level: 'info',
        msg: 'req',
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration_ms: dur,
        ua: req.get('user-agent') || '',
        ip: req.ip,
      })
    )
  })
  next()
})

// Simple rate limiter per IP
app.use(rateLimit({ windowMs: 60_000, max: 60 }))

app.get('/api/health', (_req: Request, res: Response) => {
  res.set('Cache-Control', 'public, max-age=30')
  res.json({ ok: true, time: new Date().toISOString() })
})

// POST /api/contact – send contact form email
app.post('/api/contact', async (req: Request, res: Response) => {
  try {
    if (!resend) {
      return res.status(503).json({ error: 'Email service not configured' })
    }
    const { name, email, subject, message, _honeypot, _ts } = req.body || {}
    // Honeypot / spam checks
    if (_honeypot) return res.status(400).json({ error: 'Spam detected' })
    const receivedAt = Date.now()
    if (!_ts || typeof _ts !== 'number' || receivedAt - _ts < 1500) {
      return res.status(400).json({ error: 'Too fast' })
    }
    // Validate fields
    const errors: Record<string, string> = {}
    function reqStr(value: unknown) {
      return typeof value === 'string' ? value.trim() : ''
    }
    const vName = reqStr(name)
    const vEmail = reqStr(email)
    const vSubject = reqStr(subject)
    const vMessage = reqStr(message)
    if (!vName) errors.name = 'Naam is verplicht'
    if (!vEmail || !/\S+@\S+\.\S+/.test(vEmail)) errors.email = 'Ongeldig e-mailadres'
    if (!vSubject) errors.subject = 'Onderwerp is verplicht'
    if (!vMessage) errors.message = 'Bericht is verplicht'
    if (Object.keys(errors).length) return res.status(400).json({ errors })

    // Basic length guards
    if (vMessage.length > 5000) return res.status(400).json({ error: 'Bericht te lang' })

    const html = `<h2>Nieuw contactformulier bericht</h2>
      <p><strong>Naam:</strong> ${escapeHtml(vName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(vEmail)}</p>
      <p><strong>Onderwerp:</strong> ${escapeHtml(vSubject)}</p>
      <p><strong>Bericht:</strong><br/>${escapeHtml(vMessage).replace(/\n/g, '<br/>')}</p>
      <hr/><p style="font-size:12px;color:#666">Verzonden ${new Date().toISOString()}</p>`

    const fromAddress = process.env.CONTACT_FROM || 'contact@gifteez.nl'
    const toAddress = process.env.CONTACT_TO || 'info@gifteez.nl'

    await resend.emails.send({
      from: `Gifteez Contact <${fromAddress}>`,
      to: [toAddress],
      replyTo: vEmail,
      subject: `[Contact] ${vSubject}`.slice(0, 200),
      html,
    })

    res.json({ ok: true })
  } catch (error: unknown) {
    console.error('contact_error', error)
    res.status(500).json({ error: 'Server error' })
  }
})

type AmazonSearchResult = Awaited<ReturnType<typeof searchItems>>

type AmazonItemResult = Awaited<ReturnType<typeof getItem>>

app.get('/api/amazon-search', async (req: Request, res: Response) => {
  try {
    if (!isPaapiConfigured()) {
      return res.json({ items: [], fetchedAtISO: new Date().toISOString(), disabled: true })
    }
    const { q, page, minPrice, maxPrice, sort, prime } = req.query
    const keywords = String(q || '').trim()
    if (!keywords) return res.status(400).json({ error: 'Missing q (keywords)' })
    const key = `search:${keywords}:${page || 1}:${minPrice || ''}:${maxPrice || ''}:${sort || ''}:${prime || ''}`
    const cached = getCache<AmazonSearchResult>(key)
    if (cached) {
      res.set('Cache-Control', 'public, max-age=300')
      return res.json({ ...cached, cached: true })
    }
    const data = await searchItems({
      keywords,
      page: page ? Number(page) : 1,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sort: sort ? String(sort) : undefined,
      prime: prime === 'true',
    })
    setCache(key, data)
    res.set('Cache-Control', 'public, max-age=300')
    res.json(data)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500).json({ error: message })
  }
})

app.get('/api/amazon-item/:asin', async (req: Request, res: Response) => {
  try {
    if (!isPaapiConfigured()) {
      return res.json({ item: null, fetchedAtISO: new Date().toISOString(), disabled: true })
    }
    const asin = String(req.params.asin || '').trim()
    if (!asin) return res.status(400).json({ error: 'Missing asin' })
    const key = `item:${asin}`
    const cached = getCache<AmazonItemResult>(key)
    if (cached) {
      res.set('Cache-Control', 'public, max-age=600')
      return res.json({ ...cached, cached: true })
    }
    const data = await getItem(asin)
    setCache(key, data)
    res.set('Cache-Control', 'public, max-age=600')
    res.json(data)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500).json({ error: message })
  }
})

app.get('/api/performance/source', async (req: Request, res: Response) => {
  try {
    const daysParam = Number(req.query.days)
    const normalizedDays = Number.isFinite(daysParam)
      ? Math.min(Math.max(Math.round(daysParam), 1), 90)
      : 7

    const cacheKey = `perf_source:${normalizedDays}`
    const cached = getCache<{ days: number; generatedAt: string; rows: SourcePerformanceRow[] }>(
      cacheKey
    )
    if (cached) {
      res.set('Cache-Control', 'public, max-age=60')
      return res.json({ ...cached, cached: true })
    }

    const rows = await fetchSourcePerformance(normalizedDays)
    const payload = {
      days: normalizedDays,
      generatedAt: new Date().toISOString(),
      rows,
    }

    setCache(cacheKey, payload, 1000 * 60 * 5)
    res.set('Cache-Control', 'public, max-age=60')
    res.json(payload)
  } catch (error) {
    console.error('perf_source_error', error)
    res.status(500).json({ error: 'Failed to load source performance' })
  }
})

// 404 fallback voor alle overige /api routes
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' })
  }
  return res.status(404).send('Not found')
})

// Export 1st gen HTTPS function (upgrade to 2nd gen vereist aparte nieuwe naam / migratiepad)
export const api = functions.region('europe-west1').https.onRequest(app)

// Helper to escape HTML
function escapeHtml(str: string) {
  return str.replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string
  )
}

type SourcePerformanceRow = {
  sourceKey: string
  channel: string
  guideSlug?: string
  context?: string
  feed?: string
  impressions: number
  clicks: number
  ctr: number
  uniqueProducts: number
  lastEventISO?: string
}

async function fetchSourcePerformance(days: number): Promise<SourcePerformanceRow[]> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  const cutoffTimestamp = Timestamp.fromDate(cutoffDate)

  const snapshot = await firestore
    .collection(COLLECTION_EVENTS)
    .where('timestamp', '>=', cutoffTimestamp)
    .orderBy('timestamp', 'desc')
    .get()

  const buckets = new Map<string, SourceBucket>()

  snapshot.forEach((doc) => {
    const data = doc.data() as {
      productId?: string
      eventType?: string
      timestamp?: Timestamp
      source?: string
    }
    const sourceKey =
      typeof data.source === 'string' && data.source.trim().length > 0 ? data.source : 'unknown'
    const bucket = buckets.get(sourceKey) ?? {
      impressions: 0,
      clicks: 0,
      uniqueProducts: new Set<string>(),
    }

    if (data.eventType === 'impression') {
      bucket.impressions += 1
    } else if (data.eventType === 'click') {
      bucket.clicks += 1
    }

    if (data.productId) {
      bucket.uniqueProducts.add(String(data.productId))
    }

    const ts = data.timestamp?.toDate ? data.timestamp.toDate() : undefined
    if (ts && (!bucket.lastEvent || ts > bucket.lastEvent)) {
      bucket.lastEvent = ts
    }

    buckets.set(sourceKey, bucket)
  })

  return Array.from(buckets.entries())
    .map(([sourceKey, stats]) => {
      const parsed = parseSourceKey(sourceKey)
      const ctr = stats.impressions > 0 ? (stats.clicks / stats.impressions) * 100 : 0
      return {
        sourceKey,
        channel: parsed.channel,
        guideSlug: parsed.guideSlug,
        context: parsed.context,
        feed: parsed.feed,
        impressions: stats.impressions,
        clicks: stats.clicks,
        ctr: Number(ctr.toFixed(4)),
        uniqueProducts: stats.uniqueProducts.size,
        lastEventISO: stats.lastEvent?.toISOString(),
      }
    })
    .sort((a, b) => {
      if (b.clicks !== a.clicks) return b.clicks - a.clicks
      return b.impressions - a.impressions
    })
}

const PROGRAMMATIC_CONTEXTS = new Set(['grid', 'editor', 'editors', 'hero', 'schema-item-list'])

function parseSourceKey(sourceKey: string): {
  channel: string
  guideSlug?: string
  context?: string
  feed?: string
} {
  if (!sourceKey) return { channel: 'unknown' }

  const parts = sourceKey.split(':').filter(Boolean)
  const channel = parts.shift() || 'unknown'

  if (channel !== 'programmatic') {
    return {
      channel,
      context: parts.length ? parts.join(':') : undefined,
    }
  }

  const guideSlug = parts.shift()
  let context: string | undefined
  let feed: string | undefined

  if (parts.length === 1) {
    const token = parts[0]
    if (isKnownProgrammaticContext(token)) {
      context = token
    } else {
      feed = token
    }
  } else if (parts.length >= 2) {
    context = parts[0]
    feed = parts[parts.length - 1]
  }

  return { channel, guideSlug, context, feed }
}

function isKnownProgrammaticContext(value?: string): boolean {
  if (!value) return false
  return PROGRAMMATIC_CONTEXTS.has(value.toLowerCase())
}
