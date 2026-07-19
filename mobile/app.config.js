const appJson = require("./app.json");

/** @type {import('expo/config').ExpoConfig} */
module.exports = ({ config }) => {
  const base = appJson.expo;
  const mapsKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  return {
    ...config,
    ...base,
    android: {
      ...base.android,
      config: {
        ...(base.android?.config || {}),
        googleMaps: {
          apiKey:
            mapsKey ||
            base.android?.config?.googleMaps?.apiKey ||
            "",
        },
      },
    },
  };
};
