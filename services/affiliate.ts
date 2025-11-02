import { CoolblueAffiliateService } from './coolblueAffiliateService'

export const AMAZON_ASSOCIATE_TAG = 'gifteez77-21'

// Context used to enrich affiliate links with tracking metadata
export interface AffiliateContext {
  retailer?: string
  pageType?: string
  theme?: string
  placement?: string
  cardIndex?: number
  abVariant?: string
}

/**
 * Add affiliate tracking to supported retailers
 * Supports Amazon.nl and Coolblue.nl (via Awin)
 */
const ensureAbsoluteUrl = (rawUrl: string): string => {
  if (!rawUrl) {
    return rawUrl
  }

  const trimmed = rawUrl.trim()
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`
  }

  return `https://${trimmed.replace(/^\/+/, '')}`
}

// Build SubID / clickref following the agreed spec: site|pageType|theme|placement|idx|abV
const buildClickRef = (ctx?: AffiliateContext): string => {
  const site = 'gifteez'
  const pageType = ctx?.pageType || 'unknown'
  const theme = ctx?.theme || 'na'
  const placement = ctx?.placement || 'na'
  const idxNum = typeof ctx?.cardIndex === 'number' ? ctx!.cardIndex! : 0
  const idx = String(idxNum).padStart(2, '0')
  const abV = ctx?.abVariant || 'na'
  return `${site}|${pageType}|${theme}|${placement}|${idx}|${abV}`
}

const appendUtms = (u: URL, ctx?: AffiliateContext) => {
  // Conservative UTM usage (avoid for Amazon policies)
  const utmSource = 'gifteez'
  const utmMedium = 'affiliate'
  const utmCampaign = ctx?.pageType || 'site'
  if (!u.searchParams.has('utm_source')) u.searchParams.set('utm_source', utmSource)
  if (!u.searchParams.has('utm_medium')) u.searchParams.set('utm_medium', utmMedium)
  if (!u.searchParams.has('utm_campaign')) u.searchParams.set('utm_campaign', utmCampaign)
}

const saveLastClick = (ctx?: AffiliateContext) => {
  try {
    if (typeof window === 'undefined') return
    const payload = {
      retailer: ctx?.retailer || 'unknown',
      pageType: ctx?.pageType || 'unknown',
      theme: ctx?.theme || 'na',
      placement: ctx?.placement || 'na',
      cardIndex: typeof ctx?.cardIndex === 'number' ? ctx!.cardIndex! : 0,
      abVariant: ctx?.abVariant || 'na',
      ts: Date.now(),
    }
    window.localStorage?.setItem('attribution:lastClick', JSON.stringify(payload))
  } catch {
    // ignore storage errors
  }
}

// Backward-compatible signature: second param may be a campaign string or a rich context
export function withAffiliate(url: string, campaignOrContext?: string | AffiliateContext): string {
  try {
    const absoluteUrl = ensureAbsoluteUrl(url)
    const u = new URL(absoluteUrl)
    const ctx: AffiliateContext | undefined =
      typeof campaignOrContext === 'object' ? (campaignOrContext as AffiliateContext) : undefined
    const campaign: string | undefined =
      typeof campaignOrContext === 'string' ? (campaignOrContext as string) : undefined

    // Handle Amazon affiliate links
    const isAmazonNl = /(^|\.)amazon\.nl$/i.test(u.hostname)
    if (isAmazonNl) {
      // already tagged?
      if (u.searchParams.has('tag')) return u.toString()
      u.searchParams.set('tag', AMAZON_ASSOCIATE_TAG)
      // Avoid UTM on Amazon unless explicitly desired — skip
      if (ctx) saveLastClick({ ...ctx, retailer: ctx.retailer || 'amazon' })
      return u.toString()
    }

    // Handle Coolblue affiliate links via Awin
    if (CoolblueAffiliateService.isCoolblueUrl(url)) {
      // Don't double-wrap already converted Awin links
      if (CoolblueAffiliateService.isAwinLink(absoluteUrl)) {
        return absoluteUrl
      }
      const clickRef = ctx ? buildClickRef(ctx) : campaign ? `gifteez-${campaign}` : undefined
      const wrapped = campaign
        ? CoolblueAffiliateService.generateCampaignUrl(absoluteUrl, campaign)
        : CoolblueAffiliateService.addAffiliateTracking(absoluteUrl, clickRef)
      if (ctx) saveLastClick({ ...ctx, retailer: ctx.retailer || 'coolblue' })
      return wrapped
    }

    // Return other URLs unchanged
    // Optionally add UTM for other retailers
    if (ctx) {
      appendUtms(u, ctx)
      saveLastClick(ctx)
    }
    return u.toString()
  } catch {
    return ensureAbsoluteUrl(url) // leave malformed URLs as-is but ensure scheme
  }
}

/**
 * Enhanced affiliate function with campaign tracking
 */
export function withAffiliateAndCampaign(url: string, campaign: string): string {
  return withAffiliate(url, campaign)
}
