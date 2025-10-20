import { Stack } from "expo-router";

// Estructura la navegación interna de la pestaña de búsqueda.
export default function SearchLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
