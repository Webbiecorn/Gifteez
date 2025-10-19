# AWIN Publisher MasterTag Integration 🎯

## Overzicht

De AWIN Publisher MasterTag is geïntegreerd in Gifteez.nl om geavanceerde affiliate tracking en analytics mogelijk te maken.

**Publisher ID**: 256611  
**MasterTag URL**: `https://www.dwin2.com/pub.256611.min.js`

## Geactiveerde Plugins

### ✅ 1. wecantrack - Consolidated Affiliate Analytics

**Waarom handig**:

- Verzamelt data van **350+ partnernetwerken** (AWIN, Coolblue, Amazon, etc.)
- **Eén dashboard** voor alle affiliate statistieken
- Automatische integratie met Google Analytics, Ads, Microsoft Ads
- Real-time rapportage en inzichten

**Features**:

- Geconsolideerde rapportage over alle networks
- Cross-network attributie
- Advanced analytics en insights
- Automatische data synchronisatie

**Dashboard**: [Partner Success Center](https://www.awin.com/nl/affiliate-marketing/tools/wecantrack)

### ✅ 2. adMission - Automatic Affiliate Disclosure

**Waarom handig**:

- **Automatische disclaimer** op pagina's met affiliate links
- Compliance met Nederlandse wetgeving (ACM richtlijnen)
- Aanpasbaar design en tekst
- Geen handmatig werk meer

**Features**:

- Detecteert automatisch affiliate links
- Toont disclaimer conform wettelijke eisen
- Customizable per pagina type
- Mobile-friendly

**Configuratie**: Via AWIN Publisher Dashboard → Hulpmiddelen → adMission

### ✅ 3. TRENDii - Instant Shopping Tags

**Waarom handig**:

- Tag foto's en video's met directe productlinks
- Verhoogt conversie uit visuele content
- Maakt blog posts interactief
- Perfect voor influencer-style content

**Features**:

- Foto/video tagging met productlinks
- Instant shopping ervaring
- Mobile optimized
- Analytics per getagde item

**Use cases**:

- Blog posts met product foto's
- Gift guides met visuals
- Deal showcases
- Category pages

## Technische Implementatie

### 1. MasterTag Script (index.html)

```html
<!-- AWIN Publisher MasterTag - Enables wecantrack, adMission, TRENDii -->
<script src="https://www.dwin2.com/pub.256611.min.js" async></script>
```

**Locatie**: `/index.html` (head sectie, na Google Tag Manager)

### 2. Wecantrack Service (services/wecantrackService.ts)

De service biedt:

- **isLoaded()**: Check of MasterTag geladen is
- **isPluginActive(plugin)**: Check specifieke plugin status
- **trackClick(params)**: Log affiliate clicks
- **trackProductView(params)**: Log product views
- **getStatus()**: Debug informatie
- **initialize()**: Auto-detect en log plugins

**Gebruik in code**:

```typescript
import { wecantrackService } from '../services/wecantrackService'

// Check status
const status = wecantrackService.getStatus()
console.log('MasterTag loaded:', status.masterTagLoaded)
console.log('Plugins:', status.plugins)

// Track affiliate click
wecantrackService.trackClick({
  productId: 'prod-123',
  productName: 'Smart Home Speaker',
  retailer: 'Coolblue',
  price: 99.99,
  category: 'Electronics',
  url: 'https://www.awin1.com/...',
})

// Track product view
wecantrackService.trackProductView({
  productId: 'prod-123',
  productName: 'Smart Home Speaker',
  category: 'Electronics',
  price: 99.99,
})
```

### 3. App.tsx Initialisatie

```typescript
import { wecantrackService } from './services/wecantrackService'

useEffect(() => {
  wecantrackService.initialize()
}, [])
```

De service:

- Detecteert automatisch wanneer MasterTag geladen is
- Logt welke plugins actief zijn
- Waarschuwt als MasterTag niet laadt binnen 10 seconden

## Wat Jij Moet Doen in AWIN Dashboard

### Stap 1: Activeer Plugins (BELANGRIJK!)

1. Ga naar: https://ui.awin.com/awin/affiliate/256611/mastertag
2. **Zet deze schuifjes op "AAN"**:
   - ✅ **adMission** - Publisher Disclosure
   - ✅ **wecantrack** - Affiliate aggregatie ⭐ (SUPER BELANGRIJK!)
   - ✅ **TRENDii** - Instant shopping tags

3. **NIET nodig**:
   - ❌ Awin Tracking Optimalisatie (Bounceless Tracking) - Je hebt al tracking
   - ❌ Convert-a-Link - Converteer normale links (doe je al handmatig)

### Stap 2: Configureer wecantrack

1. Ga naar Partner Success Center
2. Koppel je netwerken:
   - AWIN (al gekoppeld)
   - Coolblue (voeg toe via Partner Success Center)
   - Amazon Associates (indien beschikbaar)
3. Koppel Google Analytics (optioneel maar aanbevolen)

### Stap 3: Configureer adMission Disclaimer

1. Ga naar adMission instellingen
2. Kies disclaimer type: "Top banner" of "Inline"
3. Pas tekst aan (Nederlands):
   ```
   Deze pagina bevat affiliate links. Als je via onze links koopt,
   ontvangen wij mogelijk een commissie zonder extra kosten voor jou.
   ```
4. Kies styling die past bij Gifteez design

### Stap 4: Test de Integratie

1. Open Gifteez.nl in browser
2. Open Console (F12)
3. Zoek naar log messages:
   ```
   ✓ AWIN MasterTag loaded successfully
   ✓ wecantrack plugin active - Consolidated analytics enabled
   ✓ adMission plugin active - Automatic disclosure enabled
   ✓ TRENDii plugin active - Instant shopping tags enabled
   ```

## Debugging

### Check MasterTag Status

```typescript
// In browser console
wecantrackService.getStatus()
```

Output should show:

```javascript
{
  masterTagLoaded: true,
  plugins: {
    wecantrack: true,
    adMission: true,
    TRENDii: true
  }
}
```

### Common Issues

**Issue**: MasterTag not loading
**Solution**:

- Check if script is in `<head>` of index.html
- Verify publisher ID is correct (256611)
- Check browser console for errors
- Disable ad blockers

**Issue**: Plugins not active
**Solution**:

- Log in to AWIN dashboard
- Go to Hulpmiddelen → Publisher MasterTag
- Toggle plugins to "ON" (groen)
- Wait 5 minutes for changes to propagate

**Issue**: No affiliate disclosure showing
**Solution**:

- Check adMission configuration in AWIN
- Verify affiliate links have correct format
- Test on pages with AWIN affiliate links

## Volgende Stappen

### TODO voor Kevin:

1. ✅ Zet plugins aan in AWIN dashboard (adMission, wecantrack, TRENDii)
2. ⏳ Configureer wecantrack met alle netwerken
3. ⏳ Pas adMission disclaimer aan (Nederlandse tekst + Gifteez styling)
4. ⏳ Test dat MasterTag laadt op live site
5. ⏳ Verifieer dat clicks getrackt worden

### TODO voor Developer:

1. ⏳ Integreer `wecantrackService.trackClick()` in bestaande affiliate links
2. ⏳ Update `GiftResultCard.tsx` met tracking
3. ⏳ Update `DealsPage.tsx` product cards met tracking
4. ⏳ Test tracking op verschillende pagina's
5. ⏳ Monitor wecantrack dashboard voor data

## Voordelen voor Gifteez.nl

### 1. Betere Analytics 📊

- **Eén dashboard** voor alle affiliate networks (geen handmatig werk meer!)
- Real-time inzichten in best performing products/retailers
- Cross-network attributie (welke combinaties werken het beste?)

### 2. Compliance & Trust 🔒

- Automatische affiliate disclosure (ACM compliant)
- Verhoogt vertrouwen bij bezoekers
- Geen zorgen over vergeten disclaimers

### 3. Verhoogde Conversie 💰

- TRENDii maakt blog posts shoppable
- Visuele content wordt direct actionable
- Lagere drempel voor aankoop

### 4. Time Saving ⏰

- Geen handmatige rapportage meer
- Automatische data synchronisatie
- Focus op content, niet op admin

## Resources

- **AWIN Dashboard**: https://ui.awin.com/awin/affiliate/256611/mastertag
- **wecantrack Docs**: https://www.awin.com/nl/affiliate-marketing/tools/wecantrack
- **Partner Success Center**: Via AWIN dashboard → Rapportages → Partner Success Center
- **adMission Guide**: Lees het Succescentrum voor volledige configuratie

## Support

Bij vragen of problemen:

1. AWIN Publisher Support: publishersupport@awin.com
2. wecantrack Support: Via Partner Success Center
3. Developer Console logs: `wecantrackService.getStatus()`

---

**Status**: ✅ Technisch geïmplementeerd - wacht op plugin activatie in AWIN dashboard

**Laatste update**: 19 oktober 2025
