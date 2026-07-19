# Secrets & accounts checklist (do not commit real keys)

Create accounts and put values only in:
- Render dashboard environment variables
- local ignored files: `backend/.env`, `mobile/.env`
- Expo/EAS secrets for APK builds

Never paste keys into chat or commit them.

## 1. MongoDB Atlas (free)
1. https://www.mongodb.com/cloud/atlas → Create free M0 cluster
2. Database Access → create user + password
3. Network Access → Allow Access from Anywhere `0.0.0.0/0` (Render IPs vary)
4. Connect → Drivers → copy `mongodb+srv://...` URI
5. Set as Render `MONGO_URI` (and local `backend/.env`)

## 2. Render (free)
1. https://dashboard.render.com → New Web Service
2. Connect GitHub repo `sainovaris/RoamSmart`
3. Branch: `beta/full-app`
4. Root Directory: `backend`
5. Build: `npm install`
6. Start: `npm start`
7. Health Check Path: `/api/health`
8. Env vars (dashboard only):
   - `MONGO_URI`
   - `GOOGLE_PLACES_API_KEY`
   - `OPENAI_API_KEY`
   - `YOUTUBE_API_KEY`
   - `NODE_ENV=production`

## 3. Google Cloud
Enable APIs:
- Places API
- Directions API
- Geocoding API
- Maps SDK for Android

Create two keys if possible:
- **Server key** → Places/Directions/Geocoding (restrict by IP later; for beta can be unrestricted briefly)
- **Android Maps key** → Maps SDK for Android, package `com.anonymous.mobile`

Put server key in Render `GOOGLE_PLACES_API_KEY`.
Put Android Maps key in `mobile/.env` as `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` and/or EAS env; do not commit.

## 4. OpenAI
- Create key at https://platform.openai.com/api-keys
- Rotate/revoke any previously exposed keys (including any local `sk-proj-*` files)
- Set Render `OPENAI_API_KEY`

## 5. YouTube Data API v3
- Enable in Google Cloud
- Create key → Render `YOUTUBE_API_KEY`

## 6. Expo (free)
1. https://expo.dev/signup
2. `cd mobile && npx eas-cli login`
3. Tell the engineer when `npx eas-cli whoami` shows your username

## Local files to create (ignored by git)

`backend/.env`:
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://USER:PASS@CLUSTER/roamsmart
GOOGLE_PLACES_API_KEY=...
OPENAI_API_KEY=...
YOUTUBE_API_KEY=...
```

`mobile/.env`:
```
EXPO_PUBLIC_BACK=https://YOUR-RENDER-SERVICE.onrender.com/
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=...
```

Trailing slash on `EXPO_PUBLIC_BACK` is required.
