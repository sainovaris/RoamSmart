import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { useState } from "react";
import { Place } from "@/types/place";

type Props = {
  places: Place[];
  onSubmit: (data: {
    placeIds: string[];
    categories: string[];
    duration: number;
  }) => void;
};

const CATEGORY_OPTIONS = ["Food", "Nature", "Culture", "Stay", "Entertainment"];

export default function PlanForm({ places, onSubmit }: Props) {
  const [successMsg, setSuccessMsg] = useState("");
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [duration, setDuration] = useState("");

  // console.log(places)

  const togglePlace = (id: string) => {
    setSelectedPlaces((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((p) => p !== id)
        : [...prev, id];

      console.log("📍 Updated Selected Places:", updated);
      return updated;
    });
  };

  const toggleCategory = (cat: string) => {
    setCategories((prev) => {
      const updated = prev.includes(cat)
        ? prev.filter((c) => c !== cat)
        : [...prev, cat];

      console.log("📂 Updated Categories:", updated);
      return updated;
    });
  };

  const handleSubmit = () => {
    if (!duration) return;

    const payload = {
      placeIds: selectedPlaces,
      categories,
      duration: Number(duration),
    };

    console.log("🚀 SUBMIT CLICKED");
    console.log("📦 Final Payload:", payload);

    onSubmit(payload);

    // ✅ Reset all fields
    setSelectedPlaces([]);
    setCategories([]);
    setDuration("");

    // ✅ Show success message
    setSuccessMsg("Your request is made, thanks");
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
                    const isSelected = selectedPlaces.includes(place.id);

                    return (
                      <View key={place.id}>
                        <Pressable
                          onPress={() => togglePlace(place.id)}
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


        {/* Categories */}
        <View className="p-3">
          <Text className="font-semibold mt-3 mb-2">Select Categories</Text>

          <View className="flex-row flex-wrap w-full">
            {CATEGORY_OPTIONS.map((cat) => {
              const isSelected = categories.includes(cat);

              return (
                <Pressable
                  key={cat}
                  onPress={() => toggleCategory(cat)}
                  className="mr-2 mb-2 px-3 py-2 rounded-md"
                  style={{
                    backgroundColor: isSelected ? "#d05203" : "#f3f4f6",
                  }}
                >
                  <Text
                    style={{
                      color: isSelected ? "#ffffff" : "#111827",
                    }}
                  >
                    {cat}
                  </Text>
                </Pressable>
              );
            })}
          </View>

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