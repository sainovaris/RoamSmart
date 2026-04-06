import { Text as RNText } from "react-native";

type Props = {
  children: React.ReactNode;
  variant?: "title" | "body" | "caption";
  className?: string;
};

export default function Text({
  children,
  variant = "body",
  className = "",
}: Props) {
  const base =
    variant === "title"
      ? "text-lg font-bold text-text"
      : variant === "caption"
      ? "text-sm text-textLight"
      : "text-base text-text";

  return (
    <RNText className={`${base} ${className}`}>
      {children}
    </RNText>
  );
}