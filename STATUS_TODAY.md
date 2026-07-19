# RoamSmart same-day recovery — status for Pritish

**Date:** 19 Jul 2026  
**Owner:** Engineering (recovery sprint)  
**Demo path:** Home → Explore Homestays → search/listing → detail → booking preview

## Early update (send before / while demoing)

I reviewed RoamSmart after the three-month pause. The core Expo/Express travel architecture is recoverable, but the current environment and a few stale routes prevent a dependable restart. Today I’m producing a working vertical slice for homestay discovery—entry point, listings, and detail—using deterministic data so the demo is not blocked by old credentials. I’ll send a walkthrough today, followed by a one-week plan for API-backed listings, authentication, and booking.

## Completion update (send with evidence)

Today I restored a demonstrable RoamSmart flow and added the first homestays vertical slice: **home → listings → details**.

**How to run the demo**

```bash
cd mobile
npm start
```

For a browser demo:

```bash
cd mobile
npm run web -- --port 8082
```

Then open the app (browser, Expo Go, or simulator) and:

1. Landing screen (**Bindaas**)
2. Tap **Explore Homestays**
3. Search “Goa” or select a city chip
4. Browse 6 curated stays (price, capacity, amenities, ratings)
5. Open any card for full detail
6. Tap **Check availability** to show the booking-preview modal (explicitly does **not** create a booking)

I deliberately kept booking out of this first slice because the project currently has no production-grade identity or availability locking; presenting that as complete would be unsafe.

**Next milestone (1 week)**

- Dedicated `Homestay` Mongo model + `GET /api/homestays` (not reusing Google `Place`)
- Search by location / guests / price / amenities
- Backend contract tests
- Auth provider decision, then authenticated booking with double-booking protection

**Current blockers / needs**

| Item | Status |
|------|--------|
| `MONGO_URI` | Invalid (`memory`) — needs real MongoDB |
| `mobile/.env` | Missing — Expo vars were under `backend/.env` |
| Google Places / YouTube keys | Missing |
| OpenAI / Maps keys in repo | Present — **rotate after demo** |
| Stale `/plan` route | Type error fixed; ZIP geocoding still unavailable |
| Automated tests | None |

## Baseline assessment (19 Jul)

- Node `v25.2.1` available
- Mobile dependencies present; Expo Metro starts on `http://localhost:8081`
- Web demo verified at `http://localhost:8082`
- Full TypeScript check passes
- Lint: 0 errors, 7 pre-existing warnings
- Browser walkthrough verified: landing → listing → search → detail → booking preview → close
- All six homestay photos are bundled locally; the demo does not depend on image-network availability

## Files added for this slice

- `mobile/types/homestay.ts`
- `mobile/data/homestays.ts` (deterministic fixtures)
- `mobile/components/homestays/HomestayCard.tsx`
- `mobile/app/homestays/index.tsx`
- `mobile/app/homestays/[id].tsx`
- `mobile/app/index.tsx` — primary **Explore Homestays** entry
- `mobile/assets/homestays/` — six offline-safe listing images
- Web-safe map adapters so the legacy native map dependency does not block the browser demo
