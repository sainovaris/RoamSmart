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

    // ✅ STRONG CACHE CHECK
    if (
      place.ai_details &&
      place.ai_details.generated_at &&
      place.summary &&
      place.description
    ) {
      return res.json({
        success: true,
        cached: true,
        data: place.ai_details,
      });
    }

    // ✅ FIX LOCATION FORMAT
    const formattedPlace = {
      ...place.toObject(),
      location: {
        lat: place.location.coordinates[1],
        lng: place.location.coordinates[0],
      },
    };

    // 🔥 CALL OPENAI
    const aiData = await generatePlaceDetails(formattedPlace);

    // 🔥 MAP FIELDS
    place.summary = aiData?.overview || "";
    place.description = aiData?.travel_tips || "";
    place.history = aiData?.highlights?.join("; ") || "";

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
