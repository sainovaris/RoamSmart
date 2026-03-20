const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema({
  place_id: {
    type: String,
    unique: true,
    sparse: true, // 🔥 VERY IMPORTANT
  },
  name: String,
  rating: Number,
  total_ratings: Number,
  address: String,
  types: [String],
  category: String,
  subcategory: String,
  is_open: String,
  photo: String,

  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true,
    },
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  summary: {
    type: String,
  },

  description: {
    type: String,
  },

  history: {
    type: String,
  },
});

// Required for geo search
placeSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Place", placeSchema);
