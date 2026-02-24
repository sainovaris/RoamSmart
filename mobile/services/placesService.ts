import { api } from "./api";

export const getNearbyPlaces = async (lat: number, lng: number) => {
  const response = await api.get("/nearby", {
    params: {
      lat: lat,
      lng: lng,
    },
  });

  return response.data;
};