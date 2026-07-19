import { useState, useCallback } from "react"
import { fetchNearbyPlaces } from "@/services/placesService"
import { calculateDistance } from "@/utils/distance"
import { Place } from "@/types/place"

export default function usePlaces(setServerDown?: (v: boolean) => void){

  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPlaces = useCallback(
    async (latitude: number, longitude: number, category: string) => {

      try {

        setLoading(true)
        setError(null)
        setServerDown?.(false)

        const response = await fetchNearbyPlaces(
          latitude,
          longitude,
          category
        )

        const raw = response?.results || response?.data || response?.places || []

        const formatted: Place[] =
          raw
            .filter((p: any) => p.location?.lat !== undefined && p.location?.lng !== undefined)
            .map((p: any) => {

              const lat = p.location.lat
              const lng = p.location.lng

              return {
                id: p._id || p.place_id,
                place_id: p.place_id,
                name: p.name,
                rating: p.rating || 0,
                type: p.category || "Place",
                open_now: p.is_open,
                latitude: lat,
                longitude: lng,
                distance: calculateDistance(
                  latitude,
                  longitude,
                  lat,
                  lng
                )
              }

            })

        setPlaces(formatted)

      } catch (err: any) {
        console.log("❌ Places API error:", err?.message);
        setPlaces([])
        setError(err?.message || "Failed to load places")

        if (
          !err.response ||
          err.code === "ECONNABORTED" ||
          err.message?.includes("Network Error") ||
          err.response?.status >= 500
        ) {
          setServerDown?.(true);
        }
      }
      finally {
        setLoading(false)
      }

    }, [setServerDown])

  return { places, loading, error, fetchPlaces }
}
