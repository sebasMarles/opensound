import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MusicPlayerProvider, useMusicPlayer } from "../context/MusicPlayerContext";
import { View } from "react-native";
import MiniReproductor from "../components/MiniReproductor";

function LayoutWithPlayer() {
  const { currentSong } = useMusicPlayer();

  return (
    <View className="flex-1 bg-black">
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
          name="login"
          options={{
            title: "Iniciar Sesión",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-circle" size={size} color={color} />
            ),
          }}
        />
      </Tabs>

      {/* Aquí lo anclamos abajo, solo si hay canción */}
      {currentSong && <MiniReproductor />}
    </View>
  );
}

export default function Layout() {
  return (
    <MusicPlayerProvider>
      <LayoutWithPlayer />
    </MusicPlayerProvider>
  );
}
