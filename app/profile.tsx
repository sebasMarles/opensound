"use client";

import { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { useMusicPlayer } from "../context/MusicPlayerContext";
import * as Haptics from "expo-haptics";
import { useForm, Controller } from "react-hook-form";
import { KeyboardDismissWrapper } from "../components/ui/KeyboardDismissWrapper";

const getInitials = (name?: string | null) => {
  if (!name) return "OS";
  const parts = name
    .split(" ")
    .filter((part) => part.trim().length > 0)
    .slice(0, 2);
  if (parts.length === 0) return "OS";
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
};

type EditProfileData = {
  name: string;
  description: string;
};

const ProfileScreen = () => {
  const router = useRouter();
  const { user, signOut, updateUser } = useAuth();
  const { setIsPlaying, setCurrentSong } = useMusicPlayer();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const initials = useMemo(() => getInitials(user?.name), [user?.name]);
  const isAdmin = user?.role === "admin";

  const { control, handleSubmit, reset } = useForm<EditProfileData>({
    defaultValues: {
      name: user?.name || "",
      description: user?.description || "",
    },
  });

  const onEditPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    reset({
      name: user?.name || "",
      description: user?.description || "",
    });
    setIsEditing(true);
  };

  const onSave = async (data: EditProfileData) => {
    setIsSaving(true);
    try {
      await updateUser(data);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsEditing(false);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error("Failed to update profile", error);
    } finally {
      setIsSaving(false);
    }
  };

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
        <TouchableOpacity
          onPress={onEditPress}
          className="p-2"
          accessibilityLabel="Editar perfil"
        >
          <Ionicons name="create-outline" size={24} color="#A855F7" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="items-center">
          <View className="w-24 h-24 rounded-full bg-purple-600 items-center justify-center mb-4">
            <Text className="text-white text-3xl font-bold">{initials}</Text>
          </View>
          <Text className="text-white text-2xl font-bold">
            {user?.name ?? "Invitado"}
          </Text>
          <Text className="text-gray-400 mt-1">
            {user?.email ?? "Sin correo"}
          </Text>
          {user?.description ? (
            <Text className="text-gray-300 mt-4 text-center px-4 italic">
              "{user.description}"
            </Text>
          ) : (
            <Text className="text-gray-600 mt-4 text-center px-4 italic text-sm">
              Sin descripción
            </Text>
          )}
        </View>

        <View className="mt-10 bg-neutral-900 rounded-2xl p-6 space-y-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-400">Rol</Text>
            <Text className="text-white font-semibold">
              {user?.role ?? "usuario"}
            </Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-400">Identificador</Text>
            <Text
              className="text-white font-semibold w-32 text-right"
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {user?.id ?? "No disponible"}
            </Text>
          </View>
        </View>

        {isAdmin && (
          <TouchableOpacity
            className="mt-6 bg-purple-600 py-3 rounded-xl flex-row items-center justify-center"
            onPress={() => router.push("/admin-panel")}
          >
            <Ionicons name="shield-checkmark" size={20} color="white" />
            <Text className="text-white text-center text-base font-semibold ml-2">
              Opciones de Administrador
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          className="mt-4 bg-neutral-900 py-3 rounded-xl"
          onPress={() => router.replace("/(tabs)")}
        >
          <Text className="text-white text-center text-base font-semibold">
            Ir al inicio
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-8 border border-red-500 py-3 rounded-xl mb-10"
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            setIsPlaying(false);
            setCurrentSong(null);
            signOut();
            router.replace("/login");
          }}
        >
          <Text className="text-red-500 text-center text-base font-semibold">
            Cerrar sesión
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de Edición */}
      <Modal
        visible={isEditing}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditing(false)}
      >

// ... inside Modal
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-end"
        >
          <View className="flex-1 bg-black/50" onTouchEnd={() => setIsEditing(false)} />
          <KeyboardDismissWrapper>
            <View className="bg-neutral-900 rounded-t-3xl p-6 border-t border-neutral-800">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-white text-xl font-bold">Editar Perfil</Text>
                <TouchableOpacity onPress={() => setIsEditing(false)}>
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>

              <View className="space-y-4">
                <View>
                  <Text className="text-gray-400 mb-2 text-sm">Nombre</Text>
                  <Controller
                    control={control}
                    name="name"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        className="bg-neutral-800 text-white p-4 rounded-xl"
                        value={value}
                        onChangeText={onChange}
                        placeholder="Tu nombre"
                        placeholderTextColor="#666"
                      />
                    )}
                  />
                </View>

                <View>
                  <Text className="text-gray-400 mb-2 text-sm">Descripción</Text>
                  <Controller
                    control={control}
                    name="description"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        className="bg-neutral-800 text-white p-4 rounded-xl min-h-[100px]"
                        value={value}
                        onChangeText={onChange}
                        placeholder="Cuéntanos sobre ti..."
                        placeholderTextColor="#666"
                        multiline
                        textAlignVertical="top"
                      />
                    )}
                  />
                </View>

                <View>
                  <Text className="text-gray-400 mb-2 text-sm">Correo (No editable)</Text>
                  <View className="bg-neutral-800/50 p-4 rounded-xl border border-neutral-800">
                    <Text className="text-gray-500">{user?.email}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  className="bg-purple-600 py-4 rounded-xl mt-4 flex-row justify-center items-center"
                  onPress={handleSubmit(onSave)}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-bold text-lg">Guardar Cambios</Text>
                  )}
                </TouchableOpacity>
              </View>
              <View style={{ height: 20 }} />
            </View>
          </KeyboardDismissWrapper>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

export default ProfileScreen;
