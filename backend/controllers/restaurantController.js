const { fetchNearbyFromGoogle } = require("../services/googlePlacesService");

exports.getNearbyRestaurants = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    const restaurants = await fetchNearbyFromGoogle(lat, lng, "restaurant");

    res.json(restaurants.slice(0, 10));
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
