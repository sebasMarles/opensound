import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { usePlaylistStore } from '../../stores/playlistStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuthStore();
  const { playlists } = usePlaylistStore();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);

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

  const handleEditProfile = () => {
    Alert.alert(
      'Editar Perfil',
      'Esta funcionalidad estará disponible próximamente',
      [{ text: 'OK' }]
    );
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Cambiar Contraseña',
      'Esta funcionalidad estará disponible próximamente',
      [{ text: 'OK' }]
    );
  };

  const menuItems = [
    {
      icon: 'person-outline',
      title: 'Editar Perfil',
      subtitle: 'Actualiza tu información personal',
      onPress: handleEditProfile,
    },
    {
      icon: 'lock-closed-outline',
      title: 'Cambiar Contraseña',
      subtitle: 'Actualiza tu contraseña de acceso',
      onPress: handleChangePassword,
    },
    {
      icon: 'musical-notes-outline',
      title: 'Mis Playlists',
      subtitle: `${playlists.length} playlists creadas`,
      onPress: () => router.push('/(tabs)/library/playlists'),
    },
    {
      icon: 'help-circle-outline',
      title: 'Ayuda y Soporte',
      subtitle: 'Obtén ayuda con la aplicación',
      onPress: () => Alert.alert('Ayuda', 'Contacta a soporte@opensound.com'),
    },
    {
      icon: 'information-circle-outline',
      title: 'Acerca de',
      subtitle: 'Información sobre OpenSound',
      onPress: () => Alert.alert('OpenSound v1.0.0', 'Plataforma de música para artistas emergentes'),
    },
  ];

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="px-6 pt-12 pb-6">
        <Text className="text-white text-2xl font-bold">Perfil</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* User Info */}
        <View className="items-center px-6 mb-8">
          {/* Avatar */}
          <View className="w-24 h-24 rounded-full bg-purple-600 justify-center items-center mb-4">
            {user?.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                className="w-24 h-24 rounded-full"
              />
            ) : (
              <Text className="text-white text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            )}
          </View>

          {/* User Details */}
          <Text className="text-white text-xl font-bold mb-1">
            {user?.name || 'Usuario'}
          </Text>
          <Text className="text-gray-400 text-sm mb-4">
            {user?.email || 'email@ejemplo.com'}
          </Text>

          {/* Stats */}
          <View className="flex-row space-x-8">
            <View className="items-center">
              <Text className="text-white text-lg font-bold">{playlists.length}</Text>
              <Text className="text-gray-400 text-xs">Playlists</Text>
            </View>
            <View className="items-center">
              <Text className="text-white text-lg font-bold">
                {playlists.reduce((total, playlist) => total + playlist.tracks.length, 0)}
              </Text>
              <Text className="text-gray-400 text-xs">Canciones</Text>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View className="px-6 mb-6">
          <Text className="text-white text-lg font-semibold mb-4">Configuración</Text>
          
          {/* Notifications */}
          <View className="bg-neutral-900 rounded-lg p-4 mb-3">
            <View className="flex-row justify-between items-center">
              <View className="flex-1 mr-4">
                <Text className="text-white font-medium">Notificaciones</Text>
                <Text className="text-gray-400 text-sm">
                  Recibe notificaciones sobre nuevas canciones
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#374151', true: '#D400FF' }}
                thumbColor={notificationsEnabled ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>
          </View>

          {/* Auto Play */}
          <View className="bg-neutral-900 rounded-lg p-4">
            <View className="flex-row justify-between items-center">
              <View className="flex-1 mr-4">
                <Text className="text-white font-medium">Reproducción Automática</Text>
                <Text className="text-gray-400 text-sm">
                  Reproduce automáticamente canciones similares
                </Text>
              </View>
              <Switch
                value={autoPlayEnabled}
                onValueChange={setAutoPlayEnabled}
                trackColor={{ false: '#374151', true: '#D400FF' }}
                thumbColor={autoPlayEnabled ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View className="px-6 mb-6">
          <Text className="text-white text-lg font-semibold mb-4">Cuenta</Text>
          
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              className="bg-neutral-900 rounded-lg p-4 mb-3 flex-row items-center"
              onPress={item.onPress}
            >
              <View className="w-10 h-10 bg-neutral-800 rounded-full justify-center items-center mr-4">
                <Ionicons name={item.icon as any} size={20} color="#D400FF" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-medium">{item.title}</Text>
                <Text className="text-gray-400 text-sm">{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <View className="px-6">
          <TouchableOpacity
            className={`bg-red-600 py-4 rounded-lg ${isLoading ? 'opacity-50' : ''}`}
            onPress={handleLogout}
            disabled={isLoading}
          >
            <Text className="text-white text-center text-lg font-semibold">
              {isLoading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View className="items-center mt-8 mb-4">
          <Text className="text-gray-500 text-xs">OpenSound v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}
