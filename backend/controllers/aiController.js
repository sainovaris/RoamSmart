const Place = require("../models/Place");
const { generatePlaceDetails } = require("../services/openaiService");
const {
  getPlaceDetailsFromGoogle,
} = require("../services/googlePlacesService");
const classifyPlace = require("../utils/classifyPlace");

exports.getAIPlaceDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Place ID is required",
      });
    }

    console.log("📡 AI Request for place_id:", id);

    // =========================
    // 1. CHECK DB (by place_id)
    // =========================
    let place = await Place.findOne({ place_id: id });

    // =========================
    // 2. IF NOT IN DB → FETCH + SAVE
    // =========================
    if (!place) {
      console.log("📍 Not in DB → Fetching from Google...");

      const googleData = await getPlaceDetailsFromGoogle(id);

      if (!googleData) {
        return res.status(404).json({
          success: false,
          message: "Place not found in Google",
        });
      }

      const { category, subcategory } = classifyPlace(googleData.types || []);

      const lat = googleData.geometry?.location?.lat;
      const lng = googleData.geometry?.location?.lng;

      // 🔥 Generate AI
      const aiData = await generatePlaceDetails({
        name: googleData.name,
        category,
        subcategory,
      });

      // 🔥 Save in DB
      place = await Place.create({
        place_id: id,
        name: googleData.name,
        category,
        subcategory,
        types: googleData.types || [],
        location: {
          type: "Point",
          coordinates: [lng, lat],
        },
        address: googleData.formatted_address || "",
        is_open:
          googleData.opening_hours?.open_now !== undefined
            ? googleData.opening_hours.open_now
            : true,
        rating: googleData.rating || 0,
        total_ratings: googleData.user_ratings_total || 1,
        ai_details: {
          ...aiData,
          generated_at: new Date(),
        },
      });

      return res.json({
        success: true,
        cached: false,
        data: place.ai_details,
      });
    }

    // =========================
    // 3. CACHE HIT
    // =========================
    if (place.ai_details && place.ai_details.generated_at) {
      console.log("⚡ Returning cached AI");

      return res.json({
        success: true,
        cached: true,
        data: place.ai_details,
      });
    }

    // =========================
    // 4. GENERATE AI IF MISSING
    // =========================
    console.log("🤖 Generating AI for existing place...");

    const aiData = await generatePlaceDetails({
      name: place.name,
      category: place.category,
      subcategory: place.subcategory,
    });

    place.ai_details = {
      ...aiData,
      generated_at: new Date(),
    };

    await place.save();

    return res.json({
      success: true,
      cached: false,
      data: place.ai_details,
    });
  } catch (error) {
    console.error("❌ AI ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to generate AI details",
    });
  }
};
