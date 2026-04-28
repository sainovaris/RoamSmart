import { Polyline } from "react-native-maps";

type LatLng = {
  latitude: number;
  longitude: number;
};

type Props = {
  coordinates: LatLng[];
  visible?: boolean;
};

export default function RoutePolyline({
  coordinates,
  visible = true,
}: Props) {
  if (!visible || !coordinates || coordinates.length === 0) return null;

  return (
    <Polyline
      coordinates={coordinates}
      strokeWidth={5}
      strokeColor="#d05203"
      lineCap="round"
      lineJoin="round"
    />
  );
}