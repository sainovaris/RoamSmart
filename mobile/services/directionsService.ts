import axios from "axios";
import { api } from "./api";

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

export const getRoute = async (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
) => {
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&key=${GOOGLE_API_KEY}`;

  const res = await axios.get(url);

  if (res.data.routes.length === 0) return [];

  return res.data.routes[0].overview_polyline.points;
};


export const getRouteFromBackend = async (origin: any, places: any[]) => {
  const res = await api.post("/route", {
    origin,
    places,
  });

  console.log("----\nRequesting at: ", api.defaults.baseURL + '/route' + '\n----')

  return res.data.data;
};