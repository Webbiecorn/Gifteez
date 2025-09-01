export type AmazonItem = {
  asin: string;
  title: string;
  url: string;
  images: { small?: string; medium?: string; large?: string };
  price?: { value: number; currency: string; display: string };
  prime?: boolean;
  savings?: { amount?: number; percent?: number };
};

const API_BASE = '';

export async function amazonSearch(q: string, opts?: { page?: number; minPrice?: number; maxPrice?: number; sort?: string; prime?: boolean; }) {
  const params = new URLSearchParams({ q });
  if (opts?.page) params.set('page', String(opts.page));
  if (opts?.minPrice != null) params.set('minPrice', String(opts.minPrice));
  if (opts?.maxPrice != null) params.set('maxPrice', String(opts.maxPrice));
  if (opts?.sort) params.set('sort', opts.sort);
  if (opts?.prime != null) params.set('prime', String(opts.prime));
  const res = await fetch(`${API_BASE}/api/amazon-search?${params.toString()}`);
  if (!res.ok) throw new Error(`Amazon search failed: ${res.status}`);
  return res.json() as Promise<{ items: AmazonItem[]; fetchedAtISO: string; cached?: boolean }>;
}

export async function amazonGetItem(asin: string) {
  const res = await fetch(`${API_BASE}/api/amazon-item/${encodeURIComponent(asin)}`);
  if (!res.ok) throw new Error(`Amazon get item failed: ${res.status}`);
  return res.json() as Promise<{ item: AmazonItem | null; fetchedAtISO: string; cached?: boolean }>;
}
