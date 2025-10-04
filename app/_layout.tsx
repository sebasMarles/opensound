import { ActivityIndicator, View } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { SafeAreaProvider } from "react-native-safe-area-context";

const AuthenticatedStack = () => {
  const { token, loading } = useAuth();
  const router = useRouter();

  // 👇 Ensancha el tipo a string[] para evitar el error de tupla
  const segmentsArr = Array.from(useSegments()); // <- clave
  const isAuthGroup = segmentsArr[0] === "(auth)";
  const currentAuthScreen = segmentsArr[1] ?? null;

  const isAuthScreen =
    isAuthGroup && (currentAuthScreen === "login" || currentAuthScreen === "register");

  useEffect(() => {
    if (loading) return;

    if (!token && !isAuthGroup) {
      router.replace("/(auth)/login");
    } else if (token && isAuthScreen) {
      router.replace("/profile");
    } else if (token && isAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isAuthGroup, isAuthScreen, loading, router, token]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="#A855F7" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="(auth)">
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="profile" />
    </Stack>
  );
};

const RootLayout = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AuthenticatedStack />
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default RootLayout;
