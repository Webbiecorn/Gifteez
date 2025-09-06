export const AMAZON_ASSOCIATE_TAG = 'gifteez77-21';

/**
 * Append the Amazon associate tag to amazon.nl links when missing.
 * For non-Amazon links, returns the URL unchanged.
 */
export function withAffiliate(url: string): string {
  try {
    const u = new URL(url);
    const isAmazonNl = /(^|\.)amazon\.nl$/i.test(u.hostname);
    if (!isAmazonNl) {
      return withBolAffiliate(url);
    }
    // Route via our backend redirect to avoid blockers and ensure tag
  const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : '';
  // Prefer /api/visit (less likely to be blocked than "/out")
  const out = new URL('/api/visit', origin || 'https://gifteez.nl');
    out.searchParams.set('to', u.toString());
    return out.toString();
  } catch {
    return url; // leave malformed URLs as-is
  }
}

/**
 * Convert plain bol.com links to your affiliate redirect if configured.
 * Replace BOL_PARTNER_REDIRECT with your campaign URL (e.g., tradedoubler/impact link)
 * Example pattern:
 *   https://partner.bol.com/click/camref:CAMREFID/tp:.../?
 */
// Configure via .env: VITE_BOL_PARTNER_REDIRECT (leave empty until approved)
const BOL_PARTNER_REDIRECT = (import.meta as any).env?.VITE_BOL_PARTNER_REDIRECT || '';

export function withBolAffiliate(url: string): string {
  try {
    const u = new URL(url);
    const isBol = /(^|\.)bol\.com$/i.test(u.hostname);
    if (!isBol) return url;
    if (!BOL_PARTNER_REDIRECT) return url; // TODO: configure your bol partner redirect
    // Pass the destination as parameter if your network supports it, else rebuild according to network spec
    const out = new URL(BOL_PARTNER_REDIRECT);
    // Common networks allow a destination parameter; adapt the param name as needed
    out.searchParams.set('dest', u.toString());
    return out.toString();
  } catch {
    return url;
  }
}
