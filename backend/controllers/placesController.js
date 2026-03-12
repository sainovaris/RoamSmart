const Place = require("../models/Place");
const googleService = require("../services/googlePlacesService");
const rankingService = require("../services/rankingService");
const classifyPlace = require("../utils/classifyPlace");


// --------------------------- GET ALL MANUAL PLACES ---------------------------
exports.getAllPlaces = async (req, res) => {
  try {
    const places = await Place.find();

    res.status(200).json({
      success: true,
      count: places.length,
      results: places,
    });

  } catch (error) {
    console.error("Error fetching manual places:", error);

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
        message: "Latitude and Longitude are required",
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        message: "Latitude and Longitude must be valid numbers",
      });
    }

    const query = {
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

    const rankedPlaces = rankingService.rankPlaces(places);

    res.status(200).json({
      success: true,
      user_coords: { lat: latitude, lng: longitude },
      count: rankedPlaces.length,
      results: rankedPlaces,
    });

  } catch (error) {
    console.error("Nearby Mongo Search Error:", error);

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
    const { lat, lng, category } = req.query;

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and Longitude must be valid numbers",
      });
    }

    // Fetch from Google
    const googleResults = await googleService.fetchNearbyFromGoogle(
      latitude,
      longitude
    );

    console.log("Google results count:", googleResults.length);

    if (!googleResults || googleResults.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        results: [],
      });
    }

    // Clean + classify
    const cleanedResults = googleResults.map((place, index) => {

      const lat = place.location?.lat;
      const lng = place.location?.lng;

      return {
        place_id: place.place_id,
        name: place.name,
        rating: place.rating || 0,
        total_ratings: place.user_ratings_total || 0,
        address: place.address || "",
        types: place.types || [],
        category: classifyPlace(place.types),
        location: {
          lat,
          lng,
        },
        is_open: place.is_open ?? "Unknown",
        photo: place.photo || null,
      };
    });

    console.log(
      "Cleaned places sample:",
      cleanedResults.slice(0, 2)
    );

    // Category filter
    const categoryFiltered =
      category && category !== "All"
        ? cleanedResults.filter((p) => p.category === category)
        : cleanedResults;

        
    // Ranking
    const rankedResults = rankingService.rankPlaces(categoryFiltered);

    console.log("Ranked places:", rankedResults.length);

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
      return res.status(404).json({
        success: false,
        message: "Place not found",
      });
    }

    if (details.photos?.length) {
      details.main_photo_url = googleService.getPhotoUrl(
        details.photos[0].photo_reference
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