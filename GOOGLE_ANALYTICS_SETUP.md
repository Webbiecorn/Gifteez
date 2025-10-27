# Google Analytics 4 Setup via Google Tag Manager

## ✅ Status Check

- ✅ Google Tag Manager container geïnstalleerd: `GTM-KC68DTEN`
- ✅ GTM snippet correct in `index.html`
- ⚠️ Google Analytics 4 nog te configureren

## 🎯 Stappen om Google Analytics 4 toe te voegen

### Stap 1: Maak Google Analytics 4 Property aan

1. Ga naar [Google Analytics](https://analytics.google.com/)
2. Klik op **Admin** (tandwiel icoon linksonder)
3. Klik op **+ Create Property**
4. Vul in:
   - **Property name**: `Gifteez.nl`
   - **Reporting time zone**: `(GMT+01:00) Amsterdam`
   - **Currency**: `Euro (EUR)`
5. Klik **Next**
6. Vul bedrijfsgegevens in (optioneel)
7. Klik **Create**
8. Accepteer de terms

### Stap 2: Kopieer Google Analytics Measurement ID

Na het aanmaken van de property:

1. Ga naar **Admin** > **Data Streams**
2. Klik **Add stream** > **Web**
3. Vul in:
   - **Website URL**: `https://gifteez.nl`
   - **Stream name**: `Gifteez Website`
4. Klik **Create stream**
5. **Kopieer** de **Measurement ID** (format: `G-XXXXXXXXXX`)

### Stap 3: Configureer in Google Tag Manager

#### 3.1 Maak Google Analytics 4 Configuration Tag

1. Ga naar [Google Tag Manager](https://tagmanager.google.com/)
2. Selecteer container `GTM-KC68DTEN`
3. Ga naar **Tags** > **New**
4. Klik op **Tag Configuration**
5. Selecteer **Google Analytics: GA4 Configuration**
6. Vul in:
   - **Measurement ID**: `G-XXXXXXXXXX` (van stap 2)
   - **Configuration Settings**: Laat standaard
7. Klik op **Triggering**
8. Selecteer **All Pages - Page View**
9. Geef de tag een naam: `GA4 - Configuration`
10. Klik **Save**

#### 3.2 Test in Preview Mode

1. Klik rechtsboven op **Preview**
2. Vul in: `https://gifteez.nl`
3. Klik **Connect**
4. Een nieuw venster opent met je site
5. Check in GTM Preview of `GA4 - Configuration` fired
6. Check in Google Analytics **Realtime** report of je bezoek verschijnt

#### 3.3 Publiceer Container

1. Als de test succesvol is, klik op **Submit** (rechtsboven)
2. Geef een naam: `GA4 Configuration Setup`
3. Beschrijving: `Added Google Analytics 4 configuration tag`
4. Klik **Publish**

### Stap 4: Configureer Event Tracking (Optioneel maar aanbevolen)

#### Track Button Clicks

**Tag 1: Track "Start Gift Finder" Button**

1. **Tags** > **New**
2. **Tag Configuration**: Google Analytics: GA4 Event
3. **Configuration Tag**: Selecteer `GA4 - Configuration`
4. **Event Name**: `start_gift_finder`
5. **Event Parameters** (optioneel):
   ```
   page_location: {{Page URL}}
   page_title: {{Page Title}}
   ```
6. **Triggering**: Maak nieuwe trigger:
   - Type: **Click - All Elements**
   - Trigger fires on: **Some Clicks**
   - Click Text contains: `Vind jouw cadeau`
7. Naam: `GA4 - Start Gift Finder Click`
8. **Save**

**Tag 2: Track Affiliate Clicks**

1. **Tags** > **New**
2. **Tag Configuration**: Google Analytics: GA4 Event
3. **Configuration Tag**: Selecteer `GA4 - Configuration`
4. **Event Name**: `affiliate_click`
5. **Event Parameters**:
   ```
   link_url: {{Click URL}}
   link_text: {{Click Text}}
   outbound: true
   ```
6. **Triggering**: Maak nieuwe trigger:
   - Type: **Click - All Elements**
   - Trigger fires on: **Some Clicks**
   - Click URL contains: `amazon.nl` OR `coolblue.nl` OR `awin` OR `partypro`
7. Naam: `GA4 - Affiliate Click`
8. **Save**

**Tag 3: Track Quiz Completion**

1. **Tags** > **New**
2. **Tag Configuration**: Google Analytics: GA4 Event
3. **Configuration Tag**: Selecteer `GA4 - Configuration`
4. **Event Name**: `quiz_complete`
5. **Triggering**: Maak custom event trigger voor quiz completion
6. Naam: `GA4 - Quiz Complete`
7. **Save**

### Stap 5: Verificatie

#### In Google Analytics:

1. Ga naar **Reports** > **Realtime**
2. Bezoek je website
3. Check of je bezoek verschijnt
4. Klik op buttons en check of events verschijnen

#### In Google Tag Manager:

1. Gebruik **Preview Mode** om te testen
2. Check of alle tags correct firen
3. Geen errors in de console

## 📊 Aanbevolen Events om te tracken

### E-commerce Events

```javascript
// Product Click
dataLayer.push({
  'event': 'select_item',
  'ecommerce': {
    'items': [{
      'item_name': 'Product Name',
      'item_id': 'product-123',
      'price': 29.99,
      'item_brand': 'Brand Name',
      'item_category': 'Category'
    }]
  }
});

// Purchase (affiliate click-out)
dataLayer.push({
  'event': 'purchase',
  'ecommerce': {
    'transaction_id': 'T_12345',
    'affiliation': 'Coolblue',
    'value': 29.99,
    'currency': 'EUR',
    'items': [...]
  }
});
```

### Engagement Events

- `search` - Zoekacties
- `view_item` - Product detail bekeken
- `add_to_wishlist` - Favoriet toegevoegd
- `share` - Delen via social media

## 🔧 Code Aanpassingen (Optioneel)

Als je events vanuit React wilt triggeren:

```typescript
// types.ts
declare global {
  interface Window {
    dataLayer: any[]
  }
}

// utils/analytics.ts
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...parameters,
    })
  }
}

// Gebruik in components
import { trackEvent } from '../utils/analytics'

const handleButtonClick = () => {
  trackEvent('start_gift_finder', {
    page_location: window.location.href,
    page_title: document.title,
  })
  navigateTo('giftFinder')
}
```

## 📈 Aanbevolen Dashboards & Reports

### In GA4:

1. **Realtime** - Live bezoekers
2. **Acquisition** - Traffic bronnen
3. **Engagement** - Pageviews, events
4. **Monetization** - E-commerce (indien geconfigureerd)
5. **Retention** - Terugkerende bezoekers

### Custom Reports:

1. **Affiliate Performance** - Welke retailers het beste converteren
2. **Gift Finder Usage** - Hoeveel mensen de quiz gebruiken
3. **Category Performance** - Populairste categorieën

## ⚠️ Privacy & GDPR

**LET OP**: Zorg voor:

1. ✅ Cookie consent banner (al geïmplementeerd via CookieConsentContext)
2. ✅ Analytics alleen na consent
3. ✅ Privacy policy bijwerken met Google Analytics
4. ✅ IP Anonimization (standaard in GA4)

## 🎯 Quick Win: Enhanced Conversions

Voor betere tracking van affiliate conversions:

1. Ga naar GA4 > **Admin** > **Data Streams**
2. Klik op je stream
3. Scroll naar **Enhanced measurement**
4. Zorg dat deze aan staat:
   - ✅ Page views
   - ✅ Scrolls
   - ✅ Outbound clicks
   - ✅ Site search
   - ✅ Video engagement
   - ✅ File downloads

## 📝 Checklist

- [ ] GA4 Property aangemaakt
- [ ] Measurement ID gekopieerd
- [ ] GA4 Configuration Tag in GTM
- [ ] Getest in Preview Mode
- [ ] Container gepubliceerd
- [ ] Realtime data zichtbaar in GA4
- [ ] Event tracking geconfigureerd (optioneel)
- [ ] Cookie consent check (indien nodig)
- [ ] Team toegang gegeven (indien van toepassing)

## 🔗 Nuttige Links

- [Google Analytics 4](https://analytics.google.com/)
- [Google Tag Manager](https://tagmanager.google.com/)
- [GA4 Event Reference](https://support.google.com/analytics/answer/9267735)
- [GTM Documentation](https://support.google.com/tagmanager)

---

_Laatste update: 27 oktober 2025_
