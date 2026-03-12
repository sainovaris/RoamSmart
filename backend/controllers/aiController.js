const Place = require("../models/Place");
const { generatePlaceDetails } = require("../services/openaiService");
const googleService = require("../services/googlePlacesService");

exports.getAIPlaceDetails = async (req, res) => {
  try {
    const { id } = req.params; // this is Google place_id

    // 🔹 Find by Google place_id
    let place = await Place.findOne({ place_id: id });

    // 🔹 If not in DB → fetch from Google and create
    if (!place) {
      const googleDetails = await googleService.getPlaceDetailsFromGoogle(id);

      if (!googleDetails) {
        return res.status(404).json({
          success: false,
          message: "Place not found in Google",
        });
      }

      place = new Place({
        place_id: id,
        name: googleDetails.name,
        type: googleDetails.types?.[0] || "Place",
        location: {
          type: "Point",
          coordinates: [
            googleDetails.geometry.location.lng,
            googleDetails.geometry.location.lat,
          ],
        },
        address: googleDetails.formatted_address,
        rating: googleDetails.rating || 0,
      });

      await place.save();
    }

    // 🔹 CACHE CHECK
    if (place.ai_details && place.ai_details.generated_at) {
      return res.json({
        success: true,
        cached: true,
        data: place.ai_details,
      });
    }

    // 🔹 Generate AI content
    const aiData = await generatePlaceDetails(place);

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