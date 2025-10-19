// Service to filter gifts for affiliate retailers only
import { Gift } from '../types';

// List of retailers we have affiliate partnerships with
const AFFILIATE_RETAILERS = ['amazon', 'coolblue', 'shop like you give a damn', 'shoplikeyougiveadamn', 'slygad'];

/**
 * Check if a retailer name matches our affiliate partners
 */
function isAffiliateRetailer(retailerName: string): boolean {
  if (!retailerName) {
    return false;
  }

  const name = retailerName.toLowerCase();
  const condensedName = name.replace(/[^a-z0-9]/g, '');

  return AFFILIATE_RETAILERS.some(affiliate => {
    const condensedAffiliate = affiliate.replace(/[^a-z0-9]/g, '');
    return name.includes(affiliate) || condensedName.includes(condensedAffiliate);
  });
}

/**
 * Validate and fix retailer URLs to ensure they work properly
 */
function validateAndFixRetailerUrl(retailer: { name: string; affiliateLink: string }, productName: string): { name: string; affiliateLink: string } {
  const safeName = retailer.name?.trim() || 'Amazon';
  const name = safeName.toLowerCase();
  const rawLink = retailer.affiliateLink?.trim() || '';
  const link = rawLink.toLowerCase();

  const searchKeywords = productName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '+');

  if (name.includes('coolblue')) {
    if (!link.includes('coolblue.nl') || (link.includes('/product/') && !link.includes('/zoeken'))) {
      return {
        name: 'Coolblue',
        affiliateLink: `https://www.coolblue.nl/zoeken?query=${searchKeywords}`
      };
    }
  }

  if (name.includes('amazon')) {
    if (!link.includes('amazon.nl') || (!link.includes('/s?k=') && !link.includes('/dp/'))) {
      return {
        name: 'Amazon',
        affiliateLink: `https://www.amazon.nl/s?k=${searchKeywords}`
      };
    }
  }

  if (name.includes('shop like you give a damn') || name.includes('shoplikeyougiveadamn') || name.includes('slygad')) {
    if (!link.includes('shoplikeyougiveadamn')) {
      return {
        name: 'Shop Like You Give A Damn',
        affiliateLink: `https://www.shoplikeyougiveadamn.com/search?q=${searchKeywords}`
      };
    }
  }

  if (!rawLink) {
    return {
      name: safeName,
      affiliateLink: `https://www.amazon.nl/s?k=${searchKeywords}`
    };
  }

  return {
    name: safeName,
    affiliateLink: retailer.affiliateLink
  };
}

/**
 * Filter gifts to only include those with affiliate retailers
 */
export function filterGiftsWithAffiliateRetailers(gifts: Gift[]): Gift[] {
  return gifts.filter(gift => {
    // Check if gift has retailers
    if (!gift.retailers || gift.retailers.length === 0) {
      return false;
    }

    // Check if at least one retailer is an affiliate partner
    return gift.retailers.some(retailer => retailer?.name && isAffiliateRetailer(retailer.name));
  });
}

/**
 * Filter a single gift's retailers to only include affiliate partners and fix URLs
 */
export function filterGiftRetailersToAffiliateOnly(gift: Gift): Gift {
  if (!gift.retailers || gift.retailers.length === 0) {
    return gift;
  }

  const affiliateRetailers = gift.retailers
    .filter(retailer => retailer?.name && isAffiliateRetailer(retailer.name))
    .map(retailer => validateAndFixRetailerUrl(retailer, gift.productName))
    .filter(retailer => Boolean(retailer.affiliateLink));

  const uniqueRetailers = affiliateRetailers.filter((retailer, index, array) =>
    array.findIndex(entry => entry.name.toLowerCase() === retailer.name.toLowerCase()) === index
  );

  return {
    ...gift,
    retailers: uniqueRetailers
  };
}

/**
 * Add fallback retailers if none are present
 */
function buildFallbackRetailers(productName: string, includeSlygad: boolean): { name: string; affiliateLink: string }[] {
  const searchKeywords = productName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '+');

  const retailers = [
    {
      name: 'Amazon',
      affiliateLink: `https://www.amazon.nl/s?k=${searchKeywords}`
    },
    {
      name: 'Coolblue',
      affiliateLink: `https://www.coolblue.nl/zoeken?query=${searchKeywords}`
    }
  ];

  if (includeSlygad) {
    retailers.push({
      name: 'Shop Like You Give A Damn',
      affiliateLink: `https://www.shoplikeyougiveadamn.com/search?q=${searchKeywords}`
    });
  }

  return retailers;
}

function addFallbackRetailers(gift: Gift): Gift {
  const existingRetailers = (gift.retailers || []).filter(retailer => retailer?.name && retailer.affiliateLink);
  const hasAffiliate = existingRetailers.some(retailer => isAffiliateRetailer(retailer.name));

  if (hasAffiliate) {
    return {
      ...gift,
      retailers: existingRetailers
    };
  }

  const includeSlygad = Boolean(gift.sustainability);
  const fallbackRetailers = buildFallbackRetailers(gift.productName, includeSlygad);

  return {
    ...gift,
    retailers: fallbackRetailers
  };
}

/**
 * Filter all gifts and their retailers to only include affiliate partners
 */
export function processGiftsForAffiliateOnly(gifts: Gift[]): Gift[] {
  return gifts.map(originalGift => {
    const withFallback = addFallbackRetailers(originalGift);
    const affiliateOnly = filterGiftRetailersToAffiliateOnly(withFallback);

    if (!affiliateOnly.retailers || affiliateOnly.retailers.length === 0) {
      const includeSlygad = Boolean(affiliateOnly.sustainability);
      const fallbackRetailers = buildFallbackRetailers(affiliateOnly.productName, includeSlygad)
        .map(retailer => validateAndFixRetailerUrl(retailer, affiliateOnly.productName));

      return {
        ...affiliateOnly,
        retailers: fallbackRetailers
      };
    }

    return affiliateOnly;
  });
}
