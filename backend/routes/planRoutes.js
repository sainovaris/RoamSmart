const express = require("express");
const router = express.Router();
const planController = require("../controllers/planController");

router.post("/generate-plan", planController.generateItinerary);

module.exports = router;
