"use client";

import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Stack, useRouter, useRootNavigationState } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Network from "expo-network";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { MusicPlayerProvider } from "../context/MusicPlayerContext";
import { usePushNotifications } from "../hooks/usePushNotifications";
import PlayerModal from "../components/PlayerModal";

// Subcomponente que controla las redirecciones seguras
function AuthGate() {
  const { token, loading } = useAuth();
  const router = useRouter();
  const rootNavigation = useRootNavigationState();

  usePushNotifications();

  // Estado de conexión
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  // Comprobar conexión de red
  useEffect(() => {
    async function checkConnection() {
      const networkState = await Network.getNetworkStateAsync();
      setIsConnected(
        Boolean(networkState.isConnected && networkState.isInternetReachable)
      );
    }

    checkConnection();

    // Escucha cambios en tiempo real (opcional)
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  // Control de navegación segura
  useEffect(() => {
    if (!rootNavigation?.key || loading || isConnected === null) return;

    if (!isConnected) return; // Si no hay Internet, no redirige aún
    if (!token) {
      router.replace("/(auth)/login");
    } else {
      router.replace("/(tabs)");
    }
  }, [rootNavigation?.key, loading, token, isConnected]);

  // Pantalla de carga o sin conexión
  if (loading || !rootNavigation?.key || isConnected === null) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="#A855F7" />
        <Text className="text-gray-400 mt-3">Cargando...</Text>
      </View>
    );
  }

  if (!isConnected) {
    return (
      <View className="flex-1 items-center justify-center bg-black px-6">
        <Text className="text-red-400 text-lg font-semibold mb-2">
          Sin conexión a Internet
        </Text>
        <Text className="text-gray-400 text-center">
          Verifica tu conexión y vuelve a intentarlo.
        </Text>
      </View>
    );
  }

  // Navegación principal
  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="admin-panel" />
      </Stack>

      <PlayerModal />
    </View>
  );
}

// Layout raíz con provider de autenticación
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MusicPlayerProvider>
          <AuthGate />
        </MusicPlayerProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
