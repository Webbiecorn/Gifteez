import aws4 from 'aws4';
export function isPaapiConfigured() {
    const accessKey = process.env.PAAPI_ACCESS_KEY || '';
    const secretKey = process.env.PAAPI_SECRET_KEY || '';
    const partnerTag = process.env.PAAPI_PARTNER_TAG || '';
    return Boolean(accessKey && secretKey && partnerTag);
}
function cfg() {
    const accessKey = process.env.PAAPI_ACCESS_KEY || '';
    const secretKey = process.env.PAAPI_SECRET_KEY || '';
    const partnerTag = process.env.PAAPI_PARTNER_TAG || '';
    const host = process.env.PAAPI_HOST || 'webservices.amazon.nl';
    const region = process.env.PAAPI_REGION || 'eu-west-1';
    if (!accessKey || !secretKey || !partnerTag)
        throw new Error('PAAPI env not configured');
    return { accessKey, secretKey, partnerTag, host, region };
}
const normalizeHeaders = (headers) => {
    if (!headers)
        return {};
    return Object.fromEntries(Object.entries(headers).map(([key, value]) => [key, String(value)]));
};
async function signedFetch(path, body) {
    const { accessKey, secretKey, host, region } = cfg();
    const serializedBody = JSON.stringify(body);
    const request = {
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
    };
    const credentials = {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
    };
    aws4.sign(request, credentials);
    const url = `https://${host}${path}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: normalizeHeaders(request.headers),
        body: serializedBody,
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`PAAPI ${response.status}: ${errorText}`);
    }
    return (await response.json());
}
const toCurrencyDisplay = (amount, currency) => {
    try {
        return new Intl.NumberFormat('nl-NL', { style: 'currency', currency }).format(amount);
    }
    catch {
        return `${amount.toFixed(2)} ${currency}`;
    }
};
const mapOffer = (offer) => {
    const amount = offer?.Price?.Amount;
    const currency = offer?.Price?.Currency;
    const savingsAmount = offer?.Savings?.Amount;
    const savingsPercent = offer?.Savings?.Percentage;
    const price = typeof amount === 'number' && typeof currency === 'string'
        ? { value: amount, currency, display: toCurrencyDisplay(amount, currency) }
        : undefined;
    const savings = typeof savingsAmount === 'number' || typeof savingsPercent === 'number'
        ? {
            amount: typeof savingsAmount === 'number' ? savingsAmount : undefined,
            percent: typeof savingsPercent === 'number' ? savingsPercent : undefined,
        }
        : undefined;
    return {
        price,
        savings,
        prime: offer?.ProgramEligibility?.IsPrimeEligible === true,
    };
};
const extractStringArray = (value) => {
    if (!Array.isArray(value))
        return undefined;
    const strings = value.filter((entry) => typeof entry === 'string');
    return strings.length > 0 ? strings : undefined;
};
const findEditorialContent = (entries) => {
    if (!entries)
        return undefined;
    const match = entries.find((entry) => typeof entry.Content === 'string');
    return typeof match?.Content === 'string' ? match.Content : undefined;
};
const resolveStarRating = (value) => {
    if (typeof value === 'number') {
        return value;
    }
    if (value && typeof value === 'object' && typeof value.Value === 'number') {
        return value.Value;
    }
    return undefined;
};
export async function searchItems(params) {
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
            'ItemInfo.Features',
            'EditorialReviews.Entries',
            'CustomerReviews.Count',
            'CustomerReviews.StarRating',
            'Offers.Listings.Price',
            'Offers.Listings.SavingBasis',
            'Offers.Listings.ProgramEligibility',
        ],
        // Note: price filters differ per locale; in PA-API use MinPrice/MaxPrice in cents for some markets.
    };
    if (typeof params.minPrice === 'number') {
        body.MinPrice = Math.round(params.minPrice * 100);
    }
    if (typeof params.maxPrice === 'number') {
        body.MaxPrice = Math.round(params.maxPrice * 100);
    }
    const data = await signedFetch('/paapi5/searchitems', body);
    const items = (data.ItemsResult?.Items ?? []).map((it) => {
        const listing = it.Offers?.Listings?.[0];
        const priceInfo = mapOffer(listing);
        const features = extractStringArray(it.ItemInfo?.Features?.DisplayValues);
        const editorialContent = findEditorialContent(it.EditorialReviews?.Items ?? it.EditorialReviews?.Entries);
        const starRating = resolveStarRating(it.CustomerReviews?.StarRating);
        const reviewCount = typeof it.CustomerReviews?.Count === 'number' ? it.CustomerReviews.Count : undefined;
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
        };
    });
    return { items, fetchedAtISO: new Date().toISOString() };
}
export async function getItem(asin) {
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
            'ItemInfo.Features',
            'EditorialReviews.Entries',
            'CustomerReviews.Count',
            'CustomerReviews.StarRating',
            'Offers.Listings.Price',
            'Offers.Listings.SavingBasis',
            'Offers.Listings.ProgramEligibility',
        ],
    };
    const data = await signedFetch('/paapi5/getitems', body);
    const it = data.ItemsResult?.Items?.[0];
    if (!it)
        return { item: null, fetchedAtISO: new Date().toISOString() };
    const listing = it.Offers?.Listings?.[0];
    const priceInfo = mapOffer(listing);
    const features = extractStringArray(it.ItemInfo?.Features?.DisplayValues);
    const editorialContent = findEditorialContent(it.EditorialReviews?.Items ?? it.EditorialReviews?.Entries);
    const starRating = resolveStarRating(it.CustomerReviews?.StarRating);
    const reviewCount = typeof it.CustomerReviews?.Count === 'number' ? it.CustomerReviews.Count : undefined;
    const item = {
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
    };
    return { item, fetchedAtISO: new Date().toISOString() };
}
