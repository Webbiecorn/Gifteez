# 🎁 Gifteez Programmatic SEO System - Complete Architectuur

> **Doel van dit document:** Uitleg voor developers, AI-assistenten en toekomstige contributors over hoe het programmatic systeem werkt, van configuratie tot geld verdienen.

---

## 📋 Inhoudsopgave

1. [Wat is het Programmatic Systeem?](#1-wat-is-het-programmatic-systeem)
2. [Architectuur Overzicht](#2-architectuur-overzicht)
3. [De Vier Kernonderdelen](#3-de-vier-kernonderdelen)
4. [Dataflow: Van Config naar Geld](#4-dataflow-van-config-naar-geld)
5. [Configuratie Referentie](#5-configuratie-referentie)
6. [Product Classifier Systeem](#6-product-classifier-systeem)
7. [Workflow: Nieuwe Gids Maken](#7-workflow-nieuwe-gids-maken)
8. [Analytics & Tracking](#8-analytics--tracking)
9. [SEO Strategie](#9-seo-strategie)
10. [Troubleshooting](#10-troubleshooting)
11. [AI-Bot Instructies](#11-ai-bot-instructies)

---

## 1. Wat is het Programmatic Systeem?

### Het Probleem

Handmatig affiliate landingspagina's maken kost weken per pagina. Je hebt nodig:

- Unieke copy
- Relevante producten
- Goede metadata
- Interne links
- Duidelijke koopintentie

### De Oplossing

**Eén configuratie-object = één complete SEO-geoptimaliseerde landingspagina.**

```
Configuratie (15 min schrijven)
      ↓
Build Script (automatisch)
      ↓
JSON productbestand
      ↓
Dynamische pagina (automatisch)
      ↓
Pinterest pins → Traffic → Affiliate clicks → €€€
```

### Resultaat

- **19+ actieve gidsen** live
- **Volledig geautomatiseerde** productselectie
- **Multi-retailer** support (Coolblue, SLYGAD, PartyPro, Holland & Barrett)
- **Real-time analytics** per gids, per product, per retailer

---

## 2. Architectuur Overzicht

```
┌─────────────────────────────────────────────────────────────────────┐
│                        GIFTEEZ PROGRAMMATIC                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐    ┌──────────────────┐    ┌───────────────┐  │
│  │  CONFIGURATIE    │    │   BUILD SCRIPT   │    │  JSON OUTPUT  │  │
│  │                  │    │                  │    │               │  │
│  │ data/programmatic│───▶│ build-programmatic│───▶│ public/       │  │
│  │ /index.ts        │    │ -indices.mts     │    │ programmatic/ │  │
│  │                  │    │                  │    │ *.json        │  │
│  └──────────────────┘    └──────────────────┘    └───────────────┘  │
│           │                      │                       │          │
│           │              ┌───────┴───────┐               │          │
│           │              │               │               │          │
│           │    ┌─────────▼─────┐ ┌───────▼───────┐       │          │
│           │    │ PRODUCT FEEDS │ │ TAXONOMY      │       │          │
│           │    │               │ │               │       │          │
│           │    │ • Coolblue    │ │ • keywords    │       │          │
│           │    │ • SLYGAD      │ │ • gpc-mapping │       │          │
│           │    │ • PartyPro    │ │ • overrides   │       │          │
│           │    │ • AWIN feeds  │ │               │       │          │
│           │    └───────────────┘ └───────────────┘       │          │
│           │                                              │          │
│           ▼                                              ▼          │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    FRONTEND PAGINA                            │   │
│  │                                                               │   │
│  │  components/ProgrammaticLandingPage.tsx                       │   │
│  │                                                               │   │
│  │  ┌─────────┐ ┌───────────┐ ┌──────────┐ ┌─────────────────┐  │   │
│  │  │  HERO   │ │ QUICKSCAN │ │ PRODUCTS │ │ KOOPGIDS + FAQ  │  │   │
│  │  └─────────┘ └───────────┘ └──────────┘ └─────────────────┘  │   │
│  │                                                               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    ANALYTICS & TRACKING                       │   │
│  │                                                               │   │
│  │  • Impressions per product    • CTR per gids                 │   │
│  │  • Clicks per retailer        • Performance Insights         │   │
│  │  • Firestore + IndexedDB      • Admin Dashboard              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. De Vier Kernonderdelen

### 3.1 Configuratie (`data/programmatic/index.ts`)

Dit is de **ruggengraat** van het systeem. Elke gids is een `ProgrammaticConfig` object:

```typescript
{
  // IDENTITEIT
  slug: "cadeaus-voor-nachtlezers",  // URL-pad
  title: "Cadeaus voor Nachtlezers (2025)",
  intro: "De beste cadeaus voor boekenliefhebbers...",

  // METADATA (voor badges/filtering)
  occasion: "kerst",
  recipient: "hem",
  budgetMax: 50,
  retailer: "coolblue",  // optioneel: filter op retailer

  // PRODUCTSELECTIE
  filters: {
    maxPrice: 50,
    keywords: ["leeslamp", "boekenlegger", "kindle"],
    excludeKeywords: ["bbq", "grill"],
    preferredMerchants: ["coolblue"],
    maxResults: 24,
    maxPerBrand: 3
  },

  // CONTENT SECTIES
  quickScan: { personas: [...] },
  editorPicks: [{ sku: "ABC123", reason: "Onze favoriet" }],
  koopgids: ["Controleer lumen", "Let op accuduur"],
  faq: [{ q: "Vraag?", a: "Antwoord" }],
  internalLinks: [{ href: "/cadeaus/...", label: "..." }]
}
```

### 3.2 Build Script (`scripts/build-programmatic-indices.mts`)

Het script dat de magie doet:

```bash
npm run build-programmatic-indices
```

**Wat het doet:**

1. **Laadt alle product feeds**
   - Coolblue CSV
   - SLYGAD JSON
   - PartyPro JSON
   - AWIN feeds (Holland & Barrett, etc.)

2. **Normaliseert producten** naar unified format:

   ```typescript
   {
     id: "coolblue:12345:ABC",
     title: "Philips Leeslamp",
     price: 29.99,
     merchant: "Coolblue",
     images: [...],
     affiliateLink: "..."
   }
   ```

3. **Past filters toe** per gids config

4. **Diversifieert** (max 3 per merk, spreiding categorieën)

5. **Schrijft JSON** naar `public/programmatic/<slug>.json`

### 3.3 Frontend (`components/ProgrammaticLandingPage.tsx`)

De React component die de pagina rendert:

```
URL: /cadeaus/cadeaus-voor-nachtlezers
       ↓
Leest config uit PROGRAMMATIC_INDEX[slug]
       ↓
Fetcht /programmatic/cadeaus-voor-nachtlezers.json
       ↓
Rendert complete pagina:
  • Hero met titel/intro
  • QuickScan cards
  • Product grid (met filters/sorting)
  • Editor's Picks
  • Koopgids
  • FAQ (structured data)
  • Interne links
```

### 3.4 Product Classifier (`utils/product-classifier/`)

Het classificatiesysteem dat producten categoriseert:

```
utils/product-classifier/
├── types.ts       # TypeScript interfaces
├── normalize.ts   # Feed → unified Product
├── classifier.ts  # Product → ClassifiedProduct
├── hash.ts        # Deduplicatie
└── diversify.ts   # MMR diversificatie
```

---

## 4. Dataflow: Van Config naar Geld

```
┌─────────────────────────────────────────────────────────────────┐
│                     COMPLETE DATAFLOW                           │
└─────────────────────────────────────────────────────────────────┘

STAP 1: CONFIGURATIE SCHRIJVEN
──────────────────────────────
Developer schrijft config in data/programmatic/index.ts:

  {
    slug: "kerst-tech-onder-100",
    filters: { maxPrice: 100, keywords: ["tech", "gadget"] },
    ...
  }

                              ↓

STAP 2: BUILD SCRIPT RUNNEN
───────────────────────────
$ npm run build-programmatic-indices

  [1] Laad Coolblue feed (15.000 producten)
  [2] Laad SLYGAD feed (1.000 producten)
  [3] Laad PartyPro feed (500 producten)
  [4] Filter: maxPrice <= 100
  [5] Filter: keywords match "tech" OR "gadget"
  [6] Diversify: max 3 per merk
  [7] Selecteer top 24 producten
  [8] Schrijf naar public/programmatic/kerst-tech-onder-100.json

                              ↓

STAP 3: PAGINA IS LIVE
──────────────────────
URL: https://gifteez.nl/cadeaus/kerst-tech-onder-100

  ProgrammaticLandingPage.tsx:
    → fetch('/programmatic/kerst-tech-onder-100.json')
    → render Hero, Products, FAQ, etc.

                              ↓

STAP 4: TRAFFIC GENEREREN
─────────────────────────
Pinterest pins → specifieke gids-URL
Google indexeert → long-tail keywords
Instagram reels → link in bio

                              ↓

STAP 5: GEBRUIKER INTERACTIE
────────────────────────────
Bezoeker landt op pagina
  ↓
Bekijkt producten (IMPRESSION tracked)
  ↓
Klikt op "Bekijk bij Coolblue" (CLICK tracked)
  ↓
Gaat naar Coolblue met affiliate tag
  ↓
Koopt iets (kan ander product zijn!)
  ↓
Gifteez krijgt commissie 💰

                              ↓

STAP 6: ANALYTICS BEKIJKEN
──────────────────────────
Admin Dashboard → Performance Insights:
  • CTR per gids
  • Best presterende retailers
  • Top producten
  • Conversie trends
```

---

## 5. Configuratie Referentie

### Complete ProgrammaticConfig Interface

```typescript
type ProgrammaticConfig = {
  // === IDENTITEIT ===
  slug: string // URL-segment, bijv. "kerst-voor-hem-onder-50"
  title: string // H1 titel
  intro: string // Intro paragraaf

  // === METADATA (optioneel) ===
  occasion?: string // "kerst" | "sinterklaas" | "vaderdag" | etc.
  recipient?: string // "hem" | "haar" | "kinderen" | "collegas"
  budgetMax?: number // Max budget voor badge
  retailer?: string // Filter op specifieke retailer
  interest?: string // "tech" | "mode" | "gaming" | etc.
  audience?: Audience[] // ["men", "women", "gamers"]

  // === CONTENT ===
  highlights?: string[] // Bullet points in hero
  editorPicks?: EditorPick[]
  curatedProducts?: CuratedProduct[] // Handmatig toegevoegde producten

  // === FILTERS ===
  filters?: {
    maxPrice?: number
    fastDelivery?: boolean
    eco?: boolean
    keywords?: string[] // Moet matchen
    boostKeywords?: string[] // Krijgt hogere score
    excludeKeywords?: string[] // Wordt uitgefilterd
    excludeMerchants?: string[]
    preferredMerchants?: string[]
    maxResults?: number // Default: 24
    maxPerBrand?: number // Default: 3
    maxPerCategory?: number
    categories?: string[]
  }

  // === QUICK SCAN ===
  quickScan?: {
    title?: string
    subtitle?: string
    personas: QuickScanPersona[]
  }

  // === RETAILER SPOTLIGHT ===
  retailerSpotlight?: RetailerSpotlightConfig

  // === SEO CONTENT ===
  faq?: { q: string; a: string }[]
  internalLinks?: { href: string; label: string }[]

  // === FLAGS ===
  disableOccasionFilter?: boolean
}
```

### QuickScan Persona

```typescript
type QuickScanPersona = {
  id: string // Uniek ID
  label: string // "De Boekenwurm"
  summary: string // Korte beschrijving
  budgetLabel?: string // "Tot €30"
  badges?: string[] // ["🌿 Duurzaam", "⚡ Snel"]
  topSuggestions?: string[]
  action?: QuickScanAction
}

type QuickScanAction =
  | { type: 'filters'; label: string; fastDeliveryOnly?: boolean; sortOption?: SortOption }
  | { type: 'link'; label: string; href: string }
```

---

## 6. Product Classifier Systeem

### Bestandsstructuur

```
utils/product-classifier/
├── types.ts           # Alle TypeScript types
├── normalize.ts       # Raw feed → Product
├── classifier.ts      # Product → ClassifiedProduct
├── hash.ts            # Canonical keys voor dedup
├── diversify.ts       # MMR algoritme
└── index.ts           # Barrel export

data/taxonomy/
├── keywords.yaml      # Keyword → category/audience mapping
├── gpc-mapping.json   # Google Product Category mapping
└── overrides.json     # SKU-specifieke overrides
```

### Normalisatie Flow

```
Coolblue CSV Row          SLYGAD JSON Item         PartyPro JSON
      │                         │                        │
      ▼                         ▼                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    normalize.ts                              │
│                                                              │
│  Elke feed heeft eigen normalizer:                          │
│  • normalizeCoolblue(row)                                   │
│  • normalizeSlygad(item)                                    │
│  • normalizeAwin(row)                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    Unified Product {
                      id: "coolblue:12345:ABC",
                      title: "...",
                      price: 29.99,
                      merchant: "Coolblue",
                      images: [...],
                      url: "..."
                    }
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    classifier.ts                             │
│                                                              │
│  Voegt toe:                                                  │
│  • audience: "men" | "women" | "unisex"                     │
│  • category: "elektronica" | "mode" | etc.                  │
│  • priceBucket: "under-25" | "25-50" | etc.                 │
│  • occasions: ["kerst", "vaderdag"]                         │
│  • score: relevantie score                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ClassifiedProduct {
                      ...Product,
                      audience: "men",
                      category: "gadgets",
                      priceBucket: "25-50",
                      occasions: ["kerst"],
                      score: 0.85
                    }
```

### Diversificatie (MMR Algoritme)

**Probleem:** Zonder diversificatie krijg je 10× hetzelfde merk.

**Oplossing:** Maximal Marginal Relevance

```typescript
// diversify.ts

function diversifyMMR(
  products: ClassifiedProduct[],
  config: {
    maxPerBrand: number // max 3 per merk
    maxPerCategory: number // max 5 per categorie
    maxTotal: number // totaal max 24
  }
): ClassifiedProduct[] {
  const selected: ClassifiedProduct[] = []
  const brandCounts = new Map<string, number>()
  const categoryCounts = new Map<string, number>()

  for (const product of sortedByScore) {
    const brand = product.brand || 'unknown'
    const category = product.category || 'overig'

    if (brandCounts.get(brand) >= config.maxPerBrand) continue
    if (categoryCounts.get(category) >= config.maxPerCategory) continue

    selected.push(product)
    brandCounts.set(brand, (brandCounts.get(brand) || 0) + 1)
    categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1)

    if (selected.length >= config.maxTotal) break
  }

  return selected
}
```

---

## 7. Workflow: Nieuwe Gids Maken

### Stap 1: Config Toevoegen

Open `data/programmatic/index.ts` en voeg toe:

```typescript
{
  slug: "cadeaus-voor-kattenmoeders",
  title: "Cadeaus voor Kattenmoeders (2025)",
  intro: "De leukste cadeaus voor echte kattenliefhebbers. Van praktisch tot uniek.",

  occasion: "verjaardag",
  recipient: "haar",
  budgetMax: 75,

  filters: {
    maxPrice: 75,
    keywords: ["kat", "poes", "kitten", "cat"],
    excludeKeywords: ["hond", "dog"],
    maxResults: 24,
    maxPerBrand: 3
  },

  highlights: [
    "🐱 Speciaal geselecteerd voor kattenliefhebbers",
    "🎁 Originele cadeaus die je nergens anders vindt",
    "🚚 Snel geleverd"
  ],

  quickScan: {
    title: "Snelle Keuze",
    personas: [
      {
        id: "praktisch",
        label: "Praktisch",
        summary: "Handige spullen voor de dagelijkse kattenverzorging",
        action: { type: "filters", label: "Toon praktisch", sortOption: "price-asc" }
      },
      {
        id: "speels",
        label: "Speels",
        summary: "Speelgoed en entertainment voor de kat",
        action: { type: "filters", label: "Toon speelgoed", sortOption: "featured" }
      }
    ]
  },

  faq: [
    {
      q: "Wat is een leuk cadeau voor een kattenmoeder?",
      a: "Denk aan gepersonaliseerde items met hun kat erop, praktische verzorgingsproducten, of leuk speelgoed voor de kat."
    }
  ],

  internalLinks: [
    { href: "/cadeaus/duurzame-lifestyle-cadeaus", label: "Duurzame cadeaus" }
  ]
}
```

### Stap 2: Build Runnen

```bash
npm run build-programmatic-indices
```

Output:

```
📚 Loading taxonomy...
  ✓ Keywords loaded
  ✓ GPC mapping loaded

📦 Loading product feeds...
  ✓ Coolblue: 15234 products
  ✓ SLYGAD: 1024 products
  ✓ PartyPro: 489 products

🔨 Building indices...
  ✓ cadeaus-voor-kattenmoeders: 24 products (3 sources)

✅ Done! 20 indices generated.
```

### Stap 3: Pagina Testen

```bash
npm run dev
# Open: http://localhost:5173/cadeaus/cadeaus-voor-kattenmoeders
```

### Stap 4: Deploy

```bash
npm run deploy
```

### Stap 5: Pinterest Pins Maken

Maak 10-20 pins die linken naar:

```
https://gifteez.nl/cadeaus/cadeaus-voor-kattenmoeders
```

---

## 8. Analytics & Tracking

### Wat wordt getrackt?

| Event            | Wanneer                  | Data                            |
| ---------------- | ------------------------ | ------------------------------- |
| `impression`     | Product komt in viewport | product_id, source, position    |
| `click`          | Klik op affiliate button | product_id, source, destination |
| `view_item_list` | Pagina geladen           | list_name, items[]              |
| `select_item`    | Product geselecteerd     | item_id, list_name              |

### Source Descriptor Format

```
programmatic:{slug}:{context}:{feed}

Voorbeelden:
- programmatic:kerst-tech-onder-100:grid:coolblue
- programmatic:dames-mode-duurzaam:editor:slygad
- programmatic:sinterklaas-kinderen:spotlight:partypro
```

### Performance Insights Service

```typescript
// services/performanceInsightsService.ts

PerformanceInsightsService.trackImpression(sourceDescriptor, productId)
PerformanceInsightsService.trackClick(sourceDescriptor, productId)
PerformanceInsightsService.getMetrics(days: number)
```

### Admin Dashboard

**Route:** `/admin` → Performance Insights tab

Toont:

- CTR per gids
- Top producten
- Retailer performance
- Trends over tijd

---

## 9. SEO Strategie

### Waarom Dit Werkt

#### 1. Niche Clusters

```
/cadeaus/kerst-voor-hem-onder-50
/cadeaus/kerst-voor-hem-onder-150
/cadeaus/kerst-voor-haar-onder-50
/cadeaus/kerst-tech-onder-100
```

Google ziet een **topical authority** op "kerstcadeaus".

#### 2. Long-tail Keywords

Elke gids target specifieke zoektermen:

- "kerstcadeaus voor hem onder 50 euro"
- "duurzame cadeaus voor vrouwen"
- "tech gadgets kerst 2025"

#### 3. Structured Data

```typescript
// Automatisch gegenereerd per pagina
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [...]
}
</script>
```

#### 4. Interne Links

Elke gids linkt naar gerelateerde gidsen:

```
kerst-voor-hem-onder-50
  → linkt naar: kerst-tech-onder-100
  → linkt naar: duurzame-cadeaus-mannen
```

Dit creëert **SEO-clusters**.

### Pinterest Strategie

```
Pin: "15 Originele Kerstcadeaus voor Hem (Onder €50)"
  ↓
Link: https://gifteez.nl/cadeaus/kerst-voor-hem-onder-50
  ↓
Bezoeker landt direct op relevante pagina
  ↓
Hoge engagement → Pinterest boost de pin
  ↓
Meer verkeer → Meer affiliate clicks
```

---

## 10. Troubleshooting

### Probleem: Build script faalt

```bash
# Check of feeds bestaan
ls -la data/feeds/
ls -la data/*.json

# Run met debug output
DEBUG=true npm run build-programmatic-indices
```

### Probleem: Pagina toont geen producten

1. Check of JSON bestaat:

   ```bash
   ls public/programmatic/<slug>.json
   ```

2. Check JSON content:

   ```bash
   cat public/programmatic/<slug>.json | jq '.products | length'
   ```

3. Check browser console voor fetch errors

### Probleem: Verkeerde producten

1. Review filters in config
2. Check `excludeKeywords`
3. Run build opnieuw met logging

### Probleem: Affiliate links werken niet

1. Check `APPROVED_MERCHANTS` whitelist
2. Verify affiliate tags in `services/affiliate.ts`
3. Test link handmatig

---

## 11. AI-Bot Instructies

### Context voor AI Assistenten

> Als je werkt aan het Gifteez programmatic systeem, onthoud:

#### ✅ DO's

1. **Configuratie is de source of truth**
   - Alle content komt uit `data/programmatic/index.ts`
   - Wijzig nooit direct de JSON in `public/programmatic/`

2. **Run altijd de build na config wijzigingen**

   ```bash
   npm run build-programmatic-indices
   ```

3. **Respecteer de approved merchants lijst**
   - Alleen producten van goedgekeurde affiliates worden getoond
   - Check `APPROVED_MERCHANTS` in build script

4. **Volg het type systeem**
   - Alle configs moeten voldoen aan `ProgrammaticConfig` interface
   - TypeScript zal errors geven bij ongeldige configs

#### ❌ DON'Ts

1. **Bewerk nooit `public/programmatic/*.json` handmatig**
   - Deze worden overschreven door de build

2. **Voeg geen nieuwe retailers toe zonder approval**
   - Affiliate partnerships moeten eerst worden goedgekeurd

3. **Maak geen duplicate slugs**
   - Elke slug moet uniek zijn

4. **Vergeet de build niet**
   - Config wijzigingen werken pas na `npm run build-programmatic-indices`

### Veelvoorkomende AI Taken

#### Nieuwe gids toevoegen

```typescript
// Voeg toe aan PROGRAMMATIC_VARIANTS array in data/programmatic/index.ts
{
  slug: "nieuwe-gids",
  title: "...",
  // ... rest van config
}
```

#### Filters aanpassen

```typescript
filters: {
  maxPrice: 75,           // Pas budget aan
  keywords: ["..."],      // Voeg zoektermen toe
  excludeKeywords: ["..."] // Filter ongewenste items
}
```

#### FAQ toevoegen

```typescript
faq: [
  { q: 'Vraag hier?', a: 'Antwoord hier.' },
  // Voeg meer toe...
]
```

---

## Samenvatting

> **Het Gifteez Programmatic System is een schaalbare engine die via configuratie → productselectie → dynamische pagina → analytics, automatisch hyperniche affiliate-landingspagina's genereert die hoog converteren en SEO-vriendelijk zijn.**

### Key Files

| Bestand                                  | Functie                   |
| ---------------------------------------- | ------------------------- |
| `data/programmatic/index.ts`             | Alle gids configuraties   |
| `scripts/build-programmatic-indices.mts` | Build script              |
| `components/ProgrammaticLandingPage.tsx` | Frontend component        |
| `utils/product-classifier/*`             | Classificatie systeem     |
| `public/programmatic/*.json`             | Gegenereerde product data |
| `data/taxonomy/*`                        | Keyword/category mappings |

### Commands

```bash
# Build alle indices
npm run build-programmatic-indices

# Development server
npm run dev

# Deploy naar productie
npm run deploy
```

---

_Laatste update: November 2025_
_Maintainer: Gifteez Team_
