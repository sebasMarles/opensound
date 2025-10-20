import React from "react";
import { Ionicons } from "@expo/vector-icons";

type IconProps = {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  // Ionicons no soporta className (solo style), dejamos props básicos
};

export default function Icon({ name, size = 24, color = "white" }: IconProps) {
  return <Ionicons name={name} size={size} color={color} />;
}