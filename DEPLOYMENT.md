# Deployment Checklist (Nov 2025)

Deze gids vat de volledige pre-deploy flow samen die we zojuist hebben doorlopen. Volg elk blok van boven naar
beneden zodat de Programmatic/QuickScan updates production-ready blijven en analytics assets up-to-date blijven.

## 1. Pre-deploy verificatie

1. **Lint & types** – `npm run lint` en `npm run typecheck` moeten zonder warnings/errors doorlopen.
2. **Unit/integration tests** – `npm run test:run` (326 Vitest specs) bevestigt functionele stabiliteit.
3. **QuickScan content sanity**
   - `npm run build-programmatic-indices` (alias `npx tsx scripts/build-programmatic-indices.mts`) moet zonder
     fouten draaien; dit importeert `data/programmatic/index.ts`, voert `validateProgrammaticConfigs` uit en bouwt
     alle public JSON-indices.
   - Spot-check `data/programmatic/index.ts` met `grep "action: { type: 'filters'"` en controleer dat elke CTA
     minimaal `fastDeliveryOnly` of `sortOption` invult (de validator dwingt dit inmiddels af).
4. **Programmatic smoke (browser)** – `npm run test:e2e` voor Playwright.
   - Op schone Linux-machines zijn systeemlibs nodig: `sudo apt-get install libevent-2.1-7t64 libavif16` of
     `sudo npx playwright install-deps`.
   - Zodra die libs aanwezig zijn, draaien de 400+ navigatie/giftfinder/deals/blog scenario’s headless en dekken ze
     QuickScan CTA’s impliciet doordat programmatic pagina’s geladen worden.
5. **SEO/analytics assets** – `npm run prebuild` regenereert sitemap, favicons, pinned-tab assets, RSS-feed en
   voert een dry-run responsive images check uit. Zet vooraf `FIREBASE_SERVICE_ACCOUNT_JSON` (of wijs
   `FIREBASE_SERVICE_ACCOUNT` naar `gifteez-7533b-firebase-adminsdk.json`) zodat sitemap én RSS je Firestore blogs
   meenemen. Resultaat check je met `head public/sitemap.xml` of een diff.
6. **Vite build** – `npm run build` bevestigt dat de productie bundel nog steeds compileert nadat stap 1-5 klaar zijn.

## 2. Deploy uitvoeren (Firebase Hosting)

1. Optioneel: `npm run format:check` om laatste docs/code consistent te houden.
2. Draai `npm run deploy` – dit voert `check:images`, `predeploy` (volledige responsive image generation), `build`
   en vervolgens `firebase deploy --only hosting` uit.
3. Controleer na afloop dat `public/sitemap.xml` en `public/rss.xml` inderdaad in de uitgevoerde release zitten.

## 3. Post-deploy monitoring

- **Realtime analytics** – Controleer GA4/GTM events `quickscan_cta_click` en `funnel_step_complete` binnen het
  eerste uur na livegang. Let vooral op nieuwe QuickScan CTA-labels.
- **Affiliate kwaliteitscontrole** – Gebruik `services/analyticsEventService.ts` logging of de admin dashboards
  om te bevestigen dat affiliate clicks nog evenveel conversies genereren.
- **Error tracking** – Houd browser console/Sentry in de gaten voor 404’s op nieuwe RSS/sitemap assets en voor
  eventuele QuickScan persona ID conflicts (de validator zou dit tijdens build al blokkeren).
- **Product feeds** – Indien `build-programmatic-indices` recente data heeft weggeschreven, upload de JSON-bestanden
  naar staging/CDN of cache layer zodat de front-end dezelfde snapshots gebruikt als tijdens de checks.

## 4. Troubleshooting

- **Playwright dependencies ontbreken** – Installeer de packages uit de terminalfout (`libevent-2.1-7t64`,
  `libavif16`) of voer `sudo npx playwright install-deps`. Zonder deze libs kunnen de browsers niet starten en
  eindigen alle e2e-suites met een launch error.
- **QuickScan CTA validation errors** – draai `npm run build-programmatic-indices` om te zien welke slug/persona
  faalt. Fouten verwijzen naar `personaId` + `configSlug`, waardoor copywriters snel de juiste kaart vinden.

Bewaar deze checklist als standaardprocedure voor toekomstige releases; werk hem bij zodra nieuwe quality-gates of
deployment targets bijkomen.
