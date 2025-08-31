<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/12yHmfFpzOGsAVUJYXEU3QM3vf47lFVx4

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `VITE_GEMINI_API_KEY` in `.env.local` to your Gemini API key (preferred)
   - Alternatively for quick demos, you can paste your key on the GiftFinder page; it will be stored in `localStorage` (not recommended for production).
3. Run the app:
    - Default: `npm run dev`
    - Alternate port (handy if another app uses 5173): `npm run dev:5174`

### Troubleshooting Dev
- Seeing another app (e.g., “Buurtapp”) when starting dev? Likely a port conflict or wrong directory.
   - Ensure you are in this folder: `Gifteez/`
   - Stop other dev servers using port 5173, or use `npm run dev:5174` and open the printed URL.

### Vercel Deploy
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Env vars: set `VITE_GEMINI_API_KEY` in Vercel Project Settings → Environment Variables.
- Optional local dev via Vercel:
   - Re-link project: `npx vercel link`
   - Start: `npx vercel dev`

## Serverless API (Vercel)

This project includes a secure serverless endpoint at `api/gifts.ts` that calls Gemini on the server. Benefits: your `GEMINI_API_KEY` never reaches the browser.

How it works:
- Client first tries `POST /api/gifts` (production path). If available, it uses that and no client key is required.
- If the endpoint isn’t available (local plain Vite), it falls back to client-side Gemini using `VITE_GEMINI_API_KEY`.

Environment variables:
- Server (Vercel Functions): `GEMINI_API_KEY` (secret, not exposed)
- Client (Vite, optional fallback): `VITE_GEMINI_API_KEY`

Setup on Vercel:
1) Add `GEMINI_API_KEY` in Project Settings → Environment Variables (Production/Preview).
2) Build Command: `npm run build`, Output: `dist`.
3) Deploy. The function will be available at `/api/gifts`.

Local development options:
- Quick: use `VITE_GEMINI_API_KEY` in `.env.local` and run `npm run dev` (client-only fallback).
- Serverless locally: `npx vercel link` then `npx vercel dev` (reads `GEMINI_API_KEY` from your shell or a `.env` used by Vercel CLI). Client will hit `/api/gifts`.

Security note:
- Prefer the serverless path in production. Avoid shipping `VITE_GEMINI_API_KEY` in production builds.
