import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; 

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#D400FF", 
        tabBarStyle: {
        backgroundColor: "#121212", 
        borderTopColor: "#121212", 
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
  );
}
