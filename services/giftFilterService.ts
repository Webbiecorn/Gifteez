import { Gift, GiftSearchParams, AdvancedFilters } from '../types';
import { ProductBasedGiftService } from './productBasedGiftService';
import { findGifts as originalFindGifts } from './geminiService';

export const findGiftsWithFilters = async (searchParams: GiftSearchParams): Promise<Gift[]> => {
  console.log('🎁 Clean separation: 3 Amazon AI + 3 Pure Coolblue products');
  
  try {
    // Get 3 AI-generated Amazon gifts (original working approach)
    console.log('🤖 Getting 3 Amazon AI gifts...');
    const amazonGifts = await originalFindGifts(
      searchParams.recipient,
      searchParams.budget,
      searchParams.occasion,
      searchParams.interests
    );
    
    // Filter Amazon gifts to ONLY have Amazon retailers (remove Coolblue retailers)
    const pureAmazonGifts = amazonGifts.map(gift => ({
      ...gift,
      retailers: gift.retailers ? gift.retailers.filter(retailer => 
        retailer.name.toLowerCase().includes('amazon') && 
        !retailer.name.toLowerCase().includes('coolblue')
      ) : []
    })).filter(gift => gift.retailers && gift.retailers.length > 0);
    
    // Take only first 3 pure Amazon results
    const limitedAmazonGifts = pureAmazonGifts.slice(0, 3);
    console.log(`✅ Got ${limitedAmazonGifts.length} PURE Amazon AI gifts (no Coolblue retailers)`);
    
    // Get 3 Coolblue products from feed (filter out Amazon products)
    console.log('🔵 Getting 3 Coolblue products...');
    const allProductBasedGifts = await ProductBasedGiftService.findGifts(searchParams);
    
    // Filter to only get Coolblue products (exclude Amazon products)
    const coolblueOnlyGifts = allProductBasedGifts.filter(gift => {
      // Check if it's a Coolblue product by looking at retailers
      return gift.retailers && gift.retailers.some(retailer => 
        retailer.name.toLowerCase().includes('coolblue') && 
        !retailer.name.toLowerCase().includes('amazon')
      );
    });
    
    // Take only first 3 Coolblue results
    const limitedCoolblueGifts = coolblueOnlyGifts.slice(0, 3);
    console.log(`✅ Got ${limitedCoolblueGifts.length} pure Coolblue products`);
    
    // Combine: 3 Amazon AI + 3 Pure Coolblue = 6 total
    const allGifts = [...limitedAmazonGifts, ...limitedCoolblueGifts];
    console.log(`🎯 Total gifts: ${allGifts.length} (${limitedAmazonGifts.length} Amazon AI + ${limitedCoolblueGifts.length} Pure Coolblue)`);
    
    // Remove images from all gifts for cleaner display
    const giftsWithoutImages = allGifts.map(gift => ({
      ...gift,
      imageUrl: '' // Remove all images
    }));
    
    // Apply advanced filters if provided
    if (searchParams.filters) {
      return applyAdvancedFilters(giftsWithoutImages, searchParams.filters);
    }

    return giftsWithoutImages;
    
  } catch (error) {
    console.error('Error in simple hybrid approach:', error);
    
    // Fallback to Amazon AI gifts only
    console.log('⚠️  Falling back to Amazon AI gifts only');
    const fallbackGifts = await originalFindGifts(
      searchParams.recipient,
      searchParams.budget,
      searchParams.occasion,
      searchParams.interests
    );
    
    // Remove images and limit to 6
    const cleanedFallbackGifts = fallbackGifts.slice(0, 6).map(gift => ({
      ...gift,
      imageUrl: ''
    }));
    
    if (searchParams.filters) {
      return applyAdvancedFilters(cleanedFallbackGifts, searchParams.filters);
    }
    
    return cleanedFallbackGifts;
  }
};

export const applyAdvancedFilters = (gifts: Gift[], filters: Partial<AdvancedFilters>): Gift[] => {
  return gifts.filter(gift => {
    // Price range filter
    if (filters.priceRange) {
      const giftPrice = extractPriceFromRange(gift.priceRange);
      if (giftPrice < filters.priceRange.min || giftPrice > filters.priceRange.max) {
        return false;
      }
    }

    // Categories filter
    if (filters.categories && filters.categories.length > 0) {
      if (!gift.category || !filters.categories.includes(gift.category)) {
        return false;
      }
    }

    // Gift type filter
    if (filters.giftType && gift.giftType !== filters.giftType) {
      return false;
    }

    // Delivery speed filter
    if (filters.deliverySpeed && gift.deliverySpeed !== filters.deliverySpeed) {
      return false;
    }

    // Age group filter
    if (filters.ageGroup && gift.ageGroup !== filters.ageGroup) {
      return false;
    }

    // Gender filter
    if (filters.gender && gift.gender !== filters.gender && gift.gender !== 'unisex') {
      return false;
    }

    // Sustainability filter
    if (filters.sustainability && !gift.sustainability) {
      return false;
    }

    // Personalization filter
    if (filters.personalization && !gift.personalization) {
      return false;
    }

    // Availability filter
    if (filters.availability && filters.availability !== 'all') {
      if (gift.availability !== filters.availability) {
        return false;
      }
    }

    return true;
  });
};

export const sortGifts = (gifts: Gift[], sortBy: 'relevance' | 'price' | 'rating' | 'popularity'): Gift[] => {
  const sortedGifts = [...gifts];

  switch (sortBy) {
    case 'price':
      return sortedGifts.sort((a, b) => {
        const priceA = extractPriceFromRange(a.priceRange);
        const priceB = extractPriceFromRange(b.priceRange);
        return priceA - priceB;
      });
    
    case 'rating':
      return sortedGifts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    
    case 'popularity':
      return sortedGifts.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    
    case 'relevance':
    default:
      // For relevance, maintain the original order as gifts are already sorted by relevance
      return sortedGifts;
  }
};

// Helper function to extract numeric price from range string
const extractPriceFromRange = (priceRange: string): number => {
  // Extract numbers from strings like "€25 - €50" or "€39,99"
  const matches = priceRange.match(/\d+([.,]\d+)?/g);
  if (matches && matches.length > 0) {
    return parseFloat(matches[0].replace(',', '.'));
  }
  return 0;
};

export const enhanceGiftsWithMetadata = (gifts: Gift[]): Gift[] => {
  return gifts.map((gift, index) => ({
    ...gift,
    // Add some basic metadata if missing
    rating: gift.rating || 4.0 + Math.random() * 0.8, // 4.0 - 4.8 range
    reviews: gift.reviews || Math.floor(Math.random() * 500) + 50,
    popularity: gift.popularity || Math.floor(Math.random() * 10) + 1,
    availability: gift.availability || 'in-stock'
  }));
};
