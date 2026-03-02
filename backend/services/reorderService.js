const { getDistanceKm } = require("../utils/distanceCalc");

exports.reorderPlaces = (places, userLat, userLng) => {
  return places.sort((a, b) => {
    const d1 = getDistanceKm(userLat, userLng, a.location.lat, a.location.lng);

    const d2 = getDistanceKm(userLat, userLng, b.location.lat, b.location.lng);

    return d1 - d2;
  });
};
