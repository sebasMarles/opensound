import React from "react";
import { Keyboard, TouchableWithoutFeedback, View, StyleSheet, ViewStyle } from "react-native";

interface KeyboardDismissWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const KeyboardDismissWrapper: React.FC<KeyboardDismissWrapperProps> = ({
  children,
  style,
}) => {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={[styles.container, style]}>{children}</View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
