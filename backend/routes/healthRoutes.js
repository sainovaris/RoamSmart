const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
    uptime: process.uptime(),
    message: "RoamSmart Backend is reachable and healthy",
    timestamp: new Date().toISOString(),
  });
});

router.get("/ready", (_req, res) => {
  const mongoReady = mongoose.connection.readyState === 1;
  const status = mongoReady ? 200 : 503;

  res.status(status).json({
    success: mongoReady,
    status: mongoReady ? "READY" : "NOT_READY",
    mongo: mongoReady ? "connected" : "disconnected",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
