const rankingService = require("../services/rankingService");
const googleService = require("../services/googlePlacesService");
const classifyPlace = require("../utils/classifyPlace");
const { reorderPlaces } = require("../services/reorderService");
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
    const { lat, lng, totalTimeHours = 6, category } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Missing coordinates",
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    let remainingTime = totalTimeHours * 60;

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

    // ================= 2️⃣ GOOGLE FALLBACK =================
    let apiPlaces = [];

    if (dbPlaces.length < 10) {
      const rawPlaces = await googleService.fetchNearbyFromGoogle(
        latitude,
        longitude,
      );

      const enrichedPlaces = [];

      for (let place of rawPlaces) {
        const { category, subcategory } = classifyPlace(place.types || []);

        let aiDetails = null;

        try {
          // 🔥 GENERATE AI DETAILS
          aiDetails = await generatePlaceDetails({
            name: place.name,
            category,
            subcategory,
          });
        } catch (err) {
          console.error("AI Error:", err.message);
        }

        const formattedPlace = {
          place_id: place.place_id,
          name: place.name,
          category,
          subcategory,
          types: place.types,

          location: {
            lat: place.location?.lat,
            lng: place.location?.lng,
          },

          address: place.address || "",
          is_open: typeof place.is_open === "boolean" ? place.is_open : false,

          photo: place.photo,
          photo_reference: null,

          rating: place.rating || 0,
          total_ratings: place.user_ratings_total || 1,

          ai_details: aiDetails || null,

          source: "google",
        };

        enrichedPlaces.push(formattedPlace);
      }

      // 🔥 SAVE TO DB WITH AI DETAILS
      await Promise.all(
        enrichedPlaces.map((p) =>
          Place.updateOne(
            { place_id: p.place_id },
            {
              $set: {
                ...p,
                location: {
                  type: "Point",
                  coordinates: [p.location.lng, p.location.lat],
                },
              },
            },
            { upsert: true },
          ),
        ),
      );

      // 🔥 USE THESE PLACES IMMEDIATELY
      apiPlaces = enrichedPlaces;
    }

    // ================= 3️⃣ NORMALIZE DB =================
    const normalizedDB = dbPlaces.map((p) => ({
      place_id: p.place_id,
      name: p.name,
      category: p.category,
      subcategory: p.subcategory,
      types: p.types,

      location: {
        lat: p.location.coordinates[1],
        lng: p.location.coordinates[0],
      },

      address: p.address,
      is_open: p.is_open,

      photo: p.photo,
      photo_reference: p.photo_reference,

      rating: p.rating,
      total_ratings: p.total_ratings,

      ai_details: p.ai_details || null,

      source: "db",
    }));

    // ================= 4️⃣ MERGE =================
    const allPlaces = [...normalizedDB, ...apiPlaces];

    // ================= 5️⃣ CATEGORY FILTER =================
    let filtered =
      category && category !== ""
        ? allPlaces.filter(
            (p) =>
              p.category && p.category.toLowerCase() === category.toLowerCase(),
          )
        : allPlaces;

    // 🔥 IMPORTANT: fallback if nothing found
    if (filtered.length === 0) {
      console.log("No category match → using all places");
      filtered = allPlaces;
    }

    // ================= REMOVE CLOSED PLACES =================
    const openPlaces = filtered.filter((p) => p.is_open !== false);

    // ================= 6️⃣ RANK =================
    const ranked = rankingService.rankPlaces(openPlaces);

    // ================= SMART TIME FILTER =================
    const currentHour = new Date().getHours();

    const smartFiltered = ranked; // 🔥 disable for now

    // ================= 7️⃣ DISTANCE OPTIMIZE =================
    const optimized = smartFiltered;
    let currentTime = new Date();
    remainingTime = totalTimeHours * 60;

    const itinerary = [];

    for (let place of optimized) {

      let duration = parseDuration(place.ai_details?.recommended_duration);

      console.log("Checking:", place.name, duration, remainingTime);

      if (remainingTime < duration) {
        if (itinerary.length === 0) {
          duration = remainingTime; // force at least 1 place
        } else {
          break;
        }
      }

      const start = new Date(currentTime);
      const end = new Date(currentTime.getTime() + duration * 60000);

      currentTime = new Date(end.getTime() + 20 * 60000);
      remainingTime -= duration;

      let videos = [];
      try {
        const rawVideos = await fetchVideos(place.name);
        videos = rankVideos(rawVideos, place.name);
      } catch (err) {}

      itinerary.push({
        step: itinerary.length + 1,
        name: place.name,
        duration_minutes: duration,
        visit_start: start,
        visit_end: end,
        ai_details: place.ai_details,
        videos,
      });
      console.log("PLACE:", place.name);
      console.log("CATEGORY:", place.category);
      console.log("DURATION:", duration);
      console.log("REMAINING:", remainingTime);
    }
    if (itinerary.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No places fit within the given time",
        total_places: 0,
        plan: [],
      });
    }
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
