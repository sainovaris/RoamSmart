import { View, Text } from "react-native";

type ItineraryItem = {
  name: string;
  visit_time?: string;
};

type Props = {
  itinerary: ItineraryItem[];
};

export default function ItineraryCard({ itinerary }: Props) {
  if (!itinerary || itinerary.length === 0) return null;

  return (
    <View className=" bg-white p-4 rounded-xl shadow-lg">
      <Text className="text-lg font-bold mb-2">
        AI Travel Plan
      </Text>

      {itinerary.map((place, index) => (
        <Text key={index} className="text-gray-700 mb-1">
          {index + 1}. {place.name} {place.visit_time}
        </Text>
      ))}
    </View>
  );
}