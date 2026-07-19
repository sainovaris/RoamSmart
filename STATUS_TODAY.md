# RoamSmart full functional beta — status

**Date:** 19 Jul 2026  
**Branch:** `beta/full-app` (pushed to GitHub)  
**Existing backend:** https://bindaas-backend.onrender.com

## What’s done in code
- Backend hardened: env validation, Mongo-before-listen, `/api/health` + `/api/ready`, fixed route order, smoke tests, `render.yaml`
- Google nearby now uses mobile `category`, surfaces Places API denials, Mongo cache is best-effort
- Mobile: restored **Explore Nearby Places**, robust API client, location/error UX, Expo patch versions aligned, Maps key removed from committed `app.json`
- Homestays browse/detail still works offline
- Setup docs: `SETUP_SECRETS.md`, `DEPLOY.md`

## Blocker (needs you — ~15–30 min)
Render currently returns **0 Google places** and Mongo queries time out. Update the Render service env and redeploy from `beta/full-app`:

| Variable | Status on live service |
|----------|-------------------------|
| Health | OK |
| YouTube | Working |
| `MONGO_URI` | Broken / timing out |
| `GOOGLE_PLACES_API_KEY` | Missing or denied (0 results) |
| `OPENAI_API_KEY` | Unknown until places return |
| Branch / latest code | Must point to `beta/full-app` and redeploy |

Follow **`DEPLOY.md`** exactly.

## iPhone beta (Expo Go) — available now
Tunnel:
```
exp://5ejns5g-anonymous-8081.exp.direct
```
1. Install Expo Go  
2. Open the link  
3. Homestays works fully  
4. Nearby Places needs the Render keys above

## Android APK — next after Expo login
```bash
cd mobile
npx eas-cli login
```
Then we run:
```bash
npx eas-cli build -p android --profile preview
```

## Beta limitations
- Homestay booking is preview-only (no real reservation/payment/auth)
- iPhone standalone/TestFlight needs paid Apple Developer account
- Render free tier cold-starts (~30s first request)
