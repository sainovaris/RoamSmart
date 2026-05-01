import { api } from "./api";

export const getNearbyPlaces = async (lat: number, lng: number) => {
  const response = await api.get("/nearby", {
    params: {
      lat: lat,
      lng: lng,
    },
  });

  console.log("----\nRequesting at: ", api.defaults.baseURL + '/nearby' + '\n---------')
  console.log("Nearby places response count:", response.data["count"]);
  return response.data;
};

export const fetchNearbyPlaces = async (
  lat: number,
  lng: number,
  category?: string
) => {

  const response = await api.get("/google-nearby", {
    params: {
      lat,
      lng,
      ...(category && category !== "All" && { category })
    }
  });

  console.log("----\nRequesting at: ", api.defaults.baseURL + '/google-nearby' + '\n----------')
  console.log(`Google Nearby places response count for ${category}: ${response.data["count"]}`);
  return response.data;
};