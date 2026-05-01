import { ScrollView, Pressable, Text, View } from "react-native";
import MapView from "react-native-maps";
import { Place } from "@/types/place";
// import { useTrip } from "@/context/TripContext";

type Props = {
  places: Place[];
  mapRef: React.RefObject<MapView | null>;
  setSelectedPlace: React.Dispatch<React.SetStateAction<Place | null>>;
  fetchAIDetails: (place: Place) => void;
};

export default function HorizontalPlacesList({
  places,
  mapRef,
  setSelectedPlace,
  fetchAIDetails,
}: Props) {
  // const { isNavigating } = useTrip();

  return (
    <View className="absolute bottom-5 left-5 right-5 pb-2">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {places.map((place) => (
          <Pressable
            key={place.id}
            className="bg-white rounded-xl shadow-md mr-3 p-3 w-56"
            onPress={() => {
              setSelectedPlace((prev) => {
                // avoid redundant state + API call
                if (prev?.place_id !== place.place_id){
                  fetchAIDetails(place);
                }
                return place;
              });

              mapRef.current?.animateToRegion(
                {
                  latitude: place.latitude,
                  longitude: place.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                },
                400
              );
            }}
          >
            {/* Name */}
            <Text
              className="font-semibold text-base"
              numberOfLines={2}
              ellipsizeMode="tail"
            >
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
                place.open_now ? "text-green-600" : "text-red-500"
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