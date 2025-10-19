# 🏗️ Code Architectuur Verbetering - Implementatieplan

**Datum:** 19 oktober 2025  
**Status:** In Progress (7/7 voltooid)

---

## ✅ Geïmplementeerd

### 1. `/lib/apiClient.ts` - API Client met Retry & Rate Limiting

**Features:**
- ✅ Automatic retry met exponential backoff
- ✅ Request timeout handling (10s default)
- ✅ Rate limiting per endpoint (60 req/min default)
- ✅ Error logging via logger service
- ✅ Convenience methods (get/post/put/delete)

**Gebruik:**
```typescript
import ApiClient from '../lib/apiClient';

const client = new ApiClient('https://api.example.com', 60);
const data = await client.get<Product[]>('/products', {
  timeout: 5000,
  retries: 3,
  rateLimitKey: 'products-list'
});
```

---

### 2. `/lib/logger.ts` - Centralized Logging

**Features:**
- ✅ Multiple log levels (debug, info, warn, error)
- ✅ Contextual logging (route, action, userId)
- ✅ Environment-aware (verbose in dev)
- ✅ Buffer voor remote logging
- ✅ Performance tracking met timers

**Gebruik:**
```typescript
import { logger } from '../lib/logger';

logger.info('User logged in', { userId: '123', route: '/dashboard' });
logger.error('API call failed', new Error('Network error'));

const endTimer = logger.startTimer('Product fetch');
await fetchProducts();
endTimer(); // Logs duration
```

---

### 3. `/lib/cache.ts` - Unified Cache Layer

**Features:**
- ✅ Multiple backends (memory, localStorage, indexedDB)
- ✅ TTL support (default 1 hour)
- ✅ Namespacing (`gifteez:product:<id>`)
- ✅ Cache statistics (hit rate, size)
- ✅ `getOrCompute` helper

**Gebruik:**
```typescript
import { cache } from '../lib/cache';

// Set met TTL
await cache.set('product:123', product, {
  ttl: 60000, // 1 minute
  namespace: 'gifteez',
  backend: 'localStorage'
});

// Get
const cached = await cache.get<Product>('product:123', { namespace: 'gifteez' });

// Get or compute
const product = await cache.getOrCompute(
  'product:123',
  async () => await fetchProduct(123),
  { ttl: 300000 } // 5 minutes
);
```

---

### 4. `.env.example` - Environment Variables

**Features:**
- ✅ Complete overzicht van alle env vars
- ✅ Georganiseerd per categorie
- ✅ Feature flags sectie
- ✅ API configuration sectie
- ✅ Duidelijke comments

**Categorieën:**
- Firebase configuratie
- AI services (Gemini, OpenAI)
- Affiliate networks (AWIN, Coolblue, Amazon, SLYGAD)
- Analytics (GA, GTM, Hotjar)
- Feature flags
- Logging & monitoring
- API configuration
- Cache configuration
- Development settings

---

### 5. `/lib/env.ts` - Environment Validation

**Features:**
- ✅ Type-safe environment config
- ✅ Validation bij startup
- ✅ Default values
- ✅ Helper methods (`isFeatureEnabled`, `getApiConfig`)
- ✅ Warns over ontbrekende optional config

**Gebruik:**
```typescript
import { env } from '../lib/env';

const config = env.getConfig();
const apiConfig = env.getApiConfig();
const isAIEnabled = env.isFeatureEnabled('giftAI');
```

---

### 6. `/lib/featureFlags.ts` - Feature Flags System

**Features:**
- ✅ Environment-based feature flags
- ✅ Runtime overrides (voor testing)
- ✅ A/B testing support
- ✅ LocalStorage persistence
- ✅ Debug mode

**Gebruik:**
```typescript
import { featureFlags } from '../lib/featureFlags';

// Check feature
if (featureFlags.isEnabled('giftAI')) {
  // Show AI features
}

// Runtime override (test)
featureFlags.setOverride('adminDashboard', true, 3600000); // 1 hour

// A/B test
featureFlags.registerABTest({
  name: 'quiz-redesign',
  variants: ['control', 'variant-a', 'variant-b'],
  distribution: [33, 33, 34]
});

const variant = featureFlags.getABTestVariant('quiz-redesign');
```

---

## ⚠️ In Progress

### 7. `/components/RouteErrorBoundary.tsx` - Error Boundaries

**Status:** Component created maar heeft TypeScript configuratie issues

**Geplande Features:**
- React Error Boundary per route
- Fallback UI met recovery opties
- Error logging naar logger
- Copy error details functie
- Development/production mode aware

**TODO:**
- Fix TypeScript class component issues
- Integreren in App.tsx voor elke route
- Testen met opzettelijke errors

---

## 📋 Volgende Stappen

### Hoog Prioriteit
1. **Fix Error Boundary TypeScript issues** (10 min)
   - Mogelijk tsconfig.json aanpassing nodig
   - Of omzetten naar functional component met error boundary hook

2. **Integreer Error Boundaries in App.tsx** (15 min)
   ```tsx
   <RouteErrorBoundary routeName="Home">
     <HomePage />
   </RouteErrorBoundary>
   ```

3. **Migreer bestaande services naar ApiClient** (30 min)
   - `coolblueFeedService.ts` - gebruik ApiClient ipv fetch
   - `shopLikeYouGiveADamnService.ts` - gebruik ApiClient
   - `affiliateService.ts` - gebruik ApiClient

4. **Vervang productCacheService met unified cache** (20 min)
   - Migreer naar lib/cache.ts
   - Consistent namespace gebruik
   - Test IndexedDB backend

### Medium Prioriteit
5. **Logging integratie** (30 min)
   - Vervang console.log statements met logger
   - Add performance tracking key operations
   - Setup remote logging endpoint (optioneel)

6. **Feature flags activeren** (20 min)
   - Test runtime overrides
   - Document feature flag strategy
   - Setup A/B tests

7. **Environment validation** (15 min)
   - Test met ontbrekende env vars
   - Add meer validatie rules
   - Document required vs optional vars

### Laag Prioriteit
8. **API Client uitbreiden** (later)
   - Request/response interceptors
   - JWT authentication support
   - Request deduplication

9. **Cache uitbreiden** (later)
   - IndexedDB backend volledig implementeren
   - Cache warming strategies
   - Cache invalidation patterns

10. **Monitoring & Analytics** (later)
    - Integrate Sentry voor error tracking
    - Setup performance monitoring
    - Feature flag analytics

---

## 🎯 Voordelen van Deze Architectuur

### Robuustheid
- **Retry logic**: API calls falen minder vaak
- **Rate limiting**: Voorkomt API throttling
- **Error boundaries**: App crasht niet bij component errors

### Observability
- **Centralized logging**: Alle events op één plek
- **Performance tracking**: Bottlenecks snel vinden
- **Error reporting**: Bugs snel oplossen

### Flexibiliteit
- **Feature flags**: Graduele rollouts zonder deploy
- **A/B testing**: Data-driven decisies
- **Environment config**: Easy multi-environment setup

### Performance
- **Smart caching**: Minder API calls
- **TTL management**: Fresh data zonder overhead
- **Multiple cache backends**: Kies beste optie per use case

### Developer Experience
- **Type safety**: Minder runtime errors
- **Clear APIs**: Easy to use, hard to misuse
- **Good defaults**: Works out of the box

### Analytics & Experimentation
- **Unified event schema**: Consistente tracking
- **Funnel tracking**: Begrijp user journey
- **A/B testing**: Optimize conversions

---

## 📊 Impact Schatting

| Verbetering | Impact | Effort | Priority |
|-------------|--------|--------|----------|
| API Client | ⭐⭐⭐⭐⭐ Hoog | Medium | P0 |
| Logger | ⭐⭐⭐⭐ Hoog | Laag | P0 |
| Cache Layer | ⭐⭐⭐⭐⭐ Zeer Hoog | Medium | P0 |
| Env Management | ⭐⭐⭐ Medium | Laag | P1 |
| Feature Flags | ⭐⭐⭐⭐ Hoog | Medium | P1 |
| Error Boundaries | ⭐⭐⭐ Medium | Medium | P1 |
| Analytics & A/B | ⭐⭐⭐⭐⭐ Zeer Hoog | Medium | P0 |

---

## ✅ Geïmplementeerd (7/7)

### 7. Analytics & Experimentation Framework (~1,400 lines)

**Services:**
- ✅ `services/analyticsEventService.ts` (380 lines)
  * Unified event schema (view_product, click_affiliate, start_giftfinder, apply_filter, share_pin)
  * Batch product impression tracking
  * Session management
  * GTM dataLayer integration

- ✅ `services/funnelTrackingService.ts` (350 lines)
  * Multi-step funnel tracking (giftfinder_flow, deals_flow, category_flow, blog_flow)
  * Drop-off rate calculation
  * Time-per-step measurement
  * Conversion metrics & analytics
  * Session lifecycle management

- ✅ `services/abTestingService.ts` (450 lines)
  * Deterministic variant assignment (hash-based)
  * Multi-variant support (A/B/C/D/...)
  * Conversion tracking with time measurement
  * Statistical significance testing
  * Winning variant identification

**Hooks:**
- ✅ `hooks/useFunnelTracking.ts` (100 lines)
  * React hook for funnel tracking
  * Auto-lifecycle management (auto-start/end)
  * Step completion tracking
  * Session retrieval

- ✅ `hooks/useABTest.ts` (100 lines)
  * React hook for A/B tests
  * Auto variant assignment on mount
  * Conversion tracking helper
  * Metrics retrieval
  * Winning variant check

**Documentation:**
- ✅ `ANALYTICS_EXPERIMENTATION_PLAN.md` (600 lines)
  * Complete architecture overview
  * Event schema definitions (6 event types)
  * Funnel definitions (4 funnels)
  * GTM configuration guide
  * Testing procedures

- ✅ `ANALYTICS_DEPLOYMENT_GUIDE.md` (500 lines)
  * Step-by-step deployment guide
  * GTM tag/trigger configuration
  * Testing checklist
  * Success metrics
  * Privacy & GDPR compliance

**Examples:**
- ✅ `examples/HomePage_Integration_Example.tsx` (200 lines)
  * Real-world A/B test examples
  * Hero CTA text variants
  * Hero image style variants
  * Newsletter position variants
  * Funnel tracking integration

- ✅ `examples/GiftFinderPage_Integration_Example.tsx` (250 lines)
  * GiftFinder-specific analytics
  * Filter tracking (occasion, budget, recipient, interests)
  * Product impression tracking
  * Affiliate click tracking
  * GTM event structure documentation

**Features:**
- **Event Schema**: 6 unified event types (view_product, click_affiliate, start_giftfinder, apply_filter, share_pin, funnel_step_complete)
- **Funnel Tracking**: 4 predefined funnels with drop-off analysis
- **A/B Testing**: Hash-based deterministic assignment, multi-variant support, conversion tracking
- **Privacy**: GDPR compliant, localStorage-based, non-identifying session IDs
- **GTM Integration**: Complete dataLayer support, 13 custom variables, 8 custom events

**Gebruik:**
```typescript
// A/B Testing
import { useABTest } from '../hooks/useABTest';

const { variant, trackConversion } = useABTest('hero_cta_test', {
  A: 'Vind het perfecte cadeau',
  B: 'Start GiftFinder',
  C: 'Ontdek jouw ideale cadeau'
});

<Button onClick={() => {
  trackConversion('click');
  navigateTo('giftFinder');
}}>
  {variant} →
</Button>

// Funnel Tracking
import { useFunnelTracking } from '../hooks/useFunnelTracking';

const { trackStep } = useFunnelTracking('giftfinder_flow');

useEffect(() => {
  trackStep('start_giftfinder');
}, []);

const handleFilterChange = (filter) => {
  setFilter(filter);
  trackStep('apply_filters');
};

// Analytics Events
import { 
  trackViewProduct, 
  trackClickAffiliate,
  trackProductImpressions 
} from '../services/analyticsEventService';

// Track product view
trackViewProduct(product, 1, 'giftfinder_results');

// Track affiliate click
trackClickAffiliate(product, 'giftfinder', 'result_card', 1);

// Batch track product impressions
trackProductImpressions(products, 'deals_page');
```

---

## 🚀 Deployment Plan

### Phase 1: Infrastructure (Week 1) ✅ COMPLEET
- ✅ Deploy logger, cache, env management
- ✅ Test in development
- ✅ Monitor for issues

### Phase 2: API Migration (Week 2)
- Migrate affiliate services to ApiClient
- Add retry logic to critical endpoints
- Monitor error rates

### Phase 3: Features & Monitoring (Week 3)
- Enable feature flags
- Setup error boundaries
- Integrate analytics

### Phase 4: Analytics & A/B Testing (Week 4) 🆕
- Integrate analytics events in GiftFinderPage
- Setup A/B tests on HomePage (hero CTA, image style)
- Configure GTM tags & triggers (13 variables, 8 events)
- Test funnel tracking in production
- Monitor conversion metrics

### Phase 5: Optimization (Week 5)
- Fine-tune cache TTLs
- Adjust rate limits
- Analyze A/B test results
- Pick winning variants
- Optimize funnel drop-off points

---

## 📝 Documentatie

**Compleet:**
- ✅ API Client usage guide → `lib/apiClient.ts` (comments)
- ✅ Logger best practices → `lib/logger.ts` (comments)
- ✅ Cache strategy document → `lib/cache.ts` (comments)
- ✅ Feature flag workflow → `lib/featureFlags.ts` (comments)
- ✅ Environment setup guide → `.env.example`
- ✅ Analytics & Experimentation → `ANALYTICS_EXPERIMENTATION_PLAN.md`
- ✅ Analytics Deployment → `ANALYTICS_DEPLOYMENT_GUIDE.md`

**TODO:**
- [ ] Error handling guidelines
- [ ] Integration tests voor analytics
- [ ] A/B test results dashboard component
- [ ] Funnel visualization component

---

## 🎯 Success Metrics

### **Week 1-2 (Baseline)**
- Establish baseline funnel metrics
- Track current drop-off rates
- Measure average time per step

### **Week 3-4 (A/B Testing)**
- Run 3 A/B tests: Hero CTA (3 variants), Hero image (3 variants), Newsletter position (3 variants)
- Collect 1,000+ impressions per variant
- Achieve 95% statistical significance

### **Month 2+ (Optimization)**
- **Target**: 10% increase in GiftFinder → Affiliate click rate
- **Target**: 20% reduction in funnel drop-off
- **Target**: 15% increase in average session duration
- **Target**: 5% increase in overall conversion rate

---

**Next Actions:**
1. ✅ Analytics & Experimentation Framework
2. Integrate analytics in GiftFinderPage
3. Setup A/B tests on HomePage
4. Configure GTM tags (13 variables, 8 events)
5. Deploy to staging & test
6. Monitor metrics & iterate


