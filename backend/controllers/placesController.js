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
        $maxDistance: 5000,
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
          $maxDistance: 5000,
        },
      },
    };

    if (type) {
      query.type = type;
    }

    const places = await Place.find(query);

    const plainPlaces = places.map((p) => p.toObject());

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

    // STEP 1: Check MongoDB for cached places
    const cachedPlaces = await findNearbyPlaces(latitude, longitude);

   if (cachedPlaces.length > 0) {
     const plainPlaces = cachedPlaces.map((p) => p.toObject());

     const rankedPlaces = rankingService.rankPlaces(
       plainPlaces,
       latitude,
       longitude,
     );

     return res.status(200).json({
       success: true,
       source: "database",
       count: rankedPlaces.length,
       results: rankedPlaces,
     });
   }

    // STEP 2: Fetch from Google Places API
    const googleResults = await googleService.fetchNearbyFromGoogle(
      latitude,
      longitude,
      type,
    );

    console.log(
      googleResults.map((p) => ({
        name: p.name,
        user_ratings_total: p.user_ratings_total,
        rating: p.rating,
      })),
    );

    // STEP 3: Clean and classify results
   const cleanedResults = googleResults
     .map((place) => {
       if (!place) return null;

       const { category, subcategory } = classifyPlace(place.types || []);

       const lat = place.location?.lat;
       const lng = place.location?.lng;

       return {
         place_id: place.place_id,
         name: place.name || "Unknown",
         rating: place.rating || 0,
         total_ratings: place.user_ratings_total || 1,
         address: place.vicinity || "",
         types: place.types || [],
         category,
         subcategory,
         is_open: place.opening_hours?.open_now ?? "Unknown",
         photo: place.photos ? place.photos[0]?.photo_reference : null,

         location: {
           lat: lat || null,
           lng: lng || null,
         },
       };
     })
     .filter(Boolean);
    console.log(
      cleanedResults.map((p) => ({
        name: p.name,
        lat: p.location?.lat,
        lng: p.location?.lng,
      })),
    );
   await Promise.all(
     cleanedResults.map(async (place) => {
       try {
         const aiData = await generatePlaceDetails(place);

         place.summary = aiData?.overview || "";
         place.description = aiData?.travel_tips || "";
         place.history = aiData?.highlights?.join("; ") || "";

         place.ai_details = {
           ...aiData,
           generated_at: new Date(),
         };
       } catch (err) {
         console.error(`AI failed for ${place.name}:`, err.message);

         place.summary = "";
         place.description = "";
         place.history = "";
         place.ai_details = null;
       }
     }),
   );


    console.log(
      "Classified Places:",
      cleanedResults.map((p) => ({
        name: p.name,
        rating: p.rating,
        total_ratings: p.total_ratings,
        category: p.category,
      })),
    );
    console.log("Cleaned Results:", cleanedResults.length);
    console.log("Requested Category:", category);

    // STEP 4: Filter by category if selected
    let categoryFiltered = cleanedResults;

    if (category && category !== "") {
      categoryFiltered = cleanedResults.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase(),
      );
    }
    console.log("After Category Filter:", categoryFiltered.length);
    // STEP 5: Save places into MongoDB
    const validPlaces = categoryFiltered.filter(
  (p) =>
    p.location.lat !== null &&
    p.location.lng !== null &&
    p.place_id // ✅ FILTER OUT NULL place_id
);

   const placesToInsert = validPlaces.map((place) => ({
     place_id: place.place_id,
     name: place.name,
     rating: place.rating,
     total_ratings: place.total_ratings,
     category: place.category,
     address: place.address,
     types: place.types,
     is_open: place.is_open,
     photo: place.photo,

     summary: place.summary,
     description: place.description,
     history: place.history,
     ai_details: place.ai_details,

     location: {
       type: "Point",
       coordinates: [place.location.lng, place.location.lat],
     },

     source: "google",
   }));


await Promise.all(
  placesToInsert.map((place) =>
    Place.updateOne(
      { place_id: place.place_id },
      { $set: place },
      { upsert: true },
    ),
  ),
);

console.log("AI SAMPLE:", cleanedResults[0]);

    // STEP 6: Rank places
    const rankedResults = rankingService.rankPlaces(
      categoryFiltered,
      latitude,
      longitude,
    );
    
    console.log(
      "SCORES:",
      rankedResults.map((p) => ({
        name: p.name,
        rating: p.rating,
        total_ratings: p.total_ratings,
        score: p.score,
      })),
    );


    res.status(200).json({
      success: true,
      source: "google",
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
