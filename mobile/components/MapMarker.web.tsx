import React, { useEffect, useRef } from "react";
import { useGoogleMap } from "./MapView.web";

type MarkerProps = {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title?: string;
  pinColor?: string;
  onPress?: () => void;
};

export default function MapMarkerWeb({
  coordinate,
  title,
  pinColor,
  onPress,
}: MarkerProps) {
  const map = useGoogleMap();
  const markerRef = useRef<any | null>(null);

  useEffect(() => {
    if (!map) return;

    const googleObj = (window as any).google;
    if (!googleObj || !googleObj.maps) return;

    const position = {
      lat: coordinate.latitude,
      lng: coordinate.longitude,
    };

    const marker = new googleObj.maps.Marker({
      position,
      map,
      title,
      icon: pinColor
        ? {
            path: googleObj.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: pinColor,
            fillOpacity: 1,
            strokeColor: "white",
            strokeWeight: 2,
          }
        : undefined,
    });

    if (onPress) {
      marker.addListener("click", () => onPress());
    }

    markerRef.current = marker;

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, [
    map,
    coordinate.latitude,
    coordinate.longitude,
    title,
    pinColor,
    onPress,
  ]);

    return null;
}
