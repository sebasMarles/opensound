import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../stores/authStore';
import { usePlaylistStore } from '../../../stores/playlistStore';

export default function LibraryScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { playlists, fetchPlaylists } = usePlaylistStore();

  useEffect(() => {
    if (user?.id) {
      fetchPlaylists(user.id);
    }
  }, [user?.id]);

  const libraryItems = [
    {
      icon: 'musical-notes',
      title: 'Mis Playlists',
      subtitle: `${playlists.length} playlists`,
      route: '/(tabs)/library/playlists',
      color: '#D400FF',
    },
    {
      icon: 'heart',
      title: 'Canciones Favoritas',
      subtitle: 'Próximamente',
      route: null,
      color: '#EF4444',
    },
    {
      icon: 'time',
      title: 'Reproducidas Recientemente',
      subtitle: 'Próximamente',
      route: null,
      color: '#10B981',
    },
    {
      icon: 'download',
      title: 'Descargas',
      subtitle: 'Próximamente',
      route: null,
      color: '#3B82F6',
    },
  ];

  const recentPlaylists = playlists.slice(0, 3);

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="px-6 pt-12 pb-6">
        <Text className="text-white text-2xl font-bold">Tu Biblioteca</Text>
        <Text className="text-gray-400 text-sm">
          Accede a tu música personalizada
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Quick Actions */}
        <View className="px-6 mb-8">
          <View className="flex-row justify-between mb-4">
            <Text className="text-white text-lg font-semibold">Acceso Rápido</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/library/create-playlist')}>
              <Ionicons name="add-circle" size={24} color="#D400FF" />
            </TouchableOpacity>
          </View>

          <View className="space-y-3">
            {libraryItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                className="bg-neutral-900 rounded-lg p-4 flex-row items-center"
                onPress={() => {
                  if (item.route) {
                    router.push(item.route as any);
                  } else {
                    // Mostrar mensaje de próximamente
                    alert('Esta funcionalidad estará disponible próximamente');
                  }
                }}
              >
                <View
                  className="w-12 h-12 rounded-lg justify-center items-center mr-4"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <Ionicons name={item.icon as any} size={24} color={item.color} />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-semibold">{item.title}</Text>
                  <Text className="text-gray-400 text-sm">{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Playlists */}
        {recentPlaylists.length > 0 && (
          <View className="px-6 mb-8">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-lg font-semibold">Playlists Recientes</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/library/playlists')}>
                <Text className="text-purple-400 text-sm">Ver todas</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {recentPlaylists.map((playlist) => {
                const coverImage = playlist.coverImage || 
                  playlist.tracks[0]?.album_image || 
                  playlist.tracks[0]?.image;

                return (
                  <TouchableOpacity
                    key={playlist.id}
                    className="mr-4 w-32"
                    onPress={() => router.push(`/(tabs)/library/playlist/${playlist.id}`)}
                  >
                    <View className="w-32 h-32 rounded-lg bg-neutral-800 mb-2 overflow-hidden">
                      {coverImage ? (
                        <Image
                          source={{ uri: coverImage }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="w-full h-full justify-center items-center">
                          <Ionicons name="musical-notes" size={32} color="#9CA3AF" />
                        </View>
                      )}
                    </View>
                    <Text
                      className="text-white text-sm font-medium"
                      numberOfLines={1}
                    >
                      {playlist.name}
                    </Text>
                    <Text className="text-gray-400 text-xs">
                      {playlist.tracks.length} canciones
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Empty State */}
        {playlists.length === 0 && (
          <View className="items-center px-6 py-12">
            <Ionicons name="musical-notes-outline" size={64} color="#9CA3AF" />
            <Text className="text-white text-xl font-semibold mt-4 text-center">
              Tu biblioteca está vacía
            </Text>
            <Text className="text-gray-400 text-center mt-2 mb-6">
              Crea tu primera playlist para empezar a organizar tu música
            </Text>
            <TouchableOpacity
              className="bg-purple-600 px-6 py-3 rounded-lg"
              onPress={() => router.push('/(tabs)/library/create-playlist')}
            >
              <Text className="text-white font-semibold">Crear Playlist</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Statistics */}
        <View className="px-6 mb-8">
          <Text className="text-white text-lg font-semibold mb-4">Estadísticas</Text>
          <View className="bg-neutral-900 rounded-lg p-4">
            <View className="flex-row justify-around">
              <View className="items-center">
                <Text className="text-white text-2xl font-bold">{playlists.length}</Text>
                <Text className="text-gray-400 text-sm">Playlists</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-2xl font-bold">
                  {playlists.reduce((total, playlist) => total + playlist.tracks.length, 0)}
                </Text>
                <Text className="text-gray-400 text-sm">Canciones</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-2xl font-bold">
                  {playlists.filter(p => p.isPublic).length}
                </Text>
                <Text className="text-gray-400 text-sm">Públicas</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
