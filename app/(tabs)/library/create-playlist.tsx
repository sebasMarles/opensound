import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { usePlaylistStore } from '../../../stores/playlistStore';
import { CreatePlaylistDto } from '../../../types/playlist';

export default function CreatePlaylistScreen() {
  const router = useRouter();
  const { createPlaylist, isLoading, error, clearError } = usePlaylistStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreatePlaylistDto & { isPublic: boolean }>({
    defaultValues: {
      name: '',
      description: '',
      isPublic: false,
    },
  });

  const onSubmit = async (data: CreatePlaylistDto & { isPublic: boolean }) => {
    try {
      clearError();
      const playlistData: CreatePlaylistDto = {
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
        isPublic: data.isPublic,
      };

      const newPlaylist = await createPlaylist(playlistData);
      
      Alert.alert(
        'Playlist Creada',
        `"${newPlaylist.name}" se ha creado exitosamente`,
        [
          {
            text: 'Ver Playlist',
            onPress: () => router.replace(`/(tabs)/library/playlist/${newPlaylist.id}`),
          },
          {
            text: 'Crear Otra',
            onPress: () => {
              // Reset form and stay on this screen
            },
          },
        ]
      );
    } catch (error) {
      console.error('Create playlist failed:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 bg-black">
        {/* Header */}
        <View className="flex-row items-center px-6 pt-12 pb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-4 p-2"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Nueva Playlist</Text>
        </View>

        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Cover Placeholder */}
          <View className="items-center mb-8">
            <View className="w-48 h-48 bg-neutral-800 rounded-lg justify-center items-center mb-4">
              <Ionicons name="musical-notes" size={64} color="#9CA3AF" />
            </View>
            <TouchableOpacity className="bg-neutral-700 px-4 py-2 rounded-lg">
              <Text className="text-white text-sm">Agregar Imagen</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View className="space-y-6">
            {/* Playlist Name */}
            <View>
              <Text className="text-white text-sm font-medium mb-2">
                Nombre de la playlist *
              </Text>
              <Controller
                control={control}
                name="name"
                rules={{
                  required: 'El nombre es requerido',
                  minLength: {
                    value: 1,
                    message: 'El nombre debe tener al menos 1 caracter',
                  },
                  maxLength: {
                    value: 100,
                    message: 'El nombre no puede exceder 100 caracteres',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="bg-neutral-900 text-white px-4 py-3 rounded-lg border border-neutral-700 focus:border-purple-600"
                    placeholder="Mi playlist increíble"
                    placeholderTextColor="#9CA3AF"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    maxLength={100}
                  />
                )}
              />
              {errors.name && (
                <Text className="text-red-500 text-sm mt-1">{errors.name.message}</Text>
              )}
            </View>

            {/* Description */}
            <View>
              <Text className="text-white text-sm font-medium mb-2">
                Descripción (opcional)
              </Text>
              <Controller
                control={control}
                name="description"
                rules={{
                  maxLength: {
                    value: 300,
                    message: 'La descripción no puede exceder 300 caracteres',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="bg-neutral-900 text-white px-4 py-3 rounded-lg border border-neutral-700 focus:border-purple-600"
                    placeholder="Describe tu playlist..."
                    placeholderTextColor="#9CA3AF"
                    value={value || ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    maxLength={300}
                  />
                )}
              />
              {errors.description && (
                <Text className="text-red-500 text-sm mt-1">{errors.description.message}</Text>
              )}
              <Text className="text-gray-500 text-xs mt-1">
                {watch('description')?.length || 0}/300 caracteres
              </Text>
            </View>

            {/* Privacy Setting */}
            <View className="bg-neutral-900 p-4 rounded-lg">
              <View className="flex-row justify-between items-center">
                <View className="flex-1 mr-4">
                  <Text className="text-white font-medium">Playlist Pública</Text>
                  <Text className="text-gray-400 text-sm mt-1">
                    Permite que otros usuarios puedan encontrar y escuchar tu playlist
                  </Text>
                </View>
                <Controller
                  control={control}
                  name="isPublic"
                  render={({ field: { onChange, value } }) => (
                    <Switch
                      value={value}
                      onValueChange={onChange}
                      trackColor={{ false: '#374151', true: '#D400FF' }}
                      thumbColor={value ? '#FFFFFF' : '#9CA3AF'}
                    />
                  )}
                />
              </View>
            </View>

            {/* Error message */}
            {error && (
              <View className="bg-red-900/20 border border-red-500 rounded-lg p-3">
                <Text className="text-red-400 text-sm text-center">{error}</Text>
              </View>
            )}

            {/* Create Button */}
            <TouchableOpacity
              className={`bg-purple-600 py-4 rounded-lg mt-8 ${isLoading ? 'opacity-50' : ''}`}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              <Text className="text-white text-center text-lg font-semibold">
                {isLoading ? 'Creando...' : 'Crear Playlist'}
              </Text>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              className="py-4"
              onPress={() => router.back()}
              disabled={isLoading}
            >
              <Text className="text-gray-400 text-center text-lg">Cancelar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
