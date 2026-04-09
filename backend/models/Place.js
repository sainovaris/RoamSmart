const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema({
  place_id: {
    type: String,
    unique: true,
    sparse: true,
  },

  name: String,
  rating: Number,
  total_ratings: Number,
  address: String,
  types: [String],

  category: String,
  subcategory: String,

  is_open: Boolean,

  photo: String,
  photo_reference: String,

  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [lng, lat]
    },
  },

  // ✅ NEW CLEAN AI FIELD
  ai_details: {
    overview: String,
    highlights: [String],
    best_time_to_visit: String,
    travel_tips: String,
    recommended_duration: String,
    booking_required: Boolean,
    generated_at: Date,
  },

  source: {
    type: String,
    default: "google",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes
placeSchema.index({ location: "2dsphere" });
placeSchema.index({ place_id: 1 });

module.exports = mongoose.models.Place || mongoose.model("Place", placeSchema);
