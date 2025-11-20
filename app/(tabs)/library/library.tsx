"use client"

import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import Ionicons from "@expo/vector-icons/Ionicons"
import { useState } from "react"
import * as Haptics from "expo-haptics"
import { useAuth } from "../../../context/AuthContext"
import { usePlaylists } from "../../../hooks/usePlaylists"
import { useLikedSongs } from "../../../hooks/useLikedSongs"
import CreatePlaylistModal from "../../../components/modals/CreatePlaylistModal"
import { useFocusEffect } from "@react-navigation/native"
import { useCallback } from "react"

export default function Library() {
  const router = useRouter()
  const { token } = useAuth()
  const { playlists, loading, refetch } = usePlaylists()
  const { likedSongs, refetch: refetchLikedSongs } = useLikedSongs()
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false)

  // Separar playlist "Me Gusta" de las demás
  const likedPlaylist = playlists.find((p) => p.isLiked)
  const userPlaylists = playlists.filter((p) => !p.isLiked)

  const handlePlaylistPress = (playlistId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.push(`/playlist-detail?id=${playlistId}`)
  }

  useFocusEffect(
    useCallback(() => {
      refetch()
      refetchLikedSongs()
    }, [refetch, refetchLikedSongs]),
  )

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#A855F7" />
        <Text className="text-white mt-4">Cargando biblioteca...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 16 }}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 90 }}
      >
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-row items-center">
            <Image source={require("../../../assets/logo.png")} className="w-8 h-8 mr-2" resizeMode="contain" />
            <Text className="text-white text-xl font-bold">Biblioteca</Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              router.push(token ? "/profile" : "/(auth)/login")
            }}
          >
            <Image source={require("../../../assets/usuario.png")} className="w-8 h-8" resizeMode="contain" />
          </TouchableOpacity>
        </View>

        {likedPlaylist && (
          <TouchableOpacity
            className="bg-gradient-to-br from-purple-900 to-purple-700 rounded-2xl p-6 mb-6"
            onPress={() => handlePlaylistPress(likedPlaylist._id)}
          >
            <View className="flex-row items-center">
              <View className="w-16 h-16 bg-purple-600 rounded-xl items-center justify-center mr-4">
                <Ionicons name="heart" size={32} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-white text-xl font-bold">Me Gusta</Text>
                <Text className="text-purple-200 text-sm">
                  {likedSongs.length} {likedSongs.length === 1 ? "canción" : "canciones"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="white" />
            </View>
          </TouchableOpacity>
        )}

        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white text-lg font-bold">Mis Playlists</Text>
          <TouchableOpacity
            className="flex-row items-center bg-purple-600 px-4 py-2 rounded-full"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              setShowCreatePlaylist(true)
            }}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-semibold ml-1">Nueva</Text>
          </TouchableOpacity>
        </View>

        {userPlaylists.length > 0 ? (
          <View className="space-y-3">
            {userPlaylists.map((playlist) => (
              <TouchableOpacity
                key={playlist._id}
                className="flex-row items-center bg-neutral-900 rounded-xl p-4"
                onPress={() => handlePlaylistPress(playlist._id)}
              >
                <View className="w-14 h-14 bg-neutral-800 rounded-lg items-center justify-center mr-3">
                  <Ionicons name="musical-notes" size={24} color="#A855F7" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-semibold" numberOfLines={1}>
                    {playlist.name}
                  </Text>
                  <Text className="text-gray-400 text-sm" numberOfLines={1}>
                    {playlist.songs.length} {playlist.songs.length === 1 ? "canción" : "canciones"}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View className="items-center py-12">
            <Ionicons name="musical-notes-outline" size={64} color="#4B5563" />
            <Text className="text-gray-400 text-center mt-4 mb-6">No tienes playlists aún</Text>
            <TouchableOpacity
              className="bg-purple-600 px-6 py-3 rounded-full"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                setShowCreatePlaylist(true)
              }}
            >
              <Text className="text-white font-semibold">Crear mi primera playlist</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <CreatePlaylistModal
        visible={showCreatePlaylist}
        onClose={() => setShowCreatePlaylist(false)}
        onSuccess={() => refetch()}
      />
    </SafeAreaView>
  )
}
