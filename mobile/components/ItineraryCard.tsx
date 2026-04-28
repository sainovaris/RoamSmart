import { View, Text, Pressable, ScrollView, Dimensions, Image, Linking } from "react-native";
import * as Speech from "expo-speech";
import { useState } from "react";
import { useTrip } from "@/context/TripContext";
import { ItineraryItem } from "@/types/place";
import { LocationObjectCoords } from "expo-location";
import { getRouteFromBackend } from "@/services/directionsService";
import { decodePolyline } from "@/utils/decodePolyline";
import { calculateDistance } from "@/utils/distance";
import { useRouter } from "expo-router";

type Props = {
  itinerary: ItineraryItem[];
  location: LocationObjectCoords | null;
};

export default function ItineraryCard({ itinerary, location }: Props) {
  const {
    summary,
    startNavigation,
    stopNavigation,
    resetTrip,
    currentStepIndex,
    setRouteCoords,
    isNavigating,
  } = useTrip();

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const screenHeight = Dimensions.get("window").height;
  const router = useRouter();

  // 🚀 START JOURNEY
  const handleStartJourney = async () => {
    console.log("🚀 Start journey clicked");

    if (!location) {
      console.log("❌ Location not available");
      return;
    }

    try {
      const origin = {
        lat: location.latitude,
        lng: location.longitude,
      };

      const places = itinerary
        .filter((p) => p.latitude != null && p.longitude != null)
        .map((p) => ({
          lat: p.latitude as number,
          lng: p.longitude as number,
        }));

      if (places.length === 0) {
        console.log("❌ No valid places for route");
        return;
      }

      const route = await getRouteFromBackend(origin, places);

      if (!route?.polyline) {
        console.log("❌ Invalid route response");
        return;
      }

      const decoded = decodePolyline(route.polyline);

      setRouteCoords(decoded);
      startNavigation();
      setIsCollapsed(true);

    } catch (err) {
      console.log("❌ Route error:", err);
    }
  };

  if (!itinerary || itinerary.length === 0) return null;

  const formatTime = (date: string) => {
    try {
      return new Date(date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const cleanSummary = (text: string) => text.replace(/\*\*/g, "");

  // 🔊 SPEAK PLAN
  const speakPlan = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }

    let text = "";

    if (summary) {
      text += cleanSummary(summary) + ". ";
    }

    text += itinerary
      .map(
        (place, index) =>
          `Stop ${index + 1}: ${place.name}. Visit between ${formatTime(
            place.visit_start
          )} and ${formatTime(place.visit_end)}.`
      )
      .join(" ");

    Speech.speak(text, {
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
    });

    setIsSpeaking(true);
  };

  // 📍 DISTANCE CALCULATION
  const firstPlace = itinerary[0];

  let distanceToFirst: number | null = null;
  let travelMinutes = 0;

  if (
    location &&
    firstPlace?.latitude != null &&
    firstPlace?.longitude != null
  ) {
    distanceToFirst = calculateDistance(
      location.latitude,
      location.longitude,
      firstPlace.latitude,
      firstPlace.longitude
    );

    const avgSpeed = 30;
    travelMinutes = (distanceToFirst / avgSpeed) * 60;
  }

  const isAtFirstPlace =
    distanceToFirst != null && distanceToFirst < 0.03;

  // 📦 COLLAPSED VIEW
  if (isCollapsed) {
    return (
      <View className="absolute bottom-15 left-2 right-2">
        <Pressable
          className="bg-[#703605] py-3 rounded-xl"
          onPress={() => setIsCollapsed(false)}
        >
          <Text className="text-center text-white font-semibold">
            Show Plan
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      className="bg-white p-4 rounded-xl shadow-lg"
      style={{ maxHeight: screenHeight * 0.55 }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text className="text-lg font-bold mb-2">
        AI Travel Plan
      </Text>

      {/* 🧭 Summary */}
      {summary ? (
        <Text className="text-sm text-gray-600 mb-3 leading-5">
          {cleanSummary(summary)}
        </Text>
      ) : null}

      {/* 🗺️ Timeline */}
      {itinerary.map((place, index) => {
        let isActive = false;

        if (index === currentStepIndex) {
          if (index === 0 && !isAtFirstPlace) {
            isActive = false;
          } 
          else {
            isActive = true;
          }
        }
        
        console.log("📦 FULL Video Details:", place.videos);

        let start = new Date(place.visit_start);
        let end = new Date(place.visit_end);

        if (index === 0 && !isAtFirstPlace && travelMinutes) {
          start = new Date(start.getTime() + travelMinutes * 60000);
          end = new Date(end.getTime() + travelMinutes * 60000);
        }

        return (
          <View
            key={index}
            className={`mb-3 p-3 rounded-lg ${isActive ? "bg-orange-100" : "bg-gray-50"
              }`}
          >
            <Text className="font-bold text-base text-gray-900">
              {index + 1}. {place.name}
            </Text>

            <Text className="text-gray-500 text-sm mt-1">
              {formatTime(start.toISOString())} -{" "}
              {formatTime(end.toISOString())}
            </Text>

            <Text className="text-xs text-gray-400 mt-1">
              {place.category}
            </Text>

            {/* On the way */}
            {index === 0 && !isAtFirstPlace && (
              <>
                <Text className="text-xs text-blue-600 font-semibold mt-2">
                  🚗 On the way
                </Text>

                {distanceToFirst != null && (
                  <Text className="text-xs text-gray-500 mt-1">
                    {distanceToFirst.toFixed(2)} km •{" "}
                    {Math.round(travelMinutes)} min
                  </Text>
                )}
              </>
            )}

            {/* 📍 Current Stop */}
            {isActive && (
              <>
                <Text className="text-xs text-orange-600 font-semibold mt-2">
                  📍 Current Stop
                </Text>

                {/* 🎬 VIDEOS */}
                {place.videos && place.videos.length > 0 && (
                  <>
                    <Text className="text-xs font-semibold text-gray-600 mt-2">
                      🎬 Explore this place
                    </Text>

                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      className="mt-2"
                    >
                      {place.videos.slice(0, 3).map((video, idx) => (
                        <Pressable
                          key={idx}
                          className="mr-3"
                          onPress={() => {
                            const url = `https://www.youtube.com/watch?v=${video.videoId}`;
                            Linking.openURL(url);
                          }}
                        >
                          <View className="w-40">
                            <Image
                              source={{ uri: video.thumbnail }}
                              className="w-40 h-24 rounded-lg"
                            />
                            <Text
                              numberOfLines={2}
                              className="text-xs mt-1 text-gray-700"
                            >
                              {video.title}
                            </Text>
                          </View>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </>
                )}
              </>
            )}
          </View>
        );
      })}

      {/* 🔥 Controls */}
      <View className="mt-3">

        {/* 🔊 Audio */}
        <Pressable
          className="mt-2 bg-[#d05203] py-2 rounded-lg"
          onPress={speakPlan}
        >
          <Text className="text-center text-white font-semibold">
            {isSpeaking ? "Stop Audio" : "Play Audio"}
          </Text>
        </Pressable>

        {/* 🧭 Start / Stop Journey */}
        <Pressable
          className={`mt-2 py-2 rounded-lg ${isNavigating
              ? "bg-[#5b2805]"
              : !location
                ? "bg-red-300"
                : "bg-[#5b2805]"
            }`}
          onPress={() => {
            if (isNavigating) {
              stopNavigation();
              resetTrip();
              router.replace("/");
            } else {
              handleStartJourney();
            }
          }}
          disabled={!isNavigating && !location}
        >
          <Text className="text-center text-white">
            {isNavigating
              ? "Stop Journey"
              : location
                ? "Start Journey"
                : "Fetching location..."}
          </Text>
        </Pressable>

        {/* 📦 Minimize */}
        <Pressable
          className="mt-2 bg-gray-400 py-2 rounded-lg"
          onPress={() => setIsCollapsed(true)}
        >
          <Text className="text-center text-white font-semibold">
            Minimize
          </Text>
        </Pressable>

      </View>
    </ScrollView>
  );
}