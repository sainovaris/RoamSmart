import { View, Pressable, Text, ActivityIndicator } from "react-native";


type Props = {
  loading: boolean;
  onPress: () => void;
};

export default function PlanButton({ loading, onPress }: Props) {
  return (
    <View>
      <Pressable
        onPress={onPress}
        className="bg-[#d05203] py-3 rounded-xl"
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-center font-semibold">
            Plan My Trip
          </Text>
        )}
      </Pressable>
    </View>
  );
}