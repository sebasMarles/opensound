import { forwardRef } from "react";
import type { TextInputProps } from "react-native";
import { TextInput } from "react-native";

type Props = TextInputProps & {
  hasError?: boolean;
};

// Campo de texto estilizado que respeta la estética actual de la app.
export const Input = forwardRef<TextInput, Props>(function Input(
  { hasError = false, className = "", ...props },
  ref,
) {
  return (
    <TextInput
      ref={ref}
      placeholderTextColor="#9CA3AF"
      className={`bg-neutral-900 text-white px-4 py-3 rounded-lg border ${
        hasError ? "border-red-500" : "border-neutral-700 focus:border-purple-600"
      } ${className}`}
      {...props}
    />
  );
});
