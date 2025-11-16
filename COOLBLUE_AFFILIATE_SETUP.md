# Coolblue Affiliate Configuratie via Awin - ✅ VOLTOOID

## Status: ✅ ACTIEF

- **Publisher ID**: 2566111 (Gifteez.nl)
- **Coolblue Advertiser ID**: 85161
- **Status**: Volledig geconfigureerd en operationeel

Coolblue werkt via het Awin affiliate netwerk (ui.awin.com).

## Instructies voor Awin/Coolblue setup:

### 1. Awin gegevens verzamelen

In je Awin dashboard (https://ui.awin.com/awin/affiliate) vind je:

- **Publisher ID**: Jouw unieke Awin publisher ID (bijv. 123456)
- **Coolblue Advertiser ID**: Coolblue's ID binnen Awin (zoek naar Coolblue in je advertiser lijst)

### 2. Configuratie updaten

Update de configuratie in `services/coolblueAffiliateService.ts`:

```typescript
CoolblueAffiliateService.updateConfig({
  publisherId: 'JOUW_AWIN_PUBLISHER_ID',
  advertiserId: 'COOLBLUE_AWIN_ADVERTISER_ID',
})
```

### 3. Link structuur

Awin affiliate links zien er zo uit:

```
https://www.awin1.com/cread.php?awinmid=ADVERTISER_ID&awinaffid=PUBLISHER_ID&clickref=gifteez&p=ENCODED_COOLBLUE_URL
```

## Wat heb ik van jou nodig:

1. **Publisher ID**: Jouw Awin Publisher ID (te vinden in je dashboard)
2. **Advertiser ID**: Coolblue's Advertiser ID binnen Awin
3. **Commissie info**: Welke productcategorieën bij Coolblue de beste commissies geven
4. **Deep linking**: Heb je toegang tot Awin product feeds/deeplinks?

## Hoe het werkt:

- Alle Coolblue URLs worden automatisch omgezet naar Awin affiliate links
- De `withAffiliate()` functie herkent Coolblue URLs en maakt Awin links
- Campaign tracking via `clickref` parameter voor betere analytics

## Test voorbeelden:

**Voor:**

- `https://www.coolblue.nl/product/123456/product-naam.html`
- `https://www.coolblue.nl/zoeken?query=lego`

**Na configuratie wordt:**

- `https://www.awin1.com/cread.php?awinmid=ADVERTISER_ID&awinaffid=PUBLISHER_ID&clickref=gifteez&p=https%3A//www.coolblue.nl/product/123456/product-naam.html`

## Awin voordelen:

✅ **Betrouwbare tracking** - Awin heeft enterprise-level tracking  
✅ **Gedetailleerde rapportage** - Zie exact welke producten verkopen  
✅ **Campaign tracking** - Via clickref parameter verschillende bronnen meten  
✅ **Automatic validation** - Awin valideert alle transacties  
✅ **Cross-device tracking** - Werkt op alle apparaten

## Volgende stappen:

1. **Geef me je Awin Publisher ID**
2. **Geef me Coolblue's Advertiser ID uit je Awin dashboard**
3. Ik update de configuratie met de juiste waarden
4. We testen of de Awin tracking correct werkt
5. Deploy naar productie

Alle bol.com references zijn al vervangen door Coolblue URLs die klaar zijn voor Awin affiliate tracking!
