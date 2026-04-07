import { ScrollView, Pressable, Text, View } from "react-native";

type Props = {
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
};

const categories = [
  "All",
  "Food",
  "Nature",
  "Culture",
  "Stay",
  "Entertainment",
];

export default function CategoryPicker({
  selectedCategory,
  setSelectedCategory,
}: Props) {
  return (
    <View className="py-2">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 
          1
         }}
      >
        {categories.map((category) => {
          const isSelected = selectedCategory === category;

          return (
            <Pressable
              key={category}
              onPress={() => setSelectedCategory(category)}
              className={`mr-2 my-1 px-1 py-1.5 rounded-md border-spacing-3 ${
                isSelected
                  ? "bg-[#d05203] border-gray-800"
                  : "bg-white border-gray-800"
              }`}
            >
              <Text
                className={`text-sm font-medium px-3 ${
                  isSelected ? "text-white" : "text-gray-700"
                }`}
              >
                {category}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}