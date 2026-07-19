#!/usr/bin/env node
/**
 * Minimal smoke tests for a deployed or local RoamSmart backend.
 *
 * Usage:
 *   BASE_URL=http://localhost:5000 node smoke-test.js
 *   BASE_URL=https://your-service.onrender.com node smoke-test.js
 *
 * Optional:
 *   LAT=22.3039 LNG=70.8022
 */

const BASE_URL = (process.env.BASE_URL || "http://localhost:5000").replace(/\/$/, "");
const LAT = process.env.LAT || "22.3039";
const LNG = process.env.LNG || "70.8022";

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const started = Date.now();
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { ok: res.ok, status: res.status, ms: Date.now() - started, body };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function run() {
  const results = [];

  async function step(name, fn) {
    try {
      await fn();
      results.push({ name, ok: true });
      console.log(`✅ ${name}`);
    } catch (err) {
      results.push({ name, ok: false, error: err.message });
      console.error(`❌ ${name}: ${err.message}`);
    }
  }

  await step("GET /api/health", async () => {
    const r = await request("/api/health");
    assert(r.ok, `status ${r.status}`);
    assert(r.body?.status === "OK" || r.body?.success === true, "unexpected body");
  });

  await step("GET /api/ready", async () => {
    const r = await request("/api/ready");
    assert(r.status === 200 || r.status === 503, `unexpected status ${r.status}`);
    if (r.status !== 200) {
      console.warn("   (Mongo not ready — places/AI may still work via Google fallback)");
    }
  });

  let samplePlaceId = null;

  await step("GET /api/google-nearby", async () => {
    const r = await request(
      `/api/google-nearby?lat=${LAT}&lng=${LNG}&category=Food`
    );
    assert(r.ok, `status ${r.status}: ${JSON.stringify(r.body).slice(0, 200)}`);
    const places = r.body?.results || r.body?.data || r.body?.places || [];
    assert(Array.isArray(places), "expected places array");
    if (places[0]?.place_id) samplePlaceId = places[0].place_id;
    console.log(`   ${places.length} places in ${r.ms}ms`);
  });

  await step("GET /api/nearby", async () => {
    const r = await request(`/api/nearby?lat=${LAT}&lng=${LNG}`);
    assert(r.ok, `status ${r.status}: ${JSON.stringify(r.body).slice(0, 200)}`);
  });

  await step("GET /api/ai/:id (optional)", async () => {
    if (!samplePlaceId) {
      console.warn("   skipped — no place_id from nearby");
      return;
    }
    const r = await request(`/api/ai/${encodeURIComponent(samplePlaceId)}`);
    if (!r.ok) {
      console.warn(`   AI not OK (${r.status}) — check OPENAI_API_KEY`);
      return;
    }
    console.log(`   AI ok in ${r.ms}ms`);
  });

  await step("POST /api/plan/custom", async () => {
    const r = await request("/api/plan/custom", {
      method: "POST",
      body: JSON.stringify({
        lat: Number(LAT),
        lng: Number(LNG),
        totalTimeHours: 2,
        place_ids: samplePlaceId ? [samplePlaceId] : [],
      }),
    });
    if (!r.ok) {
      throw new Error(`status ${r.status}: ${JSON.stringify(r.body).slice(0, 200)}`);
    }
    console.log(`   plan ok in ${r.ms}ms`);
  });

  await step("POST /api/route", async () => {
    const r = await request("/api/route", {
      method: "POST",
      body: JSON.stringify({
        origin: { lat: Number(LAT), lng: Number(LNG) },
        destination: {
          lat: Number(LAT) + 0.01,
          lng: Number(LNG) + 0.01,
        },
        waypoints: [],
      }),
    });
    if (!r.ok) {
      console.warn(`   route not OK (${r.status}) — check Directions API on Google key`);
      return;
    }
    console.log(`   route ok in ${r.ms}ms`);
  });

  await step("GET /api/videos", async () => {
    const r = await request("/api/videos?query=Rajkot%20travel");
    if (!r.ok) {
      console.warn(`   videos not OK (${r.status}) — check YOUTUBE_API_KEY`);
      return;
    }
    console.log(`   videos ok in ${r.ms}ms`);
  });

  const failed = results.filter((r) => !r.ok);
  console.log("\n---");
  console.log(`${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) process.exit(1);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
