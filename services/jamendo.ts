// services/jamendo.ts
import { apiFetch } from "./api";

export type Track = {
  id: string;
  name: string;
  artist_name: string;
  image?: string;
  album_image?: string;
  audio?: string; // URL reproducible
};

// ✅ Helper para validar arrays
function ensureArray<T>(data: any): T[] {
  return Array.isArray(data) ? data : [];
}

// ✅ Obtener canciones recientes (sin logs excesivos)
export async function getRecentSongs(limit: number = 10): Promise<Track[]> {
  try {
    const res = await apiFetch<Track>("/tracks", {
      limit,
      order: "popularity_total",
      audioformat: "mp31",
    });
    return ensureArray(res.results);
  } catch (err) {
    console.warn("⚠️ Error en getRecentSongs:", err);
    return [];
  }
}

// ✅ Buscar canciones por término (sin logs excesivos)
export async function searchSongs(query: string, limit: number = 10): Promise<Track[]> {
  if (!query) return [];
  try {
    const res = await apiFetch<Track>("/tracks", {
      limit,
      search: query,
      audioformat: "mp31",
    });
    return ensureArray(res.results);
  } catch (err) {
    console.warn("⚠️ Error en searchSongs:", err);
    return [];
  }
}
