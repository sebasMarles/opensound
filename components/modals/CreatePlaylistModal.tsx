"use client"

import { View, Text, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert } from "react-native"
import { useState } from "react"
import { usePlaylists } from "../../hooks/usePlaylists"
import * as Haptics from "expo-haptics"

interface CreatePlaylistModalProps {
  visible: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function CreatePlaylistModal({ visible, onClose, onSuccess }: CreatePlaylistModalProps) {
  const { createPlaylist, refetch } = usePlaylists()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      Alert.alert("Error", "El nombre de la playlist es requerido")
      return
    }

    setCreating(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    try {
      await createPlaylist({ name: name.trim(), description: description.trim() })
      
      await refetch()
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      Alert.alert("Éxito", "Playlist creada correctamente")
      
      setName("")
      setDescription("")
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error("Error al crear playlist:", error)
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      Alert.alert("Error", `No se pudo crear la playlist: ${errorMessage}`)
    } finally {
      setCreating(false)
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/80 justify-center items-center px-6">
        <View className="bg-neutral-900 rounded-2xl p-6 w-full max-w-md">
          <Text className="text-white text-xl font-bold mb-4">Nueva Playlist</Text>

          <TextInput
            className="bg-neutral-800 text-white px-4 py-3 rounded-lg mb-3"
            placeholder="Nombre de la playlist"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
            maxLength={50}
          />

          <TextInput
            className="bg-neutral-800 text-white px-4 py-3 rounded-lg mb-6"
            placeholder="Descripción (opcional)"
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDescription}
            maxLength={200}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <View className="flex-row space-x-3">
            <TouchableOpacity className="flex-1 py-3 bg-neutral-800 rounded-full" onPress={onClose} disabled={creating}>
              <Text className="text-white text-center font-semibold">Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 py-3 bg-purple-600 rounded-full"
              onPress={handleCreate}
              disabled={creating || !name.trim()}
            >
              {creating ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white text-center font-semibold">Crear</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}
