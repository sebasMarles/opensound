"use client"

import { useState, useEffect } from "react"
import { View, Text, TextInput, ScrollView, Image, TouchableOpacity, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import Ionicons from "@expo/vector-icons/Ionicons"
import * as Haptics from "expo-haptics"
import { useAuth } from "../../../context/AuthContext"
import { useMusicPlayer } from "../../../context/MusicPlayerContext"
import { ValidationLimits, sanitizeInput } from "../../../utils/validation"
import { searchSongs, type Track } from "../../../services/jamendo"
import SongOptionsModal from "../../../components/modals/SongOptionsModal"
import AddToPlaylistModal from "../../../components/modals/AddToPlaylistModal"
import { extractJamendoId } from "../../../utils/jamendo"

export default function BuscarScreen() {
  const router = useRouter()
  const { token } = useAuth()
  const { playFromJamendoTrack } = useMusicPlayer()

  const [searchQuery, setSearchQuery] = useState("")
  const [searchError, setSearchError] = useState<string | null>(null)
  const [results, setResults] = useState<Track[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const [selectedSong, setSelectedSong] = useState<Track | null>(null)
  const [showOptionsModal, setShowOptionsModal] = useState(false)
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false)

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.trim().length >= ValidationLimits.search.min) {
        handleSearch()
      } else if (searchQuery.trim().length === 0) {
        setResults([])
        setHasSearched(false)
      }
    }, 500)

    return () => clearTimeout(delaySearch)
  }, [searchQuery])

  const handleSearchChange = (text: string) => {
    setSearchError(null)

    if (text.length > ValidationLimits.search.max) {
      setSearchError(`La búsqueda no puede exceder ${ValidationLimits.search.max} caracteres`)
      return
    }

    setSearchQuery(text)
  }

  const handleSearch = async () => {
    const sanitized = sanitizeInput(searchQuery)

    if (sanitized.length < ValidationLimits.search.min) {
      setSearchError("Ingresa al menos 1 carácter para buscar")
      return
    }

    setLoading(true)
    setHasSearched(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    try {
      const songs = await searchSongs(sanitized, 20)
      setResults(songs)
    } catch (error) {
      console.error("[v0] Error al buscar canciones:", error)
      setSearchError("Error al buscar canciones. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const handlePlaySong = async (track: Track) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    try {
      await playFromJamendoTrack(track)
    } catch (error) {}
  }

  const handleOpenOptions = (track: Track) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setSelectedSong(track)
    setShowOptionsModal(true)
  }

  const handleAddToPlaylist = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setShowAddToPlaylistModal(true)
  }

  const handleGoToArtist = () => {
    // TODO: Implementar navegación a página de artista
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
            <Text className="text-white text-xl font-bold">Buscar</Text>
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

        <View className="mb-6">
          <View className="flex-row items-center bg-neutral-900 rounded-xl px-4 py-3 border border-purple-600">
            <Ionicons name="search" size={20} color="#A855F7" />
            <TextInput
              placeholder="Buscar canciones..."
              placeholderTextColor="#6B7280"
              className="flex-1 text-white ml-3"
              value={searchQuery}
              onChangeText={handleSearchChange}
              returnKeyType="search"
              maxLength={ValidationLimits.search.max}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Campo de búsqueda"
              accessibilityHint="Busca canciones por nombre"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  setSearchQuery("")
                }}
              >
                <Ionicons name="close-circle" size={20} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
          {searchError && <Text className="text-red-500 text-sm mt-2">{searchError}</Text>}
        </View>

        {loading && (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color="#A855F7" />
            <Text className="text-gray-400 mt-4">Buscando canciones...</Text>
          </View>
        )}

        {!loading && hasSearched && results.length > 0 && (
          <View>
            <Text className="text-white text-lg font-bold mb-4">
              {results.length} {results.length === 1 ? "resultado" : "resultados"}
            </Text>
            <View className="space-y-3">
              {results.map((track) => (
                <View key={track.id} className="flex-row items-center bg-neutral-900 rounded-xl p-3">
                  <TouchableOpacity onPress={() => handlePlaySong(track)} className="flex-row items-center flex-1">
                    <Image
                      source={{ uri: track.album_image || track.image || "https://via.placeholder.com/60" }}
                      className="w-14 h-14 rounded-lg mr-3"
                    />
                    <View className="flex-1">
                      <Text className="text-white font-semibold" numberOfLines={1}>
                        {track.name}
                      </Text>
                      <Text className="text-gray-400 text-sm" numberOfLines={1}>
                        {track.artist_name}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => handleOpenOptions(track)} className="p-2">
                    <Image
                      source={require("../../../assets/songoptions.png")}
                      className="w-6 h-6"
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {!loading && hasSearched && results.length === 0 && (
          <View className="items-center py-12">
            <Ionicons name="search-outline" size={64} color="#4B5563" />
            <Text className="text-gray-400 text-center mt-4">No se encontraron canciones para "{searchQuery}"</Text>
            <Text className="text-gray-500 text-center mt-2 text-sm">Intenta con otro término de búsqueda</Text>
          </View>
        )}

        {!loading && !hasSearched && (
          <View className="items-center py-12">
            <Ionicons name="musical-notes-outline" size={64} color="#4B5563" />
            <Text className="text-gray-400 text-center mt-4">Busca tus canciones favoritas</Text>
            <Text className="text-gray-500 text-center mt-2 text-sm">
              Escribe el nombre de una canción para comenzar
            </Text>
          </View>
        )}
      </ScrollView>

      {selectedSong && (
        <SongOptionsModal
          visible={showOptionsModal}
          onClose={() => {
            setShowOptionsModal(false)
            setSelectedSong(null)
          }}
          song={selectedSong}
          onAddToPlaylist={handleAddToPlaylist}
          onGoToArtist={handleGoToArtist}
        />
      )}

      {selectedSong && (
        <AddToPlaylistModal
          visible={showAddToPlaylistModal}
          onClose={() => setShowAddToPlaylistModal(false)}
          song={{
            jamendoId: extractJamendoId(selectedSong),
            name: selectedSong.name,
            artist_name: selectedSong.artist_name,
            image: selectedSong.album_image || selectedSong.image,
            album_image: selectedSong.album_image,
            audio: selectedSong.audio,
          }}
          onCreateNew={() => {
            setShowAddToPlaylistModal(false)
            // TODO: Abrir modal de crear playlist
          }}
        />
      )}
    </SafeAreaView>
  )
}
