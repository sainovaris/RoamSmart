import { Marker } from "react-native-maps";
import { Place } from "@/types/place";
import { useTrip } from "@/context/TripContext";

type Props = {
  places: Place[];
  selectedPlace: Place | null;
  setSelectedPlace: React.Dispatch<React.SetStateAction<Place | null>>;
  fetchAIDetails: (place: Place) => void;
};

export default function MapMarkers({
  places,
  selectedPlace,
  setSelectedPlace,
  fetchAIDetails,
}: Props) {
  const { currentStepIndex, isNavigating } = useTrip();

  return (
    <>
      {places.map((place, index) => {
        const isSelected = selectedPlace?.id === place.id;
        const isCurrentStep = isNavigating && index === currentStepIndex;

        return (
          <Marker
            key={place.id}
            coordinate={{
              latitude: place.latitude,
              longitude: place.longitude,
            }}
            title={place.name}
            pinColor={
              isCurrentStep
                ? "green"       // 🟢 current navigation step
                : isSelected
                  ? "orange"      // 🟠 selected
                  : "red"         // 🔴 default
            }
            onPress={(e) => {
              e.stopPropagation(); // 🔥 IMPORTANT FIX

              if (selectedPlace?.id !== place.id) {
                setSelectedPlace(place);

                if (!isNavigating) {
                  fetchAIDetails(place);
                }
              }
            }}
          />
        );
      })}
    </>
  );
}