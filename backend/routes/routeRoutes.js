const express = require("express");
const router = express.Router();

const { getRoute } = require("../controllers/routeController");

router.post("/", getRoute);

module.exports = router;