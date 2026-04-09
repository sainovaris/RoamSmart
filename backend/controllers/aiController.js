const Place = require("../models/Place");
const { generatePlaceDetails } = require("../services/openaiService");

exports.getAIPlaceDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const place = await Place.findById(id);

    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Place not found",
      });
    }

    // ✅ CACHE CHECK (only ai_details now)
    if (place.ai_details && place.ai_details.generated_at) {
      return res.json({
        success: true,
        cached: true,
        data: place.ai_details,
      });
    }

    // format location
    const formattedPlace = {
      ...place.toObject(),
      location: {
        lat: place.location.coordinates[1],
        lng: place.location.coordinates[0],
      },
    };

    // 🔥 CALL AI
    const aiData = await generatePlaceDetails(formattedPlace);

    // 🔥 SAVE CLEANLY
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
    console.error("AI ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to generate AI details",
    });
  }
};
