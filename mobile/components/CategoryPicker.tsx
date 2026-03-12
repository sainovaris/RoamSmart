import { View } from "react-native";
import { Picker } from "@react-native-picker/picker";

type Props = {
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
};

export default function CategoryPicker({
  selectedCategory,
  setSelectedCategory,
}: Props) {
  return (
    <View className=" bg-white rounded-lg">
      <Picker
        selectedValue={selectedCategory}
        onValueChange={setSelectedCategory}
      >
        <Picker.Item label="All" value="All" />
        <Picker.Item label="Food" value="Food" />
        <Picker.Item label="Nature" value="Nature" />
        <Picker.Item label="Culture" value="Culture" />
        <Picker.Item label="Shopping" value="Shopping" />
        <Picker.Item label="Religious" value="Religious" />
        <Picker.Item label="Nightlife" value="Nightlife" />
        <Picker.Item label="Entertainment" value="Entertainment" />
      </Picker>
    </View>
  );
}