const Place = require("../models/Place");

exports.fetchNearbyPlaces = async (lat, lng) => {
  const places = await Place.find();

  return places;
};
