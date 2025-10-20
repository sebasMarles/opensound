import { useMemo, useState } from "react";
import { Image, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Text from "@/ui/atoms/Text";
import Button from "@/ui/atoms/Button";
import { useAuth } from "@/core/auth/AuthProvider";
import { PlaylistForm, PlaylistList } from "@/features/playlists/components";
import { usePlaylists } from "@/hooks/usePlaylists";
import type { Playlist } from "@/features/playlists/types";

export default function LibraryScreen() {
  const { user } = useAuth();
  const {
    playlists,
    isLoading,
    error,
    selectedId,
    select,
    create,
    update,
    remove,
    clearError,
  } = usePlaylists();

  const [editing, setEditing] = useState<Playlist | null>(null);

  // Texto dinámico de bienvenida según el usuario autenticado.
  const headerSubtitle = useMemo(() => {
    if (!user) return "Gestiona tus playlists y mantén tu música organizada";
    return `Hola ${user.name?.split(" ")[0] ?? ""}, crea playlists increíbles`;
  }, [user]);

  // Al enviar el formulario decidimos si crear una playlist nueva o actualizar la seleccionada.
  const handleSubmit = async (values: { name: string; description: string; isPublic: boolean }) => {
    if (editing) {
      await update(editing.id, values);
      setEditing(null);
    } else {
      await create(values);
    }
  };

  // Al presionar "Editar" llenamos el formulario con la playlist actual.
  const handleEdit = (playlist: Playlist) => {
    setEditing(playlist);
    select(playlist.id);
  };

  // La eliminación también limpia la edición activa para evitar inconsistencias.
  const handleDelete = async (playlist: Playlist) => {
    await remove(playlist.id);
    if (editing?.id === playlist.id) {
      setEditing(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 16 }}
      >
        <View className="flex-row justify-between items-center mb-8">
          <View className="flex-row items-center">
            <Image
              source={require("../../../assets/logo.png")}
              className="w-8 h-8 mr-3"
              resizeMode="contain"
            />
            <View>
              <Text variant="title">Tu biblioteca</Text>
              <Text variant="caption" className="text-gray-400 mt-1">
                {headerSubtitle}
              </Text>
            </View>
          </View>

          {editing ? (
            <Button
              size="sm"
              variant="ghost"
              onPress={() => {
                setEditing(null);
                clearError();
              }}
              accessibilityLabel="Cancelar edición"
            >
              Cancelar
            </Button>
          ) : (
            <Button
              size="sm"
              onPress={() => {
                setEditing(null);
                select(null);
                clearError();
              }}
              accessibilityLabel="Crear playlist"
            >
              Nueva playlist
            </Button>
          )}
        </View>

        <PlaylistForm
          initialPlaylist={editing}
          onSubmit={handleSubmit}
          submitLabel={editing ? "Guardar cambios" : "Crear playlist"}
          onCancel={editing ? () => setEditing(null) : undefined}
          loading={isLoading}
        />

        {error && (
          <View className="bg-red-900/20 border border-red-500 rounded-lg p-3 mt-6">
            <Text className="text-red-400 text-sm text-center">{error}</Text>
          </View>
        )}

        <View className="mt-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text variant="subtitle">Tus playlists</Text>
            <Button
              size="sm"
              variant="outline"
              onPress={() => {
                clearError();
                select(null);
              }}
              accessibilityLabel="Actualizar playlists"
              loading={isLoading}
            >
              Actualizar
            </Button>
          </View>

          <PlaylistList
            playlists={playlists}
            selectedId={selectedId}
            onSelect={(playlist) => select(playlist.id)}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
