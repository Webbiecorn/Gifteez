/**
 * Gift Scoring Model Service
 * Implements weighted scoring: score = w1*budget_fit + w2*occasion_fit + w3*persona_fit + w4*trend_score
 */

import { calculateSemanticSimilarity } from './semanticLabelService'
import type { Gift } from '../types'
import type { SemanticProfile } from './semanticLabelService'

export interface ScoringWeights {
  budgetFit: number // w1
  occasionFit: number // w2
  personaFit: number // w3 (semantic matching)
  trendScore: number // w4
}

export interface GiftScore {
  totalScore: number
  budgetFit: number
  occasionFit: number
  personaFit: number
  trendScore: number
  explanations: string[] // Why this gift was recommended
}

/**
 * Default scoring weights (should sum to 1.0)
 */
export const DEFAULT_WEIGHTS: ScoringWeights = {
  budgetFit: 0.35, // 35% - Budget is very important
  occasionFit: 0.25, // 25% - Occasion matching
  personaFit: 0.3, // 30% - Personality/interest fit
  trendScore: 0.1, // 10% - Trending/popular items
}

/**
 * Calculate budget fit score (0-1)
 * Perfect score when price matches budget exactly
 * Decreases as price deviates from budget
 */
export function calculateBudgetFit(price: number, budgetMin: number, budgetMax: number): number {
  // If no budget specified, return neutral score
  if (budgetMin === 0 && budgetMax === 0) return 0.7

  // If price is within budget, excellent fit
  if (price >= budgetMin && price <= budgetMax) {
    // Perfect score if in middle 50% of budget range
    const midpoint = (budgetMin + budgetMax) / 2
    const range = budgetMax - budgetMin
    const distanceFromMid = Math.abs(price - midpoint)

    // Linear decrease from 1.0 in middle to 0.8 at edges
    return 1.0 - (distanceFromMid / range) * 0.2
  }

  // If price is too low (less than budget min)
  if (price < budgetMin) {
    const deficit = budgetMin - price
    const budgetRange = budgetMax - budgetMin
    // Penalty increases with distance from budget
    return Math.max(0, 0.6 - (deficit / budgetRange) * 0.5)
  }

  // If price is too high (more than budget max)
  if (price > budgetMax) {
    const excess = price - budgetMax
    const budgetRange = budgetMax - budgetMin
    // Steeper penalty for exceeding budget
    return Math.max(0, 0.5 - (excess / budgetRange) * 0.8)
  }

  return 0.5 // Fallback
}

/**
 * Calculate occasion fit score (0-1)
 * Based on product tags, categories, and metadata
 */
export function calculateOccasionFit(gift: Gift, occasion: string, recipient: string): number {
  let score = 0.5 // Base score
  const occasionLower = occasion.toLowerCase()
  const recipientLower = recipient.toLowerCase()

  // Combine searchable text
  const giftText = `${gift.productName} ${gift.description} ${gift.category || ''}`.toLowerCase()
  const tags = gift.tags?.map((t) => t.toLowerCase()) || []

  // Occasion-specific matching
  if (occasionLower.includes('valentijn') || occasionLower.includes('valentine')) {
    if (
      giftText.includes('romantic') ||
      giftText.includes('romantisch') ||
      giftText.includes('love') ||
      giftText.includes('liefde')
    ) {
      score += 0.3
    }
    if (tags.includes('romantic') || tags.includes('valentijn')) {
      score += 0.2
    }
  }

  if (occasionLower.includes('kerst') || occasionLower.includes('christmas')) {
    if (
      giftText.includes('kerst') ||
      giftText.includes('christmas') ||
      giftText.includes('winter') ||
      giftText.includes('holiday')
    ) {
      score += 0.3
    }
  }

  if (occasionLower.includes('verjaardag') || occasionLower.includes('birthday')) {
    // Birthday gifts are universal - slight bonus for festive items
    if (
      giftText.includes('verjaardag') ||
      giftText.includes('birthday') ||
      giftText.includes('feest') ||
      giftText.includes('party')
    ) {
      score += 0.2
    }
  }

  if (occasionLower.includes('jubileum') || occasionLower.includes('anniversary')) {
    if (
      giftText.includes('jubileum') ||
      giftText.includes('anniversary') ||
      giftText.includes('luxury') ||
      giftText.includes('luxe') ||
      giftText.includes('premium') ||
      giftText.includes('exclusive')
    ) {
      score += 0.3
    }
  }

  // Recipient-specific matching
  if (recipientLower === 'partner') {
    if (
      giftText.includes('romantic') ||
      giftText.includes('couple') ||
      giftText.includes('together') ||
      giftText.includes('samen')
    ) {
      score += 0.15
    }
  }

  if (recipientLower === 'collega') {
    if (
      giftText.includes('professional') ||
      giftText.includes('office') ||
      giftText.includes('kantoor') ||
      giftText.includes('werk')
    ) {
      score += 0.15
    }
  }

  if (recipientLower === 'kind' || recipientLower === 'child') {
    if (
      giftText.includes('kind') ||
      giftText.includes('child') ||
      giftText.includes('toy') ||
      giftText.includes('speelgoed')
    ) {
      score += 0.2
    }
  }

  // Cap at 1.0
  return Math.min(1.0, score)
}

/**
 * Calculate persona fit score (0-1)
 * Uses semantic profile matching
 */
export function calculatePersonaFit(
  giftProfile: SemanticProfile,
  userPreferences: Partial<SemanticProfile>
): number {
  // If user preferences are empty, return neutral score
  if (Object.keys(userPreferences).length === 0) {
    return 0.6
  }

  // Convert partial profile to full profile with defaults
  const fullUserProfile: SemanticProfile = {
    romantic: userPreferences.romantic || 0,
    sustainable: userPreferences.sustainable || 0,
    tech: userPreferences.tech || 0,
    funny: userPreferences.funny || 0,
    minimalist: userPreferences.minimalist || 0,
    luxury: userPreferences.luxury || 0,
    practical: userPreferences.practical || 0,
    creative: userPreferences.creative || 0,
    wellness: userPreferences.wellness || 0,
    experiential: userPreferences.experiential || 0,
  }

  // Use cosine similarity
  return calculateSemanticSimilarity(giftProfile, fullUserProfile)
}

/**
 * Calculate trend score (0-1)
 * Based on popularity, reviews, recency
 */
export function calculateTrendScore(gift: Gift): number {
  let score = 0.5 // Base score

  // Review count indicates popularity
  if (gift.reviews) {
    if (gift.reviews > 500) score += 0.2
    else if (gift.reviews > 100) score += 0.15
    else if (gift.reviews > 50) score += 0.1
    else if (gift.reviews > 10) score += 0.05
  }

  // High rating indicates quality
  if (gift.rating) {
    if (gift.rating >= 4.5) score += 0.15
    else if (gift.rating >= 4.0) score += 0.1
    else if (gift.rating >= 3.5) score += 0.05
  }

  // Sustainability is trending
  if (gift.sustainability) {
    score += 0.1
  }

  // Use priceRange to estimate if it's premium/luxury
  if (gift.priceRange) {
    const priceStr = gift.priceRange.toLowerCase()
    if (priceStr.includes('€75') || priceStr.includes('€100') || priceStr.includes('€150')) {
      score += 0.05
    }
  }

  return Math.min(1.0, score)
}

/**
 * Calculate complete gift score with explanations
 */
export function calculateGiftScore(
  gift: Gift,
  giftSemanticProfile: SemanticProfile,
  userPreferences: Partial<SemanticProfile>,
  budgetMin: number,
  budgetMax: number,
  occasion: string,
  recipient: string,
  weights: ScoringWeights = DEFAULT_WEIGHTS
): GiftScore {
  // Extract numeric price from priceRange (e.g., "€25-€50" -> 37.5 midpoint)
  const estimatedPrice = extractPriceFromRange(gift.priceRange)

  const budgetFit = calculateBudgetFit(estimatedPrice, budgetMin, budgetMax)
  const occasionFit = calculateOccasionFit(gift, occasion, recipient)
  const personaFit = calculatePersonaFit(giftSemanticProfile, userPreferences)
  const trendScore = calculateTrendScore(gift)

  // Calculate weighted total
  const totalScore =
    budgetFit * weights.budgetFit +
    occasionFit * weights.occasionFit +
    personaFit * weights.personaFit +
    trendScore * weights.trendScore

  // Generate explanations (top 2 reasons)
  const explanations = generateExplanations(
    gift,
    { budgetFit, occasionFit, personaFit, trendScore },
    budgetMin,
    budgetMax,
    occasion,
    recipient,
    giftSemanticProfile,
    userPreferences
  )

  return {
    totalScore,
    budgetFit,
    occasionFit,
    personaFit,
    trendScore,
    explanations,
  }
}

/**
 * Extract numeric price from priceRange string
 * Examples: "€25-€50" -> 37.5, "€100" -> 100
 */
export function extractPriceFromRange(priceRange: string): number {
  if (!priceRange) return 0

  // Extract all numbers from the string
  const numbers = priceRange.match(/\d+/g)
  if (!numbers || numbers.length === 0) return 0

  // If range (e.g., "€25-€50"), return midpoint
  if (numbers.length >= 2) {
    const min = parseInt(numbers[0])
    const max = parseInt(numbers[1])
    return (min + max) / 2
  }

  // Single price
  return parseInt(numbers[0])
}

/**
 * Generate human-readable explanations for why a gift was recommended
 * Returns top 2 most relevant reasons
 */
function generateExplanations(
  gift: Gift,
  scores: { budgetFit: number; occasionFit: number; personaFit: number; trendScore: number },
  budgetMin: number,
  budgetMax: number,
  occasion: string,
  recipient: string,
  giftProfile: SemanticProfile,
  userPreferences: Partial<SemanticProfile>
): string[] {
  const explanations: Array<{ text: string; score: number }> = []

  // Budget explanations
  if (scores.budgetFit > 0.8) {
    explanations.push({
      text: `Past perfect binnen jouw budget van €${budgetMin}-€${budgetMax}`,
      score: scores.budgetFit,
    })
  } else if (scores.budgetFit > 0.6) {
    explanations.push({
      text: `Betaalbaar cadeau: ${gift.priceRange}`,
      score: scores.budgetFit * 0.8,
    })
  }

  // Occasion explanations
  if (scores.occasionFit > 0.7) {
    const recipientName = recipient.toLowerCase()
    if (occasion.toLowerCase().includes('valentijn')) {
      explanations.push({
        text: `Romantisch cadeau perfect voor Valentijnsdag`,
        score: scores.occasionFit,
      })
    } else if (occasion.toLowerCase().includes('kerst')) {
      explanations.push({
        text: `Ideaal kerstcadeau om de feestdagen mee te vieren`,
        score: scores.occasionFit,
      })
    } else if (recipientName === 'partner') {
      explanations.push({
        text: `Speciaal geselecteerd voor je partner`,
        score: scores.occasionFit,
      })
    } else {
      explanations.push({
        text: `Perfect voor ${occasion.toLowerCase()}`,
        score: scores.occasionFit,
      })
    }
  }

  // Persona/interest explanations
  if (scores.personaFit > 0.6) {
    const topLabels = Object.entries(giftProfile)
      .filter(([_, score]) => score > 0.4)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 2)

    if (topLabels.length > 0) {
      const labelNames: Record<string, string> = {
        romantic: 'romantische',
        sustainable: 'duurzame',
        tech: 'tech',
        funny: 'grappige',
        minimalist: 'minimalistische',
        luxury: 'luxe',
        practical: 'praktische',
        creative: 'creatieve',
        wellness: 'wellness',
        experiential: 'beleving',
      }

      const labelName = labelNames[topLabels[0][0]] || topLabels[0][0]
      explanations.push({
        text: `Matcht met jouw interesse in ${labelName} cadeaus`,
        score: scores.personaFit,
      })
    }
  }

  // Trend/quality explanations
  if (scores.trendScore > 0.7) {
    if (gift.rating && gift.rating >= 4.5 && gift.reviews && gift.reviews > 50) {
      explanations.push({
        text: `Hoog beoordeeld: ${gift.rating} sterren (${gift.reviews} reviews)`,
        score: scores.trendScore,
      })
    } else if (gift.sustainability) {
      explanations.push({
        text: `Duurzame keuze: goed voor mens en milieu`,
        score: scores.trendScore,
      })
    } else if (gift.reviews && gift.reviews > 100) {
      explanations.push({
        text: `Populair cadeau met ${gift.reviews}+ reviews`,
        score: scores.trendScore,
      })
    }
  }

  // Retailer-specific explanations
  if (gift.retailers && gift.retailers.length > 0) {
    const retailer = gift.retailers[0]
    if (retailer.name.toLowerCase().includes('coolblue')) {
      explanations.push({
        text: `Snelle levering via Coolblue`,
        score: 0.6,
      })
    } else if (retailer.name.toLowerCase().includes('amazon')) {
      explanations.push({
        text: `Betrouwbare levering via Amazon`,
        score: 0.6,
      })
    }
  }

  // Sort by score and return top 2
  return explanations
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((e) => e.text)
}

/**
 * Sort gifts by score (highest first)
 */
export function sortGiftsByScore(
  gifts: Array<{ gift: Gift; score: GiftScore }>
): Array<{ gift: Gift; score: GiftScore }> {
  return gifts.sort((a, b) => b.score.totalScore - a.score.totalScore)
}
