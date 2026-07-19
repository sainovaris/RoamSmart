import MapMarker from "@/components/MapMarker";
import { useTrip } from "@/context/TripContext";
import { Place } from "@/types/place";

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
          <MapMarker
            key={place.id}
            coordinate={{
              latitude: place.latitude,
              longitude: place.longitude,
            }}
            title={place.name}
            pinColor={isCurrentStep ? "green" : isSelected ? "orange" : "red"}
            onPress={() => {
              if (selectedPlace?.place_id === place.place_id) return;

              setSelectedPlace(place);
              if (!isNavigating) fetchAIDetails(place);
            }}
          />
        );
      })}
    </>
  );
}
