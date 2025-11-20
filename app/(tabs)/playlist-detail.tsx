"use client";

import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useCallback } from "react";
import * as Haptics from "expo-haptics";
import { usePlaylists } from "../../hooks/usePlaylists";
import { useMusicPlayer } from "../../context/MusicPlayerContext";
import type { Playlist } from "../../types/playlist";
import { extractJamendoId } from "../../utils/jamendo";
import { useLikedSongs } from "../../hooks/useLikedSongs";
import MiniReproductor from "../../components/MiniReproductor";

export default function PlaylistDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { playlists, removeSongFromPlaylist, deletePlaylist, refetch } =
    usePlaylists();
  const { playPlaylist, currentSong } = useMusicPlayer();
  const { refetch: refetchLikedSongs } = useLikedSongs();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      refetch();
      refetchLikedSongs();
    }, [refetch, refetchLikedSongs])
  );

  useEffect(() => {
    const found = playlists.find((p) => p._id === id);
    if (found) setPlaylist(found);
  }, [id, playlists]);

  const handleRemoveSong = async (song: any) => {
    if (!playlist) return;

    const jamendoId = extractJamendoId(song);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Alert.alert(
      "Eliminar canción",
      "¿Estás seguro de que quieres eliminar esta canción de la playlist?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            setRemoving(jamendoId);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            try {
              await removeSongFromPlaylist(playlist._id, jamendoId);
              await refetch();
              await refetchLikedSongs();
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              );
              Alert.alert("Éxito", "Canción eliminada de la playlist");
            } catch (error) {
              console.error("Error al eliminar canción:", error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert("Error", "No se pudo eliminar la canción");
            } finally {
              setRemoving(null);
            }
          },
        },
      ]
    );
  };

  const handleDeletePlaylist = () => {
    if (!playlist) return;

    if (playlist.isLiked) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "No puedes eliminar la playlist Me Gusta");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Alert.alert(
      "Eliminar playlist",
      `¿Estás seguro de que quieres eliminar "${playlist.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            try {
              await deletePlaylist(playlist._id);
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              );
              router.back();
            } catch (error) {
              console.error("Error al eliminar playlist:", error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert("Error", "No se pudo eliminar la playlist");
            }
          },
        },
      ]
    );
  };

  const handlePlaySong = async (song: any, index: number) => {
    if (!playlist) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await playPlaylist(playlist.songs, index);
    } catch (error) {
      console.error("Error al reproducir canción:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "No se pudo reproducir la canción");
    }
  };

  if (!playlist) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#A855F7" />
        <Text className="text-white mt-4">Cargando playlist...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 160 }}
      >
        <View className="flex-row items-center justify-between px-4 py-4">
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            className="p-2"
          >
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>

          {!playlist.isLiked && (
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                handleDeletePlaylist();
              }}
              className="p-2"
            >
              <Ionicons name="trash-outline" size={24} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>

        <View className="items-center px-6 mb-6">
          <View className="w-48 h-48 bg-neutral-800 rounded-2xl items-center justify-center mb-4">
            <Ionicons
              name={playlist.isLiked ? "heart" : "musical-notes"}
              size={80}
              color={playlist.isLiked ? "#D400FF" : "#A855F7"}
            />
          </View>
          <Text className="text-white text-2xl font-bold text-center">
            {playlist.name}
          </Text>
          {playlist.description && (
            <Text className="text-gray-400 text-center mt-2">
              {playlist.description}
            </Text>
          )}
          <Text className="text-gray-400 text-sm mt-2">
            {playlist.songs.length}{" "}
            {playlist.songs.length === 1 ? "canción" : "canciones"}
          </Text>
        </View>

        <View className="px-4">
          {playlist.songs.length > 0 ? (
            playlist.songs.map((song, index) => (
              <View
                key={`${song.jamendoId}-${index}`}
                className="flex-row items-center justify-between py-3 border-b border-neutral-800"
              >
                <TouchableOpacity
                  className="flex-row items-center flex-1"
                  onPress={() => handlePlaySong(song, index)}
                >
                  <Image
                    source={{
                      uri:
                        song.image ||
                        song.album_image ||
                        "https://picsum.photos/200",
                    }}
                    className="w-12 h-12 rounded-lg mr-3"
                  />
                  <View className="flex-1">
                    <Text
                      className="text-white font-semibold"
                      numberOfLines={1}
                    >
                      {song.name}
                    </Text>
                    <Text className="text-gray-400 text-sm" numberOfLines={1}>
                      {song.artist_name}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleRemoveSong(song)}
                  disabled={removing === song.jamendoId}
                  className="p-2"
                >
                  {removing === song.jamendoId ? (
                    <ActivityIndicator size="small" color="#EF4444" />
                  ) : (
                    <Ionicons
                      name={playlist.isLiked ? "heart" : "close-circle-outline"}
                      size={24}
                      color={playlist.isLiked ? "#D400FF" : "#EF4444"}
                    />
                  )}
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View className="items-center py-12">
              <Ionicons
                name="musical-notes-outline"
                size={64}
                color="#4B5563"
              />
              <Text className="text-gray-400 text-center mt-4">
                No hay canciones en esta playlist
              </Text>
              <Text className="text-gray-500 text-center mt-2 px-8">
                Agrega canciones usando el menú de opciones (tres puntos) en
                cualquier canción
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {currentSong && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 10,
          }}
        >
          <MiniReproductor />
        </View>
      )}
    </SafeAreaView>
  );
}
