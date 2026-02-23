const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true }, // e.g., 'Restaurant', 'Historic', 'Park'
    rating: { type: Number, min: 0, max: 5 },
    open_now: { type: Boolean, default: true },
    address: String,
    location: {
      type: { type: String, default: "Point" },
      coordinates: [Number],
    },
  },
  { timestamps: true },
);

// This makes geospatial searches possible (needed for Day 5)
placeSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Place", placeSchema);
