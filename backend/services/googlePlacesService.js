const axios = require("axios");

// Maps our category names to Google Places keyword
const categoryToKeyword = {
  food: "restaurant",
  entertainment: "entertainment",
  culture: "tourist attraction",
  nature: "park",
  stay: "hotel",
  shopping: "shopping mall",
  wellness: "spa",
};

exports.fetchNearbyFromGoogle = async (lat, lng, type, radius = 5000) => {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  // If type is an array of categories (from planController),
  // map to Google-friendly keywords and make one call per category
  if (Array.isArray(type) && type.length > 0) {
    const allPlaces = [];
    const seenIds = new Set();

    for (const cat of type) {
      const keyword = categoryToKeyword[cat.toLowerCase()] || cat;

      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=${encodeURIComponent(keyword)}&key=${apiKey}`;

      try {
        const response = await axios.get(url);
        console.log(
          `Google API Status for "${keyword}":`,
          response.data.status,
        );

        const places = response.data.results.map((place) => ({
          place_id: place.place_id || null,
          name: place.name,
          rating: place.rating || 0,
          user_ratings_total: place.user_ratings_total || 0,
          types: place.types || [],
          is_open: place.opening_hours?.open_now ?? "Unknown",
          location: {
            lat: place.geometry?.location?.lat || null,
            lng: place.geometry?.location?.lng || null,
          },
          address: place.vicinity || "",
          photo:
            place.photos && place.photos.length > 0
              ? exports.getPhotoUrl(place.photos[0].photo_reference)
              : null,
        }));

        // Deduplicate across categories
        for (const place of places) {
          if (place.place_id && !seenIds.has(place.place_id)) {
            seenIds.add(place.place_id);
            allPlaces.push(place);
          }
        }
      } catch (err) {
        console.error(
          `Google API error for keyword "${keyword}":`,
          err.message,
        );
      }
    }

    console.log("Returning total no of places from Google:", allPlaces.length);
    return allPlaces;
  }

  // Single type/keyword call (used by restaurantController, placesController etc.)
  const searchType = type || "tourist_attraction";
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=${encodeURIComponent(searchType)}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    console.log("Google API Status:", response.data.status);

    const places = response.data.results.slice(0, 25).map((place) => ({
      place_id: place.place_id || null,
      name: place.name,
      rating: place.rating || 0,
      user_ratings_total: place.user_ratings_total || 0,
      types: place.types || [],
      is_open: place.opening_hours?.open_now ?? "Unknown",
      location: {
        lat: place.geometry?.location?.lat || null,
        lng: place.geometry?.location?.lng || null,
      },
      address: place.vicinity || "",
      photo:
        place.photos && place.photos.length > 0
          ? exports.getPhotoUrl(place.photos[0].photo_reference)
          : null,
    }));

    console.log("Returning total no of places from Google:", places.length);
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

exports.getPhotoUrl = (photoReference) => {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${apiKey}`;
};
