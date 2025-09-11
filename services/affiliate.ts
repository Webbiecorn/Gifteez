import { CoolblueAffiliateService } from './coolblueAffiliateService';

export const AMAZON_ASSOCIATE_TAG = 'gifteez77-21';

/**
 * Add affiliate tracking to supported retailers
 * Supports Amazon.nl and Coolblue.nl (via Awin)
 */
export function withAffiliate(url: string, campaign?: string): string {
  try {
    const u = new URL(url);
    
    // Handle Amazon affiliate links
    const isAmazonNl = /(^|\.)amazon\.nl$/i.test(u.hostname);
    if (isAmazonNl) {
      // already tagged?
      if (u.searchParams.has('tag')) return url;
      u.searchParams.set('tag', AMAZON_ASSOCIATE_TAG);
      return u.toString();
    }
    
    // Handle Coolblue affiliate links via Awin
    if (CoolblueAffiliateService.isCoolblueUrl(url)) {
      // Don't double-wrap already converted Awin links
      if (CoolblueAffiliateService.isAwinLink(url)) {
        return url;
      }
      return campaign 
        ? CoolblueAffiliateService.generateCampaignUrl(url, campaign)
        : CoolblueAffiliateService.addAffiliateTracking(url);
    }
    
    // Return other URLs unchanged
    return url;
  } catch {
    return url; // leave malformed URLs as-is
  }
}

/**
 * Enhanced affiliate function with campaign tracking
 */
export function withAffiliateAndCampaign(url: string, campaign: string): string {
  return withAffiliate(url, campaign);
}
