# Firebase Functions API (Amazon PA-API)

Endpoints (served via the `api` HTTPS function):
- GET /api/health
- GET /api/amazon-search?q=<keywords>&page=1&minPrice=10&maxPrice=100&sort=price&prime=true
- GET /api/amazon-item/:asin

Configuration (environment variables in Functions):
- PAAPI_ACCESS_KEY
- PAAPI_SECRET_KEY
- PAAPI_PARTNER_TAG (Associate tag)
- PAAPI_HOST (default: webservices.amazon.nl)
- PAAPI_REGION (default: eu-west-1)

Deploy notes:
1. Set config in your environment (Firebase console or CLI).
2. Deploy functions: `firebase deploy --only functions`.
3. Hosting rewrites route `/api/**` to this function.

Local dev:
- Ensure Node 20+
- `npm i`
- `npm run build`
- Use the Firebase emulators if desired; set env with `export` before starting.

Caching:
- Simple in-memory 1h TTL in index.ts. For production, consider Firestore caching.
