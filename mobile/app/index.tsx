import { Link } from "expo-router";
import { View, Text, Pressable, Image,LogBox } from "react-native";

LogBox.ignoreLogs(["Unable to activate keep awake"]);

export default function Index() {
  console.log("App loaded");
  return (
    <View className="flex-1 bg-[#7d391e] justify-center items-center px-6">

      {/* Logo */}
      <Image
        source={require("../assets/apps-imgs/logo.jpg")}
        style={{ width: 90, height: 90, borderRadius: 18 }}
        resizeMode="contain"
      />

      {/* App Name */}
      <Text className="text-[#EAEAEA] text-4xl font-extrabold mt-4 mb-2">
        Bindaas
      </Text>

      {/* Subtitle */}
      <Text className="text-[#EAEAEA] text-base text-center mb-10 opacity-80">
        Discover nearby places, explore the city, and plan your journey.
      </Text>

      {/* Open Map Button */}
      <Link href="/map" asChild>
        <Pressable className="bg-[#d05203] w-full py-4 rounded-xl shadow-lg active:opacity-80">
          <Text className="text-white text-center text-lg font-semibold">
            Open Map
          </Text>
        </Pressable>
      </Link>

    </View>
  );
}