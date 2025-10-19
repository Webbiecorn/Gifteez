import { Gift, GiftSearchParams, AdvancedFilters } from '../types';
import { ProductBasedGiftService } from './productBasedGiftService';
import { findGifts as originalFindGifts } from './geminiService';

const MAX_RESULT_COUNT = 6;
const MIN_PARTNER_RESULTS = 3;
const MIN_SLYGAD_RESULTS = 3;

const normalizeRetailerName = (name?: string): string => (name ? name.toLowerCase() : '');

const parseRelevanceScore = (gift: Gift): number => {
  if (typeof gift.relevanceScore === 'number' && Number.isFinite(gift.relevanceScore)) {
    return gift.relevanceScore;
  }

  const tagScore = gift.tags?.length ? parseFloat(gift.tags[0]) : NaN;
  return Number.isFinite(tagScore) ? tagScore : 0;
};

const computePartnerScore = (gift: Gift): number => {
  let score = parseRelevanceScore(gift);

  if (gift.availability === 'in-stock') {
    score += 1.5;
  }

  if (gift.sustainability) {
    score += 1;
  }

  if (gift.personalization) {
    score += 0.5;
  }

  if ((gift.rating || 0) >= 4.5) {
    score += 0.5;
  }

  if (gift.popularity) {
    score += Math.min(gift.popularity, 5) * 0.1;
  }

  return score;
};

type PartnerGroups = {
  coolblue: Gift[];
  slygad: Gift[];
  other: Gift[];
};

const buildPartnerGroups = (gifts: Gift[], usedNames: Set<string>): PartnerGroups => {
  const groups: PartnerGroups = {
    coolblue: [],
    slygad: [],
    other: []
  };
  const seen = new Set<string>();

  gifts.forEach(gift => {
    if (!gift?.productName || !gift.retailers || gift.retailers.length === 0) {
      return;
    }

    if (usedNames.has(gift.productName)) {
      return;
    }

    const primaryRetailer = normalizeRetailerName(gift.retailers[0]?.name);
    if (!primaryRetailer || primaryRetailer.includes('amazon')) {
      return;
    }

    const uniqueKey = `${primaryRetailer}|${gift.productName}`;
    if (seen.has(uniqueKey)) {
      return;
    }
    seen.add(uniqueKey);

    if (primaryRetailer.includes('shop like you give a damn') || primaryRetailer.includes('slygad')) {
      groups.slygad.push(gift);
      return;
    }

    if (primaryRetailer.includes('coolblue')) {
      groups.coolblue.push(gift);
      return;
    }

    groups.other.push(gift);
  });

  return groups;
};

interface PartnerGroupState {
  id: 'coolblue' | 'slygad' | 'other';
  weight: number;
  base: number;
  items: { gift: Gift; score: number }[];
  index: number;
}

const initialiseGroupStates = (
  groups: PartnerGroups,
  preferredPartner: AdvancedFilters['preferredPartner']
): PartnerGroupState[] => {
  const states: PartnerGroupState[] = [];

  const createState = (
    id: PartnerGroupState['id'],
    items: Gift[],
    base: number,
    weight: number
  ) => {
    if (!items.length) {
      return;
    }

    states.push({
      id,
      base,
      weight,
      index: 0,
      items: items
        .map(gift => ({ gift, score: computePartnerScore(gift) }))
        .sort((a, b) => b.score - a.score)
    });
  };

  createState(
    'slygad',
    groups.slygad,
    preferredPartner === 'sustainable' ? 2 : 1,
    preferredPartner === 'sustainable' ? 1.8 : 1.3
  );

  createState('coolblue', groups.coolblue, 1, 1.2);
  createState('other', groups.other, 0, 1);

  return states;
};

const selectPartnerGifts = (
  groups: PartnerGroups,
  desiredCount: number,
  preferredPartner: AdvancedFilters['preferredPartner'],
  usedNames: Set<string>
): Gift[] => {
  const selected: Gift[] = [];
  let remaining = Math.max(desiredCount, 0);

  if (remaining === 0) {
    return selected;
  }

  const slygadRanking = groups.slygad
    .filter(gift => !usedNames.has(gift.productName))
    .map(gift => ({ gift, score: computePartnerScore(gift) }))
    .sort((a, b) => b.score - a.score);

  const guaranteedSlygadCount = Math.min(
    MIN_SLYGAD_RESULTS,
    slygadRanking.length,
    remaining
  );

  if (guaranteedSlygadCount > 0) {
    const guaranteedNames = new Set<string>();
    slygadRanking.slice(0, guaranteedSlygadCount).forEach(entry => {
      selected.push(entry.gift);
      usedNames.add(entry.gift.productName);
      guaranteedNames.add(entry.gift.productName);
      remaining -= 1;
    });

    if (guaranteedNames.size > 0) {
      groups.slygad = groups.slygad.filter(gift => !guaranteedNames.has(gift.productName));
    }
  }

  const states = initialiseGroupStates(groups, preferredPartner);

  const consumeFromState = (state: PartnerGroupState) => {
    const entry = state.items[state.index];
    if (!entry) {
      return false;
    }

    state.index += 1;
    selected.push(entry.gift);
    usedNames.add(entry.gift.productName);
    remaining -= 1;
    return true;
  };

  states.forEach(state => {
    const baseTake = Math.min(state.base, state.items.length, remaining);
    for (let i = 0; i < baseTake; i += 1) {
      consumeFromState(state);
    }
  });

  while (remaining > 0) {
    const candidates = states
      .map(state => {
        const next = state.items[state.index];
        if (!next) {
          return null;
        }
        return {
          state,
          weightedScore: next.score * state.weight
        };
      })
      .filter(Boolean) as { state: PartnerGroupState; weightedScore: number }[];

    if (candidates.length === 0) {
      break;
    }

    candidates.sort((a, b) => b.weightedScore - a.weightedScore);
    consumeFromState(candidates[0].state);
  }

  if (remaining > 0) {
    const leftovers = [...groups.slygad, ...groups.coolblue, ...groups.other]
      .filter(gift => !usedNames.has(gift.productName))
      .map(gift => ({ gift, score: computePartnerScore(gift) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, remaining);

    leftovers.forEach(entry => {
      selected.push(entry.gift);
      usedNames.add(entry.gift.productName);
      remaining -= 1;
    });
  }

  return selected;
};

export const findGiftsWithFilters = async (searchParams: GiftSearchParams): Promise<Gift[]> => {
  console.log('🎁 GiftFinder zoekt cadeaus met dynamische partnerbalans', searchParams);

  try {
    console.log('🤖 Haal Amazon AI suggesties op...');
    const amazonGifts = await originalFindGifts(
      searchParams.recipient,
      searchParams.budget,
      searchParams.occasion,
      searchParams.interests
    );

    const pureAmazonGifts = amazonGifts
      .map(gift => ({
        ...gift,
        retailers: gift.retailers
          ? gift.retailers.filter(retailer => {
              const name = normalizeRetailerName(retailer.name);
              return name.includes('amazon') && !name.includes('coolblue');
            })
          : []
      }))
      .filter(gift => gift.retailers && gift.retailers.length > 0);

    const limitedAmazonGifts = pureAmazonGifts.slice(0, 3);
    console.log(`✅ Amazon AI cadeaus: ${limitedAmazonGifts.length}`);

    console.log('🤝 Verzamel partnercadeaus (Coolblue, Shop Like You Give A Damn, ... )');
    const allProductBasedGifts = await ProductBasedGiftService.findGifts(searchParams);

    const usedProductNames = new Set(limitedAmazonGifts.map(gift => gift.productName));
    const partnerGroups = buildPartnerGroups(allProductBasedGifts, usedProductNames);

    const preferredPartner = searchParams.filters?.preferredPartner;
    const partnerTarget = Math.max(MAX_RESULT_COUNT - limitedAmazonGifts.length, MIN_PARTNER_RESULTS);
    const partnerSelections = selectPartnerGifts(partnerGroups, partnerTarget, preferredPartner, usedProductNames);

    const coolblueSelectedCount = partnerSelections.filter(gift =>
      gift.retailers?.some(retailer => normalizeRetailerName(retailer.name).includes('coolblue'))
    ).length;

    const slygadSelectedCount = partnerSelections.filter(gift =>
      gift.retailers?.some(retailer => {
        const name = normalizeRetailerName(retailer.name);
        return name.includes('shop like you give a damn') || name.includes('slygad');
      })
    ).length;

    let combinedResults = [...limitedAmazonGifts, ...partnerSelections];

    if (combinedResults.length < MAX_RESULT_COUNT) {
      const usedNamesForFill = new Set(combinedResults.map(gift => gift.productName));

      const additionalAmazon = pureAmazonGifts
        .filter(gift => !usedNamesForFill.has(gift.productName))
        .slice(0, MAX_RESULT_COUNT - combinedResults.length);

      additionalAmazon.forEach(gift => {
        combinedResults.push(gift);
        usedNamesForFill.add(gift.productName);
      });

      if (combinedResults.length < MAX_RESULT_COUNT) {
        const partnerFallbackPool = allProductBasedGifts
          .filter(gift => gift.retailers && gift.retailers.length > 0 && !usedNamesForFill.has(gift.productName))
          .map(gift => ({ gift, score: computePartnerScore(gift) }))
          .sort((a, b) => b.score - a.score);

        partnerFallbackPool
          .slice(0, MAX_RESULT_COUNT - combinedResults.length)
          .forEach(entry => {
            combinedResults.push(entry.gift);
            usedNamesForFill.add(entry.gift.productName);
          });
      }
    }

    if (combinedResults.length > MAX_RESULT_COUNT) {
      combinedResults = combinedResults.slice(0, MAX_RESULT_COUNT);
    }

    const finalAmazonCount = combinedResults.filter(gift =>
      gift.retailers?.some(retailer => normalizeRetailerName(retailer.name).includes('amazon'))
    ).length;

    const finalCoolblueCount = combinedResults.filter(gift =>
      gift.retailers?.some(retailer => normalizeRetailerName(retailer.name).includes('coolblue'))
    ).length;

    const finalSlygadCount = combinedResults.filter(gift =>
      gift.retailers?.some(retailer => {
        const name = normalizeRetailerName(retailer.name);
        return name.includes('shop like you give a damn') || name.includes('slygad');
      })
    ).length;

    console.log(
      `🎯 Resultaat mix: ${combinedResults.length} totaal -> Amazon: ${finalAmazonCount}, Coolblue: ${finalCoolblueCount}, SLYGAD: ${finalSlygadCount}`
    );

    const sanitizedResults = combinedResults.map(gift => ({
      ...gift,
      imageUrl: ''
    }));

    if (searchParams.filters) {
      return applyAdvancedFilters(sanitizedResults, searchParams.filters);
    }

    return sanitizedResults;
  } catch (error) {
    console.error('Error in hybrid partner selectie:', error);
    console.log('⚠️  Vang terug naar pure Amazon AI cadeaus');

    const fallbackGifts = await originalFindGifts(
      searchParams.recipient,
      searchParams.budget,
      searchParams.occasion,
      searchParams.interests
    );

    const cleanedFallbackGifts = fallbackGifts.slice(0, MAX_RESULT_COUNT).map(gift => ({
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
