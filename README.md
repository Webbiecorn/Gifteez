## Deploy
- Development: `npm run dev`
- Build: `npm run build`
- Deploy (Firebase Hosting): `npm run deploy`

## Environment
Zet sleutels in `.env` met VITE_ prefix (zie `.env.example`).

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
