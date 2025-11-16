# Amazon SiteStripe Installatie & Setup Handleiding

## Voor Gifteez Product Feed Management

### 🎯 **Wat is Amazon SiteStripe?**

Amazon SiteStripe is een gratis browser toolbar voor Amazon Associates die je helpt om:

- Affiliate links te genereren
- Productgegevens te verzamelen
- Commissie tracking in te stellen
- Product ASINs te vinden

---

## 📋 **Stap 1: Amazon Associates Account**

### **A. Controleer je Associates Status**

1. Ga naar: https://affiliate-program.amazon.nl/
2. Log in met je Amazon account
3. Controleer of je account actief is (groene status)

### **B. Geen Associates Account?**

1. Klik op "Registreren" op https://affiliate-program.amazon.nl/
2. Vul bedrijfsgegevens in:
   - **Website**: gifteez-7533b.web.app
   - **Bedrijfsnaam**: Gifteez
   - **Type**: Website/Blog
3. Voeg website toe en wacht op goedkeuring

---

## 🔧 **Stap 2: SiteStripe Activeren**

### **Geen installatie nodig! 🎉**

SiteStripe is automatisch beschikbaar zodra je bent ingelogd op Amazon PartnerNet.

### **Activatie stappen:**

1. **Ga naar Amazon.nl** (gewone Amazon website)
2. **Log in met je Amazon account** (hetzelfde account als PartnerNet)
3. **SiteStripe verschijnt automatisch** bovenaan elke productpagina
4. **Klik op een product** om de SiteStripe balk te zien

### **SiteStripe Interface:**

- **Zwarte balk** bovenaan productpagina's
- **Drie opties**: Text, Image, Custom
- **Jouw Associate Tag**: `gifteez77-21` (zoals in je screenshot)
- **Direct link genereren** zonder extra tools

### **Verificatie:**

✅ SiteStripe balk zichtbaar op productpagina's  
✅ Je Associate Tag `gifteez77-21` zichtbaar in links  
✅ "Text", "Image", "Custom" opties beschikbaar

---

## 🛍️ **Stap 3: Product Data Verzamelen**

### **Workflow voor Gifteez:**

#### **A. Productzoeken**

```
1. Ga naar amazon.nl
2. Zoek populaire cadeau items:
   - "echo dot"
   - "airpods"
   - "kindle"
   - "jbl speaker"
   - "smart home"
```

#### **B. Data Extraheren**

Voor elk product:

1. **Klik SiteStripe → "Text"**
2. **Kopieer Short Link** (bevat jouw affiliate tag)
3. **Noteer product gegevens:**
   ```
   ASIN: B08N5WRWNW (uit URL)
   Naam: Amazon Echo Dot (4e generatie)
   Prijs: €59,99
   Afbeelding: Rechtsklik → Afbeelding kopiëren
   Beschrijving: Uit product bullets
   ```

#### **C. ASIN Vinden**

**Methode 1 - URL:**

```
https://www.amazon.nl/dp/B08N5WRWNW/
                      ^^^^^^^^^^
                      Dit is de ASIN
```

**Methode 2 - SiteStripe:**

```
Hover over SiteStripe link
ASIN staat in tooltip of URL preview
```

---

## 📝 **Stap 4: Product Toevoegen aan Gifteez**

### **Template Invullen:**

```javascript
{
  asin: 'B08N5WRWNW',
  name: 'Amazon Echo Dot (4e generatie) - Antraciet',
  description: 'Kompakte slimme luidspreker met Alexa...',
  price: 59.99,
  originalPrice: 79.99, // Indien doorgestreept
  currency: 'EUR',
  image: 'https://m.media-amazon.com/images/I/714Rq4k05UL._AC_SL1000_.jpg',
  category: 'Smart Home',
  subcategory: 'Smart Speakers',
  affiliateLink: '[JOUW SITESTRIPE LINK]',
  inStock: true,
  prime: true, // Primebadge zichtbaar?
  rating: 4.5, // Sterren rating
  reviewCount: 45000, // Aantal reviews
  features: ['Alexa spraakbesturing', 'Compact design'],
  tags: ['smart-home', 'alexa', 'speaker'],
  giftScore: 8, // 1-10 voor cadeau geschiktheid
  ageGroup: '18-65',
  occasion: ['verjaardag', 'kerstmis', 'housewarming'],
  priceRange: 'budget', // budget/mid-range/premium
  lastUpdated: new Date().toISOString()
}
```

### **Script Updaten:**

```bash
# 1. Open script
nano scripts/manualAmazonFeed.mjs

# 2. Voeg product toe aan generateSampleProducts()

# 3. Test script
node scripts/manualAmazonFeed.mjs generate

# 4. Controleer output
cat data/amazonSample.json

# 5. Deploy
npm run build && firebase deploy
```

---

## 🎯 **Stap 5: Aanbevolen Producten voor Gifteez**

### **Priority 1 - Must Have (10 producten):**

- ✅ Echo Dot (4e gen) - €59,99
- ✅ Apple AirPods (3e gen) - €179,00
- ✅ Kindle Paperwhite - €139,99
- ✅ Fire TV Stick 4K Max - €54,99
- ⭐ **Voeg toe:**
  - JBL Flip 6 speaker - €129,99
  - Philips Hue White starterskit - €99,99
  - Anker PowerCore powerbank - €39,99
  - Ring Video Doorbell - €199,99
  - Apple Watch SE - €279,99
  - Nintendo Switch Pro Controller - €69,99

### **Priority 2 - Seizoensgebonden (5 producten):**

- **Kerst**: Amazon geschenkbonnen, Kerstverlichting
- **Verjaardag**: Populaire gadgets, Boeken
- **Moederdag**: Beauty items, Keuken gadgets

### **Priority 3 - Premium (5 producten):**

- iPad (9e gen) - €389,99
- Sony WH-1000XM5 - €399,99
- Dyson V15 Detect - €749,99
- KitchenAid Stand Mixer - €499,99
- Apple MacBook Air M2 - €1.199,99

---

## ⚡ **Quick Start Checklist**

### **Setup (10 minuten):**

- [x] Amazon Associates account actief ✅
- [x] SiteStripe beschikbaar (geen installatie nodig) ✅
- [ ] Test link gegenereerd en geverifieerd
- [ ] Affiliate tag werkend (gifteez77-21)

### **Product Collection (2 uur):**

- [ ] 10 Priority 1 producten verzameld
- [ ] Data correct genoteerd (ASIN, prijs, specs)
- [ ] Affiliate links gegenereerd en getest
- [ ] Screenshots/notities gemaakt

### **Implementation (1 uur):**

- [ ] Producten toegevoegd aan script
- [ ] Feed gegenereerd en getest
- [ ] Website geupdate en gedeployed
- [ ] Functionaliteit geverifieerd

---

## 🔍 **Troubleshooting**

### **SiteStripe niet zichtbaar?**

```
1. Controleer dat je bent ingelogd op Amazon.nl
2. Ga naar een productpagina (niet homepage)
3. Scroll naar de bovenkant van de pagina
4. Refresh pagina (Ctrl+F5) als nodig
5. Controleer of je ingelogd bent met het juiste account
```

### **Affiliate links werken niet?**

```
1. Controleer Associate Tag in links
2. Test links in incognito venster
3. Verificeer account status op Associates portal
4. Wacht 24u voor link propagatie
```

### **ASIN niet gevonden?**

```
1. Zoek in URL na /dp/ of /gp/product/
2. Check product details pagina onderaan
3. Gebruik browser Developer Tools (F12)
4. Zoek naar 'asin' in HTML
```

---

## 📊 **Performance Monitoring**

### **Weekly Checklist:**

- [ ] Prijzen gecontroleerd en bijgewerkt
- [ ] Out-of-stock items vervangen
- [ ] Nieuwe seasonal items toegevoegd
- [ ] Affiliate performance bekeken

### **Monthly Review:**

- [ ] Top performing producten geïdentificeerd
- [ ] Underperforming items vervangen
- [ ] Nieuwe categorieën overwogen
- [ ] Commission rapport geanalyseerd

---

## 🎉 **Success Metrics**

- **Target**: 20-50 Amazon producten actief
- **Conversion**: 2-5% click-through rate
- **Revenue**: €50-200/maand Amazon commissies
- **Update**: Wekelijks onderhoud <1 uur

**Ready to start? Begin met de eerste 5 producten en bouw geleidelijk uit! 🚀**
