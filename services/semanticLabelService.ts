/**
 * Semantic Label Service
 * Generates semantic labels for products to improve AI recommendations
 * Labels: romantic, sustainable, tech, funny, minimalist, luxury, etc.
 */

export interface SemanticLabel {
  label: string
  confidence: number // 0-1
  source: 'auto' | 'manual' | 'ml'
}

export interface SemanticProfile {
  romantic: number // 0-1
  sustainable: number // 0-1
  tech: number // 0-1
  funny: number // 0-1
  minimalist: number // 0-1
  luxury: number // 0-1
  practical: number // 0-1
  creative: number // 0-1
  wellness: number // 0-1
  experiential: number // 0-1
}

/**
 * Keywords that indicate specific semantic labels
 */
const LABEL_KEYWORDS = {
  romantic: [
    'romantic',
    'romantisch',
    'love',
    'liefde',
    'valentine',
    'valentijn',
    'couple',
    'koppel',
    'together',
    'samen',
    'date',
    'heart',
    'hart',
    'roses',
    'rozen',
    'chocolade',
    'chocolate',
    'champagne',
    'wine',
    'wijn',
  ],
  sustainable: [
    'sustainable',
    'duurzaam',
    'eco',
    'bio',
    'organic',
    'biologisch',
    'recycled',
    'gerecycled',
    'vegan',
    'ethical',
    'eerlijk',
    'fair trade',
    'bamboo',
    'bamboe',
    'natural',
    'natuurlijk',
    'green',
    'groen',
  ],
  tech: [
    'tech',
    'smart',
    'digital',
    'digitaal',
    'electronic',
    'elektronisch',
    'wireless',
    'draadloos',
    'bluetooth',
    'usb',
    'gadget',
    'device',
    'app',
    'software',
    'hardware',
    'gaming',
    'computer',
    'laptop',
    'phone',
  ],
  funny: [
    'funny',
    'grappig',
    'humor',
    'lol',
    'joke',
    'grap',
    'novelty',
    'quirky',
    'gekke',
    'bizarre',
    'silly',
    'sarcastic',
    'sarcastisch',
    'prank',
    'meme',
    'comic',
    'cartoon',
  ],
  minimalist: [
    'minimal',
    'minimalist',
    'minimalistisch',
    'simple',
    'simpel',
    'clean',
    'basic',
    'essentieel',
    'essential',
    'sleek',
    'strak',
    'modern',
    'scandinavian',
    'scandinavisch',
    'japanese',
    'japans',
    'zen',
  ],
  luxury: [
    'luxury',
    'luxe',
    'premium',
    'exclusive',
    'exclusief',
    'designer',
    'high-end',
    'deluxe',
    'sophisticated',
    'elegant',
    'prestigious',
    'gold',
    'goud',
    'silver',
    'zilver',
    'leather',
    'leer',
    'silk',
    'zijde',
  ],
  practical: [
    'practical',
    'praktisch',
    'useful',
    'nuttig',
    'functional',
    'functioneel',
    'handy',
    'handig',
    'versatile',
    'veelzijdig',
    'everyday',
    'dagelijks',
    'tool',
    'organize',
    'storage',
    'opslag',
  ],
  creative: [
    'creative',
    'creatief',
    'art',
    'kunst',
    'diy',
    'craft',
    'handmade',
    'handgemaakt',
    'artistic',
    'artistiek',
    'design',
    'drawing',
    'tekenen',
    'painting',
    'schilderen',
    'music',
    'muziek',
  ],
  wellness: [
    'wellness',
    'health',
    'gezondheid',
    'fitness',
    'yoga',
    'meditation',
    'meditatie',
    'spa',
    'massage',
    'relaxation',
    'ontspanning',
    'selfcare',
    'beauty',
    'skincare',
    'aromatherapy',
    'essential oil',
  ],
  experiential: [
    'experience',
    'ervaring',
    'beleving',
    'activity',
    'activiteit',
    'adventure',
    'avontuur',
    'trip',
    'reis',
    'workshop',
    'course',
    'cursus',
    'lesson',
    'voucher',
    'bon',
    'ticket',
    'event',
    'evenement',
  ],
}

/**
 * Price thresholds for luxury classification
 */
const LUXURY_PRICE_THRESHOLD = 100 // €100+
const PREMIUM_PRICE_THRESHOLD = 50 // €50+

/**
 * Generate semantic labels for a product based on title, description, category, and price
 */
export function generateSemanticLabels(
  title: string,
  description: string = '',
  category: string = '',
  price: number = 0,
  tags: string[] = []
): SemanticProfile {
  // Combine all text for analysis
  const fullText = `${title} ${description} ${category} ${tags.join(' ')}`.toLowerCase()

  const profile: SemanticProfile = {
    romantic: 0,
    sustainable: 0,
    tech: 0,
    funny: 0,
    minimalist: 0,
    luxury: 0,
    practical: 0,
    creative: 0,
    wellness: 0,
    experiential: 0,
  }

  // Calculate scores for each semantic dimension
  Object.keys(LABEL_KEYWORDS).forEach((labelKey) => {
    const keywords = LABEL_KEYWORDS[labelKey as keyof typeof LABEL_KEYWORDS]
    let matchCount = 0
    let totalWeight = 0

    keywords.forEach((keyword, index) => {
      // Give more weight to matches in title vs description
      const titleMatch = title.toLowerCase().includes(keyword)
      const descMatch = description.toLowerCase().includes(keyword)
      const categoryMatch = category.toLowerCase().includes(keyword)
      const tagMatch = tags.some((tag) => tag.toLowerCase().includes(keyword))

      if (titleMatch) {
        matchCount += 3 // Title matches are most important
        totalWeight += 3
      } else if (categoryMatch) {
        matchCount += 2 // Category matches are important
        totalWeight += 2
      } else if (tagMatch) {
        matchCount += 2 // Tag matches are important
        totalWeight += 2
      } else if (descMatch) {
        matchCount += 1 // Description matches are least important
        totalWeight += 1
      }
    })

    // Normalize to 0-1 scale
    // Max possible score is roughly keywords.length * 3 (if all in title)
    const maxPossibleScore = keywords.length * 3
    profile[labelKey as keyof SemanticProfile] = Math.min(1, totalWeight / (maxPossibleScore * 0.3))
  })

  // Price-based luxury adjustment
  if (price > LUXURY_PRICE_THRESHOLD) {
    profile.luxury = Math.min(1, profile.luxury + 0.3)
  } else if (price > PREMIUM_PRICE_THRESHOLD) {
    profile.luxury = Math.min(1, profile.luxury + 0.15)
  }

  // Low price reduces luxury score
  if (price < 20 && profile.luxury > 0) {
    profile.luxury = Math.max(0, profile.luxury - 0.2)
  }

  // Wellness products often overlap with sustainable
  if (profile.wellness > 0.5 && profile.sustainable > 0.3) {
    profile.sustainable = Math.min(1, profile.sustainable + 0.1)
  }

  // Tech products are often practical
  if (profile.tech > 0.5) {
    profile.practical = Math.min(1, profile.practical + 0.2)
  }

  return profile
}

/**
 * Get top semantic labels for a product
 */
export function getTopLabels(profile: SemanticProfile, threshold: number = 0.3): string[] {
  return Object.entries(profile)
    .filter(([_, score]) => score >= threshold)
    .sort(([_, a], [__, b]) => b - a)
    .map(([label, _]) => label)
}

/**
 * Calculate similarity between two semantic profiles (cosine similarity)
 */
export function calculateSemanticSimilarity(
  profile1: SemanticProfile,
  profile2: SemanticProfile
): number {
  let dotProduct = 0
  let magnitude1 = 0
  let magnitude2 = 0

  Object.keys(profile1).forEach((key) => {
    const k = key as keyof SemanticProfile
    dotProduct += profile1[k] * profile2[k]
    magnitude1 += profile1[k] * profile1[k]
    magnitude2 += profile2[k] * profile2[k]
  })

  magnitude1 = Math.sqrt(magnitude1)
  magnitude2 = Math.sqrt(magnitude2)

  if (magnitude1 === 0 || magnitude2 === 0) return 0

  return dotProduct / (magnitude1 * magnitude2)
}

/**
 * Generate user preference profile from selected interests and occasion
 */
export function generateUserPreferenceProfile(
  interests: string[],
  occasion: string,
  recipient: string
): Partial<SemanticProfile> {
  const profile: Partial<SemanticProfile> = {}

  // Interest-based preferences
  interests.forEach((interest) => {
    const lower = interest.toLowerCase()

    if (lower.includes('tech') || lower.includes('gaming') || lower.includes('gadget')) {
      profile.tech = (profile.tech || 0) + 0.4
    }
    if (lower.includes('duurzaam') || lower.includes('eco') || lower.includes('bio')) {
      profile.sustainable = (profile.sustainable || 0) + 0.4
    }
    if (lower.includes('wellness') || lower.includes('yoga') || lower.includes('selfcare')) {
      profile.wellness = (profile.wellness || 0) + 0.4
    }
    if (lower.includes('koken') || lower.includes('bbq')) {
      profile.practical = (profile.practical || 0) + 0.3
    }
    if (lower.includes('creatief') || lower.includes('kunst') || lower.includes('muziek')) {
      profile.creative = (profile.creative || 0) + 0.4
    }
    if (lower.includes('reizen') || lower.includes('avontuur')) {
      profile.experiential = (profile.experiential || 0) + 0.4
    }
    if (lower.includes('mode') || lower.includes('sieraden')) {
      profile.luxury = (profile.luxury || 0) + 0.2
    }
    if (lower.includes('sport') || lower.includes('fitness')) {
      profile.practical = (profile.practical || 0) + 0.3
      profile.wellness = (profile.wellness || 0) + 0.2
    }
    if (lower.includes('boeken')) {
      profile.creative = (profile.creative || 0) + 0.2
    }
  })

  // Occasion-based preferences
  const occasionLower = occasion.toLowerCase()
  if (occasionLower.includes('valentijn') || occasionLower.includes('valentine')) {
    profile.romantic = 0.8
    profile.luxury = (profile.luxury || 0) + 0.3
  }
  if (occasionLower.includes('jubileum') || occasionLower.includes('anniversary')) {
    profile.romantic = (profile.romantic || 0) + 0.5
    profile.luxury = (profile.luxury || 0) + 0.4
  }
  if (occasionLower.includes('kerst') || occasionLower.includes('christmas')) {
    profile.luxury = (profile.luxury || 0) + 0.2
  }

  // Recipient-based preferences
  const recipientLower = recipient.toLowerCase()
  if (recipientLower === 'partner') {
    profile.romantic = (profile.romantic || 0) + 0.3
  }
  if (recipientLower === 'collega') {
    profile.practical = (profile.practical || 0) + 0.3
    profile.funny = (profile.funny || 0) + 0.2
  }
  if (recipientLower === 'kind' || recipientLower === 'child') {
    profile.funny = (profile.funny || 0) + 0.3
    profile.creative = (profile.creative || 0) + 0.2
  }

  // Normalize all values to 0-1
  Object.keys(profile).forEach((key) => {
    const k = key as keyof SemanticProfile
    profile[k] = Math.min(1, profile[k] as number)
  })

  return profile
}

/**
 * Get human-readable label names in Dutch
 */
export function getLabelName(label: string): string {
  const names: Record<string, string> = {
    romantic: 'Romantisch',
    sustainable: 'Duurzaam',
    tech: 'Tech & Gadgets',
    funny: 'Grappig',
    minimalist: 'Minimalistisch',
    luxury: 'Luxe',
    practical: 'Praktisch',
    creative: 'Creatief',
    wellness: 'Wellness',
    experiential: 'Beleving',
  }
  return names[label] || label
}

/**
 * Get emoji for semantic label
 */
export function getLabelEmoji(label: string): string {
  const emojis: Record<string, string> = {
    romantic: '💝',
    sustainable: '🌱',
    tech: '💻',
    funny: '😄',
    minimalist: '✨',
    luxury: '👑',
    practical: '🛠️',
    creative: '🎨',
    wellness: '🧘',
    experiential: '🎭',
  }
  return emojis[label] || '🎁'
}
