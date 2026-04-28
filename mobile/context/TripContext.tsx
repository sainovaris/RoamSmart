import React, { createContext, useContext, useState } from "react";
import { ItineraryItem } from "@/types/place";

type TripContextType = {
  itinerary: ItineraryItem[];
  summary: string;
  currentStepIndex: number;
  isNavigating: boolean;

  setTrip: (data: {
    itinerary: unknown[]; // 🔥 accept raw data
    summary: string;
  }) => void;

  startNavigation: () => void;
  stopNavigation: () => void;
  nextStep: () => void;
  resetTrip: () => void;

  routeCoords: any[];
  setRouteCoords: (coords: any[]) => void;
  
};

const TripContext = createContext<TripContextType | null>(null);



export const TripProvider = ({ children }: { children: React.ReactNode }) => {
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
  const [summary, setSummary] = useState("");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [routeCoords, setRouteCoords] = useState<any[]>([]);

  const resetTrip = () => {
    setItinerary([]);
    setSummary("");
    setCurrentStepIndex(0);
    setIsNavigating(false);
    setRouteCoords([]); // 🔥 IMPORTANT ADD
  };

  // 🔥 Normalize backend data → strict ItineraryItem
  const normalizeItinerary = (data: any[]): ItineraryItem[] => {
    return data.map((item, index) => ({
      place_id: item.place_id || "", // ✅ ADD THIS
      id: `itinerary-${index}`,
      name: item.name || "Unknown",

      category: item.category || "Place",
      subcategory: item.subcategory || "",

      duration_minutes: item.duration_minutes || 60,

      visit_start: item.visit_start || new Date().toISOString(),
      visit_end: item.visit_end || new Date().toISOString(),

      latitude: item.latitude ?? null,
      longitude: item.longitude ?? null,

      ai_details: item.ai_details || null,
      videos: item.videos || [],
    }));
  };

  const setTrip = ({
    itinerary,
    summary,
  }: {
    itinerary: any[];
    summary: string;
  }) => {
    const cleaned = normalizeItinerary(itinerary);

    setItinerary(cleaned);
    setSummary(summary);
    setCurrentStepIndex(0);
  };

  const startNavigation = () => {
  if (!itinerary.length) {
    console.log("❌ Cannot start navigation: empty itinerary");
    return;
  }
  setIsNavigating(true);
};
  const stopNavigation = () => setIsNavigating(false);

  const nextStep = () => {
    setCurrentStepIndex((prev) =>
      prev < itinerary.length - 1 ? prev + 1 : prev
    );
  };

  return (
    <TripContext.Provider
      value={{
        itinerary,
        summary,
        currentStepIndex,
        isNavigating,
        setTrip,
        startNavigation,
        stopNavigation,
        nextStep,
        routeCoords,
        setRouteCoords,
        resetTrip,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error("useTrip must be used inside TripProvider");
  return ctx;
};