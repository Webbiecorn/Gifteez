import { CoolblueAffiliateService } from './coolblueAffiliateService';

export const AMAZON_ASSOCIATE_TAG = 'gifteez77-21';

/**
 * Add affiliate tracking to supported retailers
 * Supports Amazon.nl and Coolblue.nl (via Awin)
 */
const ensureAbsoluteUrl = (rawUrl: string): string => {
  if (!rawUrl) {
    return rawUrl;
  }

  const trimmed = rawUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  return `https://${trimmed.replace(/^\/+/, '')}`;
};

export function withAffiliate(url: string, campaign?: string): string {
  try {
    const absoluteUrl = ensureAbsoluteUrl(url);
    const u = new URL(absoluteUrl);
    
    // Handle Amazon affiliate links
    const isAmazonNl = /(^|\.)amazon\.nl$/i.test(u.hostname);
    if (isAmazonNl) {
      // already tagged?
      if (u.searchParams.has('tag')) return u.toString();
      u.searchParams.set('tag', AMAZON_ASSOCIATE_TAG);
      return u.toString();
    }
    
    // Handle Coolblue affiliate links via Awin
    if (CoolblueAffiliateService.isCoolblueUrl(url)) {
      // Don't double-wrap already converted Awin links
      if (CoolblueAffiliateService.isAwinLink(absoluteUrl)) {
        return absoluteUrl;
      }
      return campaign 
        ? CoolblueAffiliateService.generateCampaignUrl(absoluteUrl, campaign)
        : CoolblueAffiliateService.addAffiliateTracking(absoluteUrl);
    }
    
    // Return other URLs unchanged
    return absoluteUrl;
  } catch {
    return ensureAbsoluteUrl(url); // leave malformed URLs as-is but ensure scheme
  }
}

/**
 * Enhanced affiliate function with campaign tracking
 */
export function withAffiliateAndCampaign(url: string, campaign: string): string {
  return withAffiliate(url, campaign);
}
