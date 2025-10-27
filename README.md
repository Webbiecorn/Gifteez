## Deploy
- Development: `npm run dev`
- Build: `npm run build`
- Deploy (Firebase Hosting): `npm run deploy`

### Build lifecycle scripts
De build pipeline voert automatisch de volgende stappen uit:

1. `prebuild` (dry-run image variants + meta assets)
   - `generate-sitemap.mjs`
   - `generate-favicons.mjs`
   - `generate-pinned-tab.mjs`
   - `generate-responsive-images.mjs --dry-run` (alleen logging, geen schrijven)
2. `predeploy`
   - `generate-responsive-images.mjs` (echte generatie WebP / AVIF indien nog niet aanwezig)
3. `deploy`
   - `check:images` integriteitscontrole
   - `build`
   - `firebase deploy --only hosting`

Voordeel: idempotente image variant generatie + snelle feedback zonder per ongeluk large batch writes tijdens lokaal itereren.

## Environment
Zet sleutels in `.env` met VITE_ prefix (zie `.env.example`).

## PartyPro Feed Automation
- Dagelijkse sync draait via `.github/workflows/partypro-feed-refresh.yml` (05:00 UTC) en gebruikt `scripts/run-partypro-feed-job.mjs`.
- Vereiste GitHub Secrets: `FIREBASE_SERVICE_ACCOUNT_JSON` (volledige service-account JSON) en `PARTYPRO_FEED_WEBHOOK` (Slack webhook).
- Handmatig draaien: `AUTO_CONFIRM=1 node scripts/run-partypro-feed-job.mjs`. Voeg `SKIP_FIREBASE=1` toe voor een dry-run zonder Firestore writes.
- Het script meldt status + productaantal in Slack; wanneer geen webhook is ingesteld wordt alleen naar stdout gelogd.

## SEO
- Canonical, robots.txt, sitemap.xml (auto via prebuild script)
- OG/Twitter tags met social image (`public/og-image-*.png`)
- Structured data (Organization + Website) in `index.html`

## PWA & Icons
- Favicons en Apple touch icons worden automatisch gegenereerd uit `assets/favicon-source.png`
- Maskable icons (192/512) in `manifest.webmanifest`
- Safari pinned tab: `public/safari-pinned-tab.svg` (auto gegenereerd)

## Afbeeldingen
Statische hero / trending afbeeldingen staan in `public/images/`. Vervang de placeholder bestanden (`trending-*.jpg`) met geoptimaliseerde JPEG/WebP (aan te raden ~60-80 kwaliteit, 400x300 voor kaarten) en commit.

Optimalisatie tip:
- Gebruik bijv. Squoosh of `sharp` script voor batch compressie.
- Overweeg WebP/AVIF varianten en `<picture>` voor verdere besparing.

### Automatische variant generatie
Tijdens build / pre-deploy kan het script `scripts/generate-responsive-images.mjs` gedraaid worden om voor bepaalde whitelisted bestanden (`trending-*`, `collection-*`, `planner*`, `about-*`, `og-tech-gifts*`, `quiz-illustration*`) WebP en AVIF varianten te genereren.

Gedrag:
- Slaat bronnen over die geen `.png`, `.jpg`, `.jpeg` extensie hebben.
- Slaat conversie over als zowel `.webp` als `.avif` al bestaan (idempotent).
- Resized naar max breedte 800px (geen upscaling) en quality: WebP 82 / AVIF 50.
- Logt gestructureerd (JSON) met status per bestand + eind rapport.
- `--dry-run` vlag toont wat er zou gebeuren zonder te schrijven.
- Bij conversiefout wordt een `.failed` kopie aangemaakt voor diagnose.

Voorbeeld gebruik:
```
node scripts/generate-responsive-images.mjs --dry-run
node scripts/generate-responsive-images.mjs
```

Integratietip: voeg aan `prebuild` of `predeploy` script toe in `package.json` voor automatische uitvoering.

## Routing
- Simpele client-side routing via `App.tsx` met pushState; deep links op Firebase Hosting werken dankzij SPA rewrite.
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Gifteez.nl — React + Vite + Tailwind (+ Firebase ready)

Production-ready scaffold with Vite, TypeScript, Tailwind CSS, and placeholders for Firebase.

## Requirements
- Node.js 18+

## Setup
1) Install deps
   - npm install

2) Configure env vars
   - Copy .env.example to .env
   - Fill in VITE_GEMINI_API_KEY and optional Firebase VITE_FIREBASE_*

3) Firebase (optioneel, voor echte accounts/favorieten)
    - Maak een project in Firebase Console en voeg een Web App toe (</> icoon)
    - Noteer config en vul in .env:
       - VITE_FIREBASE_API_KEY
       - VITE_FIREBASE_AUTH_DOMAIN
       - VITE_FIREBASE_PROJECT_ID
       - VITE_FIREBASE_STORAGE_BUCKET
       - VITE_FIREBASE_MESSAGING_SENDER_ID
       - VITE_FIREBASE_APP_ID
    - Authentication > Sign-in method: Email/Password aanzetten
    - Firestore Database aanmaken (Production mode) en Rules instellen zoals in firestore.rules

### Amazon API (server)

We added a Firebase Functions API that proxies Amazon Product Advertising API (PA-API) calls. Configure secrets in the Functions environment (see `functions/README.md`). Hosting rewrites map `/api/**` to the `api` function.

3) Run dev
   - npm run dev

4) Build production
   - npm run build
   - npm run preview (optional)
- Tailwind is compiled locally via PostCSS. Styles live in index.css.
- Vite env variables must be prefixed with VITE_.
- Firebase is initialized in services/firebase.ts (only if env vars are set).
