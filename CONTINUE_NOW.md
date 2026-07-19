# Do this now (order matters) — ~25 minutes

You are blocked only on accounts/keys. Code is ready on `beta/full-app`.

## 1. MongoDB Atlas (free) — 5 min
1. Open https://cloud.mongodb.com → Sign up / Log in
2. Create **M0 Free** cluster
3. Database Access → Add user (username + password) — save them
4. Network Access → Add IP → **Allow Access from Anywhere** `0.0.0.0/0`
5. Database → Connect → Drivers → copy URI  
   Replace `<password>` with your password. DB name tip: use `/roamsmart`

Paste that URI into Render as `MONGO_URI` (step 3).

## 2. Google Cloud keys — 10 min
1. https://console.cloud.google.com → new or existing project
2. Enable APIs: **Places API**, **Directions API**, **Geocoding API**, **Maps SDK for Android**, **YouTube Data API v3**
3. Credentials → Create API key:
   - **Server key** → for Render (`GOOGLE_PLACES_API_KEY` + Directions)
   - **Android / unrestricted Maps key** → for mobile (`EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`)
4. YouTube: use same or separate key → Render `YOUTUBE_API_KEY`

## 3. Render — update existing service — 5 min
Open https://dashboard.render.com → `bindaas-backend` (or create from repo)

Settings:
- Branch: **`beta/full-app`**
- Root Directory: **`backend`**
- Build: `npm install`
- Start: `npm start`
- Health Check: `/api/health`

Environment variables (paste values, do not send them in chat):
```
NODE_ENV=production
MONGO_URI=mongodb+srv://...
GOOGLE_PLACES_API_KEY=...
OPENAI_API_KEY=...   (you already have one locally; rotate if it was ever exposed)
YOUTUBE_API_KEY=...
```

Then **Manual Deploy** → Deploy latest commit.

## 4. Local mobile env — 1 min
Edit `RoamSmart/mobile/.env` (already exists):
```
EXPO_PUBLIC_BACK=https://bindaas-backend.onrender.com/
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key_here
```

## 5. Expo login (for Android APK) — 2 min
```bash
cd ~/Desktop/workspace/RoamSmart/mobile
npx eas-cli login
npx eas-cli whoami
```

## When done, reply with exactly:
`keys ready`  
or  
`Render redeployed`  
or  
`eas logged in`

I will then smoke-test the backend, reconnect Expo Go, finish E2E, and start the APK build. Do **not** paste secret values into chat.
