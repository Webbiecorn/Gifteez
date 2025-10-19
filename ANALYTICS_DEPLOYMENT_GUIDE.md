# 📊 Analytics & Experimentation Framework - Deployment Guide

**Datum:** 19 oktober 2025  
**Status:** Ready for Implementation

---

## ✅ What's Been Created

### **Services (3 files)**

1. ✅ `services/analyticsEventService.ts` (~380 lines)
   - Unified event schema (view_product, click_affiliate, etc.)
   - Batch tracking voor product lists
   - Session management
   - GTM dataLayer integration

2. ✅ `services/funnelTrackingService.ts` (~350 lines)
   - Multi-step funnel tracking
   - Drop-off rate calculation
   - Time-per-step measurement
   - Conversion metrics

3. ✅ `services/abTestingService.ts` (~450 lines)
   - Deterministic variant assignment
   - Multi-variant support (A/B/C/D/...)
   - Conversion tracking
   - Statistical significance testing

### **Hooks (2 files)**

1. ✅ `hooks/useFunnelTracking.ts` (~100 lines)
   - React hook for funnel tracking
   - Auto-lifecycle management
   - Step completion tracking

2. ✅ `hooks/useABTest.ts` (~100 lines)
   - React hook for A/B tests
   - Auto variant assignment
   - Conversion tracking helper

### **Documentation (3 files)**

1. ✅ `ANALYTICS_EXPERIMENTATION_PLAN.md` (~600 lines)
   - Complete architecture overview
   - Event schema definitions
   - Funnel definitions
   - GTM configuration guide

2. ✅ `examples/HomePage_Integration_Example.tsx` (~200 lines)
   - Real-world A/B test examples
   - Funnel tracking integration
   - Event tracking patterns

3. ✅ `examples/GiftFinderPage_Integration_Example.tsx` (~250 lines)
   - GiftFinder-specific analytics
   - Filter tracking
   - Product impression tracking
   - Affiliate click tracking

---

## 🚀 Deployment Steps

### **Phase 1: Core Services** (Week 1)

#### Step 1: Verify Files Exist

```bash
# Check all files are in place
ls -la services/analyticsEventService.ts
ls -la services/funnelTrackingService.ts
ls -la services/abTestingService.ts
ls -la hooks/useFunnelTracking.ts
ls -la hooks/useABTest.ts
```

#### Step 2: Build & Test

```bash
npm run build
# Should compile without errors
```

#### Step 3: Test in Browser Console

```typescript
// Open browser console on any page
import { AnalyticsEvents } from './services/analyticsEventService'

// Test event tracking
AnalyticsEvents.startGiftFinder('test')

// Check GTM dataLayer
console.log(window.dataLayer)
// Should see event: 'start_giftfinder'
```

---

### **Phase 2: GiftFinder Integration** (Week 1-2)

#### Step 1: Add Imports to GiftFinderPage.tsx

```typescript
import { useFunnelTracking } from '../hooks/useFunnelTracking'
import {
  trackStartGiftFinder,
  trackApplyFilter,
  trackProductImpressions,
} from '../services/analyticsEventService'
```

#### Step 2: Setup Funnel Tracking

```typescript
const { trackStep } = useFunnelTracking('giftfinder_flow')

useEffect(() => {
  trackStartGiftFinder('page_visit')
  trackStep('start_giftfinder')
}, [trackStep])
```

#### Step 3: Track Filter Changes

```typescript
const handleOccasionChange = (occasion: string) => {
  setOccasion(occasion)
  trackApplyFilter('occasion', occasion, 'giftfinder', filteredProducts.length)
  trackStep('apply_filters')
}
```

#### Step 4: Track Product Impressions

```typescript
useEffect(() => {
  if (filteredProducts.length > 0) {
    trackProductImpressions(filteredProducts, 'giftfinder_results')
    trackStep('view_results')
  }
}, [filteredProducts, trackStep])
```

---

### **Phase 3: A/B Testing Integration** (Week 2)

#### Step 1: Add A/B Test to HomePage

```typescript
import { useABTest } from '../hooks/useABTest';

const { variant: heroCTA, trackConversion } = useABTest('hero_cta_text', {
  A: 'Vind het perfecte cadeau',
  B: 'Start GiftFinder',
  C: 'Ontdek jouw ideale cadeau'
});

<Button onClick={() => {
  trackConversion('click');
  navigateTo('giftFinder');
}}>
  {heroCTA} →
</Button>
```

#### Step 2: Test Variant Assignment

```bash
# Open browser console
localStorage.clear(); # Clear previous assignments
# Reload page multiple times
# Variant should stay consistent (same user = same variant)
```

#### Step 3: Track Conversions

```typescript
// In any component with A/B test
const { trackConversion } = useABTest('test_name', variants)

// On conversion action (click, submit, etc.)
trackConversion('click')
```

---

### **Phase 4: GTM Configuration** (Week 2-3)

#### Step 1: Create DataLayer Variables in GTM

**Required Variables:**

1. `dlv - filter_type` → Data Layer Variable → `filter_type`
2. `dlv - filter_value` → Data Layer Variable → `filter_value`
3. `dlv - results_count` → Data Layer Variable → `results_count`
4. `dlv - product_id` → Data Layer Variable → `product_id`
5. `dlv - position` → Data Layer Variable → `position`
6. `dlv - list_name` → Data Layer Variable → `list_name`
7. `dlv - affiliate_url` → Data Layer Variable → `affiliate_url`
8. `dlv - funnel_name` → Data Layer Variable → `funnel_name`
9. `dlv - step_name` → Data Layer Variable → `step_name`
10. `dlv - step_number` → Data Layer Variable → `step_number`
11. `dlv - session_id` → Data Layer Variable → `session_id`
12. `dlv - test_name` → Data Layer Variable → `test_name`
13. `dlv - variant_name` → Data Layer Variable → `variant_name`

#### Step 2: Create Custom Event Triggers

**Triggers to Create:**

1. **Custom Event Trigger**: `apply_filter`
2. **Custom Event Trigger**: `view_product`
3. **Custom Event Trigger**: `click_affiliate`
4. **Custom Event Trigger**: `start_giftfinder`
5. **Custom Event Trigger**: `share_pin`
6. **Custom Event Trigger**: `funnel_step_complete`
7. **Custom Event Trigger**: `ab_variant_impression`
8. **Custom Event Trigger**: `ab_variant_conversion`

#### Step 3: Create GA4 Event Tags

**1. GA4 - Apply Filter**

- Tag Type: Google Analytics: GA4 Event
- Event Name: `apply_filter`
- Parameters:
  - `filter_type`: `{{dlv - filter_type}}`
  - `filter_value`: `{{dlv - filter_value}}`
  - `results_count`: `{{dlv - results_count}}`
- Trigger: `apply_filter`

**2. GA4 - View Product**

- Tag Type: Google Analytics: GA4 Event
- Event Name: `view_item`
- Parameters:
  - `item_id`: `{{dlv - product_id}}`
  - `item_name`: `{{dlv - product_name}}`
  - `item_category`: `{{dlv - category}}`
  - `price`: `{{dlv - price}}`
  - `currency`: `EUR`
  - `index`: `{{dlv - position}}`
  - `item_list_name`: `{{dlv - list_name}}`
- Trigger: `view_product`

**3. GA4 - Click Affiliate**

- Tag Type: Google Analytics: GA4 Event
- Event Name: `select_item`
- Parameters:
  - `item_id`: `{{dlv - product_id}}`
  - `item_name`: `{{dlv - product_name}}`
  - `price`: `{{dlv - price}}`
  - `source`: `{{dlv - source}}`
  - `funnel_step`: `{{dlv - funnel_step}}`
- Trigger: `click_affiliate`

**4. GA4 - Funnel Step**

- Tag Type: Google Analytics: GA4 Event
- Event Name: `funnel_step_complete`
- Parameters:
  - `funnel_name`: `{{dlv - funnel_name}}`
  - `step_name`: `{{dlv - step_name}}`
  - `step_number`: `{{dlv - step_number}}`
  - `session_id`: `{{dlv - session_id}}`
  - `time_on_step`: `{{dlv - time_on_step}}`
- Trigger: `funnel_step_complete`

**5. GA4 - A/B Variant Impression**

- Tag Type: Google Analytics: GA4 Event
- Event Name: `ab_variant_impression`
- Parameters:
  - `test_name`: `{{dlv - test_name}}`
  - `variant_name`: `{{dlv - variant_name}}`
- Trigger: `ab_variant_impression`

**6. GA4 - A/B Variant Conversion**

- Tag Type: Google Analytics: GA4 Event
- Event Name: `ab_variant_conversion`
- Parameters:
  - `test_name`: `{{dlv - test_name}}`
  - `variant_name`: `{{dlv - variant_name}}`
  - `conversion_action`: `{{dlv - conversion_action}}`
- Trigger: `ab_variant_conversion`

#### Step 4: Test in GTM Preview Mode

```bash
1. Open GTM → Click "Preview"
2. Enter site URL: https://gifteez-7533b.web.app
3. Navigate to GiftFinder
4. Apply filters
5. View products
6. Click affiliate link

# Verify in GTM Preview:
- All custom events fire correctly
- All dataLayer variables populate
- GA4 tags fire successfully
```

---

### **Phase 5: Production Deployment** (Week 3)

#### Step 1: Build Production Bundle

```bash
npm run build
```

#### Step 2: Verify No Errors

```bash
# Check for TypeScript errors
npm run type-check

# Check bundle size (should be minimal increase)
ls -lh dist/assets/*.js
```

#### Step 3: Deploy to Firebase

```bash
firebase deploy --only hosting
```

#### Step 4: Verify in Production

```bash
# Open production URL
https://gifteez-7533b.web.app

# Open browser console
window.dataLayer
# Should see events: start_giftfinder, apply_filter, etc.
```

---

## 📊 Testing Checklist

### **Analytics Events**

- [ ] `start_giftfinder` fires on GiftFinder page load
- [ ] `apply_filter` fires when filters change
- [ ] `view_product` fires for each product impression
- [ ] `click_affiliate` fires when affiliate link clicked
- [ ] `share_pin` fires when Pinterest share clicked

### **Funnel Tracking**

- [ ] Funnel starts on homepage view
- [ ] Steps track in correct order
- [ ] Drop-off rate calculates correctly
- [ ] Time per step measures accurately
- [ ] Funnel metrics visible in localStorage

### **A/B Testing**

- [ ] Variant assignment is deterministic (same user = same variant)
- [ ] Variant impressions track correctly
- [ ] Conversions track when triggered
- [ ] Metrics calculate conversion rates
- [ ] Winning variant identified correctly

### **GTM Integration**

- [ ] All dataLayer variables populate
- [ ] All triggers fire correctly
- [ ] All GA4 tags send events
- [ ] Events visible in GA4 DebugView
- [ ] No console errors

---

## 📈 Success Metrics

### **Week 1-2 (Baseline)**

- Establish baseline funnel metrics
- Track current drop-off rates
- Measure average time per step
- Identify top friction points

### **Week 3-4 (A/B Testing)**

- Run 3 A/B tests simultaneously:
  - Hero CTA text (3 variants)
  - Hero image style (3 variants)
  - Newsletter position (3 variants)
- Collect minimum 1,000 impressions per variant
- Achieve 95% statistical significance
- Pick winning variants

### **Month 2+ (Optimization)**

- **Target**: 10% increase in GiftFinder → Affiliate click rate
- **Target**: 20% reduction in funnel drop-off
- **Target**: 15% increase in average session duration
- **Target**: 5% increase in overall conversion rate

---

## 🔒 Privacy & GDPR

### **Compliance**

- ✅ All events gated by cookie consent
- ✅ No tracking before user accepts
- ✅ Session IDs are non-identifying random strings
- ✅ User can clear analytics data anytime
- ✅ No personal data (names, emails, addresses)

### **Data Retention**

- GA4: 14 months (configurable in GA4 settings)
- Funnel metrics: 90 days (localStorage)
- A/B test results: 60 days (localStorage)

---

## 🎯 Next Steps

1. **Week 1**: Deploy core services & test in staging
2. **Week 2**: Integrate in GiftFinderPage & HomePage
3. **Week 3**: Configure GTM tags & triggers
4. **Week 4**: Deploy to production & monitor
5. **Month 2**: Analyze results & iterate

---

## 📚 Additional Resources

- **Event Catalog**: See `ANALYTICS_EXPERIMENTATION_PLAN.md`
- **Integration Examples**: See `examples/` folder
- **GTM Guide**: See `GTM_SETUP_GUIDE.md`
- **Funnel Definitions**: See `services/funnelTrackingService.ts`

---

**Questions?** Check browser console:

```typescript
import { getAllTestMetrics } from './services/abTestingService'
import { getAllFunnelMetrics } from './services/funnelTrackingService'

console.log('A/B Tests:', getAllTestMetrics())
console.log('Funnels:', getAllFunnelMetrics())
```
