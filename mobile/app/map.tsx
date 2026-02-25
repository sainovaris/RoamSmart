import { useEffect, useState, useRef } from "react";
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
import axios from "axios";

type Place = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  rating: number;
  type: string;
  open_now: boolean;
};

type AIDetails = {
  overview: string;
  highlights: string[];
  best_time_to_visit: string;
  travel_tips: string;
  recommended_duration: string;
  booking_required: boolean;
};

const BASE_URL = "http://10.119.66.139:5000/api";

export default function Map() {
  const mapRef = useRef<MapView | null>(null);

  const [location, setLocation] =
    useState<LocationObjectCoords | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] =
    useState<Place | null>(null);

  const [aiDetails, setAiDetails] =
    useState<AIDetails | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setError("Location permission denied");
        return;
      }

      const currentLocation =
        await Location.getCurrentPositionAsync({});

      const { latitude, longitude } =
        currentLocation.coords;

      setLocation(currentLocation.coords);

      const response = await axios.get(
        `${BASE_URL}/nearby`,
        {
          params: { lat: latitude, lng: longitude },
        }
      );

      const { success, results } = response.data;

      if (!success) throw new Error("Backend error");

      const formattedPlaces: Place[] = results.map(
        (place: any) => ({
          id: place._id,
          name: place.name,
          rating: place.rating,
          type: place.type,
          open_now: place.open_now,
          latitude: place.location.coordinates[1],
          longitude: place.location.coordinates[0],
        })
      );

      setPlaces(formattedPlaces);

      // Auto-fit markers
      if (formattedPlaces.length > 0 && mapRef.current) {
        mapRef.current.fitToCoordinates(
          formattedPlaces.map((p) => ({
            latitude: p.latitude,
            longitude: p.longitude,
          })),
          {
            edgePadding: {
              top: 100,
              right: 100,
              bottom: 100,
              left: 100,
            },
            animated: true,
          }
        );
      }
    } catch (err: any) {
      setError("Failed to fetch nearby places" + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 AI Fetch
  const fetchAIDetails = async (placeId: string) => {
    try {
      setAiLoading(true);
      setAiDetails(null);

      const response = await axios.get(
        `${BASE_URL}/ai/${placeId}`
      );

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
            <Text className="text-xl font-bold">
              {selectedPlace.name}
            </Text>

            <Text className="text-gray-500 mt-1">
              ⭐ {selectedPlace.rating} •{" "}
              {selectedPlace.type}
            </Text>

            <Text
              className={`mt-2 ${
                selectedPlace.open_now
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {selectedPlace.open_now
                ? "Open Now"
                : "Closed"}
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