const Place = require("../models/Place");

exports.fetchNearbyPlaces = async (lat, lng, maxDistance = 15000) => {
  if (!lat || !lng) {
    throw new Error("lat and lng are required");
  }

  const places = await Place.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        $maxDistance: maxDistance,
      },
    },
  });

  return places;
};
