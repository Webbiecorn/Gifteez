export const AMAZON_ASSOCIATE_TAG = 'gifteez77-21';

/**
 * Append the Amazon associate tag to amazon.nl links when missing.
 * For non-Amazon links, returns the URL unchanged.
 */
export function withAffiliate(url: string): string {
  try {
    const u = new URL(url);
    const isAmazonNl = /(^|\.)amazon\.nl$/i.test(u.hostname);
    if (!isAmazonNl) return url;
    // already tagged?
    if (u.searchParams.has('tag')) return url;
    u.searchParams.set('tag', AMAZON_ASSOCIATE_TAG);
    return u.toString();
  } catch {
    return url; // leave malformed URLs as-is
  }
}
