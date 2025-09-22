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

export async function getRecentSongs(limit: number = 10): Promise<Track[]> {
  const res = await apiFetch<Track>("/tracks", {
    limit,
    order: "popularity_total",
    audioformat: "mp31", 
  });
  return res.results ?? [];
}

export async function searchSongs(query: string, limit: number = 10): Promise<Track[]> {
  if (!query) return [];
  const res = await apiFetch<Track>("/tracks", {
    limit,
    search: query,
    audioformat: "mp31",
  });
  return res.results ?? [];
}