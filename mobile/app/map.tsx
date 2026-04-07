import { useEffect, useState, useRef} from "react";
import { View, ActivityIndicator, Text } from "react-native";
import MapView from "react-native-maps";
import PlanOwnButton from "@/components/PlanOwnButton";
import { useRouter } from "expo-router";

import useCurrentLocation from "@/hooks/useCurrentLocation";
import useTripPlanner from "@/hooks/useTripPlanner";
import usePlaces from "@/hooks/usePlaces";
import useAI from "@/hooks/useAI";

import PlanButton from "@/components/PlanButton";
import CategoryPicker from "@/components/CategoryPicker";
import MapMarkers from "@/components/MapMarkers";
import HorizontalPlacesList from "@/components/HorizontalPlacesList";
import ItineraryCard from "@/components/ItineraryCard";
import PlaceDetailsCard from "@/components/PlaceDetailsCard";
import { Place } from "@/types/place";

// const BASE_API_URL = `http://${process.env.EXPO_PUBLIC_IPV4_ADDR}:5000/api`;
const BASE_API_URL = `${process.env.EXPO_PUBLIC_BACK}api`;

export default function Map() {

  console.log("API URL at MAP.tsx:", BASE_API_URL);
  const mapRef = useRef<MapView | null>(null);
  const router = useRouter();
  
  const { location, error } = useCurrentLocation();

  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { places, loading, fetchPlaces } = usePlaces();
  const { itinerary, planLoading, generateTrip, setItinerary } = useTripPlanner();
  const { aiDetails, aiLoading, fetchAIDetails, setAiDetails } = useAI();


  // ---------------- FETCH PLACES ----------------
  useEffect(() => {
    if (location) {
      fetchPlaces(location.latitude, location.longitude, selectedCategory);
    }
  }, [location, selectedCategory, fetchPlaces]);

  // ---------------- AI DETAILS ----------------
  useEffect(() => {
    setAiDetails(null);
  }, [selectedPlace, setAiDetails]);

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
      <View className="absolute top-12 left-4 right-4 z-50 space-y-3 bg-white/70 p-3 rounded-xl">

        <CategoryPicker
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />


        <View className="flex-row justify-between">

          <View className="flex-1 mr-2">
            <PlanButton
              loading={planLoading}
              onPress={() =>
                location &&
                generateTrip(location.latitude, location.longitude)
              }
            />
          </View>

          {/* Custom Plan */}
          <View className="flex-1 ml-2">
            <PlanOwnButton
              onPress={() => {
                console.log("➡️ Navigating to Plan Form");
                console.log("📦 Places passed:", places.length);

                router.push({
                  pathname: "/plan-form",
                  params: {
                    places: JSON.stringify(places),
                  },
                })
              }}
            />
          </View>

        </View>

        <ItineraryCard
          itinerary={itinerary}
          onClear={() => setItinerary([])}
        />

      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        mapPadding={{ top: 0, bottom: 0, left: 0, right: 0 }}
        showsUserLocation
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >

        <MapMarkers
          places={places}
          selectedPlace={selectedPlace}
          setSelectedPlace={setSelectedPlace}
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