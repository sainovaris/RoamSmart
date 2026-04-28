import { useEffect, useState } from "react";
import { getRoute } from "@/services/directionsService";
import { decodePolyline } from "@/utils/decodePolyline";

type LatLng = {
  latitude: number;
  longitude: number;
};

type Point = {
  lat: number;
  lng: number;
};

export default function useRoute(
  origin: Point | null,
  destination: Point | null
) {
  const [coords, setCoords] = useState<LatLng[]>([]);

  useEffect(() => {
    if (!origin || !destination) {
      setCoords([]);
      return;
    }

    let isActive = true; // 🔒 prevent stale updates

    const fetchRoute = async () => {
      try {
        const polyline = await getRoute(origin, destination);
        if (!polyline) return;

        const decoded = decodePolyline(polyline);

        if (isActive) {
          setCoords(decoded);
        }
      } catch (err) {
        console.log("Route error:", err);
        if (isActive) setCoords([]);
      }
    };

    fetchRoute();

    return () => {
      isActive = false;
    };
  }, [origin?.lat, origin?.lng, destination?.lat, destination?.lng, destination, origin]);

  return coords;
}