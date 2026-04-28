const Place = require("../models/Place");
const classifyPlace = require("../utils/classifyPlace");
const rankingService = require("../services/rankingService");
const { generatePlaceDetails } = require("../services/openaiService");
const { generateItinerarySummary } = require("../services/itineraryAI");
const { fetchVideos } = require("../services/youtubeService");
const { rankVideos } = require("../services/videoRankingService");
const googleService = require("../services/googlePlacesService");
const { getLocationInfo } = require("../utils/getLocationInfo");

// ================= PARSE AI DURATION =================
function parseDuration(durationStr) {
  if (!durationStr) return 90;
  const str = durationStr.toLowerCase();
  const rangeMatch = str.match(/(\d+)-(\d+)/);
  if (rangeMatch) {
    return ((parseInt(rangeMatch[1]) + parseInt(rangeMatch[2])) / 2) * 60;
  }
  const hourMatch = str.match(/(\d+)/);
  if (hourMatch) {
    return parseInt(hourMatch[1]) * 60;
  }
  return 90;
}

// ================= NORMALIZE DB PLACE =================
function normalizeDBPlace(p) {
  const { category, subcategory } = classifyPlace(p.types || []);

  let lat = null;
  let lng = null;

  if (p?.location?.coordinates) {
    lng = p.location.coordinates[0];
    lat = p.location.coordinates[1];
  }

  return {
    place_id: p.place_id,
    name: p.name,
    category,
    subcategory,
    types: p.types,

    // ✅ ALWAYS normalized
    location: { lat, lng },

    address: p.address,
    is_open: p.is_open,
    rating: p.rating,
    total_ratings: p.total_ratings,
    ai_details: p.ai_details || null,
    source: "db",
  };
}

// ================= ENSURE AI DETAILS =================
async function ensureAIDetails(place) {
  if (place.ai_details) return place;
  try {
    const ai = await generatePlaceDetails({
      name: place.name,
      category: place.category,
      subcategory: place.subcategory,
    });
    return { ...place, ai_details: ai };
  } catch {
    return place;
  }
}

// ================= REORDER BY PROXIMITY =================
// Nearest-neighbour sort so the route makes geographic sense
function reorderByProximity(places) {
  if (places.length <= 1) return places;

  const result = [];
  const remaining = [...places];

  // Start from the first place (could be randomised or user-defined later)
  result.push(remaining.splice(0, 1)[0]);

  while (remaining.length > 0) {
    const last = result[result.length - 1];
    let nearestIdx = 0;
    let nearestDist = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const p = remaining[i];
      const dist = Math.sqrt(
        Math.pow(p.location.lat - last.location.lat, 2) +
        Math.pow(p.location.lng - last.location.lng, 2),
      );
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }

    result.push(remaining.splice(nearestIdx, 1)[0]);
  }

  return result;
}

// =================================================================
// GET /api/plan/nearby-places
// Returns nearby places for the user to browse and select from
// Query params: lat, lng, categories (optional), radius (optional)
// =================================================================
exports.getNearbyForSelection = async (req, res) => {
  try {
    const { lat, lng, categories, radius = 10000 } = req.query;

    if (!lat || !lng) {
      return res
        .status(400)
        .json({ success: false, message: "Missing coordinates" });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const normalizedCategories = categories
      ? categories.split(",").map((c) => c.toLowerCase().trim())
      : [];

    console.log("\n===== NEARBY FOR SELECTION =====");
    console.log("📥 Query:", {
      latitude,
      longitude,
      normalizedCategories,
      radius,
    });

    // ===== STEP 1: Fetch from DB =====
    let dbPlaces = [];
    try {
      const dbRaw = await Place.find({
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [longitude, latitude] },
            $maxDistance: parseInt(radius),
          },
        },
      }).limit(50);

      dbPlaces = dbRaw.map(normalizeDBPlace);
      console.log("🗄️  DB places:", dbPlaces.length);

      // Apply category filter if provided
      if (normalizedCategories.length > 0) {
        dbPlaces = dbPlaces.filter((p) =>
          normalizedCategories.includes(p.category.toLowerCase()),
        );
        console.log("🔽 After category filter:", dbPlaces.length);
      }
    } catch (dbErr) {
      console.warn("⚠️  DB unavailable:", dbErr.message);
    }

    // ===== STEP 2: Google fallback if DB sparse =====
    let googlePlaces = [];
    const needsGoogle =
      normalizedCategories.length === 0
        ? dbPlaces.length < 10
        : normalizedCategories.some(
          (cat) =>
            dbPlaces.filter((p) => p.category.toLowerCase() === cat).length <
            3,
        );

    if (needsGoogle) {
      try {
        const rawGoogle = await googleService.fetchNearbyFromGoogle(
          latitude,
          longitude,
          normalizedCategories.length > 0 ? normalizedCategories : undefined,
        );

        const existingIds = new Set(dbPlaces.map((p) => p.place_id));

        for (const place of rawGoogle) {
          if (existingIds.has(place.place_id)) continue;
          const { category, subcategory } = classifyPlace(place.types || []);
          if (
            normalizedCategories.length > 0 &&
            !normalizedCategories.includes(category.toLowerCase())
          )
            continue;

          googlePlaces.push({
            place_id: place.place_id,
            name: place.name,
            category,
            subcategory,
            types: place.types,
            location: { lat: place.location?.lat, lng: place.location?.lng },
            address: place.address || "",
            is_open: typeof place.is_open === "boolean" ? place.is_open : true,
            rating: place.rating || 0,
            total_ratings: place.user_ratings_total || 1,
            photo: place.photo || null,
            ai_details: null,
            source: "google",
          });

          existingIds.add(place.place_id);
        }

        console.log("🌐 Google places added:", googlePlaces.length);

        // Save Google places to DB for future use
        if (googlePlaces.length > 0) {
          await Promise.all(
            googlePlaces.map((place) =>
              Place.updateOne(
                { place_id: place.place_id },
                {
                  $set: {
                    ...place,
                    location: {
                      type: "Point",
                      coordinates: [place.location.lng, place.location.lat],
                    },
                  },
                },
                { upsert: true },
              ),
            ),
          );
        }
      } catch (googleErr) {
        console.error("❌ Google API failed:", googleErr.message);
      }
    }

    // ===== STEP 3: Merge + filter open + rank =====
    const allPlaces = [...dbPlaces, ...googlePlaces];
    const openPlaces = allPlaces.filter((p) => p.is_open !== false);
    const ranked = rankingService.rankPlaces(
      openPlaces.length > 0 ? openPlaces : allPlaces,
    );

    console.log("✅ Returning", ranked.length, "places for selection");

    return res.status(200).json({
      success: true,
      total: ranked.length,
      message:
        "Select the places you want to visit and send their place_ids to /api/plan/custom",
      places: ranked.map((p) => ({
        place_id: p.place_id,
        name: p.name,
        category: p.category,
        subcategory: p.subcategory,
        address: p.address,
        rating: p.rating,
        total_ratings: p.total_ratings,
        is_open: p.is_open,
        photo: p.photo || null,
        relevance_score: p.relevance_score,
      })),
    });
  } catch (error) {
    console.error("❌ getNearbyForSelection Error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch nearby places",
        error: error.message,
      });
  }
};

// =================================================================
// POST /api/plan/custom
// Generates itinerary for ONLY the places the user selected
// Body: { place_ids: [...], totalTimeHours: 4, startTime: "09:00" }
// =================================================================
exports.generateCustomItinerary = async (req, res) => {
  const { lat, lng } = req.body;
  
  try {
    const {
      place_ids = [],
      totalTimeHours = 4,
      startTime = null, // optional e.g. "09:00"
    } = req.body;

    console.log("\n===== CUSTOM ITINERARY DEBUG =====");
    console.log("📥 REQUEST:", { place_ids, totalTimeHours, startTime });

    // ===== VALIDATE =====
    if (!place_ids || place_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one place_id in place_ids[]",
      });
    }

    if (place_ids.length > 15) {
      return res.status(400).json({
        success: false,
        message: "Maximum 15 places allowed per custom itinerary",
      });
    }

    let remainingTime = totalTimeHours * 60;

    // ===== STEP 1: Fetch all selected places from DB =====
    let selectedPlaces = [];
    try {
      const dbResults = await Place.find({ place_id: { $in: place_ids } });
      selectedPlaces = dbResults.map(normalizeDBPlace);
      console.log(
        "📌 Found in DB:",
        selectedPlaces.length,
        "of",
        place_ids.length,
        "requested",
      );
    } catch (dbErr) {
      console.warn("⚠️  DB unavailable:", dbErr.message);
    }

    // ===== STEP 2: Check if any place_ids weren't found in DB =====
    const foundIds = new Set(selectedPlaces.map((p) => p.place_id));
    const missingIds = place_ids.filter((id) => !foundIds.has(id));

    if (missingIds.length > 0) {
      console.warn("⚠️  These place_ids not found in DB:", missingIds);
      // Not a hard error — we just skip missing ones
    }

    if (selectedPlaces.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "None of the provided place_ids were found. Please call /api/plan/nearby-places first to get valid place_ids.",
      });
    }

    // ===== STEP 3: Preserve user's selection order but optimise route =====
    // Reorder by proximity (nearest-neighbour) so travel makes sense
    const orderedPlaces = reorderByProximity(selectedPlaces);
    console.log(
      "🗺️  Route order:",
      orderedPlaces.map((p) => p.name),
    );

    // ===== STEP 4: Ensure AI details for all selected places =====
    const placesWithAI = await Promise.all(orderedPlaces.map(ensureAIDetails));
    console.log(
      "🤖 Places with AI:",
      placesWithAI.filter((p) => p.ai_details).length,
    );

    // ===== STEP 5: Build itinerary =====
    // Parse startTime if provided e.g. "09:00"
    let currentTime = new Date();
    if (startTime) {
      const [hours, minutes] = startTime.split(":").map(Number);
      currentTime.setHours(hours, minutes, 0, 0);
    }

    const itinerary = [];

    for (const place of placesWithAI) {
      let duration = parseDuration(place.ai_details?.recommended_duration);

      // If this single place exceeds remaining time, trim it to fit
      if (remainingTime <= 0) break;

      if (remainingTime < duration) {
        duration = remainingTime; // trim last place to fill exactly
      }

      const start = new Date(currentTime);
      const end = new Date(currentTime.getTime() + duration * 60000);
      currentTime = new Date(end.getTime() + 20 * 60000); // 20 min travel buffer
      remainingTime -= duration;

      // Fetch You Tube Videos
      let videos = [];

      try {
        const { city, country } = await getLocationInfo( lat, lng );

        console.log("📍 User Location:", city, country);

        const rawVideos = await fetchVideos(place.name, city, country);

        videos = rankVideos(rawVideos, place.name);
      } 
      catch (err) {
        console.log("❌ Video fetch error:", err.message);
      }

      if (
        place?.location?.lat == null ||
        place?.location?.lng == null
      ) {
        console.log("❌ Skipping place (no coords):", place.name);
        continue;
      }

      console.log("📍 Place coords:", {
        name: place.name,
        lat: place.location?.lat,
        lng: place.location?.lng,
      });

      itinerary.push({
        step: itinerary.length + 1,
        place_id: place.place_id,
        name: place.name,
        category: place.category,
        subcategory: place.subcategory,

        // ✅ FIXED
        latitude: place.location.lat,
        longitude: place.location.lng,

        address: place.address,
        location: place.location,
        duration_minutes: duration,
        visit_start: start,
        visit_end: end,
        ai_details: place.ai_details,
        videos,
      });

    }

    console.log("📦 FINAL RESPONSE SAMPLE:", itinerary[0]);
    console.log("📋 Final custom itinerary:", itinerary.length, "places");

    // ===== STEP 6: Generate summary =====
    let summary = "";
    if (itinerary.length > 0) {
      summary = await generateItinerarySummary(itinerary);
    }

    return res.status(200).json({
      success: true,
      summary,
      total_places: itinerary.length,
      totalTimeHours,
      remainingTimeHours: (remainingTime / 60).toFixed(2),
      plan: itinerary,
    });
  } catch (error) {
    console.error("❌ Custom Itinerary Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate custom itinerary",
      error: error.message,
    });
  }
};