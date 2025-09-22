// app/(tabs)/_layout.tsx
import { Tabs, usePathname, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet, TouchableOpacity, Text, Alert } from "react-native";
import { useEffect } from "react";
import MiniReproductor from "../../components/MiniReproductor";
import PlayerModal from "../../components/PlayerModal"; 
import { MusicPlayerProvider } from "../../context/MusicPlayerContext";
import { useAuthStore } from "../../stores/authStore";

export default function TabsLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, user, logout, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isLoading]);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <Ionicons name="musical-notes-outline" size={48} color="#D400FF" />
        <Text className="text-white mt-4">Cargando...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return null; // El useEffect redirigirá al login
  }

  return (
    <MusicPlayerProvider>
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: "#D400FF",
            tabBarStyle: {
              backgroundColor: "#121212",
              borderTopColor: "#121212",
              height: 70,
              paddingBottom: 10,
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Principal",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="library"
            options={{
              title: "Biblioteca",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="library-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="search"
            options={{
              title: "Buscar",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="search" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "Perfil",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="person" size={size} color={color} />
              ),
            }}
          />
        </Tabs>     

          <View style={styles.miniPlayerWrapper}>
            <MiniReproductor />
          </View>
        <PlayerModal />
      </View>
    </MusicPlayerProvider>
  );
}

const styles = StyleSheet.create({
  miniPlayerWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 70,
    zIndex: 10,
  },
});
