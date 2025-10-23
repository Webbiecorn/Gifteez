#!/bin/bash
# Automated testing script for Affiliate Landing Page System
# Usage: ./test-landing-pages.sh

set -e

echo "🧪 Starting Affiliate Landing Page System Tests..."
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0
WARNINGS=0

# Function to print test result
test_result() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✓${NC} $2"
    ((PASSED++))
  else
    echo -e "${RED}✗${NC} $2"
    ((FAILED++))
  fi
}

test_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
  ((WARNINGS++))
}

echo "📦 1. Build & Bundle Tests"
echo "-------------------------"

# Test 1: Build succeeds
npm run build > /dev/null 2>&1
test_result $? "Build completes without errors"

# Test 2: Check bundle sizes
PRODUCT_LANDING=$(ls -lh dist/assets/ProductLandingPage-*.js | awk '{print $5}')
CATEGORY_DETAIL=$(ls -lh dist/assets/CategoryDetailPage-*.js | awk '{print $5}')
COMPARISON=$(ls -lh dist/assets/ComparisonPage-*.js | awk '{print $5}')

echo "  ProductLandingPage: $PRODUCT_LANDING"
echo "  CategoryDetailPage: $CATEGORY_DETAIL"
echo "  ComparisonPage: $COMPARISON"

# Test 3: Check for critical files
test -f dist/index.html
test_result $? "index.html exists in dist/"

test -f dist/assets/index-*.js
test_result $? "Main JS bundle exists"

test -f dist/assets/index-*.css
test_result $? "CSS bundle exists"

echo ""
echo "🔍 2. Code Quality Tests"
echo "-------------------------"

# Test 4: TypeScript compilation
npx tsc --noEmit > /dev/null 2>&1
test_result $? "TypeScript compiles without errors"

# Test 5: ESLint check
npx eslint components/ProductLandingPage.tsx --max-warnings 0 > /dev/null 2>&1
test_result $? "ProductLandingPage passes ESLint"

npx eslint components/CategoryDetailPage.tsx --max-warnings 0 > /dev/null 2>&1
test_result $? "CategoryDetailPage passes ESLint"

npx eslint components/ComparisonPage.tsx --max-warnings 0 > /dev/null 2>&1
test_result $? "ComparisonPage passes ESLint"

echo ""
echo "📱 3. Component Structure Tests"
echo "-------------------------"

# Test 6: Check imports
grep -q "import.*TrustBadges" components/CategoryDetailPage.tsx
test_result $? "CategoryDetailPage imports TrustBadges"

grep -q "import.*TrophyIcon" components/ComparisonPage.tsx
test_result $? "ComparisonPage imports TrophyIcon"

grep -q "import.*FAQSection" components/ProductLandingPage.tsx
test_result $? "ProductLandingPage imports FAQSection"

# Test 7: Check key features
grep -q "onClick={handleCardClick}" components/CategoryDetailPage.tsx
test_result $? "CategoryDetailPage cards are clickable"

grep -q "navigateTo('comparison'" components/CategoryDetailPage.tsx
test_result $? "CategoryDetailPage has comparison navigation"

grep -q "JSON-LD" components/ProductLandingPage.tsx
test_result $? "ProductLandingPage has structured data"

echo ""
echo "🎨 4. Styling & Responsiveness"
echo "-------------------------"

# Test 8: Check responsive classes
grep -q "sm:grid-cols-2.*lg:grid-cols-3" components/CategoryDetailPage.tsx
test_result $? "CategoryDetailPage has responsive grid"

grep -q "hidden.*lg:block" components/ComparisonPage.tsx
test_result $? "ComparisonPage has desktop/mobile variants"

grep -q "md:flex-row" components/CategoryDetailPage.tsx
test_result $? "CategoryDetailPage has responsive flex layouts"

# Test 9: Check conversion elements
grep -q "TrustBadges" components/CategoryDetailPage.tsx
test_result $? "CategoryDetailPage includes TrustBadges"

grep -q "SocialProofBadge" components/ComparisonPage.tsx
test_result $? "ComparisonPage includes SocialProofBadge"

grep -q "CountdownTimer\|StockCounter" components/ProductLandingPage.tsx
test_result $? "ProductLandingPage has urgency elements"

echo ""
echo "🔗 5. Routing & Navigation"
echo "-------------------------"

# Test 10: Check route definitions
grep -q "'comparison'" types.ts
test_result $? "comparison route type defined"

grep -q "case 'comparison':" App.tsx
test_result $? "comparison route handler in App.tsx"

grep -q "ComparisonPage" App.tsx
test_result $? "ComparisonPage imported in App.tsx"

# Test 11: Check navigation calls
grep -q "navigateTo('productLanding'" components/DealsPage.tsx
test_result $? "DealsPage navigates to productLanding"

grep -q "navigateTo('comparison'" components/CategoryDetailPage.tsx
test_result $? "CategoryDetailPage navigates to comparison"

echo ""
echo "⚡ 6. Performance & Optimization"
echo "-------------------------"

# Test 12: Check for React optimization
grep -q "useMemo\|useCallback" components/CategoryDetailPage.tsx
test_result $? "CategoryDetailPage uses React optimization hooks"

grep -q "React.lazy" App.tsx
test_result $? "App.tsx uses code splitting"

# Test 13: Check image optimization
grep -q "ImageWithFallback" components/ProductLandingPage.tsx
test_result $? "ProductLandingPage uses optimized images"

echo ""
echo "🔒 7. Security & Best Practices"
echo "-------------------------"

# Test 14: Check affiliate link handling
grep -q "withAffiliate" components/ProductLandingPage.tsx
test_result $? "ProductLandingPage uses withAffiliate()"

grep -q "rel=\"sponsored nofollow" components/ComparisonPage.tsx
test_result $? "ComparisonPage has proper rel attributes"

grep -q "target=\"_blank\"" components/CategoryDetailPage.tsx
test_result $? "CategoryDetailPage opens external links in new tab"

# Test 15: Check stopPropagation
grep -q "stopPropagation" components/DealsPage.tsx
test_result $? "DealsPage prevents event bubbling"

echo ""
echo "📊 8. SEO & Structured Data"
echo "-------------------------"

# Test 16: Check meta tags
grep -q "<Meta" components/ProductLandingPage.tsx
test_result $? "ProductLandingPage has Meta component"

grep -q "canonical=" components/ComparisonPage.tsx
test_result $? "ComparisonPage sets canonical URL"

# Test 17: Check JSON-LD
grep -q "application/ld+json" components/ProductLandingPage.tsx
test_result $? "ProductLandingPage has JSON-LD"

grep -q "ItemList" components/ComparisonPage.tsx
test_result $? "ComparisonPage has ItemList schema"

grep -q "BreadcrumbList" components/CategoryDetailPage.tsx
test_result $? "CategoryDetailPage has Breadcrumb schema"

echo ""
echo "🎯 9. Conversion Optimization"
echo "-------------------------"

# Test 18: Check CTA elements
CTA_COUNT=$(grep -c "Bekijk bij\|Naar.*retailer\|Bekijk deal" components/ProductLandingPage.tsx || true)
test_warning "ProductLandingPage has $CTA_COUNT CTAs (recommended: 2+)"

# Test 19: Check trust signals
grep -q "TrustBadges\|trust" components/CategoryDetailPage.tsx
test_result $? "CategoryDetailPage has trust signals"

grep -q "Winner\|winnaar" components/ComparisonPage.tsx
test_result $? "ComparisonPage highlights winner"

# Test 20: Check social proof
grep -q "verkocht\|Bezoekers\|tevreden" components/CategoryDetailPage.tsx
test_result $? "CategoryDetailPage has social proof"

echo ""
echo "=================================================="
echo "📈 Test Summary"
echo "=================================================="
echo -e "${GREEN}✓ Passed: $PASSED${NC}"
echo -e "${RED}✗ Failed: $FAILED${NC}"
echo -e "${YELLOW}⚠ Warnings: $WARNINGS${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 All critical tests passed!${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Manual testing on live site"
  echo "2. Cross-browser testing"
  echo "3. Mobile device testing"
  echo "4. Monitor analytics after deployment"
  exit 0
else
  echo -e "${RED}❌ Some tests failed. Please fix before deployment.${NC}"
  exit 1
fi
