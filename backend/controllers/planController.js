const rankingService = require("../services/rankingService");
const googleService = require("../services/googlePlacesService");
const classifyPlace = require("../utils/classifyPlace");
const Place = require("../models/Place");
const { fetchVideos } = require("../services/youtubeService");
const { rankVideos } = require("../services/videoRankingService");
const { generateItinerarySummary } = require("../services/itineraryAI");
const { generatePlaceDetails } = require("../services/openaiService");

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

exports.generateItinerary = async (req, res) => {
  try {
    const { lat, lng, totalTimeHours = 6, category, subcategory } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Missing coordinates",
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    let remainingTime = totalTimeHours * 60;

    console.log("USER CATEGORY:", category);

    // ================= 1️⃣ FETCH FROM DB =================
    let dbPlaces = await Place.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: 10000,
        },
      },
    }).limit(30);

    // ================= 2️⃣ NORMALIZE + CLASSIFY DB =================
    let processedDB = dbPlaces.map((p) => {
      const { category: placeCategory, subcategory: placeSubcategory } =
        classifyPlace(p.types || []);

      return {
        place_id: p.place_id,
        name: p.name,
        category: placeCategory,
        subcategory: placeSubcategory,
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
    });

    // ================= 3️⃣ FILTER DB =================
    let filteredPlaces = processedDB.filter((p) => {
      if (category && p.category.toLowerCase() !== category.toLowerCase())
        return false;

      if (
        subcategory &&
        p.subcategory.toLowerCase() !== subcategory.toLowerCase()
      )
        return false;

      return true;
    });

    // ================= 4️⃣ GOOGLE FALLBACK =================
    if (filteredPlaces.length < 5) {
      const rawPlaces = await googleService.fetchNearbyFromGoogle(
        latitude,
        longitude,
      );

      const googleProcessed = [];

      for (let place of rawPlaces) {
        const { category: placeCategory, subcategory: placeSubcategory } =
          classifyPlace(place.types || []);

        // FILTER
        if (category && placeCategory.toLowerCase() !== category.toLowerCase())
          continue;

        if (
          subcategory &&
          placeSubcategory.toLowerCase() !== subcategory.toLowerCase()
        )
          continue;

        let aiDetails = null;

        try {
          aiDetails = await generatePlaceDetails({
            name: place.name,
            category: placeCategory,
            subcategory: placeSubcategory,
          });
        } catch (err) {
          console.error("AI Error:", err.message);
        }

        googleProcessed.push({
          place_id: place.place_id,
          name: place.name,
          category: placeCategory,
          subcategory: placeSubcategory,
          types: place.types,

          location: {
            lat: place.location?.lat,
            lng: place.location?.lng,
          },

          address: place.address || "",
          is_open: typeof place.is_open === "boolean" ? place.is_open : true,

          rating: place.rating || 0,
          total_ratings: place.user_ratings_total || 1,

          ai_details: aiDetails,
          source: "google",
        });
      }

      // 🔥 MERGE (NO DB SAVE)
      filteredPlaces = [...filteredPlaces, ...googleProcessed];
    }

    // ================= 5️⃣ REMOVE CLOSED =================
    const openPlaces = filteredPlaces.filter((p) => p.is_open !== false);

    // ================= 6️⃣ RANK =================
    const ranked = rankingService.rankPlaces(openPlaces);

    // ================= 7️⃣ AI DETAILS (FOR DB PLACES ONLY) =================
    const placesWithAI = await Promise.all(
      ranked.slice(0, 15).map(async (place) => {
        if (place.ai_details) return place;

        try {
          const aiDetails = await generatePlaceDetails({
            name: place.name,
            category: place.category,
            subcategory: place.subcategory,
          });

          return { ...place, ai_details: aiDetails };
        } catch {
          return { ...place, ai_details: null };
        }
      }),
    );

    // ================= 8️⃣ BUILD ITINERARY =================
    let currentTime = new Date();
    const itinerary = [];

    for (let place of placesWithAI) {
      let duration = parseDuration(place.ai_details?.recommended_duration);

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
        duration_minutes: duration,
        visit_start: start,
        visit_end: end,
        ai_details: place.ai_details,
        videos,
      });
    }

    // ================= 9️⃣ SUMMARY =================
    let summary = "";
    if (itinerary.length > 0) {
      summary = await generateItinerarySummary(itinerary);
    }

    res.status(200).json({
      success: true,
      summary,
      total_places: itinerary.length,
      totalTimeHours,
      remainingTimeHours: (remainingTime / 60).toFixed(2),
      plan: itinerary,
    });
  } catch (error) {
    console.error("Itinerary Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate itinerary",
      error: error.message,
    });
  }
};
