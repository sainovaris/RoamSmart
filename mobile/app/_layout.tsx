import { TripProvider } from '@/context/TripContext';
import './globals.css'
import { Stack } from "expo-router";

export default function Layout() {
  return (
    <TripProvider>
      <Stack
        screenOptions={{
          headerShown: false, // 🔥 removes "index", "map" header
        }}
      />
    </TripProvider>
  );
}