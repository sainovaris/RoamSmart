import { Link } from "expo-router";
import { Text, View, Pressable } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 bg-blue-600 justify-center items-center px-6">

      {/* App Title */}
      <Text className="text-white text-5xl font-extrabold text-center mb-3">
        Tour Guide App
      </Text>

      {/* Subtitle */}
      <Text className="text-blue-100 text-lg text-center mb-12">
        Discover nearby places, explore the city, and plan your journey.
      </Text>

      {/* Map Page Button */}
      <Link href="/map" asChild>
        <Pressable className="bg-white w-full py-4 rounded-xl mb-4 shadow-lg active:opacity-80">
          <Text className="text-blue-600 text-center text-lg font-semibold">
            Open Map
          </Text>
        </Pressable>
      </Link>

    </View>
  );
}