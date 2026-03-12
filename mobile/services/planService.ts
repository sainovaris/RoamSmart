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

  console.log("Plan generation response:", response.data);
  return response.data;
};