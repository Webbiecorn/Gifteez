# Programmatic SEO Landings — Plan

Doel: Schaalbare landingspagina’s genereren op basis van combinaties van ontvanger × gelegenheid × budget × retailer/interesse, met unieke copyblokken, interne links en rijk schema.

## URL‑patroon

- /cadeaus/[gelegenheid]/voor-[ontvanger]/onder-[bedrag]
- /cadeaus/[gelegenheid]/voor-[ontvanger]/bij-[retailer]
- /cadeaus/[interesse]/onder-[bedrag]
- Query‑varianten voor snelle levering: ?levering=vandaag|morgen

Voorbeelden

- /cadeaus/kerst/voor-hem/onder-50
- /cadeaus/sinterklaas/voor-kinderen/onder-25
- /cadeaus/valentijn/voor-haar/onder-50
- /cadeaus/tech/onder-100
- /cadeaus/kerst/voor-hem/bij-amazon

## Datamodel (JSON)

```json
{
  "slug": "kerst-voor-hem-onder-50",
  "occasion": "kerst",
  "recipient": "hem",
  "budgetMax": 50,
  "retailer": null,
  "interest": null,
  "title": "Beste kerstcadeaus voor hem onder €50 (2025)",
  "intro": "Slimme, leuke en nuttige cadeaus voor hem binnen budget.",
  "editorPicks": [
    { "sku": "AMZ-123", "reason": "beste prijs/kwaliteit" },
    { "sku": "CBL-456", "reason": "snelle levering" },
    { "sku": "SLYG-789", "reason": "duurzame keuze" }
  ],
  "filters": { "maxPrice": 50, "fastDelivery": true, "eco": false },
  "faq": [
    { "q": "Wat is snel leverbaar?", "a": "Vandaag/morgen bij partner X." },
    { "q": "Kan ik ruilen?", "a": "Ja, volgens voorwaarden retailer." }
  ],
  "internalLinks": [
    { "href": "/cadeaus/kerst/voor-haar/onder-50", "label": "Voor haar onder €50" },
    { "href": "/cadeaus/kerst/onder-25", "label": "Kerst onder €25" }
  ]
}
```

## Templatevelden (component)

- H1: title
- Intro: intro
- Badges: occasion/recipient/budget/retailer/interest
- Quick scan: max 4 persona-kaarten met filterpresets (fast delivery, sort, deeplink)
- Editor’s Picks: 3–5 items (redactioneel)
- Lijst: ItemList van gefilterde producten (via dynamicProductService + affiliate context)
- Mini‑FAQ
- Interne links (op/neer/zijwaarts)
- Schema: ItemList + FAQ (+ BreadcrumbList)

## Interne linking

- Hub → Sub (bijv. /cadeaus/kerst → varianten “voor-hem/haar/kids”, “onder-25/50/100”)
- Sub ↔ Sub (cross‑links: budgetvarianten en ontvanger‑varianten)
- Sub → ProductLanding (diepe klikken bevorderen)

## Unieke content per variant

- Title/H1 en intro variëren per combinatie
- 3–4 custom alinea’s per pagina: koopadvies passend bij ontvanger/gelegenheid/budget
- 3–6 FAQ’s afgestemd op variant (levering/maat/retour/duurzaam)

## Generatieproces

1. Config JSON in `data/programmatic/` per variant (of CSV naar JSON)
2. Template component `ProgrammaticLandingPage` rendert op basis van config
3. Build: map over alle configs → route pre‑generate (Vite + SPA routes of statische export)
4. QA: sample van 10% handmatig checken, broken links, schema validatie
5. Deploy en indexatie (Search Console)

## Tracking & attributie

- `withAffiliate(url, { pageType: 'programmatic', placement: 'card-cta', variantKey: slug })`
- UTM: utm_source=gifteez&utm_medium=affiliate&utm_campaign=[occasion|recipient|budget]
- Clickref: subid met compact schema voor AWIN/Coolblue

## Schema

- BreadcrumbList: Site → Gelegenheid → Variant
- ItemList: lijst met positie + Offer (affiliate‑URL)
- FAQPage: uit `faq[]`

## Voorbeeld set (nov–dec 2025)

- kerst-voor-hem-onder-50
- kerst-voor-haar-onder-50
- sinterklaas-voor-kinderen-onder-25
- kerst-voor-collegas-onder-25
- kerst-tech-onder-100
- kerst-duurzaam-onder-50
- last-minute-kerstcadeaus-vandaag-bezorgd (flag: fastDelivery)

## Roadmap

- Fase 1 (2 weken): 20 varianten handmatig (top volume + seizoens)
- Fase 2 (3–6 weken): 100–200 varianten via CSV → JSON pipeline
- Fase 3 (Q1 2026): internationale varianten (EN/DE)
