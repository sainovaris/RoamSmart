import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 justify-center items-center bg-blue-600">
      <Text className="text-white text-center text-4xl font-bold">
        Hello from ARB!
      </Text>
      <Text className="text-white text-center text-2xl mt-1">
        This is the main page of the app.
      </Text>
      <Link href="/map-test" className="text-white text-center mt-8 underline">
        Go to Map-Test Page
      </Link>

      <Link href="/map" className="text-white text-2xl text-center mt-8 underline">
        Go to Map Page
      </Link>
    </View>
  );
}
