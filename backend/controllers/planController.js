const rankingService = require("../services/rankingService");
const googleService = require("../services/googlePlacesService");
const classifyPlace = require("../utils/classifyPlace");
const { reorderPlaces } = require("../services/reorderService");
const Place = require("../models/Place");

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

    // ⏱️ TIME CONFIG (minutes per category)
    const timeMap = {
      Nature: 120,
      Culture: 90,
      Food: 60,
      default: 90,
    };

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

      apiPlaces = rawPlaces.map((place) => {
        const { category, subcategory } = classifyPlace(place.types || []);

        return {
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

          source: "google",
        };
      });

      // SAVE TO DB
      await Promise.all(
        apiPlaces.map((p) =>
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
    const filtered =
      category && category !== ""
        ? allPlaces.filter(
            (p) =>
              p.category && p.category.toLowerCase() === category.toLowerCase(),
          )
        : allPlaces;

    // ================= 6️⃣ RANK =================
    const ranked = rankingService.rankPlaces(filtered);

    // ================= 7️⃣ DISTANCE OPTIMIZE =================
    const optimized = reorderPlaces(ranked, latitude, longitude);

    // ================= 8️⃣ BUILD ITINERARY =================
    let currentTime = new Date(); // 🔥 REAL CURRENT TIME

    const itinerary = [];

    for (let place of optimized) {
      const duration = timeMap[place.category] || timeMap.default;

      if (remainingTime < duration) break;

      const start = new Date(currentTime);
      const end = new Date(currentTime.getTime() + duration * 60000);

      currentTime = new Date(end.getTime() + 20 * 60000); // travel buffer

      remainingTime -= duration;

      itinerary.push({
        step: itinerary.length + 1,

        place_id: place.place_id,
        name: place.name,

        category: place.category,
        subcategory: place.subcategory,

        location: place.location,
        address: place.address,
        is_open: place.is_open,

        photo: place.photo,

        // 🔥 AI DETAILS INCLUDED
        ai_details: place.ai_details || null,

        score: place.relevance_score,
        source: place.source,

        visit_start: start,
        visit_end: end,
        duration_minutes: duration,
      });
    }

    // ================= RESPONSE =================
    res.status(200).json({
      success: true,
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
