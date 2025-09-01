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

3) Run dev
   - npm run dev

4) Build production
   - npm run build
   - npm run preview (optional)
   - Public files (robots.txt, sitemap.xml) staan in /public en worden automatisch meegenomen

## Notes
- Tailwind is compiled locally via PostCSS. Styles live in index.css.
- Vite env variables must be prefixed with VITE_.
- Firebase is initialized in services/firebase.ts (only if env vars are set).
