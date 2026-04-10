const Place = require("../models/Place");
const googleService = require("../services/googlePlacesService");
const rankingService = require("../services/rankingService");
const classifyPlace = require("../utils/classifyPlace");
const { generatePlaceDetails } = require("../services/openaiService");

// --------------------------- FIND NEARBY PLACES FROM DATABASE ---------------------------
async function findNearbyPlaces(lat, lng) {
  const places = await Place.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [lng, lat],
        },
        $maxDistance: 15000,
      },
    },
  });

  return places;
}

exports.testInsert = async (req, res) => {
  try {
    const testPlace = {
      name: "Test Place Amisha",
      rating: 4.5,
      total_ratings: 10,
      category: "Test",
      location: {
        type: "Point",
        coordinates: [77.209, 28.6139],
      },
    };

    const savedPlace = await Place.create(testPlace);

    res.json({
      message: "Place stored successfully",
      data: savedPlace,
    });
  } catch (error) {
    console.log(error);
  }
};

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
          $maxDistance: 15000,
        },
      },
    };

    if (type) {
      query.type = type;
    }

    const places = await Place.find(query);

    const plainPlaces = places.map((p) => {
      const obj = p.toObject();

      // 🔥 Normalize location here
      if (obj.location?.coordinates) {
        obj.location = {
          lat: obj.location.coordinates[1],
          lng: obj.location.coordinates[0],
        };
      }

      return obj;
    });

    const rankedPlaces = rankingService.rankPlaces(
      plainPlaces,
      latitude,
      longitude,
    );

    res.status(200).json({
      success: true,
      source: "database",
      user_coords: { lat: latitude, lng: longitude },
      count: rankedPlaces.length,
      results: rankedPlaces,
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

// --------------------------- GET REAL GOOGLE NEARBY PLACES (WITH CACHING) ---------------------------
exports.getRealNearbyPlaces = async (req, res) => {
  try {
    const { lat, lng, type, category } = req.query;

    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: "Latitude and Longitude must be valid numbers.",
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    // ================= STEP 1: GOOGLE API =================
    const googleResults = await googleService.fetchNearbyFromGoogle(
      latitude,
      longitude,
      type,
    );

    // ================= STEP 2: CLEAN DATA =================
    let cleanedResults = googleResults
      .map((place) => {
        if (!place) return null;

        const { category, subcategory } = classifyPlace(place.types || []);

        return {
          place_id: place.place_id,
          name: place.name || "Unknown",
          rating: place.rating || 0,
          total_ratings: place.user_ratings_total || 1,

          address: place.address || place.vicinity || "Address not available",

          types: place.types || [],
          category,
          subcategory,

          is_open: typeof place.is_open === "boolean" ? place.is_open : false,
          photo: place.photo || null,
          photo_reference: null,

          location: {
            lat: place.location?.lat || null,
            lng: place.location?.lng || null,
          },

          ai_details: null, // will fill below
        };
      })
      .filter(Boolean);

    // ================= STEP 3: CATEGORY FILTER =================
    if (category && category !== "") {
      cleanedResults = cleanedResults.filter(
        (p) =>
          p.category && p.category.toLowerCase() === category.toLowerCase(),
      );
    }
 const openPlaces = cleanedResults.filter((p) => p.is_open !== false);

const finalPlaces = openPlaces.length > 0 ? openPlaces : cleanedResults;
    // ================= STEP 4: GENERATE AI FOR ALL =================
    for (const place of finalPlaces) {
      try {
        // 🔥 CHECK DB FIRST (avoid cost)
        const existing = await Place.findOne({
          place_id: place.place_id,
        });

        if (existing?.ai_details?.generated_at) {
          place.ai_details = existing.ai_details;
          continue;
        }

        // 🔥 CALL OPENAI
        const aiData = await generatePlaceDetails(place);

        place.ai_details = {
          ...aiData,
          generated_at: new Date(),
        };
      } catch (err) {
        console.error("AI ERROR:", err.message);
        place.ai_details = null;
      }
    }

    // ================= STEP 5: SAVE TO DB =================
    await Promise.all(
      finalPlaces.map((place) =>
        Place.updateOne(
          { place_id: place.place_id },
          {
            $set: {
              ...place,
              location: {
                type: "Point",
                coordinates: [place.location.lng, place.location.lat],
              },
              ai_details: place.ai_details || null,
              source: "google",
            },
          },
          { upsert: true },
        ),
      ),
    );

    // ================= STEP 6: RANK =================
    const rankedResults = rankingService.rankPlaces(
      finalPlaces,
      latitude,
      longitude,
    );

    // ================= RESPONSE =================
    res.status(200).json({
      success: true,
      source: "google",
      count: rankedResults.length,
      results: rankedResults.map((p) => ({
        ...p,
        ai_details: p.ai_details || null,
      })),
    });
  } catch (error) {
    console.error("Google Nearby Error:", error);

    res.status(500).json({
      success: false,
      message: "Google API or AI issues",
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

    // Generate main photo URL
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
