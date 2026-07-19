import React, {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

type MapViewWebProps = {
  style?: any;
  initialRegion: Region;
  children?: ReactNode;
  showsUserLocation?: boolean;
  followsUserLocation?: boolean;
  loadingEnabled?: boolean;
  customMapStyle?: unknown;
};

type GoogleMapInstance = any;

export type MapViewHandle = {
  animateToRegion: (region: Region, duration?: number) => void;
};

const GoogleMapContext = createContext<GoogleMapInstance | null>(null);

export function useGoogleMap() {
  return useContext(GoogleMapContext);
}

const MapViewWeb = forwardRef<MapViewHandle, MapViewWebProps>(function MapViewWeb(
  { style, initialRegion, children },
  ref,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<GoogleMapInstance | null>(null);

  useImperativeHandle(ref, () => ({
    animateToRegion: (region) => {
      map?.panTo({ lat: region.latitude, lng: region.longitude });
    },
  }));

  useEffect(() => {
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error(
        "Missing EXPO_PUBLIC_GOOGLE_MAPS_API_KEY for web Google Maps.",
      );
      return;
    }

    const initMap = () => {
      if (!containerRef.current || map) return;

      const center = {
        lat: initialRegion.latitude,
        lng: initialRegion.longitude,
      };

      const googleObj = (window as any).google;
      if (!googleObj || !googleObj.maps) return;

      const instance = new googleObj.maps.Map(containerRef.current, {
        center,
        zoom: 14,
      });

      setMap(instance);
    };

    if (typeof window === "undefined") return;

    const g = (window as any).google;
    if (g && g.maps) {
      initMap();
      return;
    }

    let script = document.getElementById(
      "google-maps-js",
    ) as HTMLScriptElement | null;

    if (script && (window as any).google && (window as any).google.maps) {
      initMap();
      return;
    }

    if (!script) {
      script = document.createElement("script");
      script.id = "google-maps-js";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    script.addEventListener("load", initMap);

    return () => {
      script?.removeEventListener("load", initMap);
    };
  }, [
    initialRegion.latitude,
    initialRegion.longitude,
    initialRegion.latitudeDelta,
    initialRegion.longitudeDelta,
    map,
  ]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        ...style,
      }}
    >
      <div
        ref={containerRef}
        style={{ position: "absolute", inset: 0 }}
      />
      <GoogleMapContext.Provider value={map}>
        {map && children}
      </GoogleMapContext.Provider>
    </div>
  );
});

export default MapViewWeb;
