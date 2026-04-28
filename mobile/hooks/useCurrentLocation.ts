import { useState, useEffect } from "react";
import * as Location from "expo-location";
import type { LocationObjectCoords } from "expo-location";

export default function useCurrentLocation() {
  const [location, setLocation] = useState<LocationObjectCoords | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      console.log("📍 Requesting location...");

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      console.log("📍 Permission:", status);

      if (status !== "granted") {
        setError("Location permission denied");
        return;
      }

      try {
        const last = await Location.getLastKnownPositionAsync();
        if (last) {
          console.log("⚡ Using last known location");
          setLocation(last.coords);
        }

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        console.log("🎯 Accurate location fetched");
        setLocation(loc.coords);

      } catch (err: any) {
        console.log("❌ Location error:", err.message);
        setError("Failed to fetch location");
      }
    };

    load();
  }, []);

  return { location, error };
}