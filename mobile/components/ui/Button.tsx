import { Pressable, Text, ActivityIndicator } from "react-native";

type Props = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  loading?: boolean;
};

export default function Button({
  title,
  onPress,
  variant = "primary",
  loading = false,
}: Props) {

  const bg =
    variant === "primary"
      ? "bg-brand"
      : "bg-gray-300";

  const textColor =
    variant === "primary"
      ? "text-white"
      : "text-text";

  console.log(`Textcolor: ${textColor} and BG: ${bg}`)
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      className={`${bg} py-3 rounded-xl items-center ${
        loading ? "opacity-70" : ""
      }`}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text className={`${textColor} font-semibold`}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}