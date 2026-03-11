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

export const fetchNearbyPlaces = async (
  lat: number,
  lng: number,
  type?: string | null
) => {

  const response = await api.get("/google-nearby", {
    params: {
      lat,
      lng,
      ...(type ? { type } : {})
    }
  });

  return response.data;
};