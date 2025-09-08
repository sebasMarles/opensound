import { useEffect, useState } from "react";
import { getRecentSongs } from "../services/jamendo";

export function useSongs(limit: number = 10) {
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSongs() {
      try {
        setLoading(true);
        const data = await getRecentSongs(limit);
        setSongs(data);
      } catch (err: any) {
        setError(err.message || "Error cargando canciones");
      } finally {
        setLoading(false);
      }
    }

    fetchSongs();
  }, [limit]);

  return { songs, loading, error };
}
