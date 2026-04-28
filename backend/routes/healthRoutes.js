const express = require("express");
const router = express.Router();
  
// This defines the /api/health endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    uptime: process.uptime(),
    message: "RoamSmart Backend is reachable and healthy",
    timestamp: new Date(),
  });
});

module.exports = router;
