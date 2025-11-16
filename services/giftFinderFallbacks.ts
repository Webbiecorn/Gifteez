import { withAffiliate } from './affiliate'
import type { Gift, GiftSearchParams } from '../types'

type FallbackGiftSeed = {
  productName: string
  description: string
  price: number
  category: string
  tags: string[]
  deliverySpeed?: Gift['deliverySpeed']
  giftType?: Gift['giftType']
  sustainability?: boolean
  personalization?: boolean
  gender?: Gift['gender']
  matchReason?: string
  searchQuery?: string
  coolblueQuery?: string
  amazonQuery?: string
  priceRange?: string
  imageUrl?: string
  rating?: number
  reviews?: number
  popularity?: number
}

const FALLBACK_GIFT_SEEDS: FallbackGiftSeed[] = [
  {
    productName: 'Smart Ambilight Lichtstrip',
    description:
      'Slimme RGB ledstrip met timer, scènes en spraakbesturing. Ideaal om een gaming room of woonkamer direct gezellig te maken.',
    price: 45,
    category: 'smart home',
    tags: ['smart home', 'verlichting', 'rgb'],
    deliverySpeed: 'fast',
  },
  {
    productName: 'Barista Cadeaupakket Deluxe',
    description:
      'Complete set met specialty bonen, slow coffee dripper en dubbelwandige mokken. Perfect voor koffieliefhebbers.',
    price: 55,
    category: 'keuken',
    tags: ['koffie', 'ontbijt', 'gezellig'],
    deliverySpeed: 'fast',
    sustainability: true,
  },
  {
    productName: 'Wellness & Focus Cadeaubox',
    description:
      'Rustgevende cadeaubox met planner, geurige thee en mini wellness-set om thuis op te laden.',
    price: 39,
    category: 'wellness',
    tags: ['selfcare', 'mindfulness', 'thuis'],
    giftType: 'physical',
    sustainability: true,
  },
  {
    productName: 'Nordic Knit Sjaal & Muts Set',
    description:
      'Zachte merinomix set met Scandinavisch patroon. Lekker warm en stijlvol voor winterse wandelingen.',
    price: 59,
    category: 'mode',
    tags: ['warm', 'winter', 'fashion'],
    deliverySpeed: 'fast',
  },
  {
    productName: 'Personaliseerbare Story Cards',
    description:
      'Set kaartjes met creatieve vragen en challenges om herinneringen te delen tijdens diners of feestjes.',
    price: 29,
    category: 'lifestyle',
    tags: ['spel', 'familie', 'connect'],
    personalization: true,
    giftType: 'physical',
  },
  {
    productName: 'Compacte Fitness Resistance Kit',
    description:
      'Draagbare work-out kit met vijf weerstandsbanden, deuranker en trainingsschema voor thuis of onderweg.',
    price: 49,
    category: 'sport',
    tags: ['fitness', 'health', 'thuis'],
    deliverySpeed: 'fast',
  },
]

const formatPriceRange = (price: number): string => {
  const min = Math.max(5, Math.floor(price * 0.7))
  const max = Math.ceil(price * 1.1)
  return `€${min} – €${max}`
}

const buildSearchTerm = (seed: FallbackGiftSeed, params: GiftSearchParams): string => {
  const combined = [params.recipient, params.occasion, params.interests]
    .filter(Boolean)
    .join(' ')
    .trim()

  return seed.searchQuery || combined || seed.productName
}

export const buildFallbackGifts = (params: GiftSearchParams): Gift[] => {
  return FALLBACK_GIFT_SEEDS.map((seed, index) => {
    const searchTerm = buildSearchTerm(seed, params)
    const priceRange = seed.priceRange || formatPriceRange(seed.price)

    return {
      productName: seed.productName,
      description: seed.description,
      priceRange,
      retailers: [
        {
          name: 'Coolblue',
          affiliateLink: withAffiliate(
            `https://www.coolblue.nl/zoeken?query=${encodeURIComponent(seed.coolblueQuery || searchTerm)}`,
            {
              pageType: 'giftfinder',
              placement: 'fallback',
              cardIndex: index,
            }
          ),
        },
        {
          name: 'Amazon',
          affiliateLink: withAffiliate(
            `https://www.amazon.nl/s?k=${encodeURIComponent(seed.amazonQuery || searchTerm)}`,
            {
              pageType: 'giftfinder',
              placement: 'fallback',
              cardIndex: index,
            }
          ),
        },
      ],
      imageUrl: seed.imageUrl ?? '',
      category: seed.category,
      tags: seed.tags,
      deliverySpeed: seed.deliverySpeed ?? 'standard',
      giftType: seed.giftType ?? 'physical',
      sustainability: seed.sustainability ?? false,
      personalization: seed.personalization ?? false,
      gender: seed.gender,
      rating: seed.rating ?? 4.6,
      reviews: seed.reviews ?? 80 + index * 25,
      popularity: seed.popularity ?? 60 + index * 7,
      availability: 'in-stock',
      matchReason:
        seed.matchReason ||
        `Populaire keuze voor ${params.recipient.toLowerCase()} tijdens ${params.occasion.toLowerCase()}.`,
      relevanceScore: 70 - index * 4,
    }
  })
}
