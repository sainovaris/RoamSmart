import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import PlanForm from "@/components/PlanForm";

export default function PlanFormScreen() {
  const { places } = useLocalSearchParams();

  const parsedPlaces = places
    ? JSON.parse(places as string)
    : [];

  console.log("📍 Places received in PlanForm:", parsedPlaces.length);

  const handleSubmit = (data: any) => {
    console.log("Form Data:", data);
    // 👉 call your API here later
  };

  return (
    <View className="flex-1 p-4 bg-white">
      <PlanForm places={parsedPlaces} onSubmit={handleSubmit} />
    </View>
  );
}