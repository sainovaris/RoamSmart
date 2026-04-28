const axios = require("axios");

exports.getOptimizedRoute = async (origin, places) => {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    throw new Error("❌ API KEY missing");
  }

  if (!origin || !places || places.length === 0) {
    throw new Error("Invalid route input");
  }

  // ✅ destination = last place
  const destination = places[places.length - 1];

  // ✅ exclude last from waypoints
  const waypoints = places
    .slice(0, -1)
    .map((p) => `${p.lat},${p.lng}`)
    .join("|");

  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&waypoints=optimize:true|${encodeURIComponent(
    waypoints
  )}&key=${apiKey}`;

  console.log("📡 Directions URL:", url);

  const response = await axios.get(url);

  console.log("📡 STATUS:", response.data.status);

  if (response.data.status !== "OK") {
    console.error("❌ ERROR:", response.data.error_message);
    throw new Error("Failed to fetch route");
  }

  const route = response.data.routes[0];

  return {
    polyline: route.overview_polyline.points,
    legs: route.legs,
    waypoint_order: route.waypoint_order,
  };
};