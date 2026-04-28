const axios = require("axios");

exports.getLocationInfo = async (lat, lng) => {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    const res = await axios.get(
      "https://maps.googleapis.com/maps/api/geocode/json",
      {
        params: {
          latlng: `${lat},${lng}`,
          key: apiKey,
        },
      }
    );
    
    const results = res.data.results;
    console.log("🌍 FULL GEOCODE RESPONSE:", res.data.results[0]);
    
    const address = results[0].formatted_address;
    console.log("📍 Address:", address);
    
    if (!results || results.length === 0) {
      return { city: "", country: "" };
    }

    const components = results[0].address_components;

    let city = "";
    let country = "";

    for (const comp of components) {
      // ✅ priority order for city
      if (comp.types.includes("locality")) {
        city = comp.long_name;
      } else if (!city && comp.types.includes("sublocality_level_1")) {
        city = comp.long_name;
      } else if (!city && comp.types.includes("administrative_area_level_2")) {
        city = comp.long_name;
      }

      if (comp.types.includes("country")) {
        country = comp.long_name;
      }
    }

    // 🔥 FINAL FALLBACK
    if (!city) {
      const formatted = results[0].formatted_address;
      city = formatted.split(",")[0];
    }

    console.log("📍 User Location:", city, country);

    return { city, country };

  } catch (err) {
    console.log("❌ Geocode error:", err?.response?.data || err.message);
    return { city: "", country: "" };
  }
};