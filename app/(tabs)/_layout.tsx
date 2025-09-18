// app/(tabs)/_layout.tsx
import { Tabs, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";
import MiniReproductor from "../../components/MiniReproductor";
import PlayerModal from "../../components/PlayerModal"; // <- agregado
import { MusicPlayerProvider } from "../../context/MusicPlayerContext";

export default function TabsLayout() {
  const pathname = usePathname();

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
        </Tabs>

        {pathname !== "/auth/login" && pathname !== "/auth/register" && (
          <View style={styles.miniPlayerWrapper}>
            <MiniReproductor />
          </View>
        )}

        {/* Modal de detalles del reproductor (overlay) */}
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