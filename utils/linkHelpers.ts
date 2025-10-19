/**
 * Helper function to generate proper affiliate link attributes
 * Ensures Google compliance: sponsored + nofollow
 * Security: noopener + noreferrer
 */

export interface AffiliateLinkProps {
  href: string;
  target: '_blank';
  rel: 'sponsored nofollow noopener noreferrer';
  'aria-label'?: string;
}

/**
 * Get standard props for affiliate links
 * Use this for all external affiliate/partner links
 * 
 * @param url - The affiliate URL
 * @param label - Optional aria-label for accessibility
 * @returns Props object to spread on <a> tag
 * 
 * @example
 * <a {...getAffiliateLinkProps(product.affiliateLink, 'Bekijk product')}>
 *   Bekijk deal
 * </a>
 */
export function getAffiliateLinkProps(
  url: string,
  label?: string
): AffiliateLinkProps {
  const props: AffiliateLinkProps = {
    href: url,
    target: '_blank',
    rel: 'sponsored nofollow noopener noreferrer',
  };

  if (label) {
    props['aria-label'] = label;
  }

  return props;
}

/**
 * Get props for regular external links (non-affiliate)
 * No sponsored/nofollow needed
 */
export interface ExternalLinkProps {
  href: string;
  target: '_blank';
  rel: 'noopener noreferrer';
  'aria-label'?: string;
}

export function getExternalLinkProps(
  url: string,
  label?: string
): ExternalLinkProps {
  const props: ExternalLinkProps = {
    href: url,
    target: '_blank',
    rel: 'noopener noreferrer',
  };

  if (label) {
    props['aria-label'] = label;
  }

  return props;
}

/**
 * Check if URL is an affiliate link
 * Based on known affiliate patterns
 */
export function isAffiliateLink(url: string): boolean {
  const affiliatePatterns = [
    'amazon',
    'bol.com',
    'coolblue',
    'awin1.com',
    'dwin1.com',
    'partnerize',
    'prf.hn', // Partnerize
    'slygad.com',
    'shop-like-you-give-a-damn',
  ];

  const lowerUrl = url.toLowerCase();
  return affiliatePatterns.some(pattern => lowerUrl.includes(pattern));
}

/**
 * Auto-detect and return appropriate link props
 * Use when you're not sure if link is affiliate or not
 */
export function getSmartLinkProps(
  url: string,
  label?: string
): AffiliateLinkProps | ExternalLinkProps {
  if (isAffiliateLink(url)) {
    return getAffiliateLinkProps(url, label);
  }
  return getExternalLinkProps(url, label);
}
