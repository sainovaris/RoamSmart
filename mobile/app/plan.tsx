import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import { generateSmartPlan } from "@/services/planService";

const HOUR_OPTIONS = [2, 4, 6, 8, 10];

export default function PlanScreen() {
  const router = useRouter();
  const [zip, setZip] = useState("");
  const [useMyLocation, setUseMyLocation] = useState(true);
  const [hours, setHours] = useState(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setError(null);
    setLoading(true);
    try {
      let lat: number | undefined;
      let lng: number | undefined;
      let zipParam: string | undefined;

      if (useMyLocation) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Location permission denied");
          setLoading(false);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        lat = loc.coords.latitude;
        lng = loc.coords.longitude;
      } else if (zip.trim()) {
        zipParam = zip.trim();
      } else {
        setError("Enter a zip code or use “Use my location”");
        setLoading(false);
        return;
      }

      const result = await generateSmartPlan({
        ...(zipParam ? { zip: zipParam } : { lat, lng }),
        hours,
      });

      if (result?.steps?.length) {
        router.replace({
          pathname: "/itinerary",
          params: {
            steps: JSON.stringify(result.steps),
            center: JSON.stringify(result.center || {}),
            hours: String(result.hours || hours),
          },
        });
      } else {
        setError("Could not generate a plan. Try another location or time.");
      }
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-slate-800 text-2xl font-bold mb-1">
            Plan my day
          </Text>
          <Text className="text-slate-500 mb-6">
            Get a custom itinerary with meals, activities, and transport tips.
          </Text>

          {/* Location */}
          <Text className="text-slate-700 font-semibold mb-2">Location</Text>
          <Pressable
            onPress={() => setUseMyLocation(true)}
            className={`flex-row items-center p-3 rounded-xl border-2 mb-3 ${
              useMyLocation ? "border-teal-600 bg-teal-50" : "border-slate-200 bg-white"
            }`}
          >
            <Text className="text-2xl mr-3">📍</Text>
            <View className="flex-1">
              <Text className="text-slate-800 font-medium">Use my location</Text>
              <Text className="text-slate-500 text-sm">Explore near me</Text>
            </View>
            {useMyLocation && <Text className="text-teal-600 font-semibold">✓</Text>}
          </Pressable>

          <View className="flex-row items-center my-2">
            <View className="flex-1 h-px bg-slate-200" />
            <Text className="mx-3 text-slate-400 text-sm">or</Text>
            <View className="flex-1 h-px bg-slate-200" />
          </View>

          <Pressable
            onPress={() => setUseMyLocation(false)}
            className={`mb-3 rounded-xl border-2 overflow-hidden ${
              !useMyLocation ? "border-teal-600 bg-teal-50" : "border-slate-200 bg-white"
            }`}
          >
            <TextInput
              placeholder="Zip code or city (e.g. 07094 or Secaucus, NJ)"
              value={zip}
              onChangeText={setZip}
              onFocus={() => setUseMyLocation(false)}
              className="p-3 text-slate-800 text-base"
              placeholderTextColor="#94a3b8"
              editable={!loading}
            />
          </Pressable>
          {!useMyLocation && (
            <Text className="text-slate-500 text-sm mb-4">
              We’ll find attractions and restaurants near this area.
            </Text>
          )}

          {/* Duration */}
          <Text className="text-slate-700 font-semibold mb-2">How long?</Text>
          <View className="flex-row flex-wrap gap-2 mb-6">
            {HOUR_OPTIONS.map((h) => (
              <Pressable
                key={h}
                onPress={() => setHours(h)}
                className={`px-4 py-2.5 rounded-full ${
                  hours === h ? "bg-teal-600" : "bg-white border border-slate-200"
                }`}
              >
                <Text
                  className={`font-medium ${hours === h ? "text-white" : "text-slate-700"}`}
                >
                  {h} hrs
                </Text>
              </Pressable>
            ))}
          </View>

          {error ? (
            <Text className="text-red-600 mb-4 text-sm">{error}</Text>
          ) : null}

          <Pressable
            onPress={handleGenerate}
            disabled={loading}
            className="bg-teal-600 py-4 rounded-2xl shadow-lg active:opacity-90"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-center text-lg font-semibold">
                Create my itinerary
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => router.back()}
            className="mt-4 py-3"
          >
            <Text className="text-slate-500 text-center">Cancel</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
