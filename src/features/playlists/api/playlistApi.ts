import { http } from "@/core/api/httpClient";
import type {
  Playlist,
  PlaylistPayload,
  PlaylistTrackPayload,
} from "../types";

// Servicio especializado para interactuar con el backend de playlists.
// Cada función devuelve datos listos para ser consumidos por el store o los componentes.

export async function fetchPlaylists(): Promise<Playlist[]> {
  return http.get<Playlist[]>("/playlists");
}

export async function createPlaylist(payload: PlaylistPayload): Promise<Playlist> {
  return http.post<Playlist>("/playlists", payload);
}

export async function updatePlaylist(
  id: string,
  payload: PlaylistPayload,
): Promise<Playlist> {
  return http.put<Playlist>(`/playlists/${id}`, payload);
}

export async function deletePlaylist(id: string): Promise<void> {
  await http.del(`/playlists/${id}`);
}

export async function addTrackToPlaylist(
  playlistId: string,
  payload: PlaylistTrackPayload,
): Promise<Playlist> {
  return http.post<Playlist>(`/playlists/${playlistId}/tracks`, payload);
}

export async function removeTrackFromPlaylist(
  playlistId: string,
  trackId: string,
): Promise<Playlist> {
  return http.del<Playlist>(`/playlists/${playlistId}/tracks/${trackId}`);
}
