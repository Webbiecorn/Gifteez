# 🤖 AI_CONTEXT.md — Gifteez Complete Gids voor AI Assistenten

> **Laatst bijgewerkt:** 29 november 2025  
> **Doel:** Dit document bevat ALLES wat een AI-assistent moet weten om effectief te werken met de Gifteez codebase.

---

## 📋 Inhoudsopgave

1. [Project Overzicht](#1-project-overzicht)
2. [Business Model & Strategie](#2-business-model--strategie)
3. [Tech Stack](#3-tech-stack)
4. [Mappenstructuur](#4-mappenstructuur)
5. [Affiliate Partners](#5-affiliate-partners)
6. [Pagina's & Componenten](#6-paginas--componenten)
7. [Programmatic SEO Systeem](#7-programmatic-seo-systeem)
8. [Content Strategie](#8-content-strategie)
9. [Styling & Design System](#9-styling--design-system)
10. [Deployment](#10-deployment)
11. [Do's en Don'ts](#11-dos-en-donts)
12. [Changelog](#12-changelog)

---

## 1. Project Overzicht

### Wat is Gifteez?

**Gifteez.nl** is een Nederlandse affiliate website gericht op cadeaugidsen. We helpen bezoekers het perfecte cadeau te vinden via:

1. **Programmatic SEO Gidsen** — Automatisch gegenereerde landingspagina's (bijv. "Kerst Cadeaus voor Haar onder €50")
2. **Blog Content** — Handgeschreven artikelen over cadeautrends, reviews, partner spotlights
3. **Deals Pagina** — Actuele aanbiedingen van onze affiliate partners
4. **AI Cadeaucoach** — Optioneel hulpmiddel (secundair aan gidsen)

### Kernwaarden

- **Focus op CONVERSIE** — Elke pagina moet leiden tot affiliate clicks
- **Nederlandse toon** — Warm, behulpzaam, informeel maar professioneel
- **Mobile-first** — 70%+ traffic komt van mobiel
- **SEO-gedreven** — Long-tail keywords, structured data, fast loading

---

## 2. Business Model & Strategie

### Revenue Streams

```
┌─────────────────────────────────────────────────────────────┐
│                    TRAFFIC BRONNEN                          │
├─────────────────────────────────────────────────────────────┤
│  Pinterest Pins → Programmatic Gidsen → Affiliate Clicks    │
│  Google SEO → Blog Posts → Internal Links → Gidsen          │
│  Direct Traffic → Homepage → Guide Showcase → Gidsen        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    AFFILIATE COMMISSIES                     │
├─────────────────────────────────────────────────────────────┤
│  Coolblue      │  ~3-5%  │  Tech, huishouden               │
│  SLYGAD        │  ~5-8%  │  Gadgets, mannen                │
│  Holland & B.  │  ~5-8%  │  Wellness, gezondheid           │
│  PartyPro      │  ~8-10% │  Feestartikelen                 │
│  Amazon NL     │  ~3-5%  │  Alles (fallback)               │
└─────────────────────────────────────────────────────────────┘
```

### Conversie Funnel

1. **Awareness** — Pinterest pin / Google zoekresultaat
2. **Interest** — Landingspagina met hero + QuickScan
3. **Consideration** — Productvergelijking, filters
4. **Action** — Klik op "Bekijk bij [Partner]" → affiliate link

### KPI's

- **Click-through Rate (CTR)** op productkaarten: doel 5%+
- **Affiliate Revenue per 1000 pageviews**: doel €15+
- **Bounce Rate**: doel <60%
- **Time on Page**: doel >2 minuten

---

## 3. Tech Stack

### Frontend

| Technologie  | Versie | Gebruik              |
| ------------ | ------ | -------------------- |
| React        | 19     | UI Framework         |
| TypeScript   | 5.x    | Type safety          |
| Vite         | 6.x    | Build tool           |
| Tailwind CSS | 3.x    | Styling              |
| React Router | DOM    | Routing (hash-based) |

### Backend & Services

| Service            | Gebruik                           |
| ------------------ | --------------------------------- |
| Firebase Hosting   | Static hosting                    |
| Firebase Firestore | Blog posts, user data             |
| Firebase Auth      | Admin login                       |
| Firebase Analytics | Tracking                          |
| AWIN               | Affiliate network (Coolblue, H&B) |
| TradeTracker       | Affiliate network (SLYGAD)        |
| Pinterest          | Traffic source                    |

### Build & Deploy

```bash
# Lokaal ontwikkelen
npm run dev          # Start dev server op localhost:5173

# Bouwen
npm run build        # Bouwt naar /dist

# Deployen
npm run deploy       # check:images → predeploy → build → firebase deploy
```

---

## 4. Mappenstructuur

```
gifteez/
├── components/           # React componenten
│   ├── home/            # Homepage secties (modulair)
│   │   ├── GuideShowcase.tsx
│   │   ├── DealsSection.tsx
│   │   ├── NewsletterSection.tsx
│   │   └── TestimonialsSection.tsx
│   ├── Header.tsx       # Hoofd navigatie
│   ├── Footer.tsx       # Footer
│   ├── HeroHome.tsx     # Homepage hero
│   ├── ProgrammaticLandingPage.tsx  # Gids template
│   ├── BlogPage.tsx     # Blog overzicht
│   ├── BlogDetailPage.tsx # Blog artikel
│   └── ...              # Andere pagina's
│
├── data/
│   ├── programmatic/    # Gids configuraties
│   │   └── index.ts     # ALLE gids definities
│   └── blogData.ts      # Statische blog posts
│
├── public/
│   ├── programmatic/    # Gegenereerde JSON per gids
│   └── ...              # Static assets
│
├── scripts/
│   └── build-programmatic-indices.mts  # Bouwt gids JSONs
│
├── services/            # API/data services
├── utils/               # Helper functies
├── hooks/               # React hooks
├── lib/                 # Configuratie
│
├── AI_CONTEXT.md        # DIT BESTAND
├── PROGRAMMATIC_README.md # Technische gids documentatie
├── DESIGN_SYSTEM.md     # Styling guide
└── package.json
```

---

## 5. Affiliate Partners

### Coolblue

- **Categorie:** Tech, elektronica, huishouden
- **Commissie:** 3-5%
- **Netwerk:** AWIN
- **USP:** "Alles voor een glimlach", snelle levering
- **Feed:** Via AWIN datafeed

### SLYGAD

- **Categorie:** Gadgets, mannen cadeaus, tech accessoires
- **Commissie:** 5-8%
- **Netwerk:** TradeTracker
- **USP:** Unieke gadgets, grappige cadeaus

### Holland & Barrett

- **Categorie:** Wellness, vitamines, gezondheid, beauty
- **Commissie:** 5-8%
- **Netwerk:** AWIN
- **USP:** Duurzaam, gezond, natuurlijk

### PartyPro

- **Categorie:** Feestartikelen, decoratie, ballonnen
- **Commissie:** 8-10%
- **Netwerk:** Direct
- **USP:** Alles voor feestjes

### Amazon NL

- **Categorie:** Alles (fallback)
- **Commissie:** 3-5%
- **Netwerk:** Amazon Associates
- **USP:** Breed assortiment, snel geleverd

---

## 6. Pagina's & Componenten

### Hoofd Pagina's

| Route                 | Component                     | Doel                           |
| --------------------- | ----------------------------- | ------------------------------ |
| `/`                   | `HomePage.tsx`                | Landingspagina, guide showcase |
| `/cadeaugidsen`       | `CadeausHubPage.tsx`          | Overzicht alle gidsen          |
| `/cadeaugidsen/:slug` | `ProgrammaticLandingPage.tsx` | Individuele gids               |
| `/deals`              | `DealsPage.tsx`               | Actuele aanbiedingen           |
| `/blog`               | `BlogPage.tsx`                | Blog overzicht                 |
| `/blog/:slug`         | `BlogDetailPage.tsx`          | Blog artikel                   |
| `/gift-finder`        | `GiftFinderPage.tsx`          | AI Cadeaucoach                 |
| `/over-ons`           | `AboutPage.tsx`               | Over Gifteez                   |
| `/contact`            | `ContactPage.tsx`             | Contact formulier              |

### Navigatie Structuur

```
Header (3 items):
├── Cadeaugidsen → /cadeaugidsen
├── Deals → /deals
└── Blog → /blog

Footer (3 kolommen):
├── Brand (logo, tagline)
├── Gidsen (4 populaire links)
└── Service (Over ons, Contact, Privacy, etc.)
```

### Component Hiërarchie Homepage

```
HomePage
├── HeroHome
│   ├── Countdown timer (kerst)
│   ├── Budget buttons (€25, €50, €100, €150+)
│   ├── Stats strip
│   └── Partner logos
├── HowItWorks
├── GuideShowcase (4 uitgelichte gidsen)
├── DealsSection
├── NewsletterSection
└── TestimonialsSection
```

---

## 7. Programmatic SEO Systeem

### Hoe het werkt

1. **Configuratie** in `data/programmatic/index.ts`
2. **Build script** `npm run build:programmatic`
3. **JSON output** in `public/programmatic/*.json`
4. **Frontend** `ProgrammaticLandingPage.tsx` laadt JSON

### Gids Configuratie Voorbeeld

```typescript
{
  slug: 'kerst-voor-haar-onder-50',
  retailer: undefined, // of 'coolblue' voor single-retailer
  minPrice: 0,
  maxPrice: 50,
  title: 'Kerst Cadeaus voor Haar onder €50',
  metaDescription: '15+ betaalbare kerstcadeaus...',
  headerTitle: 'Kerst voor Haar',
  headerSubtitle: 'Onder €50',
  productFilters: {
    includeKeywords: ['vrouw', 'haar', 'dames'],
    excludeKeywords: ['heren', 'man'],
    preferredMerchants: ['coolblue', 'rituals']
  }
}
```

### Actieve Gidsen (19 stuks)

| Slug                                       | Focus             |
| ------------------------------------------ | ----------------- |
| `kerst-voor-haar-onder-50`                 | Vrouwen, €0-50    |
| `kerst-voor-hem-onder-50`                  | Mannen, €0-50     |
| `kerst-voor-hem-onder-150`                 | Mannen, €0-150    |
| `kerst-voor-collegas-onder-25`             | Collega's, €0-25  |
| `kerst-tech-onder-100`                     | Tech, €0-100      |
| `kerst-duurzaam-onder-50`                  | Duurzaam, €0-50   |
| `sinterklaas-voor-kinderen-onder-25`       | Kinderen          |
| `last-minute-kerstcadeaus-vandaag-bezorgd` | Snelle levering   |
| `holland-barrett-wellness-cadeaus`         | Partner spotlight |
| `gamer-cadeaus-onder-100`                  | Gamers            |
| `duurzame-lifestyle-cadeaus`               | Eco               |
| `duurzamere-cadeaus-onder-50`              | Eco budget        |
| `dames-mode-onder-150`                     | Fashion           |
| `dames-sieraden-onder-100`                 | Sieraden          |
| `dames-mode-duurzaam`                      | Duurzame mode     |
| `heren-mode-accessoires`                   | Heren fashion     |
| `wonen-decoratie-cadeaus`                  | Home & Living     |
| `cadeaus-voor-nachtlezers`                 | Boeken            |
| `test-dames-mode`                          | Test gids         |

---

## 8. Content Strategie

### Blog Categorieën

- **Cadeaugids** — Samengestelde lijsten
- **Reviews** — Productreviews
- **Partner Spotlight** — Retailer uitgelicht
- **Tips & Tricks** — Hoe koop je slim
- **Nieuws** — Site updates, trends

### Toon & Stijl

```
✅ DO:
- "Ontdek 15 cadeaus die écht scoren"
- "Wij selecteerden de beste deals"
- "Gratis bezorging bij bestellingen boven €20"

❌ DON'T:
- "Klik hier om te kopen"
- "Deze producten zijn geweldig"
- Engelse termen zonder Nederlandse context
```

### SEO Checklist per Pagina

- [ ] Title tag bevat primair keyword
- [ ] Meta description is 150-160 karakters
- [ ] H1 is uniek en bevat keyword
- [ ] Interne links naar gerelateerde gidsen
- [ ] Structured data (JSON-LD) aanwezig
- [ ] Afbeeldingen hebben alt text
- [ ] Canonical URL is correct

---

## 9. Styling & Design System

### Kleurenpalet

```css
/* Primair (Rose/Pink) */
--primary-500: #ec4899; /* Buttons, accenten */
--primary-600: #db2777; /* Hover states */

/* Grijs (Slate) */
--gray-50: #f8fafc; /* Achtergronden */
--gray-900: #0f172a; /* Dark sections */

/* Status */
--success: #22c55e; /* Groen */
--warning: #f59e0b; /* Oranje */
--error: #ef4444; /* Rood */
```

### Component Patronen

```jsx
// Button (primair)
<button className="bg-gradient-to-r from-pink-500 to-rose-500
  hover:from-pink-600 hover:to-rose-600
  text-white font-semibold px-6 py-3 rounded-xl
  transition-all duration-300 hover:scale-105">
  Bekijk Gidsen
</button>

// Card
<div className="bg-white rounded-2xl shadow-lg hover:shadow-xl
  transition-all duration-300 p-6">
  ...
</div>

// Dark Section
<section className="bg-gray-900 text-white py-20">
  ...
</section>
```

### Responsive Breakpoints

```
sm: 640px   — Mobiel landscape
md: 768px   — Tablet
lg: 1024px  — Desktop
xl: 1280px  — Groot desktop
```

---

## 10. Deployment

### Stappenplan

```bash
# 1. Test lokaal
npm run dev

# 2. Check voor errors
npm run lint

# 3. Bouw productie
npm run build

# 4. Deploy naar Firebase
npm run deploy
```

### Wat `npm run deploy` doet

1. `check:images` — Valideer afbeeldingen
2. `predeploy` — Genereer responsive images
3. `prebuild`:
   - Sitemap genereren
   - Favicons genereren
   - RSS feed genereren
4. `build` — Vite productie build
5. `firebase deploy --only hosting`

### Firebase Project

- **Project ID:** `gifteez-7533b`
- **Hosting URL:** `https://gifteez.nl` (custom domain)
- **Backup URL:** `https://gifteez-7533b.web.app`

---

## 11. Do's en Don'ts

### ✅ DO's

1. **Altijd Nederlandse tekst** — Geen Engelse UI teksten
2. **Test op mobiel** — Meeste traffic is mobiel
3. **Affiliate links** — Altijd via `withAffiliate()` helper
4. **Lazy loading** — Afbeeldingen en zware componenten
5. **Semantic HTML** — Goede heading structuur
6. **Commit messages** — Duidelijk en emoji 🎨✨🐛
7. **Update AI_CONTEXT.md** — Na grote wijzigingen

### ❌ DON'TS

1. **Geen harde links** — Gebruik `navigateTo()` of `Link`
2. **Geen inline styles** — Gebruik Tailwind classes
3. **Geen console.log in productie** — Alleen in dev
4. **Geen broken images** — Check met build script
5. **Geen duplicate content** — Unieke meta per pagina
6. **Geen externe scripts** — Performance impact

---

## 12. Changelog

### 29 november 2025 (Sessie 2)

- ✅ AI_CONTEXT.md gecreëerd met volledige documentatie
- ✅ HowItWorks.tsx: Broken emoji gefixed (📚)
- ✅ CadeausHubPage.tsx: Hero tekst user-focused gemaakt
- ✅ AboutPage.tsx: "Plan een demo" → "Neem contact op", link naar cadeausHub

### 29 november 2025 (Sessie 1)

- ✅ Header vereenvoudigd naar 3 items
- ✅ Footer vereenvoudigd (geen dubbele CTAs)
- ✅ Hero budget links gefixed

### Eerder

- ✅ 504 ongebruikte bestanden verwijderd
- ✅ Homepage gemodulariseerd
- ✅ PROGRAMMATIC_README.md geschreven
- ✅ 19 programmatic gidsen live

---

## 🔧 Quick Reference voor AI Assistenten

### Als je een nieuwe gids wilt toevoegen:

1. Open `data/programmatic/index.ts`
2. Voeg configuratie toe aan `PROGRAMMATIC_GUIDES` array
3. Run `npm run build:programmatic`
4. Check JSON in `public/programmatic/`
5. Deploy

### Als je een pagina wilt stylen:

1. Check `DESIGN_SYSTEM.md` voor patronen
2. Gebruik Tailwind classes
3. Dark sections: `bg-gray-900 text-white`
4. Cards: `bg-white rounded-2xl shadow-lg`

### Als je affiliate links wilt toevoegen:

```typescript
import { withAffiliate } from '../utils/linkHelpers'

const affiliateUrl = withAffiliate(productUrl, {
  source: 'gifteez',
  medium: 'programmatic',
  campaign: 'kerst-2025',
})
```

### Belangrijke bestanden om te kennen:

- `App.tsx` — Routing, globale state
- `components/Header.tsx` — Navigatie
- `components/Footer.tsx` — Footer
- `data/programmatic/index.ts` — Alle gidsen
- `guidePaths.ts` — URL helpers voor gidsen

---

> **Remember:** Gifteez draait om **cadeaugidsen** en **affiliate conversie**. Elke wijziging moet dit doel ondersteunen.
