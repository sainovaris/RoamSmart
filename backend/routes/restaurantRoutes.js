const express = require("express");
const router = express.Router();
const placesService = require("../services/placesService");

router.get("/", async (req, res) => {
  const { lat, lng } = req.query;
  try {
    const restaurants = await placesService.fetchNearbyFromGoogle(
      lat,
      lng,
      "restaurant",
    );
    res.json(restaurants);
  } catch (err) {
    res.status(500).send("Error fetching food");
  }
});

module.exports = router;
