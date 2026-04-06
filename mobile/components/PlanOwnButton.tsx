import { View, Text, Pressable } from "react-native";

type Props = {
  onPress: () => void;
};

export default function PlanOwnButton({ onPress }: Props) {
  return (
    <View>
      <Pressable
        onPress={onPress}
        className="bg-[#d05203] py-3 rounded-xl"
      >
        <Text className="text-white text-center text-sm font-semibold">
          Plan My Trip Own
        </Text>
      </Pressable>
    </View>
  );
}