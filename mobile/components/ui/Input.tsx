import { TextInput } from "react-native";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export default function Input({
  value,
  onChangeText,
  placeholder,
}: Props) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
    />
  );
}