# Product Classifier System - Quick Start

**Gebouwd op 3 november 2025**

## 🎯 Wat is dit?

Een complete classificatie-laag die voorkomt:
- ❌ Herenriemen in dames-gidsen
- ❌ 10 dezelfde producten (kleur/maat varianten)
- ❌ Alle producten van 1 merk
- ❌ Random producten zonder giftworthiness

En zorgt voor:
- ✅ Correcte doelgroep-matching (audience: men/women/unisex/kids)
- ✅ Slimme categorisatie (riemen, horloges, sieraden, etc.)
- ✅ Diversiteit (max 2 per merk, spread over categorieën)
- ✅ Deduplicatie (canonical keys voor varianten)

## 📦 Wat is er gebouwd?

```
utils/product-classifier/
├── types.ts          ✅ TypeScript types
├── normalize.ts      ✅ Feed adapters (AWIN, Coolblue, Bol, Amazon)
├── classifier.ts     ✅ Keyword-based classificatie
├── hash.ts           ✅ Canonical keys voor dedup
├── diversify.ts      ✅ MMR diversificatie algoritme
└── index.ts          ✅ Main export

data/taxonomy/
├── keywords.yaml     ✅ NL/EN keywords (50+ categorieën)
├── gpc-mapping.json  ✅ Google Product Category mapping
└── overrides.json    ✅ Brand/SKU-specifieke regels

scripts/
└── build-programmatic-indices.mts  ✅ Build script

components/examples/
└── ProgrammaticGuidePage.example.tsx  ✅ React component voorbeeld

PRODUCT_CLASSIFIER_README.md  ✅ Volledige documentatie
```

## 🚀 Volgende stappen (in volgorde)

### 1. Installeer dependencies

```bash
npm install csv-parse yaml
```

### 2. Test de keywords

Open `data/taxonomy/keywords.yaml` en check of de keywords voor jouw producten kloppen.

**Tip**: Zoek naar "riemen" en kijk of alle varianten erin staan:
```yaml
categories:
  riemen:
    - riem
    - riemen
    - belt
    - ceintuur  # ← Gebruik jij dit woord? Zo niet, verwijder het
```

### 3. Voeg feed-bestanden toe

Maak directory aan:
```bash
mkdir -p data/feeds
```

Kopieer je Coolblue CSV:
```bash
cp coolblue-feed.csv data/feeds/
```

### 4. Test de build (dry run)

```bash
npm run classifier:build
```

**Expected output**:
```
📚 Loading taxonomy...
  ✓ Keywords loaded
  ✓ GPC mapping loaded
  ✓ Overrides loaded

📦 Loading product feeds...
  Loading Coolblue feed...
  ✓ Coolblue: 1234 products

🔍 Classifying products...
  Classifying coolblue...
    987/1234 passed classification

📄 Building page indices...
  Building index for: kerst-voor-hem-onder-50
    Filtered: 234 products
    After dedup: 198 products
    After diversify: 24 products
    ✓ Written: /public/programmatic/kerst-voor-hem-onder-50.json

✨ Build Complete!
  Success: 42 pages
  Failed:  0 pages
```

### 5. Inspecteer de output

```bash
cat public/programmatic/kerst-voor-hem-onder-50.json | head -50
```

Check:
- [ ] Zijn er producten?
- [ ] Klopt de audience? (men/women/unisex)
- [ ] Klopt de category? (riemen, horloges, etc.)
- [ ] Zijn er verschillende merken?
- [ ] Confidence scores redelijk? (> 0.5)

### 6. Fix problemen

**Probleem: Te weinig producten**
→ Verlaag caps in `scripts/build-programmatic-indices.mts`:
```typescript
maxPerBrand: 3,     // was 2
maxPerCategory: 12  // was 8
```

**Probleem: Verkeerde classificatie**
→ Voeg keywords toe in `data/taxonomy/keywords.yaml`
→ Of voeg brand override toe in `data/taxonomy/overrides.json`

**Probleem: Nog steeds herenriemen in dames-gids**
→ Check je PROGRAMMATIC_INDEX config in `data/programmatic/index.ts`:
```typescript
{
  slug: 'vrouwen-riemen',
  audience: ['women', 'unisex'],  // ← Geen 'men' hier!
  filters: {
    excludeKeywords: ['heren', 'man']  // ← Extra zekerheid
  }
}
```

### 7. Integreer in je frontend

Vervang je huidige product-fetching met:

```tsx
import { useEffect, useState } from 'react'
import type { ProgrammaticIndex } from '../utils/product-classifier'

function MijnCadeauGids({ slug }: { slug: string }) {
  const [data, setData] = useState<ProgrammaticIndex | null>(null)

  useEffect(() => {
    fetch(`/programmatic/${slug}.json`)
      .then(r => r.json())
      .then(setData)
  }, [slug])

  return (
    <div>
      {data?.products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

**Zie volledig voorbeeld**: `components/examples/ProgrammaticGuidePage.example.tsx`

### 8. Automatiseer (optioneel)

Voeg toe aan je CI/CD pipeline:
```yaml
# .github/workflows/build-indices.yml
- name: Build product indices
  run: npm run classifier:build

- name: Commit updated indices
  run: |
    git add public/programmatic/
    git commit -m "chore: update product indices"
    git push
```

## 🔧 Handige commands

```bash
# Build indices
npm run classifier:build

# Check keywords syntax
npx js-yaml data/taxonomy/keywords.yaml

# Count products per page
ls -la public/programmatic/ | wc -l

# Inspect specific page
jq '.stats' public/programmatic/kerst-voor-hem-onder-50.json
```

## 📊 KPIs om te meten

Na deployment, track:
- **CTR per guide**: Wordt er meer geklikt?
- **Diversiteit**: Hoeveel unique brands per page?
- **Confidence**: Gemiddelde confidence score per page?
- **Review queue size**: Hoeveel producten hebben needsReview: true?

```typescript
// In Firestore
collection('product-clicks').add({
  productId: product.id,
  routeKey: 'cadeaus/kerst-voor-hem',
  audience: product.facets.audience,
  confidence: product.facets.confidence,
  timestamp: new Date()
})
```

## 🆘 Troubleshooting

**Q: Build script crasht met "Cannot find module"**
→ Check of alle dependencies zijn geïnstalleerd: `npm install csv-parse yaml`

**Q: "No products found for {slug}"**
→ Je filters zijn te strikt. Check de page config in `data/programmatic/index.ts`

**Q: Te veel unisex producten**
→ Voeg meer specifieke keywords toe aan men/women in `keywords.yaml`

**Q: Confidence scores te laag**
→ Normaal! Zelfs 0.5-0.7 is prima. Gebruik `needsReview` flag voor edge cases.

## 📚 Volledige docs

Zie `PRODUCT_CLASSIFIER_README.md` voor:
- Architectuur details
- API reference
- Advanced configuratie
- Admin UI blauwdruk
- CI/CD templates

## ✅ Success checklist

- [ ] Dependencies geïnstalleerd
- [ ] Keywords aangepast aan jouw producten
- [ ] Feed(s) toegevoegd aan `data/feeds/`
- [ ] Build script gerund zonder errors
- [ ] Output gecheckt in `public/programmatic/`
- [ ] Frontend component aangepast
- [ ] Test gedaan met echte gebruikers
- [ ] Metrics tracking opgezet

**Klaar voor productie!** 🚀

---

## 💡 Tips

1. **Start klein**: Begin met 1-2 guides en test grondig
2. **Itereer snel**: Pas keywords aan op basis van foutieve classificaties
3. **Gebruik overrides**: Voor bekende merken, stel direct de juiste audience in
4. **Monitor confidence**: Producten < 0.5 kunnen review queue in
5. **A/B test**: Test "unisex toestaan in dames-gids" ja/nee

**Succes!** 🎉
