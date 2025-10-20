import { Stack } from "expo-router";

// Mantiene la navegación interna de la pestaña de biblioteca.
export default function LibraryLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
