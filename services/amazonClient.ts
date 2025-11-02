export type AmazonItem = {
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

const API_BASE = ''

export async function amazonSearch(
  q: string,
  opts?: { page?: number; minPrice?: number; maxPrice?: number; sort?: string; prime?: boolean }
) {
  const params = new URLSearchParams({ q })
  if (opts?.page) params.set('page', String(opts.page))
  if (typeof opts?.minPrice === 'number') params.set('minPrice', String(opts.minPrice))
  if (typeof opts?.maxPrice === 'number') params.set('maxPrice', String(opts.maxPrice))
  if (opts?.sort) params.set('sort', opts.sort)
  if (typeof opts?.prime === 'boolean') params.set('prime', String(opts.prime))
  const res = await fetch(`${API_BASE}/api/amazon-search?${params.toString()}`)
  if (!res.ok) throw new Error(`Amazon search failed: ${res.status}`)
  return res.json() as Promise<{ items: AmazonItem[]; fetchedAtISO: string; cached?: boolean }>
}

export type AmazonItemResponse = {
  item: AmazonItem | null
  fetchedAtISO: string
  cached?: boolean
  disabled?: boolean
}

export async function amazonGetItem(asin: string): Promise<AmazonItemResponse> {
  const res = await fetch(`${API_BASE}/api/amazon-item/${encodeURIComponent(asin)}`)
  if (!res.ok) throw new Error(`Amazon get item failed: ${res.status}`)
  return res.json() as Promise<AmazonItemResponse>
}
