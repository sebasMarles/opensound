import React from "react";
import { View, Text } from "react-native";

type BadgeProps = {
  label?: string;
  children?: React.ReactNode;
  variant?: "primary" | "outline" | "neutral";
  className?: string;
};

const styles = {
  primary: { container: "bg-purple-700", text: "text-white" },
  outline: { container: "border border-purple-600", text: "text-purple-400" },
  neutral: { container: "bg-neutral-800", text: "text-white" },
} as const;

export default function Badge({
  label,
  children,
  variant = "primary",
  className = "",
}: BadgeProps) {
  return (
    <View className={`px-3 py-1 rounded-full ${styles[variant].container} ${className}`}>
      <Text className={`text-xs font-semibold ${styles[variant].text}`}>
        {children ?? label}
      </Text>
    </View>
  );
}