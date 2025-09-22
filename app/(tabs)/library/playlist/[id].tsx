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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePlaylistStore } from '../../../../stores/playlistStore';
import { useMusicPlayer } from '../../../../context/MusicPlayerContext';
import { Track } from '../../../../services/jamendo';

export default function PlaylistDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    currentPlaylist,
    isLoading,
    error,
    fetchPlaylistById,
    removeTrackFromPlaylist,
    clearError,
  } = usePlaylistStore();
  
  const {
    setQueueFromJamendo,
    playFromJamendoTrack,
    currentSong,
    isPlaying,
  } = useMusicPlayer();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPlaylistById(id);
    }
  }, [id]);

  const handleRefresh = async () => {
    if (id) {
      setRefreshing(true);
      await fetchPlaylistById(id);
      setRefreshing(false);
    }
  };

  const handlePlayPlaylist = async () => {
    if (currentPlaylist && currentPlaylist.tracks.length > 0) {
      try {
        setQueueFromJamendo(currentPlaylist.tracks);
        await playFromJamendoTrack(currentPlaylist.tracks[0]);
      } catch (error) {
        Alert.alert('Error', 'No se pudo reproducir la playlist');
      }
    }
  };

  const handlePlayTrack = async (track: Track) => {
    try {
      if (currentPlaylist) {
        setQueueFromJamendo(currentPlaylist.tracks);
      }
      await playFromJamendoTrack(track);
    } catch (error) {
      Alert.alert('Error', 'No se pudo reproducir la canción');
    }
  };

  const handleRemoveTrack = (track: Track) => {
    if (!currentPlaylist) return;

    Alert.alert(
      'Remover Canción',
      `¿Quieres remover "${track.name}" de la playlist?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeTrackFromPlaylist(currentPlaylist.id, track.id);
            } catch (error) {
              Alert.alert('Error', 'No se pudo remover la canción');
            }
          },
        },
      ]
    );
  };

  const renderTrackItem = (track: Track, index: number) => {
    const isCurrentTrack = currentSong?.audio === track.audio;
    const coverImage = track.album_image || track.image || 'https://picsum.photos/200';

    return (
      <TouchableOpacity
        key={`${track.id}-${index}`}
        className="flex-row items-center py-3 px-4"
        onPress={() => handlePlayTrack(track)}
      >
        {/* Track Number / Playing Indicator */}
        <View className="w-8 items-center mr-3">
          {isCurrentTrack && isPlaying ? (
            <Ionicons name="volume-high" size={16} color="#D400FF" />
          ) : (
            <Text className="text-gray-400 text-sm">{index + 1}</Text>
          )}
        </View>

        {/* Cover Image */}
        <Image
          source={{ uri: coverImage }}
          className="w-12 h-12 rounded-lg mr-3"
        />

        {/* Track Info */}
        <View className="flex-1">
          <Text
            className={`font-semibold ${isCurrentTrack ? 'text-purple-400' : 'text-white'}`}
            numberOfLines={1}
          >
            {track.name || 'Sin título'}
          </Text>
          <Text className="text-gray-400 text-sm mt-1" numberOfLines={1}>
            {track.artist_name || 'Artista desconocido'}
          </Text>
        </View>

        {/* Actions */}
        <TouchableOpacity
          className="p-2"
          onPress={() => {
            Alert.alert(
              'Opciones de Canción',
              track.name || 'Sin título',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Remover de playlist',
                  style: 'destructive',
                  onPress: () => handleRemoveTrack(track),
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
          Error al cargar playlist
        </Text>
        <Text className="text-gray-400 text-center mt-2">{error}</Text>
        <TouchableOpacity
          className="bg-purple-600 px-6 py-3 rounded-lg mt-6"
          onPress={() => {
            clearError();
            if (id) fetchPlaylistById(id);
          }}
        >
          <Text className="text-white font-semibold">Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading || !currentPlaylist) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <Ionicons name="musical-notes-outline" size={48} color="#9CA3AF" />
        <Text className="text-gray-400 text-center mt-4">Cargando playlist...</Text>
      </View>
    );
  }

  const coverImage = currentPlaylist.coverImage || 
    currentPlaylist.tracks[0]?.album_image || 
    currentPlaylist.tracks[0]?.image;

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center px-6 pt-12 pb-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-4 p-2"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold flex-1" numberOfLines={1}>
          {currentPlaylist.name}
        </Text>
        <TouchableOpacity
          className="p-2"
          onPress={() => {
            Alert.alert(
              'Opciones de Playlist',
              currentPlaylist.name,
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Editar',
                  onPress: () => router.push(`/(tabs)/library/playlist/${currentPlaylist.id}/edit`),
                },
                {
                  text: 'Agregar canciones',
                  onPress: () => router.push(`/(tabs)/library/playlist/${currentPlaylist.id}/add-songs`),
                },
              ]
            );
          }}
        >
          <Ionicons name="ellipsis-vertical" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
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
        {/* Playlist Header */}
        <View className="items-center px-6 pb-6">
          {/* Cover Image */}
          <View className="w-48 h-48 rounded-lg bg-neutral-800 mb-4 overflow-hidden">
            {coverImage ? (
              <Image
                source={{ uri: coverImage }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full justify-center items-center">
                <Ionicons name="musical-notes" size={64} color="#9CA3AF" />
              </View>
            )}
          </View>

          {/* Playlist Info */}
          <Text className="text-white text-2xl font-bold text-center mb-2">
            {currentPlaylist.name}
          </Text>
          
          {currentPlaylist.description && (
            <Text className="text-gray-400 text-center mb-2">
              {currentPlaylist.description}
            </Text>
          )}

          <Text className="text-gray-400 text-sm">
            {currentPlaylist.tracks.length} {currentPlaylist.tracks.length === 1 ? 'canción' : 'canciones'}
            {currentPlaylist.isPublic && ' • Pública'}
          </Text>

          {/* Play Button */}
          {currentPlaylist.tracks.length > 0 && (
            <TouchableOpacity
              className="bg-purple-600 flex-row items-center px-8 py-3 rounded-full mt-6"
              onPress={handlePlayPlaylist}
            >
              <Ionicons name="play" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Reproducir</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tracks List */}
        <View className="px-2">
          {currentPlaylist.tracks.length === 0 ? (
            <View className="items-center py-12">
              <Ionicons name="musical-note-outline" size={48} color="#9CA3AF" />
              <Text className="text-white text-lg font-semibold mt-4">
                Playlist vacía
              </Text>
              <Text className="text-gray-400 text-center mt-2 mb-6">
                Agrega canciones para empezar a disfrutar tu playlist
              </Text>
              <TouchableOpacity
                className="bg-purple-600 px-6 py-3 rounded-lg"
                onPress={() => router.push(`/(tabs)/library/playlist/${currentPlaylist.id}/add-songs`)}
              >
                <Text className="text-white font-semibold">Agregar Canciones</Text>
              </TouchableOpacity>
            </View>
          ) : (
            currentPlaylist.tracks.map((track, index) => renderTrackItem(track, index))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
