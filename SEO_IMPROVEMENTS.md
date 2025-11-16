# SEO Verbeteringen voor Gifteez.nl

## ✅ Wat al GOED is:

- Sitemap.xml aanwezig en automatisch gegenereerd
- Robots.txt correct geconfigureerd
- Meta tags (title, description, OG, Twitter)
- Structured Data (JSON-LD)
- Google Analytics & Tag Manager
- HTTPS en mobile responsive
- Canonical URLs

---

## ⚠️ VERBETERPUNTEN

### 1. 🔴 KRITIEK: Google Search Console

**Status:** Waarschijnlijk niet geverifieerd
**Actie:**

1. Ga naar [Google Search Console](https://search.google.com/search-console)
2. Voeg `gifteez.nl` toe als property
3. Verifieer via:
   - HTML tag (in `<head>`)
   - Google Analytics account
   - Of DNS TXT record
4. Dien sitemap in: `https://gifteez.nl/sitemap.xml`

**Zo doe je dat nu:**

1. Vraag je HTML-tag in Search Console op (`google-site-verification=...`).
2. Zet de waarde in `.env.local` (of CI) als `VITE_GOOGLE_SITE_VERIFICATION="je-code"`.
3. Vite injecteert automatisch `<meta name="google-site-verification" content="...">` in `index.html`.
4. Deploy en klik in Search Console op **Verify**.

---

### 2. 🟡 Missing: Breadcrumb Schema

Breadcrumbs helpen Google de site structuur begrijpen.

**Toevoegen aan BlogDetailPage.tsx:**

```typescript
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://gifteez.nl/',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Blog',
      item: 'https://gifteez.nl/blog',
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: post.title,
      item: `https://gifteez.nl/blog/${post.slug}`,
    },
  ],
}
```

---

### 3. 🟡 Product Schema voor Gift Cards

Voor betere visibility in Google Shopping.

**Toevoegen aan GiftResultCard.tsx:**

```typescript
const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: gift.productName,
  description: gift.description,
  image: gift.imageUrl,
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'EUR',
    lowPrice: extractPrice(gift.priceRange).min,
    highPrice: extractPrice(gift.priceRange).max,
    availability: 'https://schema.org/InStock',
  },
}
```

---

### 4. � Sitemap Verbetering: Dynamische Blog Posts uit Firestore

`scripts/generate-sitemap.mjs` en `scripts/generate-rss-feed.mjs` lezen nu:

1. Handmatige routes (home, cadeaugidsen, deals, etc.)
2. Programmatic gidsen uit `data/programmatic`
3. Blogposts uit `data/blogData.ts`
4. **Optioneel:** live blogposts uit Firestore, mits een service-account beschikbaar is

**Gebruik:**

```bash
# Optie 1: Plaats service account in de root
gifteez-7533b-firebase-adminsdk.json

# Optie 2: Zet env vars (handig voor CI)
export FIREBASE_SERVICE_ACCOUNT=/pad/naar/service-account.json
# of inline JSON
export FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account", ...}'

# Scripts (ook onderdeel van npm run prebuild)
node scripts/generate-sitemap.mjs
node scripts/generate-rss-feed.mjs
```

Wanneer de credentials ontbreken, slaan beide scripts de Firestore-stap automatisch over en gebruiken ze alleen de statische data.

---

### 5. 🟡 Missing: Meta Keywords

Niet essentieel, maar kan niet schaden.

**Toevoegen aan Meta.tsx:**

```typescript
interface MetaProps {
  // ... existing props
  keywords?: string[]
}

// In useEffect:
if (keywords && keywords.length > 0) {
  const keywordsTag = ensureTag('meta[name="keywords"]', () => {
    const m = document.createElement('meta')
    m.setAttribute('name', 'keywords')
    return m
  })
  keywordsTag.setAttribute('content', keywords.join(', '))
}
```

---

### 6. 🟡 Alt Tags voor Images

Check of alle images alt attributes hebben.

**Code review nodig voor:**

- `ImageWithFallback.tsx`
- `GiftResultCard.tsx`
- Blog images

---

### 7. 🟡 Internal Linking

Meer interne links tussen blog posts voor betere SEO.

**Toevoegen:**

- "Gerelateerde artikelen" sectie (✅ al aanwezig!)
- Contextual links binnen blog content
- Category/tag based linking

---

### 8. 🟢 Performance: Core Web Vitals

**Check via:**

- [PageSpeed Insights](https://pagespeed.web.dev/)
- [GTmetrix](https://gtmetrix.com/)

**Waarschijnlijk al goed door:**

- Vite bundling
- Image optimization
- Code splitting
- Font preloading

---

### 9. 🟢 Social Media Integration

**Toevoegen:**

- Instagram profile link in footer
- Pinterest Rich Pins (al Pinterest tracking ✅)
- Social share buttons (al aanwezig in blog ✅)

---

### 10. 🟡 Blog Post Schema Verbetering

**Uitbreiden met:**

```json
{
  "@type": "BlogPosting",
  "author": {
    "@type": "Person",
    "name": "Gifteez Redactie"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Gifteez",
    "logo": {
      "@type": "ImageObject",
      "url": "https://gifteez.nl/android-chrome-512x512.png"
    }
  },
  "dateModified": "2025-10-14",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://gifteez.nl/blog/slug"
  }
}
```

---

## 🎯 PRIORITEIT ACTIES

### Direct (Vandaag):

1. ✅ Google Search Console verificatie
2. ✅ Sitemap indienen bij Google
3. ✅ Check Google Analytics verbinding

### Deze Week:

4. Breadcrumb schema toevoegen
5. Product schema voor gifts
6. Alt tags audit
7. PageSpeed test

### Deze Maand:

8. Dynamic sitemap voor Firestore posts
9. Internal linking strategie
10. Extended blog post schema

---

## 📋 CHECKLIST

```
[ ] Google Search Console geverifieerd
[ ] Sitemap ingediend bij Google
[ ] Breadcrumb schema geïmplementeerd
[ ] Product schema toegevoegd
[ ] Alt tags gecontroleerd
[ ] PageSpeed Insights check (>90 score)
[ ] Alle meta descriptions uniek en <160 chars
[ ] H1 tags uniek per pagina
[ ] Internal linking audit
[ ] Mobile usability test in Search Console
```

---

## 🔧 QUICK WINS

### Google Search Console Meta Tag

Voeg dit toe aan `index.html` na verificatie:

```html
<meta name="google-site-verification" content="JOUW_CODE_HIER" />
```

### Verbeter OG Image

Huidige: `/og-image-20250901.png`

- Check of deze bestaat en 1200x630px is
- Maak versies per pagina type (home, blog, gift finder)

### Language Declaration

✅ Al goed: `<html lang="nl">`

### Viewport Meta

✅ Al goed: `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`

---

## 📊 Monitoring Tools

Gebruik deze tools regelmatig:

- [Google Search Console](https://search.google.com/search-console)
- [Google Analytics](https://analytics.google.com/)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Ahrefs Webmaster Tools](https://ahrefs.com/webmaster-tools) (gratis)
- [Ubersuggest](https://neilpatel.com/ubersuggest/) (keyword research)

---

**Huidige SEO Score: 7.5/10** 🎯

Met bovenstaande verbeteringen: **9/10** 🚀
