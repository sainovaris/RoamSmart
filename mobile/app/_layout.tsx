import './globals.css'
import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // 🔥 removes "index", "map" header
      }}
    />
  );
}