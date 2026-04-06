import { View, Text, Pressable } from "react-native";
import * as Speech from "expo-speech";

type ItineraryItem = {
  name: string;
  visit_time?: string;
};

type Props = {
  itinerary: ItineraryItem[];
  onClear: () => void;
};

export default function ItineraryCard({ itinerary, onClear }: Props) {

  if (!itinerary || itinerary.length === 0) return null;

  // 🔊 Convert itinerary to speech text
  const speakPlan = () => {
    const text = itinerary.map(
        (place, index) =>
          `${index + 1} place is ${place.name} and visiting time at there is ${
            place.visit_time || ""
          }`
      )
      .join(". ");

    Speech.speak(text);
  };

  return (
    <View className="bg-white p-4 rounded-xl shadow-lg">

      <Text className="text-lg font-bold mb-2">
        AI Travel Plan
      </Text>

      {itinerary.map((place, index) => (
        <Text key={index} className="text-gray-700 mb-1">
          {index + 1}. {place.name} : {place.visit_time}
        </Text>
      ))}

      {/* 🔥 Buttons */}
      <View className="flex-column justify-between mt-1">

        {/* 🔊 Speak */}
        
        <Pressable
          className="mt-2 bg-[#d05203] py-2 rounded-lg"
          onPress={speakPlan}
        >
          <Text className="text-center text-white">Play Audio</Text>
        </Pressable>
        

        {/* ❌ Clear */}
        <Pressable
          className="mt-2 bg-[#d05203] py-2 rounded-lg"
          onPress={onClear}
        >
          <Text className="text-center text-white">Close</Text>
        </Pressable>

      </View>

    </View>
  );
}