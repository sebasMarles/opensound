import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePlaylistStore } from '../../../stores/playlistStore';
import { useAuthStore } from '../../../stores/authStore';
import { Playlist } from '../../../types/playlist';

export default function PlaylistsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    playlists,
    isLoading,
    error,
    fetchPlaylists,
    deletePlaylist,
    clearError,
  } = usePlaylistStore();
  
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchPlaylists(user.id);
    }
  }, [user?.id]);

  const handleRefresh = async () => {
    if (user?.id) {
      setRefreshing(true);
      await fetchPlaylists(user.id);
      setRefreshing(false);
    }
  };

  const handleDeletePlaylist = (playlist: Playlist) => {
    Alert.alert(
      'Eliminar Playlist',
      `¿Estás seguro de que quieres eliminar "${playlist.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePlaylist(playlist.id);
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la playlist');
            }
          },
        },
      ]
    );
  };

  const renderPlaylistItem = (playlist: Playlist) => {
    const trackCount = playlist.tracks.length;
    const coverImage = playlist.coverImage || playlist.tracks[0]?.album_image || playlist.tracks[0]?.image;

    return (
      <TouchableOpacity
        key={playlist.id}
        className="flex-row items-center py-3 px-4 bg-neutral-900 rounded-lg mb-3"
        onPress={() => router.push(`/(tabs)/library/playlist/${playlist.id}`)}
      >
        {/* Cover Image */}
        <View className="w-16 h-16 rounded-lg bg-neutral-800 mr-4 overflow-hidden">
          {coverImage ? (
            <Image
              source={{ uri: coverImage }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full justify-center items-center">
              <Ionicons name="musical-notes" size={24} color="#9CA3AF" />
            </View>
          )}
        </View>

        {/* Playlist Info */}
        <View className="flex-1">
          <Text className="text-white font-semibold text-base" numberOfLines={1}>
            {playlist.name}
          </Text>
          <Text className="text-gray-400 text-sm mt-1">
            {trackCount} {trackCount === 1 ? 'canción' : 'canciones'}
          </Text>
          {playlist.description && (
            <Text className="text-gray-500 text-xs mt-1" numberOfLines={1}>
              {playlist.description}
            </Text>
          )}
        </View>

        {/* Actions */}
        <TouchableOpacity
          className="p-2"
          onPress={() => {
            Alert.alert(
              'Opciones de Playlist',
              playlist.name,
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Editar',
                  onPress: () => router.push(`/(tabs)/library/playlist/${playlist.id}/edit`),
                },
                {
                  text: 'Eliminar',
                  style: 'destructive',
                  onPress: () => handleDeletePlaylist(playlist),
                },
              ]
            );
          }}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (error) {
    return (
      <View className="flex-1 bg-black justify-center items-center px-6">
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text className="text-white text-lg font-semibold mt-4 text-center">
          Error al cargar playlists
        </Text>
        <Text className="text-gray-400 text-center mt-2">{error}</Text>
        <TouchableOpacity
          className="bg-purple-600 px-6 py-3 rounded-lg mt-6"
          onPress={() => {
            clearError();
            if (user?.id) fetchPlaylists(user.id);
          }}
        >
          <Text className="text-white font-semibold">Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 pt-12 pb-4">
        <View>
          <Text className="text-white text-2xl font-bold">Mis Playlists</Text>
          <Text className="text-gray-400 text-sm">
            {playlists.length} {playlists.length === 1 ? 'playlist' : 'playlists'}
          </Text>
        </View>
        <TouchableOpacity
          className="bg-purple-600 p-3 rounded-full"
          onPress={() => router.push('/(tabs)/library/create-playlist')}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#D400FF"
            colors={['#D400FF']}
          />
        }
      >
        {isLoading && playlists.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Ionicons name="musical-notes-outline" size={48} color="#9CA3AF" />
            <Text className="text-gray-400 text-center mt-4">Cargando playlists...</Text>
          </View>
        ) : playlists.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Ionicons name="musical-notes-outline" size={64} color="#9CA3AF" />
            <Text className="text-white text-xl font-semibold mt-4 text-center">
              No tienes playlists
            </Text>
            <Text className="text-gray-400 text-center mt-2 mb-6">
              Crea tu primera playlist para organizar tu música favorita
            </Text>
            <TouchableOpacity
              className="bg-purple-600 px-6 py-3 rounded-lg"
              onPress={() => router.push('/(tabs)/library/create-playlist')}
            >
              <Text className="text-white font-semibold">Crear Playlist</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="space-y-3">
            {playlists.map(renderPlaylistItem)}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
