const rankingService = require("../services/rankingService");
const googleService = require("../services/googlePlacesService");
const classifyPlace = require("../utils/classifyPlace");
const { getDistanceMeters } = require("../utils/distanceCalc");
const { reorderPlaces } = require("../services/reorderService");
const filterPlacesByWeather = require("../utils/weatherCheck");

// --------------------------- GENERATE ITINERARY ---------------------------
exports.generateItinerary = async (req, res) => {
  try {
    const { lat, lng, totalTimeHours = 6, category } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Missing coordinates"
      });
    }
    
    // 1. Get the best places using your existing service
    // 1️⃣ Fetch nearby places from Google
    const rawPlaces = await googleService.fetchNearbyFromGoogle(lat, lng);
    // 🔹 Add this log to check actual Google data
    console.log("Raw Places from Google:", rawPlaces.length);
    console.log(rawPlaces.slice(0, 5));
    console.log(
      rawPlaces.map((p) => ({
        name: p.name,
        user_ratings_total: p.user_ratings_total,
        rating: p.rating,
      })),
    );

    // 2️⃣ Classify each place
    const classifiedPlaces = rawPlaces.map((place) => ({
      name: place.name,
      place_id: place.place_id,
      category: classifyPlace(place.types),
      location: place.location, // ✔ correct field
      rating: place.rating || 0,
      total_ratings: place.user_ratings_total || 1,
      address: place.address || "Address not available", // ✔ correct field
    }));

    console.log(
      "Classified Places with ratings:",
      classifiedPlaces.map((p) => ({
        name: p.name,
        rating: p.rating,
        total_ratings: p.total_ratings,
        category: p.category,
      })),
    );

    // 3️⃣ Filter by weather (replace with real API later)
    const weather = "clear";
    const weatherFiltered = filterPlacesByWeather(classifiedPlaces, weather);

    // 4️⃣ Filter by user-selected category if provided
    const categoryFiltered =
      category && category !== ""
        ? weatherFiltered.filter((p) => p.category === category)
        : weatherFiltered;

    // 5️⃣ Rank the places
    const rankedPlaces = rankingService.rankPlaces(
      categoryFiltered,
      category ? [category] : [],
    );

    // 6️⃣ Select top places
    let selectedPlaces;
    if (!category || category === "") {
      const nature = rankedPlaces.filter((p) => p.category === "Nature");
      const culture = rankedPlaces.filter((p) => p.category === "Culture");
      const food = rankedPlaces.filter((p) => p.category === "Food");

      selectedPlaces = [
        ...nature.slice(0, 2),
        ...culture.slice(0, 2),
        ...food.slice(0, 1),
      ];

      // 🔹 fallback if categories not found
      if (selectedPlaces.length === 0) {
        selectedPlaces = rankedPlaces.slice(0, 5);
      }
    } else {
      selectedPlaces = rankedPlaces.slice(0, 5);
    }

    // 7️⃣ Optimize order based on distance
    const optimizedPlaces = reorderPlaces(selectedPlaces, lat, lng);

    // 8️⃣ Build itinerary with time allocation
    let currentTime = new Date();
    currentTime.setHours(10, 0, 0); // Start tour at 10:00 AM

    const itinerary = optimizedPlaces.map((place, index) => {
      const startTime = currentTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      // Spend 1.5 hours at each attraction
      currentTime.setMinutes(currentTime.getMinutes() + 90);
      const endTime = currentTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      // Add 20 mins travel time for next stop
      currentTime.setMinutes(currentTime.getMinutes() + 20);

      return {
        step: index + 1,
        id: place.place_id,
        name: place.name,
        category: place.category,
        location: place.location,
        visit_time: `${startTime} - ${endTime}`,
        address: place.address,
      };
    });

    res.status(200).json({ success: true, plan: itinerary });
  } catch (error) {
    console.error("Generate Itinerary Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// --------------------------- CHECK ARRIVAL ---------------------------
exports.checkArrival = async (req, res) => {
  try {
    const { userLat, userLng, placeLat, placeLng } = req.body;
    const distance = getDistanceMeters(userLat, userLng, placeLat, placeLng);
    const arrived = distance < 100; // less than 100 meters
    res.json({ arrived, distance });
  } catch (error) {
    console.error("Check Arrival Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// --------------------------- REORDER PLAN ---------------------------
exports.reorderPlan = async (req, res) => {
  try {
    const { places, userLat, userLng } = req.body;
    const sorted = reorderPlaces(places, userLat, userLng);
    res.json(sorted);
  } catch (error) {
    console.error("Reorder Plan Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// --------------------------- RECALCULATE PLAN ---------------------------
exports.recalculatePlan = async (req, res) => {
  try {
    const { lat, lng, hours, category } = req.body;

    const rawPlaces = await googleService.fetchNearbyFromGoogle(
      lat,
      lng,
      "tourist_attraction",
    );

    const classifiedPlaces = rawPlaces.map((place) => ({
      name: place.name,
      category: classifyPlace(place.types),
      location: {
        lat: place.geometry?.location?.lat,
        lng: place.geometry?.location?.lng,
      },
      rating: place.rating || 0,
      total_ratings: place.user_ratings_total || 1,
      address: place.vicinity || "Address not available",
    }));

    console.log(
      "Classified Places for recalculation:",
      classifiedPlaces.map((p) => ({
        name: p.name,
        rating: p.rating,
        total_ratings: p.total_ratings,
      })),
    );

    const categoryFiltered =
      category && category !== ""
        ? classifiedPlaces.filter((p) => p.category === category)
        : classifiedPlaces;

    const rankedPlaces = rankingService.rankPlaces(
      categoryFiltered,
      category ? [category] : [],
    );

    const topPlaces = rankedPlaces.slice(0, 5);

    const optimizedPlaces = reorderPlaces(topPlaces, lat, lng);

    let currentTime = new Date();
    currentTime.setHours(10, 0, 0);

    const itinerary = optimizedPlaces.map((place, index) => {
      const startTime = currentTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      currentTime.setMinutes(currentTime.getMinutes() + 90);
      const endTime = currentTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      currentTime.setMinutes(currentTime.getMinutes() + 20);

      return {
        step: index + 1,
        name: place.name,
        category: place.category,
        location: place.location,
        visit_time: `${startTime} - ${endTime}`,
        address: place.address,
      };
    });

    res.json({ success: true, plan: itinerary });
  } catch (error) {
    console.error("Recalculate Plan Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
