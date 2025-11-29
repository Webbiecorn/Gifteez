# Affiliate Tracking Spec (Gifteez)

Doel: Eenduidige tagging, rapportage en optimalisatie van affiliate-verkeer over alle placement-types, thema’s en retailers (AWIN/Coolblue, Amazon, overige).

## 1. Event model (GA4 / dataLayer)

- Eventnaam: `affiliate_click`
- Properties (altijd vullen waar mogelijk)
  - `retailer`: string (bv. `coolblue`, `amazon`, `slygad`, `partypro`)
  - `productId`: string (uniek in dataset; op deals/cards aanwezig)
  - `productName`: string
  - `price`: number (EUR)
  - `discount`: number (percentage 0–100) — indien van toepassing
  - `theme`: string (`spotlight`, `duurzaam`, `party`, …)
  - `category`: string (categorie of tag)
  - `pageType`: string (`deals`, `category`, `product-landing`, `blog`, `giftfinder`)
  - `placement`: string (↓ zie enumeratie)
  - `cardIndex`: number (0-based positie in carrousel/lijst)
  - `abVariant`: string (`A`, `B`, `C` … of `control`)
  - `url`: string (de uiteindelijke outbound affiliate-URL na `withAffiliate`)
  - `timestamp`: number (ms since epoch)

Placement-waarden (uitbreidbaar):

- `hero-cta`, `hero-retailer-badge`, `card-cta`, `card-retailer`, `sticky-bar`, `quick-view`, `admin-preview`, `blog-widget`, `comparison-winner`, `carousel-item`.

Implementatie-opmerking:

- Push naar dataLayer of eigen `logger.logUserAction('affiliate_click', params)` én trigger GA4 via GTM.

## 2. SubID / clickref standaard

SubID (aka clickref) formatie (max ~100 tekens; AWIN limieten in acht nemen):

```
site|pageType|theme|placement|idx|abV
```

Voorbeeld:

```
gifteez|deals|spotlight|card-cta|07|A
```

Regels:

- `site` = `gifteez`
- `idx` altijd 2-cijferig zero-padded (00, 01, …) — makkelijk groeperen
- Alleen ASCII, `|` als scheidingsteken; vermijd spaties/diakritische tekens
- Fallback als velden ontbreken: `gifteez|unknown|na|na|00|na`

Bewaren last-click context (voor latere attributie):

- localStorage key: `attribution:lastClick`
- Waarde (JSON): `{ retailer, pageType, theme, placement, cardIndex, abVariant, ts }`
- Bij elke affiliate-klik overschrijven (last-click wint)

## 3. URL-bouwregels per netwerk

### Amazon.nl

- Parameter: `tag=gifteez77-21` (al geïmplementeerd)
- Nooit dubbele tagging: als `tag` bestaat, niets aanpassen
- UTM’s optioneel (Amazon is strikt); indien gebruikt: `utm_source=gifteez&utm_medium=affiliate&utm_campaign=<pageType>`

### Coolblue via AWIN

- Basis: `https://www.awin1.com/cread.php?awinmid=85161&awinaffid=2566111&clickref=<SUBID>&p=<ENCODED_URL>`
- `clickref` = subid (volgens spec hierboven)
- Nooit dubbel wrappen: als host `awin1.com` en path `cread.php`, laat staan

### Overige retailers

- Laat URL staan zoals aangeleverd tot we netwerk/macro’s kennen
- Voeg alleen UTM’s toe: `utm_source=gifteez&utm_medium=affiliate&utm_campaign=<pageType>`

## 4. `withAffiliate(url, context)` contract

Signature (gewenst, non-breaking uitbreiding):

```
withAffiliate(url: string, context?: {
  retailer?: string
  pageType?: string
  theme?: string
  placement?: string
  cardIndex?: number
  abVariant?: string
}) => string
```

Gedrag:

- Normaliseer naar absolute URL (https)
- Amazon: voeg `tag` toe (respecteer bestaande)
- Coolblue: wrap via AWIN + `clickref=<subid>` (conform context)
- Overig: laat staan; voeg UTM’s toe
- Sla last-click context op in localStorage
- Voeg `rel="nofollow sponsored noopener"` toe bij render (component-verantwoordelijkheid)

Backward compatible:

- Bestaande aanroepen `withAffiliate(url)` blijven werken; context is optioneel

## 5. Datakwaliteit en privacy

- Geen PII in subid of events
- Subid bevat geen productnaam of vrije tekst
- Respecteer retailer policy (Amazon gevoelig voor UTM’s; AWIN oké met `clickref`)
- Robots/crawlers: outbound affiliate links mogen `nofollow sponsored`

## 6. Rapportage

- GA4 explorations: prestaties per `placement`, `theme`, `pageType`, `retailer`
- AWIN: rapporteren op `clickref` segmenten (site|page|theme|placement|idx|variant)
- KPI’s: CTR per placement, EPC per retailer, CR per theme, revenue per session

## 7. Testen

- Unit: `withAffiliate` formateert URLs correct (Amazon/AWIN/overig), subid opbouw, geen dubbele wrapping
- E2E: klik vanuit hero en card → juiste `clickref`, juiste event-payload, localStorage lastClick gevuld
- Rich Results smoke: geen invloed, maar outbound attrs correct `rel="nofollow sponsored noopener"`

## 8. Implementatievolgorde

1. Deze spec — DONE (document)
2. `withAffiliate` uitbreiden met `context` en subid-constructie
3. Alle calls gradueel migreren: `withAffiliate(url, { pageType, theme, placement, cardIndex, abVariant, retailer })`
4. GTM/GA4: controleer event payloads en dashboards
