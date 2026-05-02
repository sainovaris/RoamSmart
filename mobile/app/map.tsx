
import { useEffect, useState, useRef, useCallback } from "react";

import { View, ActivityIndicator, Text, Pressable, Modal, BackHandler } from "react-native";
import MapView from "react-native-maps";
import PlanOwnButton from "@/components/PlanOwnButton";
import { useRouter, useFocusEffect } from "expo-router"
  ;

import useCurrentLocation from "@/hooks/useCurrentLocation";
import usePlaces from "@/hooks/usePlaces";
import useAI from "@/hooks/useAI";

import CategoryPicker from "@/components/CategoryPicker";
import MapMarkers from "@/components/MapMarkers";
import HorizontalPlacesList from "@/components/HorizontalPlacesList";
import ItineraryCard from "@/components/ItineraryCard";
import PlaceDetailsCard from "@/components/PlaceDetailsCard";
import NavigationPlaceCard from "@/components/NavigationPlaceCard";

import { Place } from "@/types/place";

import { useTrip } from "@/context/TripContext";
import RoutePolyline from "@/components/RoutePolyline";
import useVoiceGuide from "@/hooks/useVoiceGuide";


// const BASE_API_URL = `http://${process.env.EXPO_PUBLIC_IPV4_ADDR}:5000/api`;
const BASE_API_URL = `${process.env.EXPO_PUBLIC_BACK}api`;


export default function Map() {

  const mapRef = useRef<MapView | null>(null);
  const router = useRouter();

  const { location, error } = useCurrentLocation();
  const { itinerary, isNavigating, routeCoords } = useTrip();
  const [serverDown, setServerDown] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);

  useVoiceGuide(isNavigating ? location : null);

  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { places, loading, fetchPlaces } = usePlaces(setServerDown);
  const { aiDetails, aiLoading, fetchAIDetails, setAiDetails } = useAI();

  const { resetTrip } = useTrip();

  useFocusEffect(
    useCallback(() => {
      return () => {
        resetTrip();
      };
    }, [resetTrip])
  );

  const itineraryPlaces: Place[] = itinerary
    .filter((item) => item.latitude != null && item.longitude != null)
    .map((item, index) => ({
      id: `itinerary-${index}`,
      place_id: item.place_id,
      name: item.name,
      latitude: item.latitude as number,
      longitude: item.longitude as number,
      rating: 0,
      type: item.category,
      open_now: true,
      distance: 0,
    }));

  // 📡 Fetch places (ONLY in exploration mode)
  useEffect(() => {
    if (location && !isNavigating) {
      fetchPlaces(location.latitude, location.longitude, selectedCategory);
    }
  }, [location]);

  // category change
  useEffect(() => {
    if (location && !isNavigating) {
      fetchPlaces(location.latitude, location.longitude, selectedCategory);
    }
  }, [selectedCategory]);

  // 🧠 Reset AI when place changes
  useEffect(() => {
    if (!selectedPlace) {
      setAiDetails(null);
    }
  }, [selectedPlace]);

  // Back Handling while navigation
  useEffect(() => {
    const backAction = () => {
      if (isNavigating) {
        setConfirmExit(true);
        return true; // 🔥 prevent default back
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [isNavigating]);

  // ⏳ Loading
  if (loading || !location) {
    console.log("API URL at MAP.tsx:", BASE_API_URL);

    return (
      <View className="flex-1 justify-center items-center gap-3">
        <ActivityIndicator size="large" />
        <View className="">
          <Text> Wait for a moment while fetching places nearby you </Text>
        </View>
      </View>
    );
  }

  // ❌ Error
  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>{error}</Text>
      </View>
    );
  }


  const selectedItineraryPlace =
    itinerary.find(
      p =>
        p.place_id === selectedPlace?.place_id ||
        p.name === selectedPlace?.name
    );


  return (
    <View className="flex-1">

      {/* 🔝 TOP OVERLAY */}
      <View className="absolute top-8 left-4 right-4 z-50 space-y-2">

        {/* 🧭 Exploration Controls */}
        {!isNavigating && (
          <View className="bg-white/80 p-3 rounded-xl">
            <CategoryPicker
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />

            {places.length === 0 && (
              <View className="mt-2 bg-orange-100 border border-orange-300 px-3 py-2 rounded-lg">
                <Text className="text-orange-700 text-sm text-center">
                  No places found from Google for this category,
                </Text>
              </View>
            )}

            <View className="mt-2">
              <PlanOwnButton
                onPress={() => {
                  router.push({
                    pathname: "/plan-form",
                    params: { places: JSON.stringify(places) },
                  });
                }}
              />
            </View>
          </View>
        )}

        {/* 📋 Itinerary (SCROLLABLE) */}
        {itinerary.length > 0 && (
          <View>
            <ItineraryCard itinerary={itinerary} location={location} />
          </View>
        )}

      </View>

      {/* 🗺️ MAP */}
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        showsUserLocation
        onPress={() => setSelectedPlace(null)}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >

        {/* 🔵 Route Line */}
        {isNavigating && <RoutePolyline coordinates={routeCoords} />}

        {/* 📍 Markers */}
        <MapMarkers
          places={isNavigating ? itineraryPlaces : places}
          selectedPlace={selectedPlace}
          setSelectedPlace={setSelectedPlace}
          fetchAIDetails={(place) => {
            if (!place?.place_id) {
              console.log("❌ Missing real place_id:", place);
              return;
            }
            fetchAIDetails(place.place_id);
          }}
        />

      </MapView>

      {/* Show Place Details */}
      {selectedPlace && !isNavigating && (
        <PlaceDetailsCard
          selectedPlace={selectedPlace}
          aiDetails={aiDetails}
          aiLoading={aiLoading}
          setSelectedPlace={setSelectedPlace}
          setAiDetails={setAiDetails}
        />
      )}

      {selectedPlace && isNavigating && selectedItineraryPlace && (
        <NavigationPlaceCard place={selectedItineraryPlace} />
      )}

      {/* 📍 Location Pointer */}

      {!isNavigating && (
        <View className="absolute bottom-48 right-5 z-10">
          <Pressable
            onPress={() => {
              if (!location) return;

              mapRef.current?.animateToRegion({
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
              });
            }}
            className="bg-white p-3 rounded-full shadow-lg"
          >
            <Text>📍</Text>
          </Pressable>
        </View>

      )}

      {/* 📌 Horizontal List */}
      {!isNavigating && (
        <HorizontalPlacesList
          places={places}
          mapRef={mapRef}
          setSelectedPlace={setSelectedPlace}
          fetchAIDetails={(place) => {
            if (!place?.place_id) {
              console.log("❌ Missing real place_id:", place);
              return;
            }
            fetchAIDetails(place.place_id);
          }}
        />
      )}


      <Modal
        visible={serverDown}
        transparent
        animationType="fade"
        onRequestClose={() => setServerDown(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/40">

          <View className="bg-white p-5 rounded-xl w-[80%] items-center shadow-lg">
            <Text className="text-lg font-semibold text-center mb-2">
              🚀 Server is waking up
            </Text>

            <Text className="text-sm text-gray-600 text-center mb-4">
              Please try again in a few minutes.
            </Text>

            <Pressable
              onPress={() => {
                setServerDown(false);
                if (location) {
                  fetchPlaces(location.latitude, location.longitude, selectedCategory);
                }
              }}
              className="bg-black px-4 py-2 rounded-lg"
            >
              <Text className="text-white">OK</Text>
            </Pressable>
          </View>

        </View>
      </Modal>


      <Modal
        visible={confirmExit}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmExit(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/40">

          <View className="bg-white p-5 rounded-xl w-[80%] items-center shadow-lg">

            <Text className="text-lg font-semibold text-center mb-2">
              End Trip?
            </Text>

            <Text className="text-sm text-gray-600 text-center mb-4">
              You are currently navigating. Do you want to end the trip and go back?
            </Text>

            <View className="flex-row gap-3">

              <Pressable
                onPress={() => setConfirmExit(false)}
                className="bg-gray-300 px-4 py-2 rounded-lg"
              >
                <Text className="text-black">Cancel</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setConfirmExit(false);
                  resetTrip();
                  router.back();
                }}
                className="bg-[#5b2805] px-4 py-2 rounded-lg"
              >
                <Text className="text-white">End Trip</Text>
              </Pressable>

            </View>

          </View>

        </View>
      </Modal>

    </View>
  );
}