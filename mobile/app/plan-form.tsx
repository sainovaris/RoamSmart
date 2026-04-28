import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import PlanForm from "@/components/PlanForm";
import useTripPlanner from "@/hooks/useTripPlanner";
import useCurrentLocation from "@/hooks/useCurrentLocation";

export default function PlanFormScreen() {
  const { places } = useLocalSearchParams();
  const router = useRouter();

  const { generateTrip } = useTripPlanner();
  const { location } = useCurrentLocation();

  const parsedPlaces = places
    ? JSON.parse(places as string)
    : [];

  const handleSubmit = async (data: any) => {
    if (!location) {
      console.log("❌ Location not available");
      return;
    }

    console.log("🚀 FINAL PAYLOAD at plan-form.tsx:", data);

    await generateTrip(
      location.latitude,
      location.longitude,
      data
    );

    // 🔥 GO BACK TO MAP (AUTO RENDER PLAN)
    router.back();
  };

  return (
    <View className="flex-1 p-4 bg-white">
      <PlanForm
        places={parsedPlaces}
        onSubmit={handleSubmit}
      />
    </View>
  );
}