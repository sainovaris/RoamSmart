import { forwardRef, useImperativeHandle, useRef } from "react";
import NativeMapView, {
  type MapViewProps,
  type Region,
} from "react-native-maps";

export type MapViewHandle = {
  animateToRegion: (region: Region, duration?: number) => void;
};

const MapView = forwardRef<MapViewHandle, MapViewProps>((props, ref) => {
  const nativeRef = useRef<NativeMapView>(null);

  useImperativeHandle(ref, () => ({
    animateToRegion: (region, duration) => {
      nativeRef.current?.animateToRegion(region, duration);
    },
  }));

  return <NativeMapView ref={nativeRef} {...props} />;
});

MapView.displayName = "MapView";

export default MapView;
