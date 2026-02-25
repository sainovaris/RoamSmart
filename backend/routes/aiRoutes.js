const express = require("express");
const router = express.Router();
const { getAIPlaceDetails } = require("../controllers/aiController");

router.get("/:id", getAIPlaceDetails);

module.exports = router;
