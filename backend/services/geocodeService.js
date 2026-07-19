const axios = require("axios");

/**
 * Geocode a zip code or address to lat/lng using Google Geocoding API.
 * @param {string} zipOrAddress - Zip code (e.g. "07094") or full address
 * @returns {{ lat: number, lng: number, formattedAddress: string }}
 */
exports.geocode = async (zipOrAddress) => {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_PLACES_API_KEY not set");

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    zipOrAddress
  )}&key=${apiKey}`;

  const { data } = await axios.get(url);
  if (data.status !== "OK" || !data.results?.length) {
    throw new Error("Address or zip not found");
  }

  const loc = data.results[0].geometry.location;
  return {
    lat: loc.lat,
    lng: loc.lng,
    formattedAddress: data.results[0].formatted_address,
  };
};
