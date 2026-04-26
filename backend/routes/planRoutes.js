const express = require("express");
const router = express.Router();

const { generateItinerary } = require("../controllers/planController");
const {
  getNearbyForSelection,
  generateCustomItinerary,
} = require("../controllers/customItineraryController");

router.post("/generate-plan", generateItinerary);
router.get("/nearby-places", getNearbyForSelection);
router.post("/custom", generateCustomItinerary);

module.exports = router;
