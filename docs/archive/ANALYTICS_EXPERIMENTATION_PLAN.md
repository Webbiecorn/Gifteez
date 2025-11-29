# 📊 Analytics & Experimentation Framework - Implementatieplan

**Datum:** 19 oktober 2025  
**Status:** Planning

---

## 🎯 Doel

Een **complete analytics & experimentation infrastructure** die:

1. **Unified Event Schema**: Consistente event tracking (GA4, Pinterest, Affiliate)
2. **Funnel Tracking**: Home → GiftFinder → Product → Affiliate Click → Outbound
3. **A/B Testing**: Variant toggles voor CTA-teksten, hero-beelden, layouts
4. **Conversion Analytics**: Inzicht in user journey & drop-off punten
5. **Privacy-First**: GDPR compliant, cookie consent integratie

---

## 📋 Architectuur Overzicht

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERACTIONS                         │
│   (Page Views, Clicks, Filters, Searches, Affiliate Clicks)     │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ANALYTICS SERVICE LAYER                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐ │
│  │ Event Tracker    │  │ Funnel Tracker   │  │ A/B Variant   │ │
│  │ - view_product   │  │ - Step tracking  │  │ - Feature     │ │
│  │ - click_affiliate│  │ - Drop-off rates │  │   flags       │ │
│  │ - start_finder   │  │ - Time per step  │  │ - Split test  │ │
│  │ - apply_filter   │  └──────────────────┘  └───────────────┘ │
│  │ - share_pin      │                                            │
│  └──────────────────┘                                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATA LAYER (GTM)                              │
│  - window.dataLayer.push({event: 'view_product', ...})          │
│  - Centralized event bus                                         │
│  - Consent-aware (only fires after cookie accept)               │
└────────────────────────┬────────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         ▼                               ▼
┌─────────────────┐            ┌─────────────────┐
│  GA4 Events     │            │ Pinterest Tags  │
│  - Conversions  │            │ - Engagement    │
│  - E-commerce   │            │ - Rich Pins     │
└─────────────────┘            └─────────────────┘
```

---

## 🎯 Event Schema (Unified)

### 1. **view_product** (Product Impression)

```typescript
{
  event: 'view_product',
  product_id: string,
  product_name: string,
  category: string,
  price: number,
  retailer: string,
  position: number, // Position in list (1-based)
  list_name: string, // 'giftfinder_results', 'deals_page', 'category_grid'
  variant?: string // A/B variant if applicable
}
```

### 2. **click_affiliate** (Affiliate Link Click)

```typescript
{
  event: 'click_affiliate',
  product_id: string,
  product_name: string,
  affiliate_url: string,
  retailer: string,
  price: number,
  category: string,
  source: string, // 'giftfinder', 'deals', 'blog', 'category'
  funnel_step: string // 'initial_view', 'quick_view', 'detail_page'
}
```

### 3. **start_giftfinder** (GiftFinder Start)

```typescript
{
  event: 'start_giftfinder',
  entry_point: string, // 'homepage_hero', 'navbar', 'floating_cta'
  timestamp: number
}
```

### 4. **apply_filter** (Filter Applied)

```typescript
{
  event: 'apply_filter',
  filter_type: string, // 'occasion', 'recipient', 'budget', 'interests'
  filter_value: string | number | string[],
  context: string, // 'giftfinder', 'deals', 'category'
  results_count: number
}
```

### 5. **share_pin** (Pinterest Share)

```typescript
{
  event: 'share_pin',
  content_type: string, // 'product', 'blog', 'deal'
  content_id: string,
  content_title: string,
  platform: 'pinterest'
}
```

### 6. **funnel_step_complete** (Funnel Progression)

```typescript
{
  event: 'funnel_step_complete',
  funnel_name: string, // 'product_to_affiliate', 'giftfinder_flow'
  step_name: string, // 'view_product', 'apply_filters', 'click_affiliate'
  step_number: number,
  session_id: string,
  time_on_step: number // milliseconds
}
```

---

## 🚀 Funnel Tracking

### **Primary Funnel: Product Discovery → Affiliate Click**

```
Step 1: Home Page View
   ↓
Step 2: GiftFinder Start (start_giftfinder)
   ↓
Step 3: Apply Filters (apply_filter)
   ↓
Step 4: View Product (view_product)
   ↓
Step 5: Click Affiliate (click_affiliate)
   ↓
Step 6: Outbound (trackOutboundClick)
```

**Metrics te tracken:**

- Conversion rate per step (% die doorgaat)
- Average time per step
- Drop-off punten (waar verlaten users?)
- A/B variant performance per step

---

## 🧪 A/B Testing Framework

### **Variant Toggle Systeem**

**Use Cases:**

1. **Hero CTA Text**: "Vind het perfecte cadeau" vs "Start GiftFinder"
2. **Hero Image**: Mascot vs Product collage
3. **GiftFinder Layout**: Compact vs Expanded filters
4. **Deal Card Style**: Minimal vs Rich detail
5. **Floating CTA Timing**: 3 pages vs 5 pages

**Implementation:**

```typescript
const variant = getABVariant('hero_cta_text', {
  A: 'Vind het perfecte cadeau',
  B: 'Start GiftFinder',
  C: 'Ontdek jouw ideale cadeau',
})

// Track variant impression
trackVariantImpression('hero_cta_text', variant)

// Track variant conversion
trackVariantConversion('hero_cta_text', variant, 'click')
```

**Split Logic:**

- User ID hash (consistent per user)
- 33/33/33% split (3 variants)
- Stored in localStorage
- Analytics via GTM

---

## 📁 Files to Create

### 1. `services/analyticsEventService.ts` (~350 lines)

**Purpose:** Unified event tracking met schema validation

**Functions:**

- `trackViewProduct(product, position, listName)`
- `trackClickAffiliate(product, source, funnelStep)`
- `trackStartGiftFinder(entryPoint)`
- `trackApplyFilter(filterType, filterValue, context, resultsCount)`
- `trackSharePin(contentType, contentId, contentTitle)`
- `trackFunnelStep(funnelName, stepName, stepNumber)`

---

### 2. `services/funnelTrackingService.ts` (~300 lines)

**Purpose:** Track multi-step user journeys

**Features:**

- Session management (30 min session window)
- Step progression tracking
- Time-per-step measurement
- Drop-off detection
- Funnel analytics dashboard

**Functions:**

- `startFunnel(funnelName)`
- `completeStep(funnelName, stepName)`
- `getFunnelMetrics(funnelName)`
- `getDropOffRate(funnelName, stepName)`

---

### 3. `services/abTestingService.ts` (~250 lines)

**Purpose:** A/B variant assignment & tracking

**Features:**

- Consistent user-to-variant assignment (localStorage hash)
- Multi-variant support (A/B/C/D)
- Automatic GTM event tracking
- Conversion tracking per variant
- Admin dashboard voor results

**Functions:**

- `getVariant(testName, variants)` → Returns 'A' | 'B' | 'C'
- `trackVariantImpression(testName, variant)`
- `trackVariantConversion(testName, variant, action)`
- `getTestResults(testName)` → Returns win rate per variant

---

### 4. `hooks/useABTest.ts` (~100 lines)

**Purpose:** React hook voor A/B tests

**Usage:**

```typescript
const { variant, trackConversion } = useABTest('hero_cta', {
  A: { text: 'Vind het perfecte cadeau', color: 'blue' },
  B: { text: 'Start GiftFinder', color: 'green' }
});

<Button onClick={() => trackConversion('click')}>
  {variant.text}
</Button>
```

---

### 5. `hooks/useFunnelTracking.ts` (~120 lines)

**Purpose:** React hook voor funnel tracking

**Usage:**

```typescript
const { startFunnel, trackStep } = useFunnelTracking('product_flow')

useEffect(() => {
  startFunnel()
  trackStep('view_homepage')
}, [])

const handleGiftFinderStart = () => {
  trackStep('start_giftfinder')
  navigateTo('giftFinder')
}
```

---

### 6. `components/ABTestVariant.tsx` (~80 lines)

**Purpose:** Component wrapper voor A/B tests

**Usage:**

```typescript
<ABTestVariant testName="hero_layout">
  <ABVariant name="A">
    <HeroCompact />
  </ABVariant>
  <ABVariant name="B">
    <HeroExpanded />
  </ABVariant>
</ABTestVariant>
```

---

### 7. `components/AnalyticsDashboard.tsx` (Extend existing)

**Add:**

- Funnel visualization (Sankey diagram)
- A/B test results table
- Conversion rate per variant
- Drop-off heatmap

---

## 🎯 Integration Points

### **GiftFinderPage.tsx**

```typescript
import {
  trackStartGiftFinder,
  trackApplyFilter,
  trackViewProduct,
} from '../services/analyticsEventService'
import { useFunnelTracking } from '../hooks/useFunnelTracking'

const { trackStep } = useFunnelTracking('giftfinder_flow')

// On mount
useEffect(() => {
  trackStartGiftFinder('page_visit')
  trackStep('start_giftfinder')
}, [])

// On filter apply
const handleFilterChange = (filters) => {
  trackApplyFilter('occasion', filters.occasion, 'giftfinder', results.length)
  trackStep('apply_filters')
}

// On product view
const handleProductView = (product, position) => {
  trackViewProduct(product, position, 'giftfinder_results')
  trackStep('view_product')
}
```

---

### **GiftResultCard.tsx**

```typescript
import { trackClickAffiliate } from '../services/analyticsEventService'

const handleAffiliateClick = () => {
  trackClickAffiliate(product, 'giftfinder', 'result_card')
  trackStep('click_affiliate') // From funnel hook
}
```

---

### **HomePage.tsx**

```typescript
import { useABTest } from '../hooks/useABTest';

const { variant, trackConversion } = useABTest('hero_cta_text', {
  A: 'Vind het perfecte cadeau',
  B: 'Start GiftFinder',
  C: 'Ontdek jouw ideale cadeau'
});

<Button onClick={() => {
  trackConversion('click');
  navigateTo('giftFinder');
}}>
  {variant}
</Button>
```

---

### **DealsPage.tsx**

```typescript
import { trackViewProduct } from '../services/analyticsEventService'

useEffect(() => {
  deals.forEach((deal, index) => {
    trackViewProduct(deal, index + 1, 'deals_page')
  })
}, [deals])
```

---

## 📊 GTM Configuration Updates

### **New DataLayer Variables:**

1. `dlv - product_id`
2. `dlv - position`
3. `dlv - list_name`
4. `dlv - funnel_name`
5. `dlv - step_name`
6. `dlv - step_number`
7. `dlv - variant_name`
8. `dlv - test_name`
9. `dlv - affiliate_url`
10. `dlv - time_on_step`

### **New Triggers:**

1. Custom Event: `view_product`
2. Custom Event: `click_affiliate`
3. Custom Event: `start_giftfinder`
4. Custom Event: `apply_filter`
5. Custom Event: `share_pin`
6. Custom Event: `funnel_step_complete`
7. Custom Event: `ab_variant_impression`
8. Custom Event: `ab_variant_conversion`

### **New Tags:**

1. **GA4 - View Product**: Tracks product impressions
2. **GA4 - Affiliate Click**: Enhanced conversion tracking
3. **GA4 - Funnel Step**: Custom dimension for funnel analysis
4. **GA4 - A/B Variant**: Custom dimension for variant tracking

---

## 🧪 Testing Plan

### **Phase 1: Event Schema (Week 1)**

1. ✅ Create `analyticsEventService.ts`
2. ✅ Integrate in GiftFinderPage
3. ✅ Test events in GTM Preview
4. ✅ Verify GA4 event reception

### **Phase 2: Funnel Tracking (Week 2)**

1. ✅ Create `funnelTrackingService.ts`
2. ✅ Create `useFunnelTracking` hook
3. ✅ Implement GiftFinder funnel
4. ✅ Dashboard visualization

### **Phase 3: A/B Testing (Week 3)**

1. ✅ Create `abTestingService.ts`
2. ✅ Create `useABTest` hook
3. ✅ Test Hero CTA variants
4. ✅ Collect 1 week data
5. ✅ Analyze results

### **Phase 4: Production Rollout (Week 4)**

1. ✅ Deploy to staging
2. ✅ Verify all events
3. ✅ Enable consent-gating
4. ✅ Deploy to production

---

## 📈 Success Metrics

### **Week 1-2 (Baseline):**

- Track current funnel drop-off rates
- Measure average time per step
- Identify top 3 friction points

### **Week 3-4 (A/B Testing):**

- Measure CTR improvement per variant
- Test 3 hero CTA variants
- Pick winning variant (95% confidence)

### **Month 2+:**

- 10% increase in GiftFinder → Affiliate click rate
- 20% reduction in funnel drop-off
- 15% increase in average session duration

---

## 🔒 Privacy & Compliance

### **GDPR Compliance:**

- ✅ All events gated by cookie consent
- ✅ No tracking before user accepts
- ✅ Session IDs are random (non-identifying)
- ✅ User can clear analytics anytime

### **Data Retention:**

- GA4: 14 months (configurable)
- Funnel data: 90 days (localStorage)
- A/B test results: 60 days (localStorage)

---

## 📋 Checklist

**Before Starting:**

- [x] Review current analytics setup (dataLayerService, GTM)
- [x] Identify key conversion points
- [ ] Define A/B test hypotheses

**Phase 1 (Event Schema):**

- [ ] Create `analyticsEventService.ts`
- [ ] Add schema validation
- [ ] Integrate in 5 key pages
- [ ] Test GTM events
- [ ] Document event catalog

**Phase 2 (Funnel Tracking):**

- [ ] Create `funnelTrackingService.ts`
- [ ] Create `useFunnelTracking` hook
- [ ] Define GiftFinder funnel
- [ ] Define Deals funnel
- [ ] Add dashboard visualization

**Phase 3 (A/B Testing):**

- [ ] Create `abTestingService.ts`
- [ ] Create `useABTest` hook
- [ ] Test hero CTA variants
- [ ] Test GiftFinder layout variants
- [ ] Analyze results

**Phase 4 (Production):**

- [ ] Deploy to staging
- [ ] Verify consent integration
- [ ] Test all funnels
- [ ] Monitor for 1 week
- [ ] Deploy to production

---

## 🎯 Expected Impact

### **Analytics:**

- **Visibility**: 100% coverage van user journey
- **Insights**: Weet precies waar users afhaken
- **Optimization**: Data-driven beslissingen

### **A/B Testing:**

- **Conversion**: 10-20% lift van winning variants
- **Confidence**: Statistically significant results
- **Iteration**: Weekly test new hypotheses

### **ROI:**

- **Affiliate Clicks**: +15% door funnel optimalisatie
- **Engagement**: +20% door winning A/B variants
- **Conversion Rate**: +10% door friction reduction

---

**Next Steps:**

1. Review plan met team
2. Approve A/B test hypotheses
3. Start Phase 1 implementation
4. Monitor & iterate

---

**Documentation:**

- GTM Event Catalog: `docs/event-catalog.md`
- Funnel Definitions: `docs/funnel-specs.md`
- A/B Test Results: `docs/ab-test-results.md`
