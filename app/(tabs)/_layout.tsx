"use client"

// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { View } from "react-native"
import { useMusicPlayer } from "../../context/MusicPlayerContext"
import MiniReproductor from "../../components/MiniReproductor"

export default function TabsLayout() {
  const { currentSong } = useMusicPlayer()

  return (
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
            tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: "Biblioteca",
            tabBarIcon: ({ color, size }) => <Ionicons name="library-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "Buscar",
            tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="playlist-detail"
          options={{
            href: null, // Oculta del tab bar pero mantiene las tabs visibles
          }}
        />
        <Tabs.Screen
          name="artist-detail"
          options={{
            href: null, // Oculta del tab bar pero mantiene las tabs visibles
          }}
        />
      </Tabs>

      {currentSong && (
        <View style={{ position: "absolute", bottom: 70, left: 0, right: 0, zIndex: 10 }}>
          <MiniReproductor />
        </View>
      )}
    </View>
  )
}
