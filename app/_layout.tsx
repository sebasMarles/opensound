import { ActivityIndicator, View } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { SafeAreaProvider } from "react-native-safe-area-context"; // ✅ IMPORTANTE

const AuthenticatedStack = () => {
  const { token, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const isAuthGroup = segments[0] === "(auth)";

  useEffect(() => {
    if (loading) return;

    if (!token && !isAuthGroup) {
      router.replace("/(auth)/login");
    } else if (token && isAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isAuthGroup, loading, router, token]);

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
    </Stack>
  );
};

const RootLayout = () => {
  return (
    <SafeAreaProvider>  {/* ✅ AÑADIDO */}
      <AuthProvider>
        <AuthenticatedStack />
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default RootLayout;
