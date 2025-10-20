// components/molecules/SongCard.tsx
import { Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useMusicPlayer } from "../../context/MusicPlayerContext"; // <- corregido

export default function SongCard({ song }: { song: any }) {
  const { setCurrentSong, setIsPlaying } = useMusicPlayer();

  const handlePress = () => {
    setCurrentSong({
      title: song?.name ?? "Sin título",
      artist: song?.artist_name ?? "Artista desconocido",
      image: song?.image || "https://via.placeholder.com/150",
    });
    setIsPlaying(true);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Image
        source={{ uri: song?.image || "https://via.placeholder.com/150" }}
        style={styles.image}
      />
      <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
        {song?.name ?? "Sin título"}
      </Text>
      <Text style={styles.artist} numberOfLines={1} ellipsizeMode="tail">
        {song?.artist_name ?? "Artista desconocido"}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 12,
    width: 130,
  },
  image: {
    width: 130,
    height: 130,
    borderRadius: 12,
  },
  title: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 6,
  },
  artist: {
    color: "gray",
    fontSize: 12,
    marginTop: 2,
  },
});