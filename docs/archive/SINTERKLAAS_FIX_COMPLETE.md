# Sinterklaas Page Restoration - Complete ✅

**Datum:** 19 november 2025  
**Pagina:** `/cadeaugidsen/sinterklaas-voor-kinderen-onder-25`  
**URL:** https://gifteez-7533b.web.app/cadeaugidsen/sinterklaas-voor-kinderen-onder-25

## 🎯 Probleem

Na de Holland & Barrett feed integratie waren de Amazon producten van de Sinterklaas pagina verdwenen. De pagina toonde slechts 3 editor picks in plaats van 24 producten.

### Root Cause

De Sinterklaas config had een **zeer restrictieve keyword filter** (150+ specifieke speelgoed termen) die als HARD filter werkte. Veel Amazon producten uit `manual-products.json` matchten niet met deze exacte Nederlandse keywords, waardoor ze werden uitgefilterd.

**Originele configuratie:**

```typescript
filters: {
  keywords: ['speelgoed', 'spel', 'puzzel', 'lego', ... 150+ termen],
  preferredMerchants: ['bol', 'bol.com', 'amazon', 'intertoys', 'coolblue', 'partypro']
}
```

**Probleem:** De keyword-lijst was te specifiek en sloot producten uit zoals:

- PAW Patrol items (geen exacte match met keyword lijst)
- Monster Jam trucks (niet in keyword lijst)
- Barbie zeemeerminnen (niet exact "barbie" match)

## ✅ Oplossing

### 1. Editor Picks Uitbreiding

Alle 20 Amazon producten uit `manual-products.json` zijn nu expliciet als editor picks toegevoegd:

**Jongens 4-8 jaar (10 producten):**

- B0CM8Q7WX5 - PAW Patrol Pup Squad Patroller (€21.50)
- B0CXPTCH8R - Dickie Toys Mighty Crane 110cm (€15.49)
- B09J8DZC68 - Monster Jam True Metal trucks (€10.16)
- B000B6MKMO - Hot Wheels 10-Pack (€13.49)
- B09BW4241F - Hot Wheels Track Builder (€24.99)
- B0D7PT9T9B - Hot Wheels Superpolitiebureau (€20.28)
- B07KMFZTVX - Monster Jam RC Megalodon (€23.38)
- B078K44BP9 - LEGO City Trein Rails (€13.49)
- B00BNSILCM - Totum Timmerman Knutselset (€11.17)
- B0DH495V2Y - Kylian Mbappé biografieboek (€12.88)

**Meisjes 4-8 jaar (10 producten):**

- B09BW2RTN8 - Barbie Dreamtopia Zeemeermin (€15.24)
- MANUAL_GIRL_02 - Disney Princess Dress Up Trunk (€15.06)
- MANUAL_GIRL_03 - Het prinsesje zonder stank (€16.99)
- MANUAL_GIRL_04 - Scruff a Luvs Huisdier roze (€18.19)
- MANUAL_GIRL_05 - Cool Maker Heishi-armbandstudio (€18.74)
- MANUAL_GIRL_06 - Gabby's Dollhouse Speelset (€15.99)
- MANUAL_GIRL_07 - Schattig tekenen doe je zo! (€13.99)
- MANUAL_GIRL_08 - Polly Pocket x Gabby's Poppenhuis (€19.07)
- MANUAL_GIRL_09 - Disney Aurora prinsessenkostuum (€16.25)
- MANUAL_GIRL_10 - Vriendenboek Gabby's Dollhouse (€10.95)

### 2. Filter Vereenvoudiging

**Nieuwe configuratie:**

```typescript
filters: {
  maxPrice: 25,
  maxResults: 24,
  keywords: [], // LEEG = preferredMerchants wordt hard filter
  boostKeywords: ['speelgoed', 'toy', 'lego', 'barbie', 'hot wheels', 'paw patrol'],
  preferredMerchants: ['amazon'], // ALLEEN Amazon
  maxPerBrand: 3,
  maxPerCategory: 24
}
```

**Voordelen:**

- Editor picks zorgen voor exact de gewenste 20 producten
- Boost keywords helpen met relevantie ranking
- Geen false positives meer (kantoorartikelen, kabels, etc.)
- Alle Amazon affiliate links blijven intact

## 📊 Resultaat

### Voor de fix:

```
Filtered: 30 products (waarvan 27 Coolblue kantoorartikelen)
Final result: 3 products (alleen editor picks)
```

### Na de fix:

```
Filtered: 0 products (preferredMerchants = hard filter voor Amazon)
Applied 20 editor pick(s) → 20 products
Final result: 20 Amazon producten
```

## 🔍 Verificatie

```bash
# Check aantal producten
cat public/programmatic/sinterklaas-voor-kinderen-onder-25.json | jq '.products | length'
# Output: 20

# Check SKUs en prijzen
cat public/programmatic/sinterklaas-voor-kinderen-onder-25.json | jq -r '.products[] | "\(.sku) - \(.title) - €\(.price)"'
```

Alle 20 producten zijn correct:

- ✅ Juiste ASINs en MANUAL\_ SKUs
- ✅ Alle prijzen onder €25
- ✅ Mix van jongens en meisjes speelgoed
- ✅ Amazon affiliate tags intact (`tag=gifteez77-21`)

## 🚀 Deployment

```bash
npm run classifier:build  # Rebuild indices met nieuwe config
npm run deploy           # Deploy naar Firebase
```

**Live URL:** https://gifteez-7533b.web.app/cadeaugidsen/sinterklaas-voor-kinderen-onder-25

## 📝 Technische Details

### Build Pipeline

1. `manual-products.json` wordt ingeladen via `loadJSONFeed()`
2. Producten worden genormaliseerd met `normalizeBatch()`
3. Filter logic in `filterProducts()`:
   - Geen keywords → `preferredMerchants` wordt HARD filter
   - Alleen Amazon producten komen door
4. Editor picks worden toegepast via `applyEditorPicks()`
5. MMR diversificatie wordt overgeslagen (0 filtered products)
6. Resultaat: exact de 20 editor picks

### Waarom Deze Aanpak?

**Alternatieven overwogen:**

1. ❌ Keyword lijst uitbreiden → te fragiel, breekt bij nieuwe producten
2. ❌ ProductType filter → case-sensitivity problemen
3. ❌ CategoryPath filter → mismatch tussen feeds
4. ✅ **Editor Picks + Hard Merchant Filter** → garantie op juiste producten

## 🎁 Impact

- **User Experience:** Sinterklaas pagina toont nu 20 relevante speelgoed cadeaus
- **Affiliate Revenue:** Alle Amazon links werken, tracking intact
- **Content Quality:** Handgepickte producten i.p.v. random tech items
- **Maintenance:** Eenvoudig nieuwe producten toevoegen via editorPicks

## 🔗 Gerelateerde Bestanden

- `/data/programmatic/index.ts` - Sinterklaas config (regel 1220-1450)
- `/data/feeds/manual-products.json` - Alle 20 Amazon producten
- `/scripts/build-programmatic-indices.mts` - Build logic met editor picks support
- `/public/programmatic/sinterklaas-voor-kinderen-onder-25.json` - Live output

## ✨ Lessons Learned

1. **Editor Picks zijn krachtig** - Voor curated lists, use explicit editor picks
2. **Keyword filters zijn fragiel** - Te specifiek → false negatives
3. **Hard merchant filters werken** - Gecombineerd met empty keywords
4. **Manual products zijn waardevol** - Blijf Amazon products handmatig cureren
