function filterPlacesByWeather(places, weather) {
  if (weather === "rain") {
    return places.filter((p) => p.category !== "Nature");
  }

  return places;
}

module.exports = filterPlacesByWeather;
