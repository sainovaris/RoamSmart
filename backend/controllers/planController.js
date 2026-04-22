const rankingService = require("../services/rankingService");
const googleService = require("../services/googlePlacesService");
const classifyPlace = require("../utils/classifyPlace");
const Place = require("../models/Place");
const { fetchVideos } = require("../services/youtubeService");
const { rankVideos } = require("../services/videoRankingService");
const { generateItinerarySummary } = require("../services/itineraryAI");
const { generatePlaceDetails } = require("../services/openaiService");

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

function normalizeDBPlace(p) {
  const { category, subcategory } = classifyPlace(p.types || []);
  return {
    place_id: p.place_id,
    name: p.name,
    category,
    subcategory,
    types: p.types,
    location: {
      lat: p.location.coordinates[1],
      lng: p.location.coordinates[0],
    },
    address: p.address,
    is_open: p.is_open,
    rating: p.rating,
    total_ratings: p.total_ratings,
    ai_details: p.ai_details || null,
    source: "db",
  };
}

exports.generateItinerary = async (req, res) => {
  try {
    const {
      lat,
      lng,
      totalTimeHours = 6,
      categories = [],
      places = [],
    } = req.body;

    console.log("\n==================== ITINERARY DEBUG ====================");
    console.log("📥 REQUEST:", {
      lat,
      lng,
      totalTimeHours,
      categories,
      places,
    });

    if (!lat || !lng) {
      return res
        .status(400)
        .json({ success: false, message: "Missing coordinates" });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    let remainingTime = totalTimeHours * 60;

    // Normalize to lowercase so "Food" and "food" both match
    const normalizedCategories = categories.map((c) => c.toLowerCase());

    // ===== STEP 1: Selected Places from DB =====
    let selectedPlaces = [];
    if (places.length > 0) {
      try {
        const dbSelected = await Place.find({ place_id: { $in: places } });
        selectedPlaces = dbSelected.map(normalizeDBPlace);
        console.log(
          "📌 STEP 1 - Selected places from DB:",
          selectedPlaces.length,
        );
      } catch (dbErr) {
        console.warn(
          "⚠️  STEP 1 - DB unavailable, skipping selected places:",
          dbErr.message,
        );
      }
    }

    // ===== STEP 2: Nearby Places from DB =====
    let dbPlaces = [];
    try {
      const dbRaw = await Place.find({
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [longitude, latitude] },
            $maxDistance: 10000,
          },
        },
        place_id: { $nin: places },
      }).limit(50);

      console.log("🗄️  STEP 2 - Raw DB places:", dbRaw.length);

      if (dbRaw.length > 0) {
        console.log("🔍 Sample DB place:", {
          name: dbRaw[0].name,
          types: dbRaw[0].types,
          is_open: dbRaw[0].is_open,
        });
      } else {
        console.log("⚠️  DB returned 0 places — will use Google fallback.");
      }

      dbPlaces = dbRaw.map(normalizeDBPlace);
      const categoriesInDB = [...new Set(dbPlaces.map((p) => p.category))];
      console.log("🏷️  Categories found in DB:", categoriesInDB);

      if (normalizedCategories.length > 0) {
        const before = dbPlaces.length;
        dbPlaces = dbPlaces.filter((p) =>
          normalizedCategories.includes(p.category.toLowerCase()),
        );
        console.log(
          `🔽 After category filter (${normalizedCategories}): ${before} → ${dbPlaces.length}`,
        );
      }
    } catch (dbErr) {
      console.warn(
        "⚠️  STEP 2 - DB unavailable, skipping DB fetch. Going straight to Google:",
        dbErr.message,
      );
    }

    // ===== STEP 3: Google Fallback =====
    let googlePlaces = [];

    const shouldFallback = () => {
      if (normalizedCategories.length === 0) return dbPlaces.length < 10;
      return normalizedCategories.some(
        (cat) =>
          dbPlaces.filter((p) => p.category.toLowerCase() === cat).length < 3,
      );
    };

    console.log("🌐 STEP 3 - Should fallback to Google?", shouldFallback());

    if (shouldFallback()) {
      try {
        const rawGoogle = await googleService.fetchNearbyFromGoogle(
          latitude,
          longitude,
          normalizedCategories.length > 0 ? normalizedCategories : undefined,
        );
        console.log("🌐 Google raw results:", rawGoogle.length);

        if (rawGoogle.length > 0) {
          console.log("🔍 Sample Google place:", {
            name: rawGoogle[0].name,
            types: rawGoogle[0].types,
            is_open: rawGoogle[0].is_open,
          });
        }

        const existingIds = new Set([
          ...places,
          ...dbPlaces.map((p) => p.place_id),
        ]);

        for (let place of rawGoogle) {
          if (existingIds.has(place.place_id)) continue;

          const { category, subcategory } = classifyPlace(place.types || []);

          // Case-insensitive category filter
          if (
            normalizedCategories.length > 0 &&
            !normalizedCategories.includes(category.toLowerCase())
          )
            continue;

          let aiDetails = null;
          try {
            aiDetails = await generatePlaceDetails({
              name: place.name,
              category,
              subcategory,
            });
          } catch (err) {
            console.error("AI Error:", err.message);
          }

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
            ai_details: aiDetails,
            source: "google",
          });

          existingIds.add(place.place_id);
        }

        console.log(
          "🌐 Google places after category filter:",
          googlePlaces.length,
        );
      } catch (googleErr) {
        console.error("❌ Google API failed:", googleErr.message);
      }
    }

    // ===== STEP 4: Merge =====
    const allPlaces = [...selectedPlaces, ...dbPlaces, ...googlePlaces];
    console.log("🔀 STEP 4 - Total merged:", allPlaces.length);

    // ===== STEP 5: Remove Closed =====
    const openPlaces = allPlaces.filter((p) => p.is_open !== false);
    console.log(
      "✅ STEP 5 - Open places:",
      openPlaces.length,
      "| Removed as closed:",
      allPlaces.length - openPlaces.length,
    );

    // ===== STEP 6: Rank =====
    const ranked = rankingService.rankPlaces(openPlaces);
    console.log("🏆 STEP 6 - Ranked places:", ranked.length);

    // ===== STEP 7: AI Details =====
    const placesWithAI = await Promise.all(
      ranked.slice(0, 20).map(ensureAIDetails),
    );
    console.log(
      "🤖 STEP 7 - Places with AI details:",
      placesWithAI.filter((p) => p.ai_details).length,
    );

    // ===== STEP 8: Build Itinerary =====
    let currentTime = new Date();
    const itinerary = [];

    for (let place of placesWithAI) {
      let duration = parseDuration(place.ai_details?.recommended_duration);
      console.log(
        `⏱️  ${place.name} | duration: ${duration}min | remaining: ${remainingTime}min`,
      );

      if (remainingTime < duration) {
        if (itinerary.length === 0) duration = remainingTime;
        else break;
      }

      const start = new Date(currentTime);
      const end = new Date(currentTime.getTime() + duration * 60000);
      currentTime = new Date(end.getTime() + 20 * 60000);
      remainingTime -= duration;

      let videos = [];
      try {
        const rawVideos = await fetchVideos(place.name);
        videos = rankVideos(rawVideos, place.name);
      } catch {}

      itinerary.push({
        step: itinerary.length + 1,
        name: place.name,
        category: place.category,
        subcategory: place.subcategory,
        duration_minutes: duration,
        visit_start: start,
        visit_end: end,
        ai_details: place.ai_details,
        videos,
      });
    }

    console.log("📋 STEP 8 - Final itinerary:", itinerary.length, "places");
    console.log("==================== END DEBUG ====================\n");

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
    console.error("❌ Itinerary Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate itinerary",
      error: error.message,
    });
  }
};
