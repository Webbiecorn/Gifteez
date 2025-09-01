import aws4 from 'aws4';

export interface AmazonItem {
  asin: string;
  title: string;
  url: string;
  images: { small?: string; medium?: string; large?: string };
  price?: { value: number; currency: string; display: string };
  prime?: boolean;
  savings?: { amount?: number; percent?: number };
  rating?: number;
}

function cfg() {
  const accessKey = process.env.PAAPI_ACCESS_KEY || '';
  const secretKey = process.env.PAAPI_SECRET_KEY || '';
  const partnerTag = process.env.PAAPI_PARTNER_TAG || '';
  const host = process.env.PAAPI_HOST || 'webservices.amazon.nl';
  const region = process.env.PAAPI_REGION || 'eu-west-1';
  if (!accessKey || !secretKey || !partnerTag) throw new Error('PAAPI env not configured');
  return { accessKey, secretKey, partnerTag, host, region };
}

async function signedFetch(path: string, body: any) {
  const { accessKey, secretKey, host, region } = cfg();
  const bodyStr = JSON.stringify(body);
  const opts: aws4.Request = {
    host,
    path,
    method: 'POST',
    service: 'ProductAdvertisingAPI',
    region,
    headers: {
      'content-type': 'application/json; charset=UTF-8',
      'host': host,
    },
    body: bodyStr,
  } as any;
  aws4.sign(opts, { accessKeyId: accessKey, secretAccessKey: secretKey } as any);
  const url = `https://${host}${path}`;
  const res = await fetch(url, { method: 'POST', headers: opts.headers as any, body: bodyStr });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`PAAPI ${res.status}: ${txt}`);
  }
  return res.json();
}

function mapOffer(offer: any) {
  const amount = offer?.Price?.Amount;
  const currency = offer?.Price?.Currency;
  const display = amount && currency ? new Intl.NumberFormat('nl-NL', { style: 'currency', currency }).format(amount) : undefined;
  const savingsAmount = offer?.Savings?.Amount;
  const savingsPercent = offer?.Savings?.Percentage;
  return {
    price: amount && currency ? { value: amount, currency, display: display! } : undefined,
    savings: savingsAmount || savingsPercent ? { amount: savingsAmount, percent: savingsPercent } : undefined,
    prime: offer?.ProgramEligibility?.IsPrimeEligible === true,
  };
}

export async function searchItems(params: { keywords: string; page?: number; minPrice?: number; maxPrice?: number; sort?: string; prime?: boolean; }) {
  const { partnerTag } = cfg();
  const body = {
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
      'Offers.Listings.Price',
      'Offers.Listings.SavingBasis',
      'Offers.Listings.ProgramEligibility'
    ],
    // Note: price filters differ per locale; in PA-API use MinPrice/MaxPrice in cents for some markets.
  } as any;
  if (typeof params.minPrice === 'number') body.MinPrice = Math.round(params.minPrice * 100);
  if (typeof params.maxPrice === 'number') body.MaxPrice = Math.round(params.maxPrice * 100);

  const data = await signedFetch('/paapi5/searchitems', body);
  const items = (data.ItemsResult?.Items || []).map((it: any): AmazonItem => {
    const listing = it?.Offers?.Listings?.[0];
    const priceInfo = mapOffer(listing);
    return {
      asin: it?.ASIN,
      title: it?.ItemInfo?.Title?.DisplayValue,
      url: it?.DetailPageURL,
      images: {
        small: it?.Images?.Primary?.Small?.URL,
        medium: it?.Images?.Primary?.Medium?.URL,
        large: it?.Images?.Primary?.Large?.URL,
      },
      ...priceInfo,
    };
  });
  return { items, fetchedAtISO: new Date().toISOString() };
}

export async function getItem(asin: string) {
  const { partnerTag } = cfg();
  const body = {
    PartnerType: 'Associates',
    PartnerTag: partnerTag,
    ItemIds: [asin],
    Resources: [
      'ItemInfo.Title',
      'Images.Primary.Large',
      'Images.Primary.Medium',
      'Images.Primary.Small',
      'Offers.Listings.Price',
      'Offers.Listings.SavingBasis',
      'Offers.Listings.ProgramEligibility'
    ]
  };
  const data = await signedFetch('/paapi5/getitems', body);
  const it = data.ItemsResult?.Items?.[0];
  if (!it) return { item: null, fetchedAtISO: new Date().toISOString() };
  const listing = it?.Offers?.Listings?.[0];
  const priceInfo = mapOffer(listing);
  const item: AmazonItem = {
    asin: it?.ASIN,
    title: it?.ItemInfo?.Title?.DisplayValue,
    url: it?.DetailPageURL,
    images: {
      small: it?.Images?.Primary?.Small?.URL,
      medium: it?.Images?.Primary?.Medium?.URL,
      large: it?.Images?.Primary?.Large?.URL,
    },
    ...priceInfo,
  };
  return { item, fetchedAtISO: new Date().toISOString() };
}
