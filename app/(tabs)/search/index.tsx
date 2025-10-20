import { useState } from "react";
import { ActivityIndicator, Image, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import Text from "@/ui/atoms/Text";
import Button from "@/ui/atoms/Button";
import { Input } from "@/ui/atoms/Input";
import { useMusicPlayer } from "@/core/player/MusicPlayerProvider";
import { searchSongs, type Track } from "@/features/music/api/jamendoService";
import { TrackListItem } from "@/features/music/components";

type FormValues = {
  query: string;
};

export default function SearchScreen() {
  const { playFromJamendoTrack } = useMusicPlayer();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { query: "" } });

  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Ejecuta la búsqueda contra la API de Jamendo con las validaciones necesarias.
  const onSubmit = async ({ query }: FormValues) => {
    const sanitized = query.trim();
    if (!sanitized) {
      setMessage("Ingresa un término para buscar canciones");
      setResults([]);
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const data = await searchSongs(sanitized, 30);
      if (data.length === 0) {
        setMessage("No se encontraron resultados para tu búsqueda");
      }
      setResults(data);
    } catch (error) {
      const fallback =
        error instanceof Error ? error.message : "No se pudo realizar la búsqueda";
      setMessage(fallback);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Reproducir una canción directamente desde los resultados de búsqueda.
  const playTrack = async (track: Track) => {
    try {
      await playFromJamendoTrack(track);
    } catch (err) {
      console.warn("No se pudo reproducir la canción", err);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView
        className="flex-1 px-5"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 16 }}
      >
        <View className="flex-row items-center mb-8">
          <Image
            source={require("../../../assets/logo.png")}
            className="w-8 h-8 mr-3"
            resizeMode="contain"
          />
          <View>
            <Text variant="title">Buscar</Text>
            <Text variant="caption" className="text-gray-400 mt-1">
              Encuentra canciones y artistas en segundos
            </Text>
          </View>
        </View>

        <View>
          <Controller
            control={control}
            name="query"
            rules={{
              required: "Escribe el nombre de una canción o artista",
              minLength: { value: 2, message: "Mínimo 2 caracteres" },
              maxLength: { value: 60, message: "Máximo 60 caracteres" },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Ej. lo-fi, indie, rock..."
                returnKeyType="search"
                onSubmitEditing={handleSubmit(onSubmit)}
                hasError={Boolean(errors.query)}
              />
            )}
          />
          {errors.query && (
            <Text variant="caption" className="text-red-400 mt-1">
              {errors.query.message}
            </Text>
          )}
          <Button className="mt-4" onPress={handleSubmit(onSubmit)} loading={loading}>
            Buscar
          </Button>
        </View>

        {loading && (
          <View className="mt-10 items-center">
            <ActivityIndicator color="#A855F7" />
            <Text variant="caption" className="mt-3 text-gray-400">
              Buscando canciones...
            </Text>
          </View>
        )}

        {!loading && message && (
          <View className="mt-10 bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <Text className="text-gray-300 text-center">{message}</Text>
          </View>
        )}

        {!loading && results.length > 0 && (
          <View className="mt-10">
            <Text variant="subtitle" className="mb-4">
              Resultados
            </Text>
            {results.map((track) => (
              <TrackListItem key={track.id} track={track} onPress={playTrack} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
