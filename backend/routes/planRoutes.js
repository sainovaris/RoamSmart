const express = require("express");
const router = express.Router();
const planController = require("../controllers/planController");
const {
  generateItinerary,
  checkArrival,
  reorderPlan,
  recalculatePlan,
} = require("../controllers/planController");


router.post("/generate-plan", planController.generateItinerary);
const { removeClosedPlaces } = require("../utils/timeFilters");
router.post("/check-arrival", checkArrival);
router.post("/reorder", reorderPlan);
router.post("/recalculate", recalculatePlan);

module.exports = router;
