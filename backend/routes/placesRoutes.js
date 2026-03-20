const express = require("express");
const router = express.Router();
const placesController = require("../controllers/placesController");

router.get("/places", placesController.getAllPlaces);

// NEW: The /nearby route
router.get("/nearby", placesController.getNearbyPlaces);
router.get("/test-insert", placesController.testInsert);

router.get("/google-nearby", placesController.getRealNearbyPlaces);

module.exports = router;
