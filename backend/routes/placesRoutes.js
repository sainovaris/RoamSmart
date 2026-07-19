const express = require("express");
const router = express.Router();
const placesController = require("../controllers/placesController");

router.get("/places", placesController.getAllPlaces);
router.get("/nearby", placesController.getNearbyPlaces);
router.get("/google-nearby", placesController.getRealNearbyPlaces);
router.get("/details/:placeId", placesController.getPlaceDetails);

module.exports = router;
