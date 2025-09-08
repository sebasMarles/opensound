import { apiFetch } from "./api";

// canciones recientes
export async function getRecentSongs(limit: number = 10) {
  const res = await apiFetch("/tracks/", { limit, order: "popularity_total" });
  return res.results || [];
}

// búsqueda de canciones
export async function searchSongs(query: string, limit: number = 10) {
  const res = await apiFetch("/tracks/", { limit, search: query });
  return res.results || [];
}
