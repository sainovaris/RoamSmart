import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { useState } from "react";
import { Place } from "@/types/place";

type Props = {
  places: Place[];
  onSubmit: (data: {
    placeIds: string[];
    duration: number;
  }) => void;
};

export default function PlanForm({ places, onSubmit }: Props) {
  const [successMsg, setSuccessMsg] = useState("");
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>([]);
  const [duration, setDuration] = useState("");

  // console.log(places)

  const togglePlace = (placeId: string) => {
    setSelectedPlaces((prev) => {
      const updated = prev.includes(placeId)
        ? prev.filter((p) => p !== placeId)
        : [...prev, placeId];

      return updated;
    });
  };

  const handleSubmit = () => {
    if (!duration) return;

    const payload = {
      placeIds: selectedPlaces,
      duration: Number(duration),
    };

    console.log("🚀 SUBMIT CLICKED");

    onSubmit(payload);

    setSelectedPlaces([]);
    setDuration("");

    // ✅ Show success message
    setSuccessMsg("Wait for a moment, you're redirecting to your itinerary plan");
  };


  return (
    <View className="flex-1 bg-gray-100">
      <View className="flex-1 bg-white">

        {/* Title */}
        <View className="mt-4 p-4">
          <Text className="text-4xl text-center font-bold">Create Plan</Text>
        </View>


        {/* Places */}
        <View className="p-3">
          <Text className="font-semibold">Select Places</Text>

          <ScrollView
            style={{ maxHeight: 375 }}  // 👈 controls when scroll activates (~7 items)
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-col justify-between">
              {places.length > 0 ?
                (
                  places.map((place) => {
                    const isSelected = selectedPlaces.includes(place.place_id);

                    return (
                      <View key={place.id}>
                        <Pressable
                          onPress={() => togglePlace(place.place_id)}
                          className="mt-3 py-2 rounded-md"
                          style={{
                            backgroundColor: isSelected ? "#d05203" : "#f3f4f6",
                          }}
                        >
                          <Text
                            numberOfLines={2}
                            className="text-center text-sm"
                            style={{
                              color: isSelected ? "#ffffff" : "#111827",
                            }}
                          >
                            {place.name}
                          </Text>
                        </Pressable>
                      </View>
                    );
                  })
                ) : (
                  <Text className="mt-3">No Places found</Text>
                )
              }
            </View>
          </ScrollView>

        </View>


        {/* Duration */}
        <View className="flex justify-between p-3">
          <Text className="font-semibold mb-1">Select Time Duration (in hour)</Text>

          <TextInput
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
            placeholder="e.g.  4"
            className="border border-gray-300 rounded-lg px-3 py-2 mb-6"
          />
        </View>

        {/* Submit Button */}
        <Pressable
          onPress={handleSubmit}
          className="py-4 rounded-xl mt-5"
          style={{ backgroundColor: "#d05203" }}
        >
          <Text className="text-center text-white font-semibold">
            Generate Plan
          </Text>
        </Pressable>


        {successMsg ? (
          <Text className="text-center text-green-700 mt-3 font-medium">
            {successMsg}
          </Text>
        ) : null}

      </View>
    </View>
  );
}