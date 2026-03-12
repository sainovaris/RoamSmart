import { Marker } from "react-native-maps";
import { Place } from "@/types/place";

type Props = {
  places: Place[];
  selectedPlace: Place | null;
  setSelectedPlace: React.Dispatch<React.SetStateAction<Place | null>>;
  fetchPlaceDetails: (id: string) => void;
  fetchAIDetails: (id: string) => void;
};

export default function MapMarkers({
  places,
  selectedPlace,
  setSelectedPlace,
  fetchPlaceDetails,
  fetchAIDetails
}: Props) {
  return (
    <>
      {places.map((place) => (
        <Marker
          key={place.id}
          coordinate={{
            latitude: place.latitude,
            longitude: place.longitude,
          }}
          title={place.name}
          pinColor="red"
          onPress={() => {
            if (selectedPlace?.id !== place.id) {
              setSelectedPlace(place);
              fetchPlaceDetails(place.id);
              fetchAIDetails(place.id);
            }
          }}
        />
      ))}
    </>
  );
}