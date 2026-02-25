const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const mongoose = require("mongoose");

const morgan = require('morgan');
app.use(morgan('dev')); // This prints every request to your terminal
// This line reads the URI from your .env file
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

const healthRoutes = require("./routes/healthRoutes");
const placesRoutes = require("./routes/placesRoutes");
const planRoutes = require("./routes/planRoutes");
const aiRoutes = require("./routes/aiRoutes");

app.use("/api/ai", aiRoutes);
app.use("/api/plan", planRoutes);
app.get("/", (req, res) => {
  res.send("Server is running perfectly!");
});


app.use("/api", healthRoutes);
app.use("/api", placesRoutes);


// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("Internal Server Error:", err.stack);
    res.status(500).json({
        success: false,
        message: "Something went wrong on the server!",
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

app.listen(PORT, () => {
  console.log(`-------------------------------------------`);
  console.log(`🚀 ROAMSMART BACKEND IS LIVE`);
  console.log(`📡 PORT: ${PORT}`);
  console.log(`🔗 HEALTH: http://localhost:${PORT}/api/health`);
  console.log(`🔗 PLACES: http://localhost:${PORT}/api/places`);
  console.log(`-------------------------------------------`);
});
