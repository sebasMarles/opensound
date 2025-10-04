# OpenSound — Contexto integral para IA

## Estructura de carpetas y archivos
```text
./
├── app/
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── library/
│   │   │   ├── _layout.tsx
│   │   │   └── library.tsx
│   │   └── search/
│   │       ├── _layout.tsx
│   │       └── search.tsx
│   ├── _layout.tsx
│   └── profile.tsx
├── components/
│   └── organisms/
│       ├── MiniReproductor.tsx
│       └── PlayerModal.tsx
├── context/
│   ├── AuthContext.tsx
│   └── MusicPlayerContext.tsx
├── services/
│   ├── api.ts
│   ├── auth.ts
│   └── jamendo.ts
├── store/
│   └── authStore.ts
├── types/
│   └── auth.ts
├── app.json
├── babel.config.js
├── nativewind.d.ts
├── package.json
└── tsconfig.json
```

## Código fuente

### P0 — Imprescindibles (flujo, auth, audio)

#### `app/_layout.tsx`
```tsx
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
  const currentAuthScreen = segments[1];
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
    <SafeAreaProvider>  {/* ✅ AÑADIDO */}
      <AuthProvider>
        <AuthenticatedStack />
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default RootLayout;
```

#### `app/(auth)/_layout.tsx`
```tsx
import { Stack } from "expo-router";

const AuthLayout = () => {
  return <Stack screenOptions={{ headerShown: false }} />;
};

export default AuthLayout;
```

#### `app/(auth)/login.tsx`
```tsx
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";

type FormData = {
  email: string;
  password: string;
};

export default function Login() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const { signIn, loading } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = async (data: FormData) => {
    try {
      setErrorMessage(null);
      await signIn({ email: data.email.trim(), password: data.password });
      router.replace("/(tabs)");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo iniciar sesión";
      setErrorMessage(message);
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-neutral-900">
      <TouchableOpacity
        className="absolute top-10 left-4 z-10"
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Volver al inicio"
      >
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>

      <Text className="text-center text-3xl font-bold text-purple-500 mb-8">
        OpenSound
      </Text>

      <Controller
        control={control}
        name="email"
        rules={{
          required: "El correo es obligatorio",
          pattern: {
            value: /\S+@\S+\.\S+/,
            message: "Correo inválido",
          },
        }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            className="bg-neutral-800 text-white px-4 py-3 rounded-lg mb-2"
            placeholder="Correo"
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.email && (
        <Text className="text-red-500 mb-2">{errors.email.message}</Text>
      )}

      <Controller
        control={control}
        name="password"
        rules={{
          required: "La contraseña es obligatoria",
          minLength: {
            value: 6,
            message: "Mínimo 6 caracteres",
          },
        }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            className="bg-neutral-800 text-white px-4 py-3 rounded-lg mb-2"
            placeholder="Contraseña"
            placeholderTextColor="#888"
            secureTextEntry
            autoCapitalize="none"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.password && (
        <Text className="text-red-500 mb-2">{errors.password.message}</Text>
      )}

      {errorMessage && (
        <Text className="text-red-400 text-center mb-2">{errorMessage}</Text>
      )}

      <TouchableOpacity
        className="bg-purple-600 py-3 rounded-lg mt-4 flex-row items-center justify-center"
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
        accessibilityRole="button"
        accessibilityState={{ disabled: loading }}
      >
        {loading && (
          <ActivityIndicator style={{ marginRight: 8 }} size="small" color="#fff" />
        )}
        <Text className="text-center text-white font-bold">Iniciar Sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="border border-purple-600 py-3 rounded-lg mt-2"
        onPress={() => router.push("/(auth)/register")}
      >
        <Text className="text-center text-purple-400 font-bold">
          Registrarse
        </Text>
      </TouchableOpacity>

      <Text className="text-center text-gray-400 mt-4">
        Olvidé mi contraseña
      </Text>
    </View>
  );
}
```
      <TouchableOpacity
        className="absolute top-10 left-4 z-10"
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Volver al inicio"
      >
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>

      <Text className="text-center text-3xl font-bold text-purple-500 mb-8">
        OpenSound
      </Text>

      <Controller
        control={control}
        name="email"
        rules={{
          required: "El correo es obligatorio",
          pattern: {
            value: /\S+@\S+\.\S+/,
            message: "Correo inválido",
          },
        }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            className="bg-neutral-800 text-white px-4 py-3 rounded-lg mb-2"
            placeholder="Correo"
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.email && (
        <Text className="text-red-500 mb-2">{errors.email.message}</Text>
      )}

      <Controller
        control={control}
        name="password"
        rules={{
          required: "La contraseña es obligatoria",
          minLength: {
            value: 6,
            message: "Mínimo 6 caracteres",
          },
        }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            className="bg-neutral-800 text-white px-4 py-3 rounded-lg mb-2"
            placeholder="Contraseña"
            placeholderTextColor="#888"
            secureTextEntry
            autoCapitalize="none"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.password && (
        <Text className="text-red-500 mb-2">{errors.password.message}</Text>
      )}

      {errorMessage && (
        <Text className="text-red-400 text-center mb-2">{errorMessage}</Text>
      )}

      <TouchableOpacity
        className="bg-purple-600 py-3 rounded-lg mt-4 flex-row items-center justify-center"
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
        accessibilityRole="button"
        accessibilityState={{ disabled: loading }}
      >
        {loading && (
          <ActivityIndicator style={{ marginRight: 8 }} size="small" color="#fff" />
        )}
        <Text className="text-center text-white font-bold">Iniciar Sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="border border-purple-600 py-3 rounded-lg mt-2"
        onPress={() => router.push("/(auth)/register")}
      >
        <Text className="text-center text-purple-400 font-bold">
          Registrarse
        </Text>
      </TouchableOpacity>

      <Text className="text-center text-gray-400 mt-4">
        Olvidé mi contraseña
      </Text>
    </View>
  );
}
```

#### `app/(auth)/register.tsx`
```tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";
import { RegisterCredentials } from "../../types/auth";

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterCredentials>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterCredentials) => {
    clearError();
    try {
      await register(data);
      router.replace('/(tabs)');
    } catch {
      // Error ya manejado en el store
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1 bg-black"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-16">
          {/* Header */}
          <View className="flex-row items-center mb-8">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-4 p-2"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Crear Cuenta</Text>
          </View>

          {/* Logo y título */}
          <View className="items-center mb-8">
            <Image
              source={require('../../assets/logo.png')}
              className="w-16 h-16 mb-3"
              resizeMode="contain"
            />
            <Text className="text-white text-2xl font-bold mb-2">Únete a OpenSound</Text>
            <Text className="text-gray-400 text-sm text-center">
              Descubre música increíble de artistas emergentes
            </Text>
          </View>

          {/* Formulario */}
          <View className="space-y-5">
            {/* Name */}
            <View>
              <Text className="text-white text-sm font-medium mb-2">Nombre completo</Text>
              <Controller
                control={control}
                name="name"
                rules={{
                  required: 'El nombre es requerido',
                  minLength: { value: 2, message: 'El nombre debe tener al menos 2 caracteres' },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="bg-neutral-900 text-white px-4 py-3 rounded-lg border border-neutral-700 focus:border-purple-600"
                    placeholder="Tu nombre completo"
                    placeholderTextColor="#9CA3AF"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                )}
              />
              {errors.name && (
                <Text className="text-red-500 text-sm mt-1">{errors.name.message}</Text>
              )}
            </View>

            {/* Email */}
            <View>
              <Text className="text-white text-sm font-medium mb-2">Email</Text>
              <Controller
                control={control}
                name="email"
                rules={{
                  required: 'El email es requerido',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="bg-neutral-900 text-white px-4 py-3 rounded-lg border border-neutral-700 focus:border-purple-600"
                    placeholder="tu@email.com"
                    placeholderTextColor="#9CA3AF"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                )}
              />
              {errors.email && (
                <Text className="text-red-500 text-sm mt-1">{errors.email.message}</Text>
              )}
            </View>

            {/* Password */}
            <View>
              <Text className="text-white text-sm font-medium mb-2">Contraseña</Text>
              <View className="relative">
                <Controller
                  control={control}
                  name="password"
                  rules={{
                    required: 'La contraseña es requerida',
                    minLength: { value: 6, message: 'La contraseña debe tener al menos 6 caracteres' },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="bg-neutral-900 text-white px-4 py-3 pr-12 rounded-lg border border-neutral-700 focus:border-purple-600"
                      placeholder="Mínimo 6 caracteres"
                      placeholderTextColor="#9CA3AF"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  )}
                />
                <TouchableOpacity
                  className="absolute right-3 top-3"
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text className="text-red-500 text-sm mt-1">{errors.password.message}</Text>
              )}
            </View>

            {/* Confirm Password */}
            <View>
              <Text className="text-white text-sm font-medium mb-2">Confirmar contraseña</Text>
              <View className="relative">
                <Controller
                  control={control}
                  name="confirmPassword"
                  rules={{
                    required: 'Confirma tu contraseña',
                    validate: (value) =>
                      value === password || 'Las contraseñas no coinciden',
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="bg-neutral-900 text-white px-4 py-3 pr-12 rounded-lg border border-neutral-700 focus:border-purple-600"
                      placeholder="Confirma tu contraseña"
                      placeholderTextColor="#9CA3AF"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  )}
                />
                <TouchableOpacity
                  className="absolute right-3 top-3"
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</Text>
              )}
            </View>

            {/* Error message */}
            {error && (
              <View className="bg-red-900/20 border border-red-500 rounded-lg p-3">
                <Text className="text-red-400 text-sm text-center">{error}</Text>
              </View>
            )}

            {/* Register Button */}
            <TouchableOpacity
              className={`bg-purple-600 py-4 rounded-lg mt-6 ${isLoading ? 'opacity-50' : ''}`}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              <Text className="text-white text-center text-lg font-semibold">
                {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Text>
            </TouchableOpacity>

            {/* Terms */}
            <Text className="text-gray-400 text-xs text-center mt-4">
              Al registrarte, aceptas nuestros{' '}
              <Text className="text-purple-400">Términos de Servicio</Text> y{' '}
              <Text className="text-purple-400">Política de Privacidad</Text>
            </Text>

            {/* Login Link */}
            <View className="flex-row justify-center items-center mt-6">
              <Text className="text-gray-400">¿Ya tienes cuenta? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text className="text-purple-400 font-semibold">Inicia sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
```

#### `app/(tabs)/_layout.tsx`
```tsx
// app/(tabs)/_layout.tsx
import { Tabs, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";
import MiniReproductor from "../../components/MiniReproductor";
import PlayerModal from "../../components/PlayerModal";
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
```

#### `app/(tabs)/index.tsx`
```tsx
import { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { getRecentSongs, searchSongs } from "../../services/jamendo";
import { useMusicPlayer } from "../../context/MusicPlayerContext";
import { useAuth } from "../../context/AuthContext";

type TagOption = { label: string; query: string };

const TAGS: TagOption[] = [
  { label: "Rock", query: "rock" },
  { label: "Reggaetón y vibras", query: "reggaeton" },
  { label: "Trap", query: "trap" },
];

export default function HomeScreen() {
  const router = useRouter();
  const { setQueueFromJamendo, playFromJamendoTrack } = useMusicPlayer();
  const { token, signOut } = useAuth();
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const pulse = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getRecentSongs(12);
        if (!mounted) return;
        setRecent(data || []);
        setQueueFromJamendo(data || []);
      } catch (e) {
        console.log("Error cargando recientes:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [setQueueFromJamendo]);

  const coverOf = (t: any) => t?.album_image || t?.image || "https://picsum.photos/200";

  const playTrack = async (t: any) => {
    try {
      await playFromJamendoTrack(t);
    } catch (e) {
      console.log("Error al reproducir:", e);
    }
  };

  const handleProfilePress = useCallback(() => {
    if (token) {
      router.push("/profile");
    } else {
      router.push("/(auth)/login");
    }
  }, [router, token]);

  const handleLogout = useCallback(() => {
    if (!token) return;
    signOut()
      .then(() => {
        router.replace("/(auth)/login");
      })
      .catch((error) => {
        console.warn("No se pudo cerrar sesión", error);
      });
  }, [router, signOut, token]);

  const handleFilter = async (tag: TagOption) => {
    try {
      setLoading(true);
      const data = await searchSongs(tag.query, 12);
      setRecent(data || []);
      setQueueFromJamendo(data || []);
    } catch (e) {
      console.log(`Error buscando por tag ${tag.query}:`, e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center">
        {/* ✅ el SafeAreaView reemplaza al View raíz */}
        <ActivityIndicator size="large" color="#A855F7" />
        <Animated.Text
          style={{ opacity: pulse }}
          className="text-white mt-4 text-base"
        >
          Cargando contenido...
        </Animated.Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">  {/* ✅ SafeAreaView aquí */}
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 16 }}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 90 }}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-row items-center">
            <Image
              source={require("../../assets/logo.png")}
              className="w-8 h-8 mr-2"
              resizeMode="contain"
            />
            <Text className="text-white text-xl font-bold">OpenSound</Text>
          </View>
          <View className="flex-row items-center space-x-4">
            <TouchableOpacity onPress={handleProfilePress}>
              <Image
                source={require("../../assets/usuario.png")}
                className="w-8 h-8"
                resizeMode="contain"
              />
            </TouchableOpacity>
            {token && (
              <TouchableOpacity
                onPress={handleLogout}
                className="border border-purple-500 px-3 py-1 rounded-full"
              >
                <Text className="text-purple-300 text-sm font-semibold">
                  Cerrar sesión
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filtros */}
        <View className="flex-row justify-around mb-6">
          {TAGS.map((tag) => (
            <TouchableOpacity
              key={tag.query}
              className="bg-purple-700 px-4 py-2 rounded-full"
              onPress={() => handleFilter(tag)}
            >
              <Text className="text-white text-sm font-semibold">{tag.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Más recientes */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white text-lg font-bold">Más recientes</Text>
          <Text className="text-purple-400">Más</Text>
        </View>

        {/* Carrusel */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
          {recent.slice(0, 12).map((track: any) => {
            const source = { uri: coverOf(track) };
            const title = track?.name ?? "Sin título";
            return (
              <View key={track.id} className="mr-4 w-32">
                <TouchableOpacity onPress={() => playTrack(track)}>
                  <Image source={source} className="w-32 h-32 rounded-xl" />
                  <Text
                    className="text-white text-sm mt-2"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {title}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>

        {/* Lista */}
        <View className="space-y-4">
          {recent.slice(0, 8).map((track: any, idx: number) => {
            const title = track?.name ?? "Sin título";
            const artist = track?.artist_name ?? undefined;
            const imageSrc = { uri: coverOf(track) };

            return (
              <View
                key={track?.id ?? `row-${idx}`}
                className="flex-row items-center justify-between"
              >
                <TouchableOpacity
                  className="flex-row items-center flex-1 pr-2"
                  onPress={() => playTrack(track)}
                >
                  <Image source={imageSrc} className="w-12 h-12 rounded-lg mr-3" />
                  <View className="flex-1">
                    <Text className="text-white" numberOfLines={1} ellipsizeMode="tail">
                      {title}
                    </Text>
                    {!!artist && (
                      <Text
                        className="text-gray-400 text-xs"
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {artist}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => console.log(`Opciones de ${track?.name}`)}>
                  <Image
                    source={require("../../assets/songoptions.png")}
                    className="w-6 h-6"
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

#### `app/profile.tsx`
```tsx
import { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";

const getInitials = (name?: string | null) => {
  if (!name) return "OS";
  const parts = name
    .split(" ")
    .filter((part) => part.trim().length > 0)
    .slice(0, 2);
  if (parts.length === 0) return "OS";
  return parts
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
};

const ProfileScreen = () => {
  const router = useRouter();
  const { user } = useAuth();

  const initials = useMemo(() => getInitials(user?.name), [user?.name]);

  return (
    <SafeAreaView className="flex-1 bg-black px-6 pt-6">
      <View className="flex-row items-center justify-between mb-10">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2"
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-semibold">Perfil</Text>
        <View style={{ width: 36 }} />
      </View>

      <View className="items-center">
        <View className="w-24 h-24 rounded-full bg-purple-600 items-center justify-center mb-4">
          <Text className="text-white text-3xl font-bold">{initials}</Text>
        </View>
        <Text className="text-white text-2xl font-bold">
          {user?.name ?? "Invitado"}
        </Text>
        <Text className="text-gray-400 mt-1">{user?.email ?? "Sin correo"}</Text>
      </View>

      <View className="mt-10 bg-neutral-900 rounded-2xl p-6 space-y-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-gray-400">Rol</Text>
          <Text className="text-white font-semibold">{user?.role ?? "usuario"}</Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-gray-400">Identificador</Text>
          <Text className="text-white font-semibold">{user?.id ?? "No disponible"}</Text>
        </View>
      </View>

      <TouchableOpacity
        className="mt-12 bg-purple-600 py-3 rounded-xl"
        onPress={() => router.replace("/(tabs)")}
      >
        <Text className="text-white text-center text-base font-semibold">
          Ir al inicio
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ProfileScreen;
```

#### `context/AuthContext.tsx`
```tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AuthUser } from "../types/auth";
import { useAuthStore } from "../store/authStore";
import { login } from "../services/auth";

export const AUTH_TOKEN_STORAGE_KEY = "@opensound/token";
export const AUTH_USER_STORAGE_KEY = "@opensound/user";

type SignInPayload = {
  email: string;
  password: string;
};

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  signIn: (credentials: SignInPayload) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, tokens, setSession, clearSession } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const authToken = tokens?.token ?? null;

  useEffect(() => {
    (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem(AUTH_TOKEN_STORAGE_KEY),
          AsyncStorage.getItem(AUTH_USER_STORAGE_KEY),
        ]);

        if (storedToken && storedUser) {
          const parsedUser: AuthUser = JSON.parse(storedUser);
          setSession({ user: parsedUser, tokens: { token: storedToken } });
        }
      } catch (error) {
        console.warn("No se pudo restaurar la sesión", error);
      } finally {
        setRestoring(false);
      }
    })();
  }, [setSession]);

  useEffect(() => {
    if (restoring) return;
    if (!user || !authToken) return;

    Promise.all([
      AsyncStorage.setItem(AUTH_TOKEN_STORAGE_KEY, authToken),
      AsyncStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user)),
    ]).catch((error) => {
      console.warn("No se pudo guardar la sesión", error);
    });
  }, [authToken, restoring, user]);

  const persistSession = useCallback(
    async (nextUser: AuthUser, token: string) => {
      setSession({ user: nextUser, tokens: { token } });
      await Promise.all([
        AsyncStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token),
        AsyncStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(nextUser)),
      ]);
    },
    [setSession],
  );

  const signIn = useCallback(
    async ({ email, password }: SignInPayload) => {
      setLoading(true);
      try {
        const { token, user: incomingUser } = await login({ email, password });
        const ensuredUser: AuthUser =
          incomingUser ?? ({
            id: email,
            email,
            name: email.split("@")[0] ?? email,
          } as AuthUser);

        if (!token) {
          throw new Error("No se recibió un token válido");
        }

        await persistSession(ensuredUser, token);
      } finally {
        setLoading(false);
      }
    },
    [persistSession],
  );

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      clearSession();
      await Promise.all([
        AsyncStorage.removeItem(AUTH_TOKEN_STORAGE_KEY),
        AsyncStorage.removeItem(AUTH_USER_STORAGE_KEY),
      ]);
    } finally {
      setLoading(false);
    }
  }, [clearSession]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token: authToken,
      loading: loading || restoring,
      signIn,
      signOut,
    }),
    [authToken, loading, restoring, signIn, signOut, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de un AuthProvider");
  }
  return context;
};
```

#### `store/authStore.ts`
```ts
import { create } from "zustand";
import type { AuthTokens, AuthUser, RegisterCredentials } from "../types/auth";

type AuthState = {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  error: string | null;
  register: (
    data: RegisterCredentials,
  ) => Promise<{ user: AuthUser; tokens: AuthTokens }>;
  setSession: (payload: { user: AuthUser; tokens: AuthTokens }) => void;
  clearSession: () => void;
  clearError: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tokens: null,
  isLoading: false,
  error: null,

  // Simulación de registro
  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      // Aquí iría tu llamada real al backend:
      // const res = await fetch(`${API_URL}/register`, {...})
      console.log("📤 Registrando usuario:", data);

      // Simulación de éxito
      const fakeUser: AuthUser = {
        id: "1",
        email: data.email,
        name: data.name,
        role: "user",
      };
      const fakeTokens: AuthTokens = { token: "fake-token" };

      const session = {
        user: fakeUser,
        tokens: fakeTokens,
      };

      set({
        ...session,
        isLoading: false,
      });

      return session;
    } catch (err) {
      set({
        error: "Error al registrar usuario",
        isLoading: false,
      });
      if (err instanceof Error) {
        throw err;
      }
      throw new Error("Error al registrar usuario");
    }
  },

  setSession: ({ user, tokens }) => set({ user, tokens }),
  clearSession: () => set({ user: null, tokens: null }),
  clearError: () => set({ error: null }),
}));
```

#### `services/auth.ts`
```ts
import type { AuthUser } from "../types/auth";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

type LoginPayload = {
  email: string;
  password: string;
};

type LoginResponse = {
  token: string;
  user?: AuthUser;
};

const DEFAULT_DELAY_MS = 600;

const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export async function login(credentials: LoginPayload): Promise<LoginResponse> {
  if (!API_BASE_URL) {
    await delay(DEFAULT_DELAY_MS);
    return {
      token: `demo-token-${Date.now()}`,
      user: {
        id: credentials.email,
        email: credentials.email,
        name: credentials.email.split("@")[0] ?? credentials.email,
        role: "user",
      },
    };
  }

  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "No se pudo iniciar sesión");
  }

  const data = (await res.json()) as LoginResponse;

  if (!data?.token) {
    throw new Error("Respuesta inválida del servidor");
  }

  return data;
}
```

#### `context/MusicPlayerContext.tsx`
```tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
  type AudioStatus,
} from "expo-audio";
import type { Track } from "../services/jamendo";

export type CurrentSong = {
  title: string;
  artist: string;
  image: string;
  audio?: string;
};

interface MusicPlayerContextType {
  // Estado visible en UI
  isPlaying: boolean;
  currentSong: CurrentSong | null;
  progress: number; // 0..1
  positionMillis: number;
  durationMillis: number;

  // Modal de detalles
  isPlayerVisible: boolean;
  setPlayerVisible: (v: boolean) => void;

  // Compat con UI actual
  setCurrentSong: React.Dispatch<React.SetStateAction<CurrentSong | null>>;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;

  // Controles del reproductor
  togglePlayPause: () => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  seekTo: (ms: number) => Promise<void>;

  // Cola y reproducción por índice
  setQueueFromJamendo: (tracks: Track[]) => void;
  playTrackByIndex: (index: number) => Promise<void>;

  // Reproducir directamente un track de Jamendo
  playFromJamendoTrack: (t: Track) => Promise<void>;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(
  undefined
);

export const MusicPlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const playerRef = useRef<AudioPlayer | null>(null);
  const statusSubscriptionRef = useRef<{ remove: () => void } | null>(null);
  const nextRef = useRef<(() => Promise<void>) | null>(null);

  // Cola
  const [queue, setQueue] = useState<CurrentSong[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  // Estado visible
  const [currentSong, _setCurrentSong] = useState<CurrentSong | null>(null);
  const [isPlayingState, _setIsPlayingState] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);

  // Modal (detalles)
  const [isPlayerVisible, setPlayerVisible] = useState(false);

  const progress = durationMillis > 0 ? positionMillis / durationMillis : 0;

  // Config audio
  useEffect(() => {
    (async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: false,
          allowsRecording: false,
          interruptionMode: "duckOthers",
          interruptionModeAndroid: "duckOthers",
          shouldRouteThroughEarpiece: false,
        });
      } catch (error) {
        console.warn("No se pudo configurar el modo de audio", error);
      }
    })();
  }, []);

  // Limpieza
  useEffect(() => {
    return () => {
      statusSubscriptionRef.current?.remove?.();
      statusSubscriptionRef.current = null;
      if (playerRef.current) {
        try {
          playerRef.current.remove();
        } catch (error) {
          console.warn("No se pudo liberar el reproductor", error);
        }
        playerRef.current = null;
      }
    };
  }, []);

  const attachStatusListener = useCallback((player: AudioPlayer) => {
    statusSubscriptionRef.current?.remove?.();
    statusSubscriptionRef.current = player.addListener(
      "playbackStatusUpdate",
      (status: AudioStatus) => {
        _setIsPlayingState(Boolean(status.playing));
        const position = Math.max(0, Math.floor((status.currentTime ?? 0) * 1000));
        const duration = Math.max(0, Math.floor((status.duration ?? 0) * 1000));
        setPositionMillis(position);
        setDurationMillis(duration);

        if (status.didJustFinish && nextRef.current) {
          nextRef.current().catch(() => {});
        }
      }
    );
  }, []);

  const ensurePlayer = useCallback(() => {
    if (playerRef.current) {
      return playerRef.current;
    }

    const player = createAudioPlayer(null, { updateInterval: 400 });
    attachStatusListener(player);
    playerRef.current = player;
    return player;
  }, [attachStatusListener]);

  const loadAndPlay = useCallback(
    async (song: CurrentSong) => {
      const player = ensurePlayer();
      setPositionMillis(0);
      setDurationMillis(0);

      if (!song.audio) {
        _setIsPlayingState(false);
        player.pause();
        player.replace(null);
        return;
      }

      try {
        player.replace({ uri: song.audio });
        player.play();
      } catch (error) {
        console.warn("No se pudo reproducir la canción", error);
        _setIsPlayingState(false);
      }
    },
    [ensurePlayer]
  );

  const applyPlayback = useCallback((shouldPlay: boolean) => {
    const player = playerRef.current;
    if (!player) return;

    if (shouldPlay) {
      player.play();
    } else {
      player.pause();
    }
  }, []);

  const setIsPlaying: React.Dispatch<React.SetStateAction<boolean>> = (next) => {
    _setIsPlayingState((prev) => {
      const desired = typeof next === "function" ? (next as any)(prev) : next;
      applyPlayback(desired);
      return desired;
    });
  };

  const setCurrentSong: React.Dispatch<React.SetStateAction<CurrentSong | null>> =
    (value) => {
      _setCurrentSong(value);
    };

  // Cola
  const setQueueFromJamendo = useCallback((tracks: Track[]) => {
    const mapped: CurrentSong[] = (tracks || [])
      .map((t) => ({
        title: t.name ?? "Sin título",
        artist: t.artist_name ?? "Artista desconocido",
        image: t.album_image || t.image || "https://picsum.photos/200",
        audio: t.audio,
      }))
      .filter((t) => !!t.audio);

    setQueue(mapped);
    setCurrentIndex((prev) => {
      if (mapped.length === 0) return -1;
      return prev >= mapped.length ? 0 : prev;
    });
  }, []);

  const playTrackByIndex = useCallback(
    async (index: number) => {
      if (index < 0 || index >= queue.length) return;
      const song = queue[index];
      setCurrentIndex(index);
      _setCurrentSong(song);
      await loadAndPlay(song);
    },
    [loadAndPlay, queue]
  );

  const playFromJamendoTrack = useCallback(
    async (t: Track) => {
      const song: CurrentSong = {
        title: t.name ?? "Sin título",
        artist: t.artist_name ?? "Artista desconocido",
        image: t.album_image || t.image || "https://picsum.photos/200",
        audio: t.audio,
      };
      const idx = queue.findIndex((q) => q.audio === song.audio);
      if (idx >= 0) {
        await playTrackByIndex(idx);
      } else {
        setCurrentIndex(-1);
        _setCurrentSong(song);
        await loadAndPlay(song);
      }
    },
    [loadAndPlay, playTrackByIndex, queue]
  );

  const togglePlayPause = useCallback(async () => {
    const player = playerRef.current;
    if (!player) return;

    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  }, []);

  const next = useCallback(async () => {
    if (queue.length === 0) return;
    const nextIndex = currentIndex + 1 < queue.length ? currentIndex + 1 : 0;
    await playTrackByIndex(nextIndex);
  }, [currentIndex, playTrackByIndex, queue.length]);

  const previous = useCallback(async () => {
    const player = playerRef.current;
    if (!player) return;

    if (positionMillis > 3000) {
      try {
        await player.seekTo(0);
      } catch {}
      setPositionMillis(0);
      return;
    }

    if (queue.length === 0) return;
    const prevIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : queue.length - 1;
    await playTrackByIndex(prevIndex);
  }, [currentIndex, playTrackByIndex, positionMillis, queue.length]);

  const seekTo = useCallback(
    async (ms: number) => {
      const player = playerRef.current;
      if (!player) return;

      const target = Math.max(0, Math.min(ms, durationMillis || ms));
      try {
        await player.seekTo(target / 1000);
        setPositionMillis(target);
      } catch (error) {
        console.warn("No se pudo cambiar la posición de reproducción", error);
      }
    },
    [durationMillis]
  );

  useEffect(() => {
    nextRef.current = next;
  }, [next]);

  return (
    <MusicPlayerContext.Provider
      value={{
        isPlaying: isPlayingState,
        currentSong,
        progress,
        positionMillis,
        durationMillis,

        isPlayerVisible,
        setPlayerVisible,

        setCurrentSong,
        setIsPlaying,

        togglePlayPause,
        next,
        previous,
        seekTo,

        setQueueFromJamendo,
        playTrackByIndex,
        playFromJamendoTrack,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const ctx = useContext(MusicPlayerContext);
  if (!ctx) {
    throw new Error("useMusicPlayer debe usarse dentro de un MusicPlayerProvider");
  }
  return ctx;
};
```

#### `components/organisms/PlayerModal.tsx`
```tsx
import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  LayoutChangeEvent,
  Dimensions,
  StyleSheet,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMusicPlayer } from "../../context/MusicPlayerContext";

function formatTime(ms: number) {
  if (!ms || ms <= 0) return "0:00";
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function PlayerModal() {
  const {
    isPlayerVisible,
    setPlayerVisible,
    currentSong,
    isPlaying,
    togglePlayPause,
    next,
    previous,
    progress,
    positionMillis,
    durationMillis,
    seekTo,
  } = useMusicPlayer();

  const [liked, setLiked] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  // Ancho de pantalla y tamaño del cover calculado
  const { width: screenWidth } = Dimensions.get("window");
  const horizontalPadding = 24; // px-6
  const coverMax = 360; // máximo para no exagerar en tablets
  const coverSize = Math.min(screenWidth - horizontalPadding * 2, coverMax);

  // Animación del botón "me gusta"
  const animateLike = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.25, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };
  const onToggleLike = () => {
    setLiked((v) => !v);
    animateLike();
  };

  // Barra de progreso (seek)
  const [barWidth, setBarWidth] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);
  const [preview, setPreview] = useState<number | null>(null); // 0..1

  const effectiveProgress = useMemo(() => {
    const p = preview ?? progress ?? 0;
    return Math.max(0, Math.min(1, p));
  }, [preview, progress]);

  const onBarLayout = (e: LayoutChangeEvent) => {
    setBarWidth(e.nativeEvent.layout.width);
  };

  const seekAtX = (x: number) => {
    if (!durationMillis || barWidth <= 0) return;
    const ratio = Math.max(0, Math.min(1, x / barWidth));
    setPreview(ratio);
  };

  const commitSeek = async () => {
    if (preview == null || !durationMillis) {
      setScrubbing(false);
      setPreview(null);
      return;
    }
    const ms = Math.floor(preview * durationMillis);
    await seekTo(ms);
    setScrubbing(false);
    setPreview(null);
  };

  if (!isPlayerVisible || !currentSong) return null;

  return (
    <View
      style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.95)", zIndex: 50, elevation: 100 }]}
      pointerEvents="auto"
    >
      {/* Header - ancho completo */}
      <View className="w-full px-4 pt-12 pb-4 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => setPlayerVisible(false)}
          className="p-2"
          accessibilityLabel="Cerrar"
        >
          <Ionicons name="chevron-down" size={28} color="white" />
        </TouchableOpacity>

        <Text className="text-white text-base font-semibold">Reproduciendo</Text>

        <TouchableOpacity onPress={onToggleLike} className="p-2" accessibilityLabel="Me gusta">
          <Animated.View style={{ transform: [{ scale }] }}>
            <Ionicons name={liked ? "heart" : "heart-outline"} size={24} color={liked ? "#D400FF" : "white"} />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Cover centrado, ancho consistente */}
      <View className="w-full items-center mt-4">
        <Image
          source={{
            uri:
              typeof currentSong.image === "string" && currentSong.image.length > 0
                ? currentSong.image
                : "https://picsum.photos/300",
          }}
          style={{ width: coverSize, height: coverSize, borderRadius: 16 }}
          resizeMode="cover"
        />

        <Text className="text-white text-2xl font-bold" numberOfLines={1}>
          {currentSong.title || "Sin título"}
        </Text>
        <Text className="text-gray-400 text-base mt-1" numberOfLines={1}>
          {currentSong.artist || "Artista desconocido"}
        </Text>

      </View>

      {/* Título y artista */}
      <View className="w-full px-6 mt-6 items-center">
        <Text className="text-white text-2xl font-bold" numberOfLines={1} ellipsizeMode="tail">
          {currentSong.title}
        </Text>
        <Text className="text-gray-400 text-base mt-1" numberOfLines={1} ellipsizeMode="tail">
          {currentSong.artist}
        </Text>
      </View>

      {/* Barra de progreso + tiempos (ancho completo con padding lateral) */}
      <View className="w-full px-6 mt-8">
        <View
          onLayout={onBarLayout}
          className="w-full h-8 justify-center"
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderGrant={(e) => {
            setScrubbing(true);
            seekAtX(e.nativeEvent.locationX);
          }}
          onResponderMove={(e) => {
            seekAtX(e.nativeEvent.locationX);
          }}
          onResponderRelease={commitSeek}
          onResponderTerminate={commitSeek}
        >
          {/* Track */}
          <View className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
            <View
              style={{ width: `${effectiveProgress * 100}%` }}
              className="h-2 bg-purple-600"
            />
          </View>
        </View>

        {/* Times */}
        <View className="w-full flex-row justify-between mt-2">
          <Text className="text-gray-400 text-xs">
            {formatTime(scrubbing && preview != null ? Math.floor(preview * durationMillis) : positionMillis)}
          </Text>
          <Text className="text-gray-400 text-xs">{formatTime(durationMillis)}</Text>
        </View>
      </View>

      {/* Controles, ancho completo */}
      <View className="w-full px-10 mt-8 flex-row items-center justify-between">
        <TouchableOpacity onPress={previous} accessibilityLabel="Anterior" className="p-3">
          <Ionicons name="play-skip-back" size={32} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={togglePlayPause}
          accessibilityLabel={isPlaying ? "Pausar" : "Reproducir"}
          className="p-4 rounded-full bg-purple-600"
        >
          <Ionicons name={isPlaying ? "pause" : "play"} size={32} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={next} accessibilityLabel="Siguiente" className="p-3">
          <Ionicons name="play-skip-forward" size={32} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
```

#### `components/organisms/MiniReproductor.tsx`
```tsx
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useMusicPlayer } from "../../context/MusicPlayerContext";

export default function MiniReproductor() {
  const {
    isPlaying,
    currentSong,
    togglePlayPause,
    next,
    progress,
    setPlayerVisible,
  } = useMusicPlayer();

  // si no hay canción actual, no renderizar nada
  if (!currentSong) return null;

  const clampedProgress = Math.max(0, Math.min(1, progress ?? 0));

  // fallback seguro si falta la imagen
  const imageUri =
    typeof currentSong.image === "string" && currentSong.image.length > 0
      ? currentSong.image
      : "https://picsum.photos/200";

  return (
    <View className="bg-neutral-900 border-t border-purple-600 px-4 py-3">
      <View className="absolute left-0 right-0 top-0 h-[2px] bg-neutral-800" />
      <View
        style={{ width: `${clampedProgress * 100}%` }}
        className="absolute left-0 top-0 h-[2px] bg-purple-600"
      />

      <View className="flex-row items-center">
        <Image
          source={{ uri: imageUri }}
          className="w-12 h-12 rounded-lg mr-3"
        />

        <TouchableOpacity
          className="flex-1"
          onPress={() => setPlayerVisible(true)}
          accessibilityLabel="Abrir detalles del reproductor"
        >
          <Text
            className="text-white font-bold"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {currentSong.title || "Sin título"}
          </Text>
          <Text
            className="text-gray-400 text-sm"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {currentSong.artist || "Artista desconocido"}
          </Text>
        </TouchableOpacity>

        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={togglePlayPause}
            className="mr-5"
            accessibilityLabel={isPlaying ? "Pausar" : "Reproducir"}
          >
            <Image
              source={
                isPlaying
                  ? require("../../assets/reproduciendo.png")
                  : require("../../assets/pausado2.png")
              }
              className="w-6 h-6"
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={next} accessibilityLabel="Siguiente">
            <Image
              source={require("../../assets/siguiente.png")}
              className="w-6 h-6"
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
```

### P1 — Datos remotos y utilidades

#### `services/jamendo.ts`
```ts
// services/jamendo.ts
import { apiFetch } from "./api";

export type Track = {
  id: string;
  name: string;
  artist_name: string;
  image?: string;
  album_image?: string;
  audio?: string; // URL reproducible
};

export async function getRecentSongs(limit: number = 10): Promise<Track[]> {
  const res = await apiFetch<Track>("/tracks", {
    limit,
    order: "popularity_total",
    audioformat: "mp31", // importante para obtener audio
  });
  return res.results ?? [];
}

export async function searchSongs(query: string, limit: number = 10): Promise<Track[]> {
  if (!query) return [];
  const res = await apiFetch<Track>("/tracks", {
    limit,
    search: query,
    audioformat: "mp31", // importante para obtener audio
  });
  return res.results ?? [];
}
```

#### `services/api.ts`
```ts
const DEFAULT_JAMENDO_BASE_URL = "https://api.jamendo.com/v3.0";
const JAMENDO_API_URL =
  process.env.EXPO_PUBLIC_JAMENDO_API_URL ?? DEFAULT_JAMENDO_BASE_URL;
const JAMENDO_CLIENT_ID =
  process.env.EXPO_PUBLIC_JAMENDO_CLIENT_ID ?? "c8500442";

export type JamendoResponse<T> = {
  headers: Record<string, unknown>;
  results: T[];
};

export async function apiFetch<T>(
  endpoint: string,
  params: Record<string, string | number | boolean | undefined> = {},
): Promise<JamendoResponse<T>> {
  const endpointPath = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = new URL(`${JAMENDO_API_URL}${endpointPath}`);

  const allParams = {
    client_id: JAMENDO_CLIENT_ID,
    format: "json",
    ...params,
  };

  Object.entries(allParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Error en la API de Jamendo: ${response.status}`);
  }

  return (await response.json()) as JamendoResponse<T>;
}
```

#### `types/auth.ts`
```ts
export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  role?: "admin" | "user" | "editor" | string;
};

export type AuthTokens = {
  token: string;
  refreshToken?: string;
};

// 👇 Nuevo tipo
export type RegisterCredentials = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};
```

### P2 — Configuración del proyecto

#### `package.json`
```json
{
  "name": "opensound",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "expo lint"
  },
  "dependencies": {
    "@react-native-async-storage/async-storage": "^2.2.0",
    "@react-native-community/cli-server-api": "^20.0.2",
    "expo": "54.0.7",
    "expo-audio": "~1.0.13",
    "expo-constants": "~18.0.8",
    "expo-linking": "~8.0.8",
    "expo-router": "~6.0.4",
    "expo-status-bar": "~3.0.8",
    "nativewind": "^2.0.11",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-hook-form": "^7.62.0",
    "react-native": "0.81.4",
    "react-native-safe-area-context": "~5.6.0",
    "react-native-screens": "~4.16.0",
    "zustand": "^5.0.8"
  },
  "devDependencies": {
    "@babel/core": "^7.25.2",
    "@types/react": "~19.1.10",
    "@types/react-native": "^0.72.8",
    "babel-preset-expo": "^54.0.1",
    "eslint": "^9.35.0",
    "eslint-config-expo": "^9.2.0",
    "eslint-config-prettier": "^10.1.8",
    "eslint-plugin-prettier": "^5.5.4",
    "prettier": "^3.6.2",
    "tailwindcss": "3.3.2",
    "typescript": "~5.8.3"
  },
  "private": true
}
```

#### `app.json`
```json
{
  "expo": {
    "name": "opensound",
    "slug": "opensound-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "scheme": "opensound",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "edgeToEdgeEnabled": true,
      "package": "com.sebastianmarles.opensoundapp"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-router"
    ],
    "extra": {
      "router": {},
      "eas": {
        "projectId": "5e0ca68f-bb43-407b-a709-0afe0a0fe4e8"
      }
    },
    "owner": "sebastianmarles"
  }
}
```

#### `tsconfig.json`
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "target": "es2017",
    "lib": ["es2017", "dom"],
    "module": "esnext",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "moduleResolution": "bundler",
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["*"]
    }
  },
  "include": [
    "app",
    "components",
    "context",
    "services",
    "stores",
    "types",
    "nativewind.d.ts",
    "App.tsx"
  ]
}
```

#### `babel.config.js`
```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['nativewind/babel'],
  };
};
```

#### `nativewind.d.ts`
```ts
/// <reference types="nativewind/types" />
```

### P3 — UI, estilo y navegación secundaria

#### `app/(tabs)/library/_layout.tsx`
```tsx
import { Stack } from "expo-router";

export default function LibraryLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
```

#### `app/(tabs)/library/library.tsx`
```tsx
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "../../../context/AuthContext";

export default function Library() {
  const router = useRouter();
  const { token } = useAuth();

  const recientes = [
    { id: 1, titulo: "Cúrame", portada: "https://picsum.photos/200" },
    { id: 2, titulo: "La Llevo Al Cielo", portada: "https://picsum.photos/201" },
    { id: 3, titulo: "Otro Hit", portada: "https://picsum.photos/202" },
  ];

  return (
    <View className="flex-1 bg-black">
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 16 }}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 90 }}
      >
        {/* Encabezado superior */}
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-row items-center">
            <Image
              source={require("../../../assets/logo.png")}
              className="w-8 h-8 mr-2"
              resizeMode="contain"
            />
            <Text className="text-white text-xl font-bold">OpenSound</Text>
          </View>

          <View className="flex-row space-x-4">
            <TouchableOpacity
              onPress={() =>
                router.push(token ? "/profile" : "/(auth)/login")
              }
            >
              <Image
                source={require("../../../assets/usuario.png")}
                className="w-8 h-8"
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Actividad reciente */}
        <Text className="text-white text-lg font-bold mb-4">Actividad reciente</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8">
          {recientes.map((item) => (
            <View key={item.id} className="mr-4">
              <Image
                source={{ uri: item.portada }}
                className="w-32 h-32 rounded-xl mb-2"
                resizeMode="cover"
              />
              <Text className="text-white text-sm text-center w-32" numberOfLines={1}>
                {item.titulo}
              </Text>
            </View>
          ))}
          <View className="w-16 h-32 justify-center items-center opacity-40">
            <Text className="text-white">...</Text>
          </View>
        </ScrollView>

        {/* Opciones */}
        <View className="space-y-6">
          <TouchableOpacity className="flex-row items-center">
            <Ionicons name="list-outline" size={24} color="white" />
            <Text className="text-white text-lg ml-4">Listas de reproducción</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center">
            <Ionicons name="albums-outline" size={24} color="white" />
            <Text className="text-white text-lg ml-4">Álbumes</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center">
            <Ionicons name="musical-notes-outline" size={24} color="white" />
            <Text className="text-white text-lg ml-4">Canciones</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
```

#### `app/(tabs)/search/_layout.tsx`
```tsx
import { Stack } from "expo-router";

export default function SearchLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
    </Stack>
  );
}
```

#### `app/(tabs)/search/search.tsx`
```tsx
import { View, Text, TextInput, ScrollView, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../../context/AuthContext";

export default function BuscarScreen() {
  const router = useRouter();
  const { token } = useAuth();

  return (
    <View className="flex-1 bg-black">
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 16 }}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 90 }}
      >
        {/* Encabezado superior */}
        <View className="flex-row justify-between items-center mb-6">
          {/* Logo + Nombre */}
          <View className="flex-row items-center">
            <Image
              source={require("../../../assets/logo.png")}
              className="w-8 h-8 mr-2"
              resizeMode="contain"
            />
            <Text className="text-white text-xl font-bold">OpenSound</Text>
          </View>

          {/* Iconos de búsqueda y usuario */}
          <View className="flex-row space-x-4">
            <TouchableOpacity
              onPress={() =>
                router.push(token ? "/profile" : "/(auth)/login")
              }
            >
              <Image
                source={require("../../../assets/usuario.png")}
                className="w-8 h-8"
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Barra de búsqueda */}
        <TextInput
          placeholder="Buscar..."
          placeholderTextColor="#aaa"
          className="bg-gray-800 text-white px-4 py-3 rounded-xl mb-6 border border-purple-600"
        />

        {/* Búsquedas recientes */}
        <Text className="text-white text-lg font-bold mb-4">
          Búsquedas recientes
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-8"
        >
          {[1, 2, 3, 4].map((i) => (
            <Image
              key={i}
              source={{ uri: "https://picsum.photos/200" }}
              className="w-28 h-28 rounded-lg mr-3"
            />
          ))}
        </ScrollView>

        {/* Lista de resultados */}
        <View className="space-y-3 mb-20">
          {[
            "Gold Feet",
            "Hooka",
            "Niggas in Paris",
            "Moon",
            "Ensalada",
            "I Wonder",
            "Heartless",
            "Save Your Tears",
          ].map((item, idx) => (
            <View key={idx} className="flex-row items-center">
              <Text className="text-white text-lg mr-3">○</Text>
              <Text className="text-white text-base">{item}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
```
