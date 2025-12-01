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
import { searchSongs, searchArtists, type Track, type Artist } from "../../../services/jamendo"
import SongOptionsModal from "../../../components/modals/SongOptionsModal"
import AddToPlaylistModal from "../../../components/modals/AddToPlaylistModal"
import { extractJamendoId } from "../../../utils/jamendo"
import { KeyboardDismissWrapper } from "../../../components/ui/KeyboardDismissWrapper"

export default function BuscarScreen() {
  const router = useRouter()
  const { token } = useAuth()
  const { playFromJamendoTrack } = useMusicPlayer()

  const [searchQuery, setSearchQuery] = useState("")
  const [searchError, setSearchError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [results, setResults] = useState<Track[]>([])
  const [artistResults, setArtistResults] = useState<Artist[]>([])
  
  const [selectedSong, setSelectedSong] = useState<Track | null>(null)
  const [showOptionsModal, setShowOptionsModal] = useState(false)
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false)

  const handleSearchChange = (text: string) => {
    setSearchQuery(text)
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setLoading(true)
        setSearchError(null)
        try {
          const [songs, artists] = await Promise.all([
            searchSongs(searchQuery),
            searchArtists(searchQuery)
          ])
          setResults(songs)
          setArtistResults(artists)
          setHasSearched(true)
        } catch (error) {
          setSearchError("Error al buscar")
        } finally {
          setLoading(false)
        }
      } else {
        setResults([])
        setArtistResults([])
        setHasSearched(false)
      }
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const handlePlaySong = async (track: Track) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    await playFromJamendoTrack(track)
  }

  const handleOpenOptions = (track: Track) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setSelectedSong(track)
    setShowOptionsModal(true)
  }

  const handleAddToPlaylist = () => {
    setShowOptionsModal(false)
    setTimeout(() => {
        setShowAddToPlaylistModal(true)
    }, 300)
  }

  const handleGoToArtist = () => {
    if (selectedSong) {
        setShowOptionsModal(false)
        router.push({
            pathname: "/(tabs)/artist-detail",
            params: { id: "search", name: selectedSong.artist_name }
        })
    }
  }

  const handleArtistPress = (artist: Artist) => {
    router.push({
        pathname: "/(tabs)/artist-detail",
        params: { id: artist.id, name: artist.name, image: artist.image }
    })
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <KeyboardDismissWrapper>
        <View className="flex-1">
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
                  {results.length + artistResults.length} {results.length + artistResults.length === 1 ? "resultado" : "resultados"}
                </Text>

                {/* Carrusel de Artistas */}
                {artistResults.length > 0 && (
                  <View className="mb-8">
                    <Text className="text-white text-lg font-bold mb-3">Artistas</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {artistResults.map((artist) => (
                        <TouchableOpacity
                          key={artist.id}
                          className="mr-4 items-center"
                          onPress={() => handleArtistPress(artist)}
                        >
                          <Image
                            source={{ uri: artist.image || "https://via.placeholder.com/100" }}
                            className="w-24 h-24 rounded-full mb-2"
                          />
                          <Text className="text-white text-sm font-medium text-center w-24" numberOfLines={1}>
                            {artist.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                <Text className="text-white text-lg font-bold mb-3">Canciones</Text>
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
        </View>
      </KeyboardDismissWrapper>

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
