import { Pressable, Text } from "react-native";

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export default function Chip({ label, selected, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className={`mr-2 mb-2 px-3 py-2 rounded-full border ${
        selected
          ? "bg-brand border-brand"
          : "bg-white border-gray-300"
      }`}
    >
      <Text
        className={`${
          selected ? "text-white" : "text-textLight"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}