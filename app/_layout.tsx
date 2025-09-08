import { Tabs, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import MiniReproductor from "../components/MiniReproductor";
import { MusicPlayerProvider } from "../context/MusicPlayerContext";
import { View, StyleSheet } from "react-native";

export default function Layout() {
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

        {/* Mini reproductor flotante */}
        {pathname !== "/login" && (
          <View style={styles.miniPlayerWrapper}>
            <MiniReproductor />
          </View>
        )}
      </View>
    </MusicPlayerProvider>
  );
}

const styles = StyleSheet.create({
  miniPlayerWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 70, // 👈 justo encima del tab bar
    zIndex: 10,
  },
});
