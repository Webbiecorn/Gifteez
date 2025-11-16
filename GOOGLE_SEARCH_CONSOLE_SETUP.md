# Google Search Console Verificatie Instructies

## 📋 Stap-voor-stap Gids

### Stap 1: Ga naar Google Search Console

Ga naar: [https://search.google.com/search-console](https://search.google.com/search-console)

Log in met je Google account (bij voorkeur een zakelijk/beheer account).

---

### Stap 2: Voeg Property Toe

1. Klik op **"Property toevoegen"** (of "Add property")
2. Kies **"URL-prefix"**
3. Vul in: `https://gifteez.nl`
4. Klik op **"Doorgaan"**

---

### Stap 3: Kies Verificatie Methode

Je hebt meerdere opties. **Aanbevolen: HTML-tag**

#### Optie A: HTML-tag (Makkelijkst)

1. Selecteer "HTML-tag" als verificatiemethode
2. Kopieer de meta tag die je krijgt, bijvoorbeeld:

   ```html
   <meta name="google-site-verification" content="abc123xyz456..." />
   ```

3. Open `.env.local` (of het CI-secret) en voeg toe:

   ```bash
   VITE_GOOGLE_SITE_VERIFICATION=abc123xyz456...
   ```

   > Vite injecteert deze waarde automatisch in `index.html` via
   > `<meta name="google-site-verification" content="%VITE_GOOGLE_SITE_VERIFICATION%">`.

4. Deploy naar Firebase:

   ```bash
   npm run build
   firebase deploy --only hosting
   ```

5. Ga terug naar Search Console en klik op **"Verifiëren"**

#### Optie B: Google Analytics (Als je al Analytics hebt)

Als je Google Analytics account hetzelfde is als je Search Console account, kun je verificatie via Analytics doen:

1. Selecteer "Google Analytics"
2. Klik op "Verifiëren"
3. Klaar! (geen code aanpassingen nodig)

#### Optie C: Google Tag Manager

Als je Google Tag Manager gebruikt:

1. Selecteer "Google Tag Manager"
2. Zorg dat de GTM container is gepubliceerd
3. Klik op "Verifiëren"

---

### Stap 4: Sitemap Indienen

Nadat verificatie succesvol is:

1. Ga in Search Console naar **"Sitemaps"** (in het linkermenu)
2. Vul in: `sitemap.xml`
3. Klik op **"Indienen"**

De volledige URL wordt: `https://gifteez.nl/sitemap.xml`

---

### Stap 5: Wacht op Indexering

- Het kan **enkele dagen tot weken** duren voordat Google je site volledig heeft geïndexeerd
- Check regelmatig de **"Coverage"** sectie voor indexering status
- Check **"Performance"** voor zoekverkeer data (na paar dagen)

---

## 🎯 Extra Acties na Verificatie

### 1. URL Inspectie Tool

Test of specifieke pagina's goed zijn geïndexeerd:

1. Ga naar **"URL Inspection"**
2. Voer een URL in (bijv. `https://gifteez.nl/blog/ai-smart-home-gadgets-2025`)
3. Klik op **"Test Live URL"**
4. Als niet geïndexeerd: klik op **"Request Indexing"**

### 2. Mobile Usability Check

1. Ga naar **"Mobile Usability"** in het menu
2. Check of er mobile issues zijn
3. Fix eventuele problemen

### 3. Core Web Vitals

1. Ga naar **"Core Web Vitals"**
2. Check performance scores
3. Gebruik PageSpeed Insights voor details: [https://pagespeed.web.dev/](https://pagespeed.web.dev/)

### 4. Structured Data

1. Ga naar **"Enhancements" > "Structured data"**
2. Check of Product, Article, en Breadcrumb schema's worden herkend
3. Fix eventuele errors

---

## 🔔 Notificaties Instellen

1. Klik op **"Settings"** (tandwiel icoon)
2. Ga naar **"Users and permissions"**
3. Voeg extra gebruikers toe indien nodig
4. Zorg dat email notificaties aan staan voor:
   - Critical issues
   - Manual actions
   - Security issues

---

## 📊 Wat te Monitoren (Wekelijks/Maandelijks)

### Wekelijks Checken:

- [ ] **Coverage** - Zijn er nieuwe errors?
- [ ] **Performance** - Hoeveel clicks/impressies?
- [ ] **Mobile Usability** - Nieuwe issues?

### Maandelijks Checken:

- [ ] **Core Web Vitals** - Performance stabiel?
- [ ] **Search Appearance** - Rich results werken?
- [ ] **Links** - Backlinks groei?
- [ ] **Experience** - HTTPS, mobile-friendly OK?

---

## 🆘 Troubleshooting

### "Verificatie mislukt"

- Wacht 5-10 minuten na deployment
- Check of de meta tag écht in de live HTML staat (view-source:https://gifteez.nl)
- Probeer een andere verificatiemethode

### "Sitemap couldn't be read"

- Check of sitemap bereikbaar is: https://gifteez.nl/sitemap.xml
- Check robots.txt: https://gifteez.nl/robots.txt
- Wacht 24 uur en probeer opnieuw

### "Page not indexed"

- Wacht geduldig (kan 1-4 weken duren)
- Gebruik "Request Indexing" in URL Inspection tool
- Check of robots.txt de pagina niet blokkeert
- Check of pagina links heeft van andere pagina's

---

## 📱 Handige Links

- **Search Console:** https://search.google.com/search-console
- **Rich Results Test:** https://search.google.com/test/rich-results
- **PageSpeed Insights:** https://pagespeed.web.dev/
- **Mobile-Friendly Test:** https://search.google.com/test/mobile-friendly
- **Structured Data Testing:** https://validator.schema.org/

---

## ✅ Checklist na Setup

```
[ ] Google Search Console geverifieerd
[ ] Sitemap ingediend (sitemap.xml)
[ ] Hoofdpagina's handmatig geïndexeerd via "Request Indexing"
[ ] Email notificaties geconfigureerd
[ ] Team members toegevoegd (indien van toepassing)
[ ] Eerste performance rapport bekeken (na 1 week)
[ ] Core Web Vitals gechecked
[ ] Mobile usability gechecked
[ ] Rich results test uitgevoerd
```

---

**Hulp nodig?** Check de [Google Search Console Help](https://support.google.com/webmasters/)

Succes! 🚀
