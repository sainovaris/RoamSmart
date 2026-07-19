# Deploy the full beta (Render + Atlas)

Branch already pushed: `beta/full-app`  
Repo: https://github.com/sainovaris/RoamSmart

Existing service detected: `https://bindaas-backend.onrender.com` (health OK).  
It is currently missing a working MongoDB URI and returns **0 Google places** (Places API key missing/invalid or denied). YouTube appears configured.

## A. MongoDB Atlas (5–10 min)
1. https://cloud.mongodb.com → Build a Database → **M0 Free**
2. Create database user (save username/password)
3. Network Access → **Add IP Address** → Allow Access from Anywhere (`0.0.0.0/0`)
4. Database → Connect → Drivers → copy connection string  
   Example: `mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/roamsmart?retryWrites=true&w=majority`

## B. Google Cloud keys
Enable: Places API, Directions API, Geocoding API, Maps SDK for Android, YouTube Data API v3.

Create:
1. **Server key** → paste into Render as `GOOGLE_PLACES_API_KEY` (and reuse for Directions)
2. **Android Maps key** → put in local `mobile/.env` as `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` (package `com.anonymous.mobile`)
3. Confirm/create **YouTube** key → Render `YOUTUBE_API_KEY`
4. **OpenAI** key → Render `OPENAI_API_KEY` (rotate any previously exposed keys)

## C. Update Render service
1. Open https://dashboard.render.com → service `bindaas-backend` (or create new from Blueprint `render.yaml`)
2. Settings → **Branch** = `beta/full-app`
3. Root Directory = `backend`
4. Build Command = `npm install`
5. Start Command = `npm start`
6. Health Check Path = `/api/health`
7. Environment → set/update:
   - `NODE_ENV=production`
   - `MONGO_URI=...`
   - `GOOGLE_PLACES_API_KEY=...`
   - `OPENAI_API_KEY=...`
   - `YOUTUBE_API_KEY=...`
8. Manual Deploy → **Deploy latest commit**

## D. Verify
```bash
curl https://YOUR-SERVICE.onrender.com/api/health
curl https://YOUR-SERVICE.onrender.com/api/ready
cd backend && BASE_URL=https://YOUR-SERVICE.onrender.com npm run smoke
```

Expect google-nearby `count` > 0 near Rajkot/your location.

## E. Point the mobile app
Create `mobile/.env` (gitignored):
```
EXPO_PUBLIC_BACK=https://YOUR-SERVICE.onrender.com/
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_android_maps_key
```

Then restart Expo:
```bash
cd mobile && npx expo start --tunnel --clear
```

## F. Expo account (for Android APK)
```bash
cd mobile
npx eas-cli login
npx eas-cli whoami
```
Then tell the engineer — APK build can start immediately after.
