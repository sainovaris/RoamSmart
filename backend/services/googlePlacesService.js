const axios = require("axios");

exports.fetchNearbyFromGoogle = async (lat, lng, type, radius = 5000) => {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const searchType = type || "tourist_attraction";

  // We use keyword and location to ensure we get results even if 'type' is strict
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=${searchType}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    console.log("Google API Status:", response.data.status); // Check your VS Code terminal for this!
    return response.data.results;
  } catch (error) {
    console.error("Axios Error:", error.message);
    throw error;
  }
};
// Helper to turn a photo_reference into a real URL
exports.getPhotoUrl = (photoReference) => {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  // maxwidth=400 keeps the image size optimized for mobile
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${apiKey}`;
};
