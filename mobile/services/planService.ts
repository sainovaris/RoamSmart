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

  console.log("----\nRequesting at: ", api.defaults.baseURL + '/plan/custom' + '\n----------')
  console.log("Plan generation response:", response.data);
  return response.data;
};

type SmartPlanPayload = {
  lat?: number;
  lng?: number;
  zip?: string;
  hours: number;
};

/**
 * Adapter for the legacy /plan screen. The backend currently accepts
 * coordinates only; ZIP geocoding should be added as a separate API endpoint.
 */
export const generateSmartPlan = async ({
  lat,
  lng,
  zip,
  hours,
}: SmartPlanPayload) => {
  if (zip) {
    throw new Error("ZIP search is not available yet. Use your current location.");
  }

  if (lat === undefined || lng === undefined) {
    throw new Error("Location coordinates are required.");
  }

  const response = await api.post("/plan/generate-plan", {
    lat,
    lng,
    totalTimeHours: hours,
  });

  return {
    steps: response.data.plan ?? [],
    center: { lat, lng },
    hours: response.data.totalTimeHours ?? hours,
  };
};