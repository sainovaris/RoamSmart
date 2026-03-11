import { api } from "./api";

export const generatePlan = async (
  lat: number,
  lng: number,
  duration: number
) => {
  const response = await api.post("/plan/generate-plan", {
    lat,
    lng,
    duration,
  });

  return response.data;
};