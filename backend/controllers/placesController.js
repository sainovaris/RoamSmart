const Place = require("../models/Place");
const googleService = require("../services/googlePlacesService");
const rankingService = require("../services/rankingService");

// Inside your getNearbyAttractions function, change the last line:


// @desc    Get all manual places from our MongoDB
// @route   GET /api/places
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

// @desc    Get places nearby from MongoDB (Manual Data)
// @route   GET /api/nearby
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

// @desc    Get REAL places from Google API (Week 2 Core)
// @route   GET /api/google-nearby
// @desc    Get REAL places from Google API + RANKED (Week 2 Core)
// @route   GET /api/google-nearby
exports.getRealNearbyPlaces = async (req, res) => {
  try {
    const { lat, lng, type } = req.query;

    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: "Latitude and Longitude must be valid numbers.",
      });
    }

    const googleResults = await googleService.fetchNearbyFromGoogle(lat, lng, type);

    // 1. CLEANING DATA
    const cleanedResults = googleResults.map((place) => ({
      place_id: place.place_id,
      name: place.name,
      rating: place.rating || 0,
      total_ratings: place.user_ratings_total || 0, // IMPORTANT: Need this for ranking!
      address: place.vicinity,
      types: place.types,
      is_open: place.opening_hours ? place.opening_hours.open_now : "Unknown",
      photo_reference: place.photos ? place.photos[0].photo_reference : null,
      location: place.geometry.location,
    }));

    // 2. RANKING DATA (The Day 13 Change)
    // We pass our cleaned list to the service to calculate scores and sort them
    const rankedResults = rankingService.rankPlaces(cleanedResults);

    res.status(200).json({
      success: true,
      count: rankedResults.length,
      results: rankedResults, // Send the sorted list to Aasutosh
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Google API or Ranking issues",
      error: error.message,
    });
  }
};

// @desc    Get Deep Details for a specific place
// @route   GET /api/place-details/:placeId
exports.getPlaceDetails = async (req, res) => {
  try {
    const { placeId } = req.params;
    const details = await googleService.getPlaceDetailsFromGoogle(placeId);

    if (!details) {
      return res
        .status(404)
        .json({ success: false, message: "Place not found" });
    }

    // Generate Direct Photo URL if available (Day 4 Task)
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
    res.status(500).json({
      success: false,
      message: "Failed to fetch place details",
      error: error.message,
    });
  }
};
