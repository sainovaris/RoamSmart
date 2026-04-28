const axios = require("axios");

// ✅ VALID Google Place types mapping
const categoryToType = {
  food: "restaurant",
  entertainment: "amusement_park",
  culture: "tourist_attraction",
  nature: "park",
  stay: "lodging",
  shopping: "shopping_mall",
  wellness: "spa",
};

const MAX_PER_CATEGORY = 10;

const GOOGLE_BASE = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";

// 🔁 Helper to fetch one page
async function fetchPage(url) {
  const response = await axios.get(url);
  return response.data;
}

// 🔁 Fetch multiple pages (max 3 pages = ~60 results)
async function fetchWithPagination(baseUrl) {
  let allResults = [];
  let nextPageToken = null;

  for (let i = 0; i < 3; i++) {
    let url = baseUrl;

    if (nextPageToken) {
      url += `&pagetoken=${nextPageToken}`;
      await new Promise((r) => setTimeout(r, 2000)); // required delay
    }

    const data = await fetchPage(url);

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.log("Google API Status:", data.status);
      break;
    }

    allResults = [...allResults, ...(data.results || [])];

    if (!data.next_page_token) break;
    nextPageToken = data.next_page_token;
  }

  return allResults;
}

// =============================
// MAIN FUNCTION
// =============================
exports.fetchNearbyFromGoogle = async (lat, lng, type, radius = 10000) => {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  const seenIds = new Set();
  let allPlaces = [];

  // =============================
  // MULTI CATEGORY CASE
  // =============================
  if (Array.isArray(type) && type.length > 0) {
    for (const cat of type) {
      const mappedType = categoryToType[cat.toLowerCase()] || "tourist_attraction";

      const url = `${GOOGLE_BASE}?location=${lat},${lng}&radius=${radius}&type=${mappedType}&key=${apiKey}`;

      try {
        let results = await fetchWithPagination(url);

        // 🔥 limit per category (IMPORTANT)
        const MAX_PER_CATEGORY = 10;
        results = results.slice(0, MAX_PER_CATEGORY);

        console.log(`Google API (${mappedType}) →`, results.length);

        for (const place of results) {
          if (!place.place_id || seenIds.has(place.place_id)) continue;

          seenIds.add(place.place_id);

          allPlaces.push({
            place_id: place.place_id,
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
          });
        }
      } catch (err) {
        console.error(`Google API error (${mappedType}):`, err.message);
      }
    }

    console.log("✅ Total merged places:", allPlaces.length);
    return allPlaces;
  }

  // =============================
  // SINGLE TYPE CASE
  // =============================
  const mappedType =
    categoryToType[type?.toLowerCase()] || "tourist_attraction";

  const url = `${GOOGLE_BASE}?location=${lat},${lng}&radius=${radius}&type=${mappedType}&key=${apiKey}`;

  try {
    const results = await fetchWithPagination(url);

    console.log("Google API (single) →", results.length);

    return results.map((place) => ({
      place_id: place.place_id,
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
  } catch (error) {
    console.error("Google API Error:", error.message);
    throw error;
  }
};

// =============================
// PLACE DETAILS
// =============================
exports.getPlaceDetailsFromGoogle = async (placeId) => {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,formatted_address,opening_hours,photos,geometry,types,user_ratings_total&key=${apiKey}`;

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

// =============================
// PHOTO
// =============================
exports.getPhotoUrl = (photoReference) => {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${apiKey}`;
};