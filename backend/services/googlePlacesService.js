const axios = require("axios");

exports.fetchNearbyFromGoogle = async (lat, lng, type, radius = 5000) => {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const searchType = type || "tourist_attraction";

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=${searchType}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    console.log("Google API Status:", response.data.status);

    const places = response.data.results.map((place) => ({
      name: place.name,
      rating: place.rating || 0,
      total_ratings: place.user_ratings_total || 0,
      types: place.types || [],

      is_open: place.opening_hours ? place.opening_hours.open_now : true,

      location: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
      },

      address: place.vicinity || "",

      photo:
        place.photos && place.photos.length > 0
          ? this.getPhotoUrl(place.photos[0].photo_reference)
          : null,
    }));

    return places;
  } catch (error) {
    console.error("Axios Error:", error.message);
    throw error;
  }
};

exports.getPlaceDetailsFromGoogle = async (placeId) => {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,formatted_address,formatted_phone_number,opening_hours,photos,website,reviews,geometry&key=${apiKey}`;

  try {
    const response = await axios.get(url);

    console.log("Google Details API Status:", response.data.status);

    if (response.data.status !== "OK") {
      return null;
    }

    return response.data.result;
  } catch (error) {
    console.error("Google Details API Error:", error.message);
    throw error;
  }
};

// Helper to turn photo_reference into real URL
exports.getPhotoUrl = (photoReference) => {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${apiKey}`;
};
