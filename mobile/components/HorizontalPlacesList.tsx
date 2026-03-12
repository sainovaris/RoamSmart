import { ScrollView, Pressable, Text, View } from "react-native";
import MapView from "react-native-maps";
import { Place } from "@/types/place";

type Props = {
  places: Place[];
  mapRef: React.RefObject<MapView | null>;
  setSelectedPlace: React.Dispatch<React.SetStateAction<Place | null>>;
  fetchAIDetails: (id: string) => void;
};

export default function HorizontalPlacesList({
  places,
  mapRef,
  setSelectedPlace,
  fetchAIDetails,
}: Props) {
  return (
    <View className="absolute bottom-5 left-3 right-3 pb-2">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {places.map((place) => (
          <Pressable
            key={place.id}
            className="bg-white rounded-xl shadow-md mr-3 p-3 w-56"
            onPress={() => {

              setSelectedPlace(place);

              mapRef.current?.animateToRegion(
                {
                  latitude: place.latitude,
                  longitude: place.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                },
                500
              );

              fetchAIDetails(place.id);
            }}
          >

            {/* Name */}
            <Text className="font-semibold text-lg">
              {place.name}
            </Text>

            {/* Rating + Type */}
            <Text className="text-gray-500 mt-1">
              {place.type === "Restaurant" ? "🍽" : "📍"} ⭐ {place.rating} • {place.type}
            </Text>

            {/* Distance */}
            <Text className="text-gray-400 mt-1">
              📍 {place.distance} km away
            </Text>

            {/* Open / Closed */}
            <Text
              className={`mt-1 font-medium ${
                place.open_now
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {place.open_now ? "Open Now" : "Closed"}
            </Text>

          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}