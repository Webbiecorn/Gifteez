// Quick test to verify Awin affiliate link generation
console.log('🔗 Testing Awin Affiliate Link Generation');

// Simulate the configuration and function
const AWIN_CONFIG = {
  publisherId: '2566111', // Gifteez.nl Publisher ID
  advertiserId: '85161', // Coolblue Advertiser ID
  baseUrl: 'https://www.awin1.com/cread.php'
};

function generateAwinLink(originalUrl, clickRef = 'general') {
  const encodedUrl = encodeURIComponent(originalUrl);
  return `${AWIN_CONFIG.baseUrl}?awinmid=${AWIN_CONFIG.advertiserId}&awinaffid=${AWIN_CONFIG.publisherId}&clickref=${clickRef}&p=${encodedUrl}`;
}

// Test URL
const testUrl = 'https://www.coolblue.nl/product/123456/test-product';

console.log('Original URL:', testUrl);

const affiliateLink = generateAwinLink(testUrl);
console.log('Awin Affiliate Link:', affiliateLink);

const campaignLink = generateAwinLink(testUrl, 'giftfinder');
console.log('Campaign Link (Gift Finder):', campaignLink);

// Verify the link structure
const expectedPattern = /https:\/\/www\.awin1\.com\/cread\.php\?awinmid=85161&awinaffid=2566111/;
if (expectedPattern.test(affiliateLink)) {
  console.log('✅ Affiliate link structure is correct!');
  console.log('✅ Publisher ID: 2566111 (Gifteez.nl)');
  console.log('✅ Advertiser ID: 85161 (Coolblue)');
} else {
  console.log('❌ Affiliate link structure needs adjustment');
}
