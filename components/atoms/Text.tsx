import React from "react";
import { Text as RNText, TextProps } from "react-native";

type Props = TextProps & {
  variant?: "title" | "subtitle" | "body" | "caption";
  className?: string;
};

const map = {
  title: "text-xl font-bold",
  subtitle: "text-lg font-semibold",
  body: "text-base",
  caption: "text-xs text-gray-400",
} as const;

export default function Text({
  variant = "body",
  className = "",
  ...rest
}: Props) {
  return <RNText {...rest} className={`text-white ${map[variant]} ${className}`} />;
}
