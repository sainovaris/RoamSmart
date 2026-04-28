import { useState } from "react";
import { generatePlan } from "@/services/planService";
import { useTrip } from "@/context/TripContext";

export default function useTripPlanner() {
  const [planLoading, setPlanLoading] = useState(false);

  const { setTrip } = useTrip(); // 🔥 GLOBAL

  
  const generateTrip = async (
    lat: number,
    lng: number,
    data: {
      placeIds: string[];
      categories: string[];
      duration: number;
    }
  ) => {
    try {
      setPlanLoading(true);

      const response = await generatePlan({
        lat,
        lng,
        duration: data.duration,
        categories: data.categories,
        placeIds: data.placeIds,
      });

      
      if (response.success) {
        // 🔥 PUSH INTO GLOBAL CONTEXT
        setTrip({
          itinerary: response.plan,
          summary: response.summary || "",
        });
      }

      console.log("Plan data:", response.plan);
    } catch (err) {
      console.log("Plan error:", err);
    } finally {
      setPlanLoading(false);
    }
  };

  return {
    planLoading,
    generateTrip,
  };
}