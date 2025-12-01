import { View, Text, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert } from "react-native"
import { useState } from "react"
import { usePlaylists } from "../../hooks/usePlaylists"
import * as Haptics from "expo-haptics"
import { useToast } from "../../context/ToastContext"
import { KeyboardDismissWrapper } from "../ui/KeyboardDismissWrapper"

interface CreatePlaylistModalProps {
  visible: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function CreatePlaylistModal({ visible, onClose, onSuccess }: CreatePlaylistModalProps) {
  const { createPlaylist, refetch, playlists } = usePlaylists()
  const { showToast } = useToast()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [creating, setCreating] = useState(false)

  // Helper function to generate unique playlist name
  const generateUniqueName = (baseName: string): string => {
    const trimmedName = baseName.trim()
    const existingNames = playlists.map(p => p.name.toLowerCase())
    
    // If the name doesn't exist, use it as is
    if (!existingNames.includes(trimmedName.toLowerCase())) {
      return trimmedName
    }
    
    // Find the next available copy number
    let copyNumber = 1
    let newName = `${trimmedName} (Copia ${copyNumber})`
    
    while (existingNames.includes(newName.toLowerCase())) {
      copyNumber++
      newName = `${trimmedName} (Copia ${copyNumber})`
    }
    
    return newName
  }

  const handleCreate = async () => {
    if (!name.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      showToast("El nombre de la playlist es requerido", "error")
      return
    }

    setCreating(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    try {
      // Generate unique name if necessary
      const uniqueName = generateUniqueName(name)
      const wasRenamed = uniqueName !== name.trim()
      
      await createPlaylist({ name: uniqueName, description: description.trim() })
      
      await refetch()
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      
      // Show appropriate message
      if (wasRenamed) {
        showToast(
          `Playlist creada como "${uniqueName}" (el nombre original ya existía)`,
          "success"
        )
      } else {
        showToast("Playlist creada correctamente", "success")
      }
      
      setName("")
      setDescription("")
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error("Error al crear playlist:", error)
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      showToast(`No se pudo crear la playlist: ${errorMessage}`, "error")
    } finally {
      setCreating(false)
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardDismissWrapper style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.8)" }}>
        <View className="bg-neutral-900 rounded-2xl p-6 w-full max-w-md mx-6">
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
      </KeyboardDismissWrapper>
    </Modal>
  )
}
