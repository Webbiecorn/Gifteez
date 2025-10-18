// Service to filter gifts for affiliate retailers only
import { Gift } from '../types';

// List of retailers we have affiliate partnerships with
const AFFILIATE_RETAILERS = ['amazon', 'coolblue', 'shop like you give a damn', 'slygad'];

/**
 * Check if a retailer name matches our affiliate partners
 */
function isAffiliateRetailer(retailerName: string): boolean {
  const name = retailerName.toLowerCase();
  return AFFILIATE_RETAILERS.some(affiliate => name.includes(affiliate));
}

/**
 * Validate and fix retailer URLs to ensure they work properly
 */
function validateAndFixRetailerUrl(retailer: { name: string; affiliateLink: string }, productName: string): { name: string; affiliateLink: string } {
  const name = retailer.name.toLowerCase();
  
  // Create search-friendly product keywords
  const searchKeywords = productName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '+'); // Replace spaces with +
  
  // Fix Coolblue URLs
  if (name.includes('coolblue')) {
    if (!retailer.affiliateLink.includes('coolblue.nl') || retailer.affiliateLink.includes('product/') && !retailer.affiliateLink.includes('zoeken')) {
      return {
        name: 'Coolblue',
        affiliateLink: `https://www.coolblue.nl/zoeken?query=${searchKeywords}`
      };
    }
  }
  
  // Fix Amazon URLs
  if (name.includes('amazon')) {
    if (!retailer.affiliateLink.includes('amazon.nl') || (!retailer.affiliateLink.includes('/s?k=') && !retailer.affiliateLink.includes('/dp/'))) {
      return {
        name: 'Amazon',
        affiliateLink: `https://www.amazon.nl/s?k=${searchKeywords}`
      };
    }
  }

  // Fix Shop Like You Give A Damn URLs
  if (name.includes('shop like you give a damn') || name.includes('slygad')) {
    if (!retailer.affiliateLink.includes('shoplikeyougiveadamn')) {
      return {
        name: 'Shop Like You Give A Damn',
        affiliateLink: `https://www.shoplikeyougiveadamn.com/search?q=${searchKeywords}`
      };
    }
  }
  
  return retailer;
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
    return gift.retailers.some(retailer => isAffiliateRetailer(retailer.name));
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
    .filter(retailer => isAffiliateRetailer(retailer.name))
    .map(retailer => validateAndFixRetailerUrl(retailer, gift.productName));

  return {
    ...gift,
    retailers: affiliateRetailers
  };
}

/**
 * Add fallback retailers if none are present
 */
function addFallbackRetailers(gift: Gift): Gift {
  if (gift.retailers && gift.retailers.length > 0) {
    return gift; // Already has retailers
  }

  // Create search-friendly product keywords
  const searchKeywords = gift.productName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '+'); // Replace spaces with +

  const fallbackRetailers = [
    {
      name: 'Amazon',
      affiliateLink: `https://www.amazon.nl/s?k=${searchKeywords}`
    },
    {
      name: 'Coolblue',
      affiliateLink: `https://www.coolblue.nl/zoeken?query=${searchKeywords}`
    },
    {
      name: 'Shop Like You Give A Damn',
      affiliateLink: `https://www.shoplikeyougiveadamn.com/search?q=${searchKeywords}`
    }
  ];

  return {
    ...gift,
    retailers: fallbackRetailers
  };
}

/**
 * Filter all gifts and their retailers to only include affiliate partners
 */
export function processGiftsForAffiliateOnly(gifts: Gift[]): Gift[] {
  return gifts
    .map(addFallbackRetailers) // Add fallback retailers if none present
    .map(filterGiftRetailersToAffiliateOnly) // Remove non-affiliate retailers and fix URLs
    .filter(gift => gift.retailers && gift.retailers.length > 0); // Keep only gifts with remaining retailers
}
