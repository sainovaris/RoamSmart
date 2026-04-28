import { View, Text, ScrollView, Pressable, Image, Linking } from "react-native";
import { ItineraryItem } from "@/types/place";

type Props = {
  place: ItineraryItem;
};

export default function NavigationPlaceCard({ place }: Props) {
  if (!place) return null;

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

  return (
    <View className="absolute bottom-0 left-0 right-0">

      <View className="bg-white rounded-t-2xl p-4 shadow-lg">

        {/* 🔹 Name */}
        <Text className="text-lg font-bold">
          {place.name}
        </Text>

        {/* 🔹 Time */}
        <Text className="text-gray-500 mt-1">
          {formatTime(place.visit_start)} - {formatTime(place.visit_end)}
        </Text>

        {/* 🔹 Category */}
        <Text className="text-xs text-gray-400 mt-1">
          {place.category}
        </Text>

        {/* 🔹 AI Overview */}
        {place.ai_details?.overview && (
          <Text className="text-sm text-gray-700 mt-3">
            {place.ai_details.overview}
          </Text>
        )}

        {/* 🔹 Highlights */}
        {Array.isArray(place.ai_details?.highlights) &&
          place.ai_details.highlights.length > 0 && (
            <View className="mt-2">
              {place.ai_details.highlights.slice(0, 3).map((h: string, i: number) => (
                <Text key={i} className="text-xs text-gray-600">
                  • {h}
                </Text>
              ))}
            </View>
        )}

        {/* 🎬 Videos */}
        {place.videos && place.videos.length > 0 && (
          <>
            <Text className="text-xs font-semibold text-gray-600 mt-3">
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
                  onPress={() =>
                    Linking.openURL(
                      `https://www.youtube.com/watch?v=${video.videoId}`
                    )
                  }
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

      </View>
    </View>
  );
}