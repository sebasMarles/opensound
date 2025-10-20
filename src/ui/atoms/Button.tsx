import React from "react";
import {
  TouchableOpacity,
  ActivityIndicator,
  GestureResponderEvent,
} from "react-native";
import Text from "./Text";

type ButtonProps = {
  title?: string;
  children?: React.ReactNode;
  onPress?: (e: GestureResponderEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  accessibilityLabel?: string;
  fullWidth?: boolean;
};

const base = "rounded-lg items-center justify-center";
const variants = {
  primary: "bg-purple-600",
  outline: "bg-transparent border border-purple-500",
  ghost: "bg-transparent",
} as const;
const sizes = {
  sm: "px-3 py-2",
  md: "px-4 py-3",
  lg: "px-5 py-4",
} as const;

export default function Button({
  title,
  children,
  onPress,
  disabled,
  loading,
  variant = "primary",
  size = "md",
  className = "",
  accessibilityLabel,
  fullWidth = false,
}: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${
    disabled ? "opacity-50" : ""
  } ${fullWidth ? "w-full" : ""} ${className}`;

  const textColor = variant === "outline" ? "text-purple-400" : "text-white";

  const renderChildren = () => {
    if (typeof children === "string") {
      return <Text className={`font-bold ${textColor}`}>{children}</Text>;
    }

    if (children) {
      return children;
    }

    return <Text className={`font-bold ${textColor}`}>{title}</Text>;
  };

  return (
    <TouchableOpacity
      className={classes}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
    >
      {loading ? <ActivityIndicator color="#fff" /> : renderChildren()}
    </TouchableOpacity>
  );
}
