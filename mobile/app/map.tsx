import { useEffect, useState, useRef, useCallback } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import MapView from "react-native-maps";
import axios from "axios";

import useCurrentLocation from "@/hooks/useCurrentLocation";
import useTripPlanner from "@/hooks/useTripPlanner";

import PlanButton from "@/components/PlanButton";
import CategoryPicker from "@/components/CategoryPicker";
import MapMarkers from "@/components/MapMarkers";
import HorizontalPlacesList from "@/components/HorizontalPlacesList";
import ItineraryCard from "@/components/ItineraryCard";
import PlaceDetailsCard from "@/components/PlaceDetailsCard";

import { fetchNearbyPlaces } from "@/services/placesService";
import { api } from "@/services/api";

import { calculateDistance } from "@/utils/distance";
import { Place, AIDetails } from "@/types/place";

const BASE_API_URL = `http://${process.env.EXPO_PUBLIC_IPV4_ADDR}:5000/api`;

export default function Map() {

  console.log("API URL:", BASE_API_URL);
  const mapRef = useRef<MapView | null>(null);

  const { location, error } = useCurrentLocation();

  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [aiDetails, setAiDetails] = useState<AIDetails | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const { itinerary, planLoading, generateTrip } = useTripPlanner();

  const [loading, setLoading] = useState(true);

  // ---------------- FETCH PLACES ----------------
  const fetchPlaces = useCallback(async () => {

    if (!location) return;

    try {

      setLoading(true);

      const response = await fetchNearbyPlaces(
        location.latitude,
        location.longitude,
        selectedCategory
      );

      const formatted: Place[] = response.results
        .filter((place: any) => place.location?.lat && place.location?.lng)
        .map((place: any) => {

          const lat = place.location.lat;
          const lng = place.location.lng;

          return {
            id: place.place_id,
            name: place.name,
            rating: place.rating || 0,
            type: place.category || "Place",
            open_now: place.is_open,
            latitude: lat,
            longitude: lng,
            distance: calculateDistance(
              location.latitude,
              location.longitude,
              lat,
              lng
            ),
          };

        });

      setPlaces(formatted);
      if (formatted.length > 0) {
        console.log("First place:", formatted[0]);
      }
    } catch (err) {

      console.log("Fetch places error:", err);

    } finally {

      setLoading(false);

    }

  }, [location, selectedCategory]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  // ---------------- AI DETAILS ----------------
  const fetchAIDetails = async (placeId: string) => {

    try {
      setAiLoading(true);
      setAiDetails(null);

      const response = await api.get(`/ai/${placeId}`);

      if (response.data.success) {
        setAiDetails(response.data.data);
      }

      console.log("AI Details for place:", response.data.data);
    } catch (error) {
      console.log("AI error:", error);
    } finally {
      setAiLoading(false);
    }

  };

  // ---------------- PLACE DETAILS ----------------
  const fetchPlaceDetails = async (placeId: string) => {

    try {

      const response = await axios.get(
        `${BASE_API_URL}/place-details/${placeId}`
      );

      console.log("Place Details:", response.data);

    } catch (err) {

      console.log("Details error:", err);

    }

  };

  // ---------------- LOADING ----------------
  if (loading || !location) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // ---------------- ERROR ----------------
  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>{error}</Text>
      </View>
    );
  }

  // ---------------- UI ----------------
  return (

    <View className="flex-1">

      {/* Top UI Overlay */}
      <View className="absolute top-3 left-4 right-4 z-50 space-y-3 bg-white/90 p-3 rounded-xl">

        <CategoryPicker
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        <PlanButton
          loading={planLoading}
          onPress={() =>
            location &&
            generateTrip(location.latitude, location.longitude)
          }
        />

        <ItineraryCard itinerary={itinerary} />

      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        mapPadding={{ top: 160, bottom: 200, left: 0, right: 0 }}
        showsUserLocation
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >

        <MapMarkers
          places={places}
          selectedPlace={selectedPlace}
          setSelectedPlace={setSelectedPlace}
          fetchPlaceDetails={fetchPlaceDetails}
          fetchAIDetails={fetchAIDetails}
        />

      </MapView>

      {/* Bottom horizontal cards */}
      <HorizontalPlacesList
        places={places}
        mapRef={mapRef}
        setSelectedPlace={setSelectedPlace}
        fetchAIDetails={fetchAIDetails}
      />

      {/* Bottom AI details card */}
      <PlaceDetailsCard
        selectedPlace={selectedPlace}
        aiDetails={aiDetails}
        aiLoading={aiLoading}
        setSelectedPlace={setSelectedPlace}
        setAiDetails={setAiDetails}
      />

    </View>
  );
}