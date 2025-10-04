import { View, Text, Image, TouchableOpacity } from "react-native";
import { useMusicPlayer } from "../../context/MusicPlayerContext";

export default function MiniReproductor() {
  const {
    isPlaying,
    currentSong,
    togglePlayPause,
    next,
    progress,
    setPlayerVisible,
  } = useMusicPlayer();

  // si no hay canción actual, no renderizar nada
  if (!currentSong) return null;

  const clampedProgress = Math.max(0, Math.min(1, progress ?? 0));

  // fallback seguro si falta la imagen
  const imageUri =
    typeof currentSong.image === "string" && currentSong.image.length > 0
      ? currentSong.image
      : "https://picsum.photos/200";

  return (
    <View className="bg-neutral-900 border-t border-purple-600 px-4 py-3">
      <View className="absolute left-0 right-0 top-0 h-[2px] bg-neutral-800" />
      <View
        style={{ width: `${clampedProgress * 100}%` }}
        className="absolute left-0 top-0 h-[2px] bg-purple-600"
      />

      <View className="flex-row items-center">
        <Image
          source={{ uri: imageUri }}
          className="w-12 h-12 rounded-lg mr-3"
        />

        <TouchableOpacity
          className="flex-1"
          onPress={() => setPlayerVisible(true)}
          accessibilityLabel="Abrir detalles del reproductor"
        >
          <Text
            className="text-white font-bold"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {currentSong.title || "Sin título"}
          </Text>
          <Text
            className="text-gray-400 text-sm"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {currentSong.artist || "Artista desconocido"}
          </Text>
        </TouchableOpacity>

        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={togglePlayPause}
            className="mr-5"
            accessibilityLabel={isPlaying ? "Pausar" : "Reproducir"}
          >
            <Image
              source={
                isPlaying
                  ? require("../../assets/reproduciendo.png")
                  : require("../../assets/pausado2.png")
              }
              className="w-6 h-6"
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={next} accessibilityLabel="Siguiente">
            <Image
              source={require("../../assets/siguiente.png")}
              className="w-6 h-6"
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
