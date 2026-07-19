const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
require("dotenv").config();

const REQUIRED_ENV = [
  "MONGO_URI",
  "GOOGLE_PLACES_API_KEY",
  "OPENAI_API_KEY",
  "YOUTUBE_API_KEY",
];

function validateEnv() {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]?.trim());
  const warnings = [];

  if (process.env.MONGO_URI === "memory") {
    missing.push("MONGO_URI (invalid value 'memory')");
  }

  if (!process.env.OPENAI_API_KEY) {
    warnings.push("OPENAI_API_KEY missing — AI details will fail");
  }
  if (!process.env.YOUTUBE_API_KEY) {
    warnings.push("YOUTUBE_API_KEY missing — video enrichment will fail");
  }
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    warnings.push("GOOGLE_PLACES_API_KEY missing — nearby places will fail");
  }

  return { missing, warnings };
}

async function start() {
  const { missing, warnings } = validateEnv();
  warnings.forEach((w) => console.warn("⚠️ ", w));

  if (missing.length > 0 && process.env.NODE_ENV === "production") {
    console.error("❌ Missing required environment variables:", missing.join(", "));
    process.exit(1);
  }

  if (missing.includes("MONGO_URI") || process.env.MONGO_URI === "memory") {
    console.error(
      "❌ Valid MONGO_URI is required. Set a MongoDB Atlas or local Mongo connection string."
    );
    if (process.env.NODE_ENV === "production") process.exit(1);
  }

  const app = express();
  const PORT = process.env.PORT || 5000;

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

  app.get("/", (_req, res) => {
    res.json({
      success: true,
      service: "roamsmart-backend",
      message: "Server is running",
    });
  });

  const healthRoutes = require("./routes/healthRoutes");
  const placesRoutes = require("./routes/placesRoutes");
  const planRoutes = require("./routes/planRoutes");
  const aiRoutes = require("./routes/aiRoutes");
  const videoAssistant = require("./routes/videoAssistant");
  const routeRoutes = require("./routes/routeRoutes");
  const errorHandler = require("./middleware/errorHandler");

  app.use("/api", healthRoutes);
  app.use("/api", placesRoutes);
  app.use("/api/plan", planRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api/videos", videoAssistant);
  app.use("/api/route", routeRoutes);

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
  });

  app.use(errorHandler);

  const mongoUri = process.env.MONGO_URI;
  if (mongoUri && mongoUri !== "memory") {
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log("✅ MongoDB connected");
    } catch (err) {
      console.error("❌ MongoDB connection failed:", err.message);
      if (process.env.NODE_ENV === "production") {
        process.exit(1);
      }
      console.warn("⚠️  Continuing without MongoDB (development only)");
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log("-------------------------------------------");
    console.log("🚀 ROAMSMART BACKEND IS LIVE");
    console.log(`📡 PORT: ${PORT}`);
    console.log(`🔗 HEALTH: http://localhost:${PORT}/api/health`);
    console.log(`🔗 READY:  http://localhost:${PORT}/api/ready`);
    console.log("-------------------------------------------");
  });
}

start().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
