import { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  ActivityIndicator,
  Text,
  Pressable,
  ScrollView,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import type { LocationObjectCoords } from "expo-location";
import { fetchNearbyPlaces } from "../services/placesService";
import { api } from "@/services/api";

type Place = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  rating: number;
  type: string;
  open_now: boolean;
  distance: number;
};

type AIDetails = {
  overview: string;
  highlights: string[];
  best_time_to_visit: string;
  travel_tips: string;
  recommended_duration: string;
  booking_required: boolean;
};

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
};

const BASE_API_URL = `http://${process.env.EXPO_PUBLIC_IPV4_ADDR}:5000/api`;
console.log("Using API URL:", BASE_API_URL);

export default function Map() {
  const mapRef = useRef<MapView | null>(null);

  const [location, setLocation] = useState<LocationObjectCoords | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedType, setSelectedType] =  useState<string | null>(null);

  const [aiDetails, setAiDetails] = useState<AIDetails | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaces = useCallback(async (type?: string) => {
    try {
      setLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setError("Location permission denied");
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});

      const { latitude, longitude } = currentLocation.coords;

      setLocation(currentLocation.coords);

      const response = await fetchNearbyPlaces(
        latitude,
        longitude,
        selectedType
      );

      const { results } = response;

      const formatted: Place[] = results.map(
        (place: any) => {
          const placeLat =
            place.location.coordinates[1];
          const placeLng =
            place.location.coordinates[0];

          return {
            id: place._id,
            name: place.name,
            rating: place.rating,
            type: place.type,
            open_now: place.open_now,
            latitude: placeLat,
            longitude: placeLng,
            distance: calculateDistance(
              latitude,
              longitude,
              placeLat,
              placeLng
            ),
          };
        }
      );

      setPlaces(formatted);
    } catch (err: any) {
      setError("Failed to fetch nearby places\n" + (err.message || ""));
      console.log("Fetch places error:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedType]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  // 🔥 AI Fetch
  const fetchAIDetails = async (placeId: string) => {
    try {
      setAiLoading(true);
      setAiDetails(null);
      console.log("AI URL:", `${BASE_API_URL}/ai/${placeId}`);

      const response = await api.get(`/ai/${placeId}`);

      if (response.data.success) {
        setAiDetails(response.data.data);
      }
    } catch (error) {
      console.log("AI error:", error);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-red-500 text-lg text-center">
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <View className="absolute top-16 left-5 right-5 flex-row justify-between bg-white rounded-xl p-2 shadow-md z-50">
        <Pressable
          onPress={() => setSelectedType(null)}
          className={`flex-1 py-2 rounded-lg ${
            selectedType === null ? "bg-blue-600" : "bg-gray-200"
          }`}
        >
          <Text className={`text-center ${
            selectedType === null ? "text-white" : "text-gray-700"
          }`}>
            All
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setSelectedType("Restaurant")}
          className={`flex-1 py-2 rounded-lg ml-2 ${
            selectedType === "Restaurant" ? "bg-blue-600" : "bg-gray-200"
          }`}
        >
          <Text className={`text-center ${
            selectedType === "Restaurant" ? "text-white" : "text-gray-700"
          }`}>
            Restaurants
          </Text>
        </Pressable>
      </View>


      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        showsUserLocation
        initialRegion={{
          latitude: location?.latitude ?? 22.3039,
          longitude: location?.longitude ?? 70.8022,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {places.map((place) => (
          <Marker
            key={place.id}
            coordinate={{
              latitude: place.latitude,
              longitude: place.longitude,
            }}
            title={place.name}
            onPress={() => {
              // 🔥 Prevent duplicate AI calls
              if (selectedPlace?.id !== place.id) {
                setSelectedPlace(place);
                fetchAIDetails(place.id);
              }
            }}
          />
        ))}
      </MapView>

      {/* No places */}
      {places.length === 0 && (
        <View className="absolute top-20 left-5 right-5 bg-white p-4 rounded-xl shadow-md">
          <Text className="text-center text-gray-600">
            No attractions found within 5 km.
          </Text>
        </View>
      )}

      {/* 🔥 Bottom Card */}
      {selectedPlace && (
        <View className="absolute bottom-6 left-5 right-5 bg-white p-4 rounded-2xl shadow-xl max-h-[65%]">
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text className="text-gray-500 mt-1">
              ⭐ {selectedPlace.rating} • {selectedPlace.type}
            </Text>

            <Text className="text-gray-400 mt-1">
              📍 {selectedPlace.distance} km away
            </Text>

            <Text
              className={`mt-2 font-semibold ${
                selectedPlace.open_now
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {selectedPlace.open_now ? "Open Now" : "Closed"}
            </Text>

            {/* AI Loading */}
            {aiLoading && (
              <View className="mt-4">
                <ActivityIndicator size="small" />
                <Text className="text-gray-400 mt-2">
                  Generating AI guide...
                </Text>
              </View>
            )}

            {/* AI Content */}
            {aiDetails && (
              <View className="mt-4">
                <Text className="font-semibold">
                  Overview
                </Text>
                <Text className="text-gray-700 mt-1">
                  {aiDetails.overview}
                </Text>

                <Text className="font-semibold mt-3">
                  Highlights
                </Text>
                {aiDetails.highlights.map(
                  (item, index) => (
                    <Text
                      key={index}
                      className="text-gray-700"
                    >
                      • {item}
                    </Text>
                  )
                )}

                <Text className="font-semibold mt-3">
                  Best Time to Visit
                </Text>
                <Text className="text-gray-700">
                  {aiDetails.best_time_to_visit}
                </Text>

                <Text className="font-semibold mt-3">
                  Travel Tips
                </Text>
                <Text className="text-gray-700">
                  {aiDetails.travel_tips}
                </Text>

                <Text className="font-semibold mt-3">
                  Recommended Duration
                </Text>
                <Text className="text-gray-700">
                  {aiDetails.recommended_duration}
                </Text>

                {/* Booking Button */}
                {aiDetails.booking_required && (
                  <View className="mt-5 bg-blue-600 p-3 rounded-lg">
                    <Text className="text-white text-center font-semibold">
                      Book Now
                    </Text>
                  </View>
                )}
              </View>
            )}

            <Pressable
              className="mt-5 bg-gray-300 py-2 rounded-lg"
              onPress={() => {
                setSelectedPlace(null);
                setAiDetails(null);
              }}
            >
              <Text className="text-center font-medium">
                Close
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      )}
    </View>
  );
}