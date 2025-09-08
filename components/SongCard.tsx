import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

export default function SongCard({ song }: { song: any }) {
  return (
    <TouchableOpacity style={styles.container}>
      <Image
        source={{ uri: song.image || "https://via.placeholder.com/150" }}
        style={styles.image}
      />
      <Text style={styles.title} numberOfLines={1}>
        {song.name ?? "Sin título"}
      </Text>
      <Text style={styles.artist} numberOfLines={1}>
        {song.artist_name ?? "Artista desconocido"}
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
