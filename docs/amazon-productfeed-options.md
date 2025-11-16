# Amazon Product Feed Opties - Onderzoek

## Huidige Situatie

- Amazon Partner API (PA-API) vereist minimaal 3 verkopen in 180 dagen
- Gifteez heeft momenteel PA-API configuratie in Firebase Functions
- Maar zonder verkopen geen toegang tot productdata

## Alternatieve Opties voor Amazon Productfeeds

### 1. **Amazon Associates SiteStripe** ⭐ (Meest praktisch)

**Wat:** Browser extensie voor Amazon Associates
**Voordelen:**

- Geen verkoop requirement
- Gratis voor alle Amazon Associates
- Directe affiliate links genereren
- Product informatie beschikbaar
  **Nadelen:**
- Handmatig proces, geen bulk download
- Beperkte automatisering

### 2. **Amazon Affiliate Program Alternative Sources**

**Rainforest API** (3rd party)

- $1/1000 requests
- Real-time Amazon data
- Product searches, details, reviews
- Geen Amazon partnership vereist

**ScrapeFly/Scrapfly**

- Amazon scraping API
- Product data + prijzen
- ~$49/maand voor 100k requests

### 3. **Manual Product Curation** ⭐ (Huidige beste optie)

**Wat:** Handmatig geselecteerde Amazon producten
**Implementatie:**

- Amazon SiteStripe voor affiliate links
- Handmatige productdata entry
- Focus op best-sellende cadeau items
- Periodieke updates

### 4. **Hybrid Approach** ⭐ (Aanbevolen)

**Combinatie van:**

- Coolblue productfeed (automatisch) ✅ Werkend
- Amazon handmatig geselecteerd (via SiteStripe)
- Andere affiliate netwerken (Daisycon, TradeTracker)

### 5. **Web Scraping** ⚠️ (Risicovol)

**Waarom niet aanbevolen:**

- Tegen Amazon ToS
- IP blokkering risico
- Legale complicaties

## Implementatie Strategie

### Fase 1: Directe Implementatie (Deze week)

1. **Amazon SiteStripe Training**
   - Browser extensie installeren
   - 50 populaire cadeaus selecteren
   - Affiliate links + productdata verzamelen

2. **Manual Amazon Feed Creator**
   - Script voor handmatige Amazon product entry
   - Gestructureerde data format
   - Easy update process

### Fase 2: Semi-Automatisering (Volgende maand)

1. **Rainforest API Integratie**
   - Test account aanmaken
   - Amazon product search implementeren
   - Price monitoring voor geselecteerde items

2. **Scheduled Updates**
   - Wekelijkse prijs updates
   - Out-of-stock detection
   - Automated affiliate link validation

### Fase 3: Full Automation (Bij 3+ verkopen)

1. **PA-API Activatie**
   - Switch naar officiële Amazon API
   - Bulk product management
   - Real-time inventory tracking

## Onmiddellijke Actieplan

### 1. Amazon SiteStripe Setup (30 min)

```bash
# Install SiteStripe extensie
# Ga naar populaire cadeau categorieën
# Genereer 50 affiliate links
# Documenteer in spreadsheet
```

### 2. Manual Amazon Feed Script (2 uur)

```bash
# Maak Amazon product entry tool
# Import spreadsheet data
# Generate JSON feed compatible met huidige systeem
# Test integratie
```

### 3. Hybride System Update (1 uur)

```bash
# Update website om beide feeds te gebruiken
# Coolblue (automatisch) + Amazon (handmatig)
# Weighted product selection
# Performance monitoring
```

## Conclusie & Aanbeveling

**Voor Nu:** Manual Amazon curation via SiteStripe
**Voordelen:**

- Direct implementeerbaar
- Geen extra kosten
- Volledige controle over productqualiteit
- Goede affiliate conversie

**Later:** Upgrade naar PA-API zodra 3 verkopen bereikt

**Tools Needed:**

- Amazon Associates SiteStripe extensie
- Spreadsheet voor product management
- Custom import script

**Estimated Time:** 4-6 uur implementatie
**Monthly Maintenance:** 1-2 uur product updates
