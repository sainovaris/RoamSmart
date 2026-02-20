import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import type { LocationObjectCoords } from "expo-location";

type Place = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
};

export default function Map() {
  const [location, setLocation] = useState<LocationObjectCoords | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLoading(false);
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);

      const mockPlaces: Place[] = [
        {
          id: 0,
          name: "Race Course Garden",
          latitude: 22.306583978682376,
          longitude: 70.78971434896978,
        },
        {
          id: 1,
          name: "Ranjit Vilas Palace",
          latitude: 22.29368921068667,
          longitude: 70.80935542883624,
        }
      ];

      setPlaces(mockPlaces);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <MapView
        style={{ flex: 1 }}
        showsUserLocation
        initialRegion={{
          latitude: location?.latitude ?? 22.3039,
          longitude: location?.longitude ?? 70.8022,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {places.map((place) => (
          <Marker
            key={place.id}
            coordinate={{
              latitude: place.latitude,
              longitude: place.longitude,
            }}
            title={place.name}
          />
        ))}
      </MapView>
    </View>
  );
}