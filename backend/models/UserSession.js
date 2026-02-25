const mongoose = require("mongoose");

const UserSessionSchema = new mongoose.Schema({
  userId: String,
  currentItinerary: [
    {
      placeId: String,
      name: String,
      scheduledTime: String,
      status: {
        type: String,
        enum: ["pending", "visited", "skipped"],
        default: "pending",
      },
    },
  ],
  lastLocation: {
    lat: Number,
    lng: Number,
  },
});

module.exports = mongoose.model("UserSession", UserSessionSchema);
