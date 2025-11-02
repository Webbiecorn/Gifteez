import aws4 from 'aws4'
import type { Request as AwsRequest } from 'aws4'

export interface AmazonItem {
  asin: string
  title: string
  url: string
  images: { small?: string; medium?: string; large?: string }
  price?: { value: number; currency: string; display: string }
  prime?: boolean
  savings?: { amount?: number; percent?: number }
  rating?: number
  reviewCount?: number
  features?: string[]
  description?: string
}

export function isPaapiConfigured() {
  const accessKey = process.env.PAAPI_ACCESS_KEY || ''
  const secretKey = process.env.PAAPI_SECRET_KEY || ''
  const partnerTag = process.env.PAAPI_PARTNER_TAG || ''
  return Boolean(accessKey && secretKey && partnerTag)
}

function cfg() {
  const accessKey = process.env.PAAPI_ACCESS_KEY || ''
  const secretKey = process.env.PAAPI_SECRET_KEY || ''
  const partnerTag = process.env.PAAPI_PARTNER_TAG || ''
  const host = process.env.PAAPI_HOST || 'webservices.amazon.nl'
  const region = process.env.PAAPI_REGION || 'eu-west-1'
  if (!accessKey || !secretKey || !partnerTag) throw new Error('PAAPI env not configured')
  return { accessKey, secretKey, partnerTag, host, region }
}

type JsonLike = Record<string, unknown>

type AwsHeaders = AwsRequest['headers']

const normalizeHeaders = (headers: AwsHeaders | undefined): Record<string, string> => {
  if (!headers) return {}
  return Object.fromEntries(Object.entries(headers).map(([key, value]) => [key, String(value)]))
}

async function signedFetch<TResponse>(path: string, body: JsonLike): Promise<TResponse> {
  const { accessKey, secretKey, host, region } = cfg()
  const serializedBody = JSON.stringify(body)

  const request: AwsRequest = {
    host,
    path,
    method: 'POST',
    service: 'ProductAdvertisingAPI',
    region,
    headers: {
      'content-type': 'application/json; charset=UTF-8',
      host,
    },
    body: serializedBody,
  }

  const credentials = {
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
  }

  aws4.sign(request, credentials)

  const url = `https://${host}${path}`
  const response = await fetch(url, {
    method: 'POST',
    headers: normalizeHeaders(request.headers),
    body: serializedBody,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`PAAPI ${response.status}: ${errorText}`)
  }

  return (await response.json()) as TResponse
}

interface PaapiPrice {
  Amount?: number
  Currency?: string
}

interface PaapiSavings {
  Amount?: number
  Percentage?: number
}

interface PaapiProgramEligibility {
  IsPrimeEligible?: boolean
}

interface PaapiOfferListing {
  Price?: PaapiPrice
  Savings?: PaapiSavings
  ProgramEligibility?: PaapiProgramEligibility
}

interface PaapiImageVariant {
  URL?: string
}

interface PaapiImages {
  Primary?: {
    Small?: PaapiImageVariant
    Medium?: PaapiImageVariant
    Large?: PaapiImageVariant
  }
}

interface PaapiTitle {
  DisplayValue?: string
}

interface PaapiFeatures {
  DisplayValues?: unknown
}

interface PaapiItemInfo {
  Title?: PaapiTitle
  Features?: PaapiFeatures
}

interface PaapiEditorialEntry {
  Content?: unknown
}

interface PaapiEditorialReviews {
  Items?: PaapiEditorialEntry[]
  Entries?: PaapiEditorialEntry[]
}

interface PaapiStarRatingObject {
  Value?: number
}

interface PaapiCustomerReviews {
  StarRating?: PaapiStarRatingObject | number
  Count?: number
}

interface PaapiOffers {
  Listings?: PaapiOfferListing[]
}

interface PaapiItem {
  ASIN?: string
  DetailPageURL?: string
  Offers?: PaapiOffers
  Images?: PaapiImages
  ItemInfo?: PaapiItemInfo
  EditorialReviews?: PaapiEditorialReviews
  CustomerReviews?: PaapiCustomerReviews
}

interface SearchItemsResponse {
  ItemsResult?: {
    Items?: PaapiItem[]
  }
}

interface GetItemsResponse {
  ItemsResult?: {
    Items?: PaapiItem[]
  }
}

const toCurrencyDisplay = (amount: number, currency: string): string => {
  try {
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currency}`
  }
}

const mapOffer = (
  offer: PaapiOfferListing | undefined
): { price?: AmazonItem['price']; savings?: AmazonItem['savings']; prime?: boolean } => {
  const amount = offer?.Price?.Amount
  const currency = offer?.Price?.Currency
  const savingsAmount = offer?.Savings?.Amount
  const savingsPercent = offer?.Savings?.Percentage

  const price =
    typeof amount === 'number' && typeof currency === 'string'
      ? { value: amount, currency, display: toCurrencyDisplay(amount, currency) }
      : undefined

  const savings =
    typeof savingsAmount === 'number' || typeof savingsPercent === 'number'
      ? {
          amount: typeof savingsAmount === 'number' ? savingsAmount : undefined,
          percent: typeof savingsPercent === 'number' ? savingsPercent : undefined,
        }
      : undefined

  return {
    price,
    savings,
    prime: offer?.ProgramEligibility?.IsPrimeEligible === true,
  }
}

const extractStringArray = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) return undefined
  const strings = value.filter((entry): entry is string => typeof entry === 'string')
  return strings.length > 0 ? strings : undefined
}

const findEditorialContent = (entries: PaapiEditorialEntry[] | undefined): string | undefined => {
  if (!entries) return undefined
  const match = entries.find((entry) => typeof entry.Content === 'string')
  return typeof match?.Content === 'string' ? match.Content : undefined
}

const resolveStarRating = (value: PaapiCustomerReviews['StarRating']): number | undefined => {
  if (typeof value === 'number') {
    return value
  }
  if (value && typeof value === 'object' && typeof value.Value === 'number') {
    return value.Value
  }
  return undefined
}

export async function searchItems(params: {
  keywords: string
  page?: number
  minPrice?: number
  maxPrice?: number
  sort?: string
  prime?: boolean
}) {
  const { partnerTag } = cfg()
  const body: JsonLike = {
    PartnerType: 'Associates',
    PartnerTag: partnerTag,
    Keywords: params.keywords,
    SearchIndex: 'All',
    ItemPage: params.page || 1,
    SortBy: params.sort === 'price' ? 'Price:LowToHigh' : 'Relevance',
    Resources: [
      'ItemInfo.Title',
      'Images.Primary.Large',
      'Images.Primary.Medium',
      'Images.Primary.Small',
      'ItemInfo.Features',
      'EditorialReviews.Entries',
      'CustomerReviews.Count',
      'CustomerReviews.StarRating',
      'Offers.Listings.Price',
      'Offers.Listings.SavingBasis',
      'Offers.Listings.ProgramEligibility',
    ],
    // Note: price filters differ per locale; in PA-API use MinPrice/MaxPrice in cents for some markets.
  }
  if (typeof params.minPrice === 'number') {
    body.MinPrice = Math.round(params.minPrice * 100)
  }
  if (typeof params.maxPrice === 'number') {
    body.MaxPrice = Math.round(params.maxPrice * 100)
  }

  const data = await signedFetch<SearchItemsResponse>('/paapi5/searchitems', body)
  const items = (data.ItemsResult?.Items ?? []).map((it: PaapiItem): AmazonItem => {
    const listing = it.Offers?.Listings?.[0]
    const priceInfo = mapOffer(listing)
    const features = extractStringArray(it.ItemInfo?.Features?.DisplayValues)
    const editorialContent = findEditorialContent(
      it.EditorialReviews?.Items ?? it.EditorialReviews?.Entries
    )
    const starRating = resolveStarRating(it.CustomerReviews?.StarRating)
    const reviewCount =
      typeof it.CustomerReviews?.Count === 'number' ? it.CustomerReviews.Count : undefined
    return {
      asin: it.ASIN ?? '',
      title: it.ItemInfo?.Title?.DisplayValue ?? '',
      url: it.DetailPageURL ?? '',
      images: {
        small: it.Images?.Primary?.Small?.URL,
        medium: it.Images?.Primary?.Medium?.URL,
        large: it.Images?.Primary?.Large?.URL,
      },
      ...priceInfo,
      rating: starRating,
      reviewCount,
      features,
      description: editorialContent,
    }
  })
  return { items, fetchedAtISO: new Date().toISOString() }
}

export async function getItem(asin: string) {
  const { partnerTag } = cfg()
  const body: JsonLike = {
    PartnerType: 'Associates',
    PartnerTag: partnerTag,
    ItemIds: [asin],
    Resources: [
      'ItemInfo.Title',
      'Images.Primary.Large',
      'Images.Primary.Medium',
      'Images.Primary.Small',
      'ItemInfo.Features',
      'EditorialReviews.Entries',
      'CustomerReviews.Count',
      'CustomerReviews.StarRating',
      'Offers.Listings.Price',
      'Offers.Listings.SavingBasis',
      'Offers.Listings.ProgramEligibility',
    ],
  }
  const data = await signedFetch<GetItemsResponse>('/paapi5/getitems', body)
  const it = data.ItemsResult?.Items?.[0]
  if (!it) return { item: null, fetchedAtISO: new Date().toISOString() }
  const listing = it.Offers?.Listings?.[0]
  const priceInfo = mapOffer(listing)
  const features = extractStringArray(it.ItemInfo?.Features?.DisplayValues)
  const editorialContent = findEditorialContent(
    it.EditorialReviews?.Items ?? it.EditorialReviews?.Entries
  )
  const starRating = resolveStarRating(it.CustomerReviews?.StarRating)
  const reviewCount =
    typeof it.CustomerReviews?.Count === 'number' ? it.CustomerReviews.Count : undefined
  const item: AmazonItem = {
    asin: it.ASIN ?? '',
    title: it.ItemInfo?.Title?.DisplayValue ?? '',
    url: it.DetailPageURL ?? '',
    images: {
      small: it.Images?.Primary?.Small?.URL,
      medium: it.Images?.Primary?.Medium?.URL,
      large: it.Images?.Primary?.Large?.URL,
    },
    ...priceInfo,
    rating: starRating,
    reviewCount,
    features,
    description: editorialContent,
  }
  return { item, fetchedAtISO: new Date().toISOString() }
}
