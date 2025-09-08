# Firebase Functions API (Amazon PA-API)

Endpoints (served via the `api` HTTPS function):
- GET /api/health
- GET /api/amazon-search?q=<keywords>&page=1&minPrice=10&maxPrice=100&sort=price&prime=true
- GET /api/amazon-item/:asin

Configuration (environment variables in Functions / dotenv):
- PAAPI_ACCESS_KEY
- PAAPI_SECRET_KEY
- PAAPI_PARTNER_TAG (Associate tag)
- PAAPI_HOST (default: webservices.amazon.nl)
- PAAPI_REGION (default: eu-west-1)

Deploy notes:
1. Set config in your environment.
	- Kortetermijn: via Firebase Console > Build > Functions > Variables (of CLI: `firebase functions:config:set` maar let op de deprecatie).
	- Langetermijn (aanbevolen, vóór maart 2026): gebruik `.env` + `.env.<project>` bestanden met de nieuwe dotenv tooling (zie migratiegids) en commit alleen `.env.example`.
2. Deploy functions: `firebase deploy --only functions`.
3. Hosting rewrites route `/api/**` to this function.

Migration away from functions.config():
Current code gebruikt geen `functions.config()`, dus je bent al bijna klaar. Voeg straks een `functions/.env` toe met:
```
PAAPI_ACCESS_KEY=...
PAAPI_SECRET_KEY=...
PAAPI_PARTNER_TAG=...
PAAPI_HOST=webservices.amazon.nl
PAAPI_REGION=eu-west-1
```
En draai lokaal met `npx firebase functions:config:get` alleen als je legacy wilt exporteren. Daarna: `firebase deploy` pakt de nieuwe var-injectie automatisch op zodra je overstapt naar de nieuwe syntax (CLI v13+ zodra beschikbaar). Tot die tijd kun je secrets ook zetten via Cloud Console Secret Manager en lezen met process.env als je ze als environment vars definieert in de functieconfig.

Local dev:
- Ensure Node 20+
- `npm i`
- `npm run build`
- Use the Firebase emulators if desired; set env with `export` before starting.

Caching:
- Simple in-memory 1h TTL in index.ts. For production, consider Firestore caching.
