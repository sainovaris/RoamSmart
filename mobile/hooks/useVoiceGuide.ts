import { useEffect, useRef } from "react";
import * as Speech from "expo-speech";
import { calculateDistance } from "@/utils/distance";
import { useTrip } from "@/context/TripContext";

type LocationCoords = {
  latitude: number;
  longitude: number;
};

export default function useVoiceGuide(location: LocationCoords | null) {
  const { itinerary, currentStepIndex, nextStep, isNavigating } = useTrip();

  const spokenRef = useRef<Set<number>>(new Set());
  const speakingRef = useRef(false);

  useEffect(() => {
    if (!isNavigating) return;
    if (!location || itinerary.length === 0) return;

    const current = itinerary[currentStepIndex];

    if (
      current?.latitude == null ||
      current?.longitude == null ||
      location.latitude == null ||
      location.longitude == null
    ) {
      return;
    }

    const dist = calculateDistance(
      location.latitude,
      location.longitude,
      current.latitude,
      current.longitude
    );

    // 🎯 ~30 meters
    if (dist < 0.03 && !spokenRef.current.has(currentStepIndex)) {
      if (speakingRef.current) return;

      speakingRef.current = true;

      const message = `You have arrived at ${current.name}. ${
        current.ai_details?.overview || ""
      }`;

      Speech.speak(message, {
        onDone: () => {
          speakingRef.current = false;
          spokenRef.current.add(currentStepIndex);
          nextStep();
        },
        onStopped: () => {
          speakingRef.current = false;
        },
        onError: () => {
          speakingRef.current = false;
        },
      });
    }
  }, [location, currentStepIndex, itinerary, nextStep, isNavigating]);

  // 🧹 Cleanup when unmount / navigation stops
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);
}