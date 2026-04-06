import { View } from "react-native";

export default function Card({ children }: any) {
  return (
    <View className="bg-surface p-4 rounded-2xl shadow-md">
      {children}
    </View>
  );
}