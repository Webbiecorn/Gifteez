import { PartyProService } from './partyProService'
import { ShopLikeYouGiveADamnService } from './shopLikeYouGiveADamnService'
import type { DealCategory, DealItem } from '../types'
import type { PartyProProduct } from './partyProService'
import type { SLYGADProduct } from './shopLikeYouGiveADamnService'

const DEFAULT_IMAGE = '/images/amazon-placeholder.png'
const MAX_THEMATIC_ITEMS = 20

const shuffle = <T>(input: T[]): T[] => {
  const items = [...input]
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[items[index], items[swapIndex]] = [items[swapIndex], items[index]]
  }
  return items
}

const roundRobinSelect = <T>(groups: Map<string, T[]>, limit: number): T[] => {
  if (limit <= 0 || groups.size === 0) {
    return []
  }

  const groupedKeys = shuffle([...groups.keys()])
  const selected: T[] = []
  let round = 0

  while (selected.length < limit && round < 10) {
    for (const key of groupedKeys) {
      if (selected.length >= limit) {
        break
      }
      const items = groups.get(key)
      if (!items || items.length <= round) {
        continue
      }
      const candidate = items[round]
      if (candidate) {
        selected.push(candidate)
      }
    }
    round += 1
  }

  return selected.slice(0, limit)
}

const toDealItem = (product: {
  id: string
  name: string
  price: number
  affiliateLink: string
  image?: string
  imageUrl?: string
  description?: string
  shortDescription?: string
  giftScore?: number
  originalPrice?: number
}): DealItem | null => {
  if (!product?.id || !product.name || !product.affiliateLink) {
    return null
  }

  const priceValue = Number.isFinite(product.price) ? Number(product.price) : Number.NaN
  if (!Number.isFinite(priceValue) || priceValue <= 0) {
    return null
  }

  const image = product.imageUrl || product.image || DEFAULT_IMAGE
  const description = product.description || product.shortDescription || ''
  const giftScore = typeof product.giftScore === 'number' ? product.giftScore : 8
  const isOnSale =
    typeof product.originalPrice === 'number' && product.originalPrice > product.price
      ? true
      : false

  return {
    id: product.id,
    name: product.name,
    description,
    imageUrl: image,
    price: `€${priceValue.toFixed(2)}`,
    affiliateLink: product.affiliateLink,
    originalPrice:
      isOnSale && typeof product.originalPrice === 'number'
        ? `€${product.originalPrice.toFixed(2)}`
        : undefined,
    isOnSale,
    giftScore,
  }
}

const buildSustainableCategory = (products?: SLYGADProduct[] | null): DealCategory | null => {
  if (!products?.length) {
    return null
  }

  const grouped = new Map<string, SLYGADProduct[]>()
  products.forEach((product) => {
    const subcategory = ShopLikeYouGiveADamnService.detectSubcategory(product.name)
    const existing = grouped.get(subcategory)
    if (existing) {
      existing.push(product)
    } else {
      grouped.set(subcategory, [product])
    }
  })

  const candidates = roundRobinSelect(grouped, MAX_THEMATIC_ITEMS)
  const seen = new Set<string>()
  const items: DealItem[] = []

  candidates.forEach((product) => {
    const deal = toDealItem(product)
    if (!deal || seen.has(deal.id)) {
      return
    }
    seen.add(deal.id)
    items.push(deal)
  })

  if (!items.length) {
    return null
  }

  return {
    id: 'duurzame-cadeaus-slygad',
    title: 'Duurzame Cadeaus',
    description:
      '🌿 Bewuste cadeaus van Shop Like You Give A Damn. Mix van yoga-essentials, vegan sieraden en drinkflessen – zorgvuldig geselecteerd voor bewuste gevers.',
    items,
  }
}

const buildPartyCategory = (products?: PartyProProduct[] | null): DealCategory | null => {
  if (!products?.length) {
    return null
  }

  const grouped = new Map<string, PartyProProduct[]>()
  products.forEach((product) => {
    const subcategory = PartyProService.detectSubcategory(product.name)
    const existing = grouped.get(subcategory)
    if (existing) {
      existing.push(product)
    } else {
      grouped.set(subcategory, [product])
    }
  })

  const candidates = roundRobinSelect(grouped, MAX_THEMATIC_ITEMS)
  const seen = new Set<string>()
  const items: DealItem[] = []

  candidates.forEach((product) => {
    const deal = toDealItem(product)
    if (!deal || seen.has(deal.id)) {
      return
    }
    seen.add(deal.id)
    items.push(deal)
  })

  if (!items.length) {
    return null
  }

  return {
    id: 'feest-party-partypro',
    title: 'Feest & Party Cadeaus',
    description:
      '🎉 PartyPro highlights met decoratie, drinkspellen en party gadgets. Ideaal voor verjaardagen, house-warmings en themafeesten.',
    items,
  }
}

export interface MergeResult {
  categories: DealCategory[]
  added: Array<{ id?: string; title: string; count: number }>
}

export const mergeThematicCategories = (
  baseCategories: DealCategory[],
  options: {
    sustainableProducts?: SLYGADProduct[] | null
    partyProducts?: PartyProProduct[] | null
  }
): MergeResult => {
  const categories = [...baseCategories]
  const added: MergeResult['added'] = []
  const seenTitles = new Set(categories.map((category) => category.title.toLowerCase()))

  const sustainable = buildSustainableCategory(options.sustainableProducts)
  if (sustainable && !seenTitles.has(sustainable.title.toLowerCase())) {
    categories.unshift(sustainable)
    seenTitles.add(sustainable.title.toLowerCase())
    added.push({ id: sustainable.id, title: sustainable.title, count: sustainable.items.length })
  }

  const party = buildPartyCategory(options.partyProducts)
  if (party && !seenTitles.has(party.title.toLowerCase())) {
    const insertIndex = categories.findIndex((category) => {
      const title = category.title.toLowerCase()
      return title.includes('duurza') || title.includes('slygad')
    })
    if (insertIndex >= 0) {
      categories.splice(insertIndex + 1, 0, party)
    } else {
      categories.unshift(party)
    }
    seenTitles.add(party.title.toLowerCase())
    added.push({ id: party.id, title: party.title, count: party.items.length })
  }

  return { categories, added }
}
