const mongoose = require("mongoose");

const aiDetailsSchema = new mongoose.Schema(
  {
    overview: String,
    highlights: [String],
    best_time_to_visit: String,
    travel_tips: String,
    recommended_duration: String,
    booking_required: Boolean,
    generated_at: Date,
  },
  { _id: false }, // prevents nested _id
);

const placeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    rating: { type: Number, min: 0, max: 5 },
    open_now: { type: Boolean, default: true },
    address: String,

    location: {
      type: { type: String, default: "Point" },
      coordinates: {
        type: [Number],
        required: true,
      },
    },

    // 🔥 NEW AI CACHE FIELD
    ai_details: aiDetailsSchema,
  },
  { timestamps: true },
);

// Keep geo index
placeSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Place", placeSchema);
