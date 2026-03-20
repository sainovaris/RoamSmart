const axios = require("axios");

exports.fetchNearbyFromGoogle = async (lat, lng, type, radius = 5000) => {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const searchType = type || "tourist_attraction";

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=${searchType}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    console.log("Google API Status:", response.data.status);

    const places = response.data.results
      .slice(0, 10) // ✅ LIMIT RESULTS
      .map((place) => ({
        place_id: place.place_id || null, // ✅ SAFE

        name: place.name,
        rating: place.rating || 0,
        user_ratings_total: place.user_ratings_total || 0,
        types: place.types || [],

        is_open: place.opening_hours?.open_now ?? "Unknown", // ✅ FIXED

        location: {
          lat: place.geometry?.location?.lat || null,
          lng: place.geometry?.location?.lng || null,
        },

        address: place.vicinity || "",

        photo:
          place.photos && place.photos.length > 0
            ? exports.getPhotoUrl(place.photos[0].photo_reference) // ✅ FIXED
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
