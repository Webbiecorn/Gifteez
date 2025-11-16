# 🏷️ Google Tag Manager Setup Guide - Gifteez.nl

**GTM Container ID:** GTM-KC68DTEN  
**Status:** ✅ Code geïnstalleerd in index.html  
**DataLayer Service:** ✅ Geïmplementeerd

---

## 📋 QUICK START

### Stap 1: Open GTM Dashboard

👉 **https://tagmanager.google.com/**

1. Login met je Google account
2. Selecteer container **GTM-KC68DTEN**
3. Ga naar **Tags** in het linkermenu

---

## 🏷️ TAGS DIE JE MOET AANMAKEN

### 1. Google Analytics 4 - Configuration Tag

**Doel:** Basis GA4 tracking op alle pagina's

**Settings:**

- **Tag Type:** Google Analytics: GA4 Configuration
- **Measurement ID:** `G-Y697MJEN2H` (je huidige GA4 ID)
- **Trigger:** All Pages (Page View - All Pages)

**Extra configuratie:**

- Send Page View: ✅ Enabled
- Configuration Settings:
  - `send_page_view`: true
  - `cookie_flags`: 'SameSite=None;Secure'

---

### 2. Google Analytics 4 - Page View Tag

**Doel:** Verzend page views naar GA4

**Settings:**

- **Tag Type:** Google Analytics: GA4 Event
- **Configuration Tag:** GA4 Configuration Tag (selecteer tag #1)
- **Event Name:** `page_view`
- **Event Parameters:**
  - `page_path`: `{{Page Path}}`
  - `page_title`: `{{Page Title}}`
  - `page_location`: `{{Page URL}}`

**Trigger:**

- **Type:** Custom Event
- **Event name:** `page_view`
- **Fire on:** All Custom Events

---

### 3. GA4 - Search Event

**Doel:** Track GiftFinder & blog searches

**Settings:**

- **Tag Type:** Google Analytics: GA4 Event
- **Configuration Tag:** GA4 Configuration Tag
- **Event Name:** `search`
- **Event Parameters:**
  - `search_term`: `{{dlv - search_term}}`
  - `results_count`: `{{dlv - results_count}}`

**Trigger:**

- **Type:** Custom Event
- **Event name:** `search`

**DataLayer Variables nodig:**

1. Variable Name: `dlv - search_term`
   - Type: Data Layer Variable
   - Data Layer Variable Name: `search_term`

2. Variable Name: `dlv - results_count`
   - Type: Data Layer Variable
   - Data Layer Variable Name: `results_count`

---

### 4. GA4 - Product Click

**Doel:** Track wanneer gebruiker op product klikt

**Settings:**

- **Tag Type:** Google Analytics: GA4 Event
- **Configuration Tag:** GA4 Configuration Tag
- **Event Name:** `select_item`
- **Event Parameters:**
  - `item_name`: `{{dlv - product_name}}`
  - `item_category`: `{{dlv - category}}`
  - `price`: `{{dlv - price}}`
  - `currency`: `EUR`

**Trigger:**

- **Type:** Custom Event
- **Event name:** `product_click`

---

### 5. GA4 - GiftFinder Search

**Doel:** Track GiftFinder usage

**Settings:**

- **Tag Type:** Google Analytics: GA4 Event
- **Configuration Tag:** GA4 Configuration Tag
- **Event Name:** `giftfinder_search`
- **Event Parameters:**
  - `occasion`: `{{dlv - occasion}}`
  - `recipient`: `{{dlv - recipient}}`
  - `budget`: `{{dlv - budget}}`
  - `interests`: `{{dlv - interests}}`
  - `results_count`: `{{dlv - results_count}}`

**Trigger:**

- **Type:** Custom Event
- **Event name:** `giftfinder_search`

---

### 6. GA4 - Lead Generation

**Doel:** Track contact form submits, quiz completions

**Settings:**

- **Tag Type:** Google Analytics: GA4 Event
- **Configuration Tag:** GA4 Configuration Tag
- **Event Name:** `generate_lead`
- **Event Parameters:**
  - `lead_type`: `{{dlv - lead_type}}`
  - `value`: `{{dlv - value}}`

**Trigger:**

- **Type:** Custom Event
- **Event name:** `generate_lead`

---

### 7. Pinterest - PageVisit Tag

**Doel:** Track page views voor Pinterest

**Settings:**

- **Tag Type:** Custom HTML
- **HTML:**

```html
<script>
  pintrk('track', 'pagevisit', {
    event_id: '{{dlv - event_id}}',
    page_type: '{{dlv - page_type}}',
  })
</script>
```

**Trigger:**

- **Type:** Custom Event
- **Event name:** `pinterest_pagevisit`

**DataLayer Variables nodig:**

1. `dlv - event_id`
2. `dlv - page_type`

---

### 8. Pinterest - Search Tag

**Doel:** Track searches voor Pinterest

**Settings:**

- **Tag Type:** Custom HTML
- **HTML:**

```html
<script>
  pintrk('track', 'search', {
    event_id: '{{dlv - event_id}}',
    search_query: '{{dlv - search_query}}',
  })
</script>
```

**Trigger:**

- **Type:** Custom Event
- **Event name:** `pinterest_search`

---

### 9. Pinterest - Lead Tag

**Doel:** Track conversies voor Pinterest

**Settings:**

- **Tag Type:** Custom HTML
- **HTML:**

```html
<script>
  pintrk('track', 'lead', {
    event_id: '{{dlv - event_id}}',
    lead_type: '{{dlv - lead_type}}',
  })
</script>
```

**Trigger:**

- **Type:** Custom Event
- **Event name:** `pinterest_lead`

---

### 10. Outbound Link Click Tracker

**Doel:** Track affiliate link clicks

**Settings:**

- **Tag Type:** Google Analytics: GA4 Event
- **Configuration Tag:** GA4 Configuration Tag
- **Event Name:** `outbound_click`
- **Event Parameters:**
  - `outbound_url`: `{{dlv - outbound_url}}`
  - `retailer`: `{{dlv - retailer}}`
  - `product_name`: `{{dlv - product_name}}`

**Trigger:**

- **Type:** Custom Event
- **Event name:** `outbound_click`

---

## 🔧 DATALAAYER VARIABLES AANMAKEN

Je moet deze variables aanmaken om de tags te laten werken:

### Common Variables:

1. **dlv - search_term** → Data Layer Variable → `search_term`
2. **dlv - results_count** → Data Layer Variable → `results_count`
3. **dlv - product_name** → Data Layer Variable → `product_name`
4. **dlv - category** → Data Layer Variable → `category`
5. **dlv - price** → Data Layer Variable → `price`
6. **dlv - retailer** → Data Layer Variable → `retailer`
7. **dlv - occasion** → Data Layer Variable → `occasion`
8. **dlv - recipient** → Data Layer Variable → `recipient`
9. **dlv - budget** → Data Layer Variable → `budget`
10. **dlv - interests** → Data Layer Variable → `interests`
11. **dlv - lead_type** → Data Layer Variable → `lead_type`
12. **dlv - value** → Data Layer Variable → `value`
13. **dlv - event_id** → Data Layer Variable → `event_id`
14. **dlv - page_type** → Data Layer Variable → `page_type`
15. **dlv - search_query** → Data Layer Variable → `search_query`
16. **dlv - outbound_url** → Data Layer Variable → `outbound_url`

---

## ✅ TRIGGERS AANMAKEN

### Custom Event Triggers:

1. **Trigger Name:** `CE - Page View`
   - Type: Custom Event
   - Event name: `page_view`

2. **Trigger Name:** `CE - Search`
   - Type: Custom Event
   - Event name: `search`

3. **Trigger Name:** `CE - Product Click`
   - Type: Custom Event
   - Event name: `product_click`

4. **Trigger Name:** `CE - GiftFinder Search`
   - Type: Custom Event
   - Event name: `giftfinder_search`

5. **Trigger Name:** `CE - Generate Lead`
   - Type: Custom Event
   - Event name: `generate_lead`

6. **Trigger Name:** `CE - Pinterest PageVisit`
   - Type: Custom Event
   - Event name: `pinterest_pagevisit`

7. **Trigger Name:** `CE - Pinterest Search`
   - Type: Custom Event
   - Event name: `pinterest_search`

8. **Trigger Name:** `CE - Pinterest Lead`
   - Type: Custom Event
   - Event name: `pinterest_lead`

9. **Trigger Name:** `CE - Outbound Click`
   - Type: Custom Event
   - Event name: `outbound_click`

---

## 🧪 TESTING & DEBUGGING

### Stap 1: Preview Mode

1. Klik op **Preview** rechtsboven in GTM
2. Voer in: `https://gifteez.nl`
3. GTM opent debug venster

### Stap 2: Test Events

Open je site en voer deze acties uit:

✅ **Page View Test:**

- Navigate naar homepage
- Check of `page_view` event vuurt in debug console

✅ **GiftFinder Test:**

- Gebruik GiftFinder
- Check of `giftfinder_search` event vuurt
- Verifieer parameters (occasion, budget, etc.)

✅ **Product Click Test:**

- Klik op een product
- Check of `product_click` event vuurt
- Verifieer product_name, price

✅ **Search Test:**

- Zoek in blog of GiftFinder
- Check of `search` event vuurt

✅ **Lead Test:**

- Verstuur contact form
- Check of `generate_lead` event vuurt

### Stap 3: Verifieer in Google Analytics

1. Ga naar GA4 → Realtime
2. Test events moeten verschijnen binnen 30 seconden
3. Check event parameters

### Stap 4: Verifieer in Pinterest

1. Ga naar Pinterest Analytics → Conversions
2. Check Tag Health (moet groen zijn)
3. Test events moeten verschijnen binnen 1-2 minuten

---

## 🚀 PUBLISHING

### Wanneer alle tests slagen:

1. Klik op **Submit** rechtsboven
2. Geef versie een naam: `Initial GTM Setup - GA4 + Pinterest`
3. Voeg beschrijving toe:
   ```
   - GA4 Configuration Tag
   - Page View, Search, Product Click events
   - GiftFinder tracking
   - Lead generation tracking
   - Pinterest PageVisit, Search, Lead events
   - Outbound link tracking
   ```
4. Klik **Publish**

---

## 📊 EVENTS OVERZICHT

### Events die gefired worden:

| Event Name            | Waar               | Wanneer                  |
| --------------------- | ------------------ | ------------------------ |
| `page_view`           | Alle pages         | Bij elke page load       |
| `search`              | GiftFinder, Blog   | Bij zoeken               |
| `product_click`       | Deal/Product cards | Bij klik op product      |
| `product_impression`  | Deal/Product cards | Bij zichtbaar worden     |
| `giftfinder_search`   | GiftFinder         | Bij genereren resultaten |
| `generate_lead`       | Contact, Quiz      | Bij form submit          |
| `add_to_favorites`    | Product cards      | Bij favorieten toevoegen |
| `outbound_click`      | Affiliate links    | Bij klik naar retailer   |
| `pinterest_pagevisit` | Alle pages         | PageVisit tracking       |
| `pinterest_search`    | GiftFinder         | Search tracking          |
| `pinterest_lead`      | Contact/Quiz       | Lead tracking            |
| `quiz_start`          | Quiz page          | Start quiz               |
| `quiz_complete`       | Quiz page          | Complete quiz            |
| `login`               | Login page         | Succesvolle login        |
| `sign_up`             | Signup page        | Account aanmaken         |
| `blog_read`           | Blog posts         | 50%+ scroll depth        |

---

## 🔍 TROUBLESHOOTING

### Event vuurt niet?

1. Check of dataLayer variable bestaat in debug console
2. Verifieer trigger configuratie
3. Check of event naam exact matcht (case-sensitive!)

### GA4 data komt niet binnen?

1. Verifieer Measurement ID: `G-Y697MJEN2H`
2. Check GA4 Configuration Tag is correct
3. Wacht 24-48 uur voor historical data

### Pinterest pixel werkt niet?

1. Verifieer Pinterest Tag ID in custom HTML
2. Check Tag Health in Pinterest dashboard
3. Test in incognito mode (ad blockers kunnen blokkeren)

---

## 📈 NEXT STEPS (OPTIONEEL)

### Week 2-3:

1. **Conversion Tracking:**
   - Affiliate link clicks als conversie
   - Quiz completions als conversie
   - Lead forms als conversie

2. **E-commerce Tracking:**
   - Enhanced E-commerce events
   - Product impressions met position
   - Cart abandonment tracking

3. **Advanced Segments:**
   - Returning users vs new users
   - High-intent users (3+ searches)
   - Deal hunters (clicks > 5 deals)

### Week 4+:

1. **A/B Testing Integration:**
   - Google Optimize tag
   - Test hero CTAs
   - Test GiftFinder flow

2. **Hotjar/Heatmaps:**
   - User behavior tracking
   - Session recordings
   - Heatmap analysis

3. **Facebook/TikTok Pixels:**
   - Retargeting campagnes
   - Lookalike audiences
   - Conversion optimization

---

## ✅ CHECKLIST

Vink af wanneer voltooid:

**Setup:**

- [ ] GTM container code in index.html (✅ DONE)
- [ ] DataLayer service aangemaakt (✅ DONE)
- [ ] GA4 tracking gemigreerd (✅ DONE)
- [ ] Pinterest tracking gemigreerd (✅ DONE)

**GTM Dashboard:**

- [ ] GA4 Configuration Tag aangemaakt
- [ ] Page View Tag aangemaakt
- [ ] Search Event Tag aangemaakt
- [ ] Product Click Tag aangemaakt
- [ ] GiftFinder Search Tag aangemaakt
- [ ] Lead Generation Tag aangemaakt
- [ ] Pinterest PageVisit Tag aangemaakt
- [ ] Pinterest Search Tag aangemaakt
- [ ] Pinterest Lead Tag aangemaakt
- [ ] Outbound Click Tag aangemaakt
- [ ] Alle DataLayer Variables aangemaakt
- [ ] Alle Triggers aangemaakt

**Testing:**

- [ ] Preview Mode getest
- [ ] Page views werken
- [ ] GiftFinder tracking werkt
- [ ] Product clicks werken
- [ ] Lead generation werkt
- [ ] Pinterest events werken
- [ ] GA4 Realtime data zichtbaar
- [ ] Pinterest Tag Health groen

**Publishing:**

- [ ] GTM container gepubliceerd
- [ ] Versie beschrijving toegevoegd
- [ ] Production site getest
- [ ] 24 uur monitoring

---

## 🆘 SUPPORT

**Vragen?** Check:

1. GTM Help Center: https://support.google.com/tagmanager
2. GA4 Documentation: https://developers.google.com/analytics/devguides/collection/ga4
3. Pinterest Tag: https://help.pinterest.com/en/business/article/track-conversions-with-pinterest-tag

**Need help?** Laat het me weten! 🚀
