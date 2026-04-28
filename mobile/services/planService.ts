import { api } from "./api";

type GeneratePlanPayload = {
  lat: number;
  lng: number;
  duration: number;
  categories: string[];
  placeIds: string[];
};

export const generatePlan = async ({
  lat,
  lng,
  duration,
  placeIds,
}: GeneratePlanPayload) => {
  const response = await api.post("/plan/custom", {
    lat,
    lng,
    totalTimeHours: duration,
    place_ids: placeIds,
  });

  console.log("Plan generation response:", response.data);
  return response.data;
};