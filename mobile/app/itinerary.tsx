import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, ScrollView, Pressable, Linking, Share } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Step = {
  step: number;
  action: string;
  placeName: string;
  time: string;
  transport: string | null;
  address: string;
};

export default function ItineraryScreen() {
  const params = useLocalSearchParams<{
    steps?: string;
    center?: string;
    hours?: string;
  }>();
  const router = useRouter();

  let steps: Step[] = [];
  try {
    if (params.steps) steps = JSON.parse(params.steps as string);
  } catch (_) {}

  const openMaps = (placeName: string, address: string) => {
    const q = encodeURIComponent([placeName, address].filter(Boolean).join(", "));
    const url = `https://www.google.com/maps/search/?api=1&query=${q}`;
    Linking.openURL(url);
  };

  const openUber = () => {
    Linking.openURL("https://m.uber.com/");
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-4 pt-2 pb-4 border-b border-slate-200 bg-white">
        <View className="flex-row justify-between items-center">
          <Text className="text-slate-800 text-xl font-bold">Your itinerary</Text>
          <Pressable onPress={() => router.back()} className="py-2 px-3">
            <Text className="text-teal-600 font-semibold">Done</Text>
          </Pressable>
        </View>
        {params.hours ? (
          <Text className="text-slate-500 text-sm mt-1">
            {params.hours} hour plan · Follow in order
          </Text>
        ) : null}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        {steps.length === 0 ? (
          <Text className="text-slate-500 text-center py-8">
            No itinerary steps. Create one from Plan my day.
          </Text>
        ) : (
          steps.map((s, index) => (
            <View key={index} className="mb-5">
              {/* Transport step */}
              {s.action?.toLowerCase() === "travel" && s.transport ? (
                <View className="flex-row items-center pl-2 ml-3 border-l-2 border-amber-400 py-2">
                  <Text className="text-2xl mr-3">🚗</Text>
                  <View className="flex-1">
                    <Text className="text-slate-700 font-medium">{s.time}</Text>
                    <Text className="text-slate-600 text-sm">{s.transport}</Text>
                    <Pressable
                      onPress={openUber}
                      className="mt-2 bg-slate-800 py-2 px-3 rounded-lg self-start"
                    >
                      <Text className="text-white text-sm font-medium">
                        Open Uber
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                /* Place step */
                <View className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                  <View className="flex-row items-start">
                    <View className="w-8 h-8 rounded-full bg-teal-600 items-center justify-center mr-3">
                      <Text className="text-white font-bold text-sm">{s.step}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-slate-500 text-xs font-medium uppercase">
                        {s.time}
                      </Text>
                      <Text className="text-slate-800 font-semibold text-lg mt-0.5">
                        {s.placeName}
                      </Text>
                      <Text className="text-teal-600 font-medium mt-1">
                        {s.action}
                      </Text>
                      {s.address ? (
                        <Text className="text-slate-500 text-sm mt-1">
                          {s.address}
                        </Text>
                      ) : null}
                      <Pressable
                        onPress={() => openMaps(s.placeName, s.address)}
                        className="mt-3 bg-slate-100 py-2 px-3 rounded-lg self-start"
                      >
                        <Text className="text-slate-700 text-sm font-medium">
                          Get directions
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              )}
            </View>
          ))
        )}

        <Pressable
          onPress={() => router.replace("/map")}
          className="mt-4 bg-teal-600 py-4 rounded-2xl"
        >
          <Text className="text-white text-center font-semibold">
            View on map
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
