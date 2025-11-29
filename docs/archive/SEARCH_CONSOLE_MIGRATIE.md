# Google Search Console - Migratie Checklist

## Situatie

Je hebt een bestaande Search Console property, maar de sitemap is van 21 september (oud). De nieuwe site heeft een verse sitemap met 7 URLs gegenereerd op 14 oktober.

## Wat Te Checken

### 1. Welke Property Gebruik Je?

In je screenshot zie je twee properties:

- **gifteez.nl** (Domain property) ⭐ AANBEVOLEN
- **https://gifteez.nl/** (URL-prefix property)
- **https://peru-cobra-571411.hostingersite.com/** (Oude hosting?)

### 2. Controleer Je Huidige Domein

De nieuwe site draait op:

- **Firebase Hosting**: `https://gifteez-7533b.web.app`
- **Custom Domain**: `https://gifteez.nl` (als gekoppeld)

## Stap-voor-Stap Actieplan

### STAP 1: Controleer Welke Property Actief Is

1. Ga naar [Google Search Console](https://search.google.com/search-console)
2. Klik op de property selector (linksboven)
3. Check welke properties je ziet

### STAP 2: Controleer Domain Koppeling

```bash
# Check waar gifteez.nl naar wijst
dig gifteez.nl
nslookup gifteez.nl
```

Verwacht:

- Als Firebase custom domain: A-records naar Firebase IPs
- Als Hostinger: A-records naar Hostinger IPs

### STAP 3A: Als gifteez.nl NOG op oude hosting staat

**Dan moet je:**

1. ✅ Verwijder de oude Hostinger property (`https://peru-cobra-571411.hostingersite.com/`)
2. ✅ Update DNS records om naar Firebase te wijzen
3. ✅ Voeg custom domain toe in Firebase Console
4. ✅ Submit nieuwe sitemap in Search Console

### STAP 3B: Als gifteez.nl AL op Firebase staat

**Dan moet je:**

1. ✅ Selecteer de `gifteez.nl` domain property in Search Console
2. ✅ Ga naar **Sitemaps** (links menu)
3. ✅ Verwijder oude sitemap (als die er staat)
4. ✅ Voeg nieuwe sitemap toe: `https://gifteez.nl/sitemap.xml`
5. ✅ Wacht 1-2 dagen op indexering

### STAP 4: Sitemap Opnieuw Indienen

1. Open Google Search Console
2. Ga naar **Sitemaps** in het linker menu
3. Zie je een oude sitemap? Klik op de 3 dots → **Verwijderen**
4. Klik op **Nieuwe sitemap toevoegen**
5. Voer in: `sitemap.xml`
6. Klik **Indienen**

### STAP 5: Verifieer de Sitemap

Na indienen zou je moeten zien:

- ✅ Status: **Geslaagd**
- ✅ URLs ontdekt: **7**
- ✅ Laatste leesdatum: **Vandaag (14 okt 2025)**

## DNS Check Commando's

### Check huidige DNS

```bash
# Check A-records
dig gifteez.nl A +short

# Check nameservers
dig gifteez.nl NS +short

# Check alle DNS records
dig gifteez.nl ANY
```

### Firebase Custom Domain IPs

Als je Firebase custom domain gebruikt, zou je één van deze moeten zien:

```
151.101.1.195
151.101.65.195
```

## Firebase Custom Domain Setup

Als je custom domain `gifteez.nl` nog NIET hebt gekoppeld aan Firebase:

### 1. In Firebase Console

1. Ga naar [Firebase Console](https://console.firebase.google.com/project/gifteez-7533b/hosting)
2. Klik op **Hosting** in het linker menu
3. Klik op **Aangepast domein toevoegen**
4. Voer in: `gifteez.nl`
5. Volg de instructies voor DNS verificatie

### 2. Update DNS Records (bij je domein registrar)

```
Type: A
Name: @
Value: 151.101.1.195

Type: A
Name: @
Value: 151.101.65.195

Type: A
Name: www
Value: 151.101.1.195

Type: A
Name: www
Value: 151.101.65.195
```

### 3. SSL Certificaat

Firebase genereert automatisch een gratis SSL certificaat (Let's Encrypt).
Dit kan 24 uur duren.

## Oude Property Cleanup

### Properties die je KUNT verwijderen:

- ❌ `https://peru-cobra-571411.hostingersite.com/` (oude Hostinger site)
- ⚠️ `https://gifteez.nl/` (URL-prefix) - alleen als je de domain property gebruikt

### Properties die je MOET behouden:

- ✅ `gifteez.nl` (Domain property) - DEZE GEBRUIKEN!

### Hoe property verwijderen:

1. Ga naar Search Console
2. Selecteer de property die je wilt verwijderen
3. Klik op het tandwiel ⚙️ (Instellingen)
4. Scroll naar beneden
5. Klik **Property verwijderen**

## Quick Test Commands

Voer deze commando's uit om te checken waar je site nu staat:

```bash
# Check of gifteez.nl naar Firebase wijst
curl -I https://gifteez.nl

# Check of sitemap bereikbaar is
curl https://gifteez.nl/sitemap.xml

# Check welke server de site host
curl -I https://gifteez.nl | grep -i server

# Check Firebase URL
curl -I https://gifteez-7533b.web.app
```

## Verwachte Resultaten

### Als custom domain WEL gekoppeld is:

```bash
$ curl -I https://gifteez.nl
HTTP/2 200
content-type: text/html
x-cloud-trace-context: ...
```

### Als custom domain NIET gekoppeld is:

```bash
$ curl -I https://gifteez.nl
# Redirects naar oude hosting of error
```

## Volgende Stappen

1. **NU**: Run de DNS check commands hieronder
2. **Check**: Waar wijst gifteez.nl naartoe?
3. **Besluit**: Migreer naar Firebase custom domain OF update sitemap op huidige hosting
4. **Cleanup**: Verwijder oude Search Console properties
5. **Monitor**: Check indexering over 2-3 dagen

## Hulp Nodig?

Laat me weten wat de output is van:

```bash
dig gifteez.nl +short
curl -I https://gifteez.nl | head -5
```

Dan kan ik je precies vertellen wat de volgende stap is! 🎯
