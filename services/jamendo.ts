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

export type Artist = {
  id: string;
  name: string;
  image: string;
  website?: string;
  joindate?: string;
};

// ✅ Helper para validar arrays
function ensureArray<T>(data: any): T[] {
  return Array.isArray(data) ? data : [];
}

// ✅ Obtener canciones recientes (sin logs excesivos)
export async function getRecentSongs(limit: number = 10, offset: number = 0): Promise<Track[]> {
  try {
    const res = await apiFetch<Track>("/tracks", {
      limit,
      offset,
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
export async function searchSongs(query: string, limit: number = 10, offset: number = 0): Promise<Track[]> {
  if (!query) return [];
  try {
    const res = await apiFetch<Track>("/tracks", {
      limit,
      offset,
      search: query,
      audioformat: "mp31",
    });
    return ensureArray(res.results);
  } catch (err) {
    console.warn("⚠️ Error en searchSongs:", err);
    return [];
  }
}

// Buscar artistas por nombre
export async function searchArtists(query: string, limit: number = 10): Promise<Artist[]> {
  if (!query) return [];
  try {
    const res = await apiFetch<Artist>("/artists", {
      limit,
      namesearch: query,
      order: "popularity_total",
    });
    return ensureArray(res.results);
  } catch (err) {
    console.warn("⚠️ Error en searchArtists:", err);
    return [];
  }
}

// Obtener canciones de un artista (top o recientes)
export async function getArtistTracks(artistName: string, order: "popularity_total" | "releasedate" = "popularity_total", limit: number = 10): Promise<Track[]> {
  try {
    const res = await apiFetch<Track>("/tracks", {
      limit,
      artist_name: artistName,
      order,
      audioformat: "mp31",
    });
    return ensureArray(res.results);
  } catch (err) {
    console.warn("⚠️ Error en getArtistTracks:", err);
    return [];
  }
}

// Obtener info de un artista por ID
export async function getArtistById(id: string): Promise<Artist | null> {
  try {
    const res = await apiFetch<Artist>("/artists", {
      id,
    });
    return res.results[0] || null;
  } catch (err) {
    console.warn("⚠️ Error en getArtistById:", err);
    return null;
  }
}
