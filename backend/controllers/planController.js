const rankingService = require("../services/rankingService");
const googleService = require("../services/googlePlacesService");
const classifyPlace = require("../utils/classifyPlace");
const { getDistanceMeters } = require("../utils/distanceCalc");
const { reorderPlaces } = require("../services/reorderService");
const filterPlacesByWeather = require("../utils/weatherCheck");



exports.generateItinerary = async (req, res) => {
  try {
    const { lat, lng, totalTimeHours = 6 } = req.body;

    // 1. Get the best places using your existing service
    const rawPlaces = await googleService.fetchNearbyFromGoogle(lat, lng);

    // CLASSIFY EACH PLACE
   const classifiedPlaces = rawPlaces.map((place) => ({
     name: place.name,
     category: classifyPlace(place.types),

     location: {
       lat: place.geometry?.location?.lat,
       lng: place.geometry?.location?.lng,
     },

     rating: place.rating || 0,
     address: place.vicinity || "Address not available",
   }));

    // WEATHER FILTERING
    const weather = "clear"; // later replace with real weather API
    const filteredPlaces = filterPlacesByWeather(classifiedPlaces, weather);
    // RANK THEM
    const rankedPlaces = rankingService.rankPlaces(filteredPlaces);

    // 2. Take top 4-5 places (don't overwhelm the user)
    const nature = rankedPlaces.filter((p) => p.category === "Nature");
    const culture = rankedPlaces.filter((p) => p.category === "Culture");
    const food = rankedPlaces.filter((p) => p.category === "Food");

    const selectedPlaces = [
      ...nature.slice(0, 2),
      ...culture.slice(0, 2),
      ...food.slice(0, 1),
    ];
    const optimizedPlaces = reorderPlaces(selectedPlaces, lat, lng);
    // 3. Simple Time Allocation Logic
    let currentTime = new Date();
    currentTime.setHours(10, 0, 0); // Start the tour at 10:00 AM

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

      // Add 20 mins travel time for the next stop
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

    res.status(200).json({ success: true, plan: itinerary });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.checkArrival = async (req, res) => {
  try {
    const { userLat, userLng, placeLat, placeLng } = req.body;

    const distance = getDistanceMeters(userLat, userLng, placeLat, placeLng);

    const arrived = distance < 100;

    res.json({
      arrived,
      distance,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};


exports.reorderPlan = async (req, res) => {
  try {
    const { places, userLat, userLng } = req.body;

    const sorted = reorderPlaces(places, userLat, userLng);

    res.json(sorted);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
exports.recalculatePlan = async (req, res) => {
  try {
    const { lat, lng, hours } = req.body;

    const places = await googleService.fetchNearbyFromGoogle(
      lat,
      lng,
      "tourist_attraction",
    );

    const topPlaces = places.slice(0, 8);

    const plan = await generateItineraryAI(topPlaces, hours);

    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
