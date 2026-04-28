exports.removeClosedPlaces = (places) => {
  return places.filter((p) => p.opening_hours?.open_now !== false);
};
