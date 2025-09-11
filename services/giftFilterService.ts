import { Gift, GiftSearchParams, AdvancedFilters } from '../types';
import { findGifts as originalFindGifts } from './geminiService';

export const findGiftsWithFilters = async (searchParams: GiftSearchParams): Promise<Gift[]> => {
  // First get the base gifts from the AI service
  let gifts = await originalFindGifts(
    searchParams.recipient,
    searchParams.budget,
    searchParams.occasion,
    searchParams.interests
  );

  // Apply advanced filters if provided
  if (searchParams.filters) {
    gifts = applyAdvancedFilters(gifts, searchParams.filters);
  }

  return gifts;
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
      return sortedGifts; // Keep original order from AI
  }
};

export const extractPriceFromRange = (priceRange: string): number => {
  // Extract numeric value from price range string (e.g., "€25-50" -> 37.5)
  const matches = priceRange.match(/(\d+)(?:-(\d+))?/);
  if (!matches) return 0;
  
  const min = parseInt(matches[1]);
  const max = matches[2] ? parseInt(matches[2]) : min;
  
  return (min + max) / 2; // Return average
};

export const enhanceGiftsWithMetadata = (gifts: Gift[]): Gift[] => {
  // This function would enhance gifts with additional metadata
  // In a real implementation, this might call external APIs or use a database
  return gifts.map(gift => ({
    ...gift,
    // Add default metadata if not present
    category: gift.category || categorizeGift(gift),
    rating: gift.rating || Math.random() * 2 + 3, // Random rating 3-5
    reviews: gift.reviews || Math.floor(Math.random() * 500) + 50,
    deliverySpeed: gift.deliverySpeed || 'standard',
    giftType: gift.giftType || 'physical',
    sustainability: gift.sustainability || Math.random() > 0.7,
    personalization: gift.personalization || Math.random() > 0.8,
    ageGroup: gift.ageGroup || '',
    gender: gift.gender || 'unisex',
    popularity: gift.popularity || Math.random() * 100,
    availability: gift.availability || 'in-stock',
    tags: gift.tags || generateTags(gift)
  }));
};

const categorizeGift = (gift: Gift): string => {
  const name = gift.productName.toLowerCase();
  const description = gift.description.toLowerCase();
  const text = `${name} ${description}`;

  if (text.includes('boek') || text.includes('lezen')) return 'Boeken & Media';
  if (text.includes('tech') || text.includes('elektronisch') || text.includes('gadget')) return 'Elektronica';
  if (text.includes('kleding') || text.includes('mode') || text.includes('accessoire')) return 'Mode & Accessoires';
  if (text.includes('sport') || text.includes('fitness') || text.includes('gym')) return 'Sport & Fitness';
  if (text.includes('huis') || text.includes('tuin') || text.includes('interieur')) return 'Huis & Tuin';
  if (text.includes('eten') || text.includes('drinken') || text.includes('koken')) return 'Voeding & Drinken';
  if (text.includes('wellness') || text.includes('beauty') || text.includes('verzorging')) return 'Wellness & Beauty';
  if (text.includes('reis') || text.includes('ervaring') || text.includes('activiteit')) return 'Reizen & Ervaringen';
  if (text.includes('kunst') || text.includes('cultuur') || text.includes('muziek')) return 'Kunst & Cultuur';
  
  return 'Hobby & Vrije tijd';
};

const generateTags = (gift: Gift): string[] => {
  const tags: string[] = [];
  const text = `${gift.productName} ${gift.description}`.toLowerCase();

  // Common tags based on content
  if (text.includes('luxe') || text.includes('premium')) tags.push('luxe');
  if (text.includes('handgemaakt') || text.includes('artisaan')) tags.push('handgemaakt');
  if (text.includes('vintage') || text.includes('retro')) tags.push('vintage');
  if (text.includes('modern') || text.includes('contemporary')) tags.push('modern');
  if (text.includes('grappig') || text.includes('humor')) tags.push('grappig');
  if (text.includes('romantisch') || text.includes('liefde')) tags.push('romantisch');
  if (text.includes('praktisch') || text.includes('nuttig')) tags.push('praktisch');
  if (text.includes('uniek') || text.includes('bijzonder')) tags.push('uniek');

  return tags;
};
