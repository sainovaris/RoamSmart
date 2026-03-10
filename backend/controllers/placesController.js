const Place = require("../models/Place");
const googleService = require("../services/googlePlacesService");
const rankingService = require("../services/rankingService");
const classifyPlace = require("../utils/classifyPlace");

// --------------------------- GET ALL MANUAL PLACES ---------------------------
exports.getAllPlaces = async (req, res) => {
  try {
    const places = await Place.find();
    res.status(200).json({
      count: places.length,
      success: true,
      results: places,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching all places",
      error: error.message,
    });
  }
};

// --------------------------- GET NEARBY MANUAL PLACES ---------------------------
exports.getNearbyPlaces = async (req, res) => {
  try {
    const { lat, lng, type } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Please provide both latitude (lat) and longitude (lng)",
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    let query = {
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: 5000,
        },
      },
    };

    if (type) {
      query.type = type;
    }

    const places = await Place.find(query);

    res.status(200).json({
      success: true,
      user_coords: { lat: latitude, lng: longitude },
      count: places.length,
      results: places,
    });
  } catch (error) {
    console.error("Nearby Search Error:", error);
    res.status(500).json({
      success: false,
      message: "Error calculating nearby places",
      error: error.message,
    });
  }
};

// --------------------------- GET REAL GOOGLE NEARBY PLACES ---------------------------
exports.getRealNearbyPlaces = async (req, res) => {
  try {
    const { lat, lng, type, category } = req.query;

    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: "Latitude and Longitude must be valid numbers.",
      });
    }

    // Fetch from Google
    const googleResults = await googleService.fetchNearbyFromGoogle(
      parseFloat(lat),
      parseFloat(lng),
      type,
    );
    console.log(
      googleResults.map((p) => ({
        name: p.name,
        user_ratings_total: p.user_ratings_total,
        rating: p.rating,
      })),
    );

    console.log("First Place from Google:", googleResults[0]);

    // Map and classify
    const cleanedResults = googleResults.map((place) => {
      const categoryName = classifyPlace(place.types);

      return {
        name: place.name,
        rating: place.rating || 0,
        total_ratings: place.user_ratings_total || 1, // <- important fix
        address: place.vicinity || "",
        types: place.types || [],
        category: categoryName,
        is_open: place.opening_hours?.open_now ?? "Unknown",
        photo: place.photos ? place.photos[0]?.photo_reference : null,
        location: place.geometry?.location || null,
      };
    });

    console.log(
      "Classified Places with ratings:",
      cleanedResults.map((p) => ({
        name: p.name,
        rating: p.rating,
        total_ratings: p.total_ratings,
        category: p.category,
      })),
    );

    // Filter by user-selected category if any
    const categoryFiltered =
      category && category !== ""
        ? cleanedResults.filter((p) => p.category === category)
        : cleanedResults;

    // Rank
    const rankedResults = rankingService.rankPlaces(
      categoryFiltered,
      category ? [category] : [],
    );

    res.status(200).json({
      success: true,
      count: rankedResults.length,
      results: rankedResults,
    });
  } catch (error) {
    console.error("Google Nearby Error:", error);
    res.status(500).json({
      success: false,
      message: "Google API or Ranking issues",
      error: error.message,
    });
  }
};

// --------------------------- GET PLACE DETAILS ---------------------------
exports.getPlaceDetails = async (req, res) => {
  try {
    const { placeId } = req.params;
    const details = await googleService.getPlaceDetailsFromGoogle(placeId);

    if (!details) {
      return res
        .status(404)
        .json({ success: false, message: "Place not found" });
    }

    // Generate main photo URL if available
    if (details.photos && details.photos.length > 0) {
      details.main_photo_url = googleService.getPhotoUrl(
        details.photos[0].photo_reference,
      );
    }

    res.status(200).json({
      success: true,
      results: details,
    });
  } catch (error) {
    console.error("Place Details Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch place details",
      error: error.message,
    });
  }
};
