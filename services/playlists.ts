import { getApiBaseUrl } from "../hooks/useApiBaseUrl"
import type { Playlist, CreatePlaylistDto, UpdatePlaylistDto, AddSongDto } from "../types/playlist"
import { extractJamendoId } from "../utils/jamendo"

// Helper para poner los headers de auth
async function getAuthHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "x-access-token": token,
  }
}

// Traer todas las playlists
export async function getAllPlaylists(token: string): Promise<Playlist[]> {
  const baseUrl = await getApiBaseUrl()

  const response = await fetch(`${baseUrl}/playlists`, {
    headers: await getAuthHeaders(token),
  })

  if (!response.ok) {
    if (response.status === 401) {
      return []
    }
    throw new Error("Error al obtener playlists")
  }

  const data = await response.json()
  const playlists = data.playlists || data
  return Array.isArray(playlists) ? playlists : []
}

// Traer una playlist por ID
export async function getPlaylistById(token: string, playlistId: string): Promise<Playlist> {
  const baseUrl = await getApiBaseUrl()
  const response = await fetch(`${baseUrl}/playlists/${playlistId}`, {
    headers: await getAuthHeaders(token),
  })

  if (!response.ok) {
    throw new Error("Error al obtener playlist")
  }

  const data = await response.json()
  return data.playlist || data
}

// Crear playlist nueva
export async function createPlaylist(token: string, data: CreatePlaylistDto): Promise<Playlist> {
  const baseUrl = await getApiBaseUrl()

  try {
    const headers = await getAuthHeaders(token)

    const response = await fetch(`${baseUrl}/playlists`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Error al crear playlist: ${response.status}`)
    }

    const result = await response.json()
    return result.playlist || result
  } catch (error) {
    throw error
  }
}

// Actualizar playlist
export async function updatePlaylist(token: string, playlistId: string, data: UpdatePlaylistDto): Promise<Playlist> {
  const baseUrl = await getApiBaseUrl()
  const response = await fetch(`${baseUrl}/playlists/${playlistId}`, {
    method: "PUT",
    headers: await getAuthHeaders(token),
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error("Error al actualizar playlist")
  }

  const result = await response.json()
  return result.playlist || result
}

// Borrar playlist
export async function deletePlaylist(token: string, playlistId: string): Promise<void> {
  const baseUrl = await getApiBaseUrl()
  const response = await fetch(`${baseUrl}/playlists/${playlistId}`, {
    method: "DELETE",
    headers: await getAuthHeaders(token),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Error al eliminar playlist")
  }
}

// Agregar cancion a playlist
export async function addSongToPlaylist(token: string, playlistId: string, song: AddSongDto): Promise<Playlist> {
  const baseUrl = await getApiBaseUrl()

  const cleanJamendoId = extractJamendoId({
    id: song.jamendoId,
    audio: song.audio,
    name: song.name,
  })

  const cleanSong = {
    ...song,
    jamendoId: cleanJamendoId,
  }

  const response = await fetch(`${baseUrl}/playlists/${playlistId}/songs`, {
    method: "POST",
    headers: await getAuthHeaders(token),
    body: JSON.stringify(cleanSong),
  })

  if (!response.ok) {
    throw new Error("Error al agregar canción")
  }

  const result = await response.json()
  return result.playlist || result
}

// Quitar cancion de playlist
export async function removeSongFromPlaylist(token: string, playlistId: string, jamendoId: string): Promise<Playlist> {
  const baseUrl = await getApiBaseUrl()

  const response = await fetch(`${baseUrl}/playlists/${playlistId}/songs/${jamendoId}`, {
    method: "DELETE",
    headers: await getAuthHeaders(token),
  })

  if (!response.ok) {
    throw new Error("Error al eliminar canción")
  }

  const result = await response.json()
  return result.playlist || result
}

// Ver canciones favoritas
export async function getLikedSongs(token: string): Promise<AddSongDto[]> {
  const baseUrl = await getApiBaseUrl()
  const response = await fetch(`${baseUrl}/playlists/liked/songs`, {
    headers: await getAuthHeaders(token),
  })

  if (!response.ok) {
    if (response.status === 401) {
      return []
    }
    throw new Error("Error al obtener canciones favoritas")
  }

  const data = await response.json()
  const songs = data.songs || data
  return Array.isArray(songs) ? songs : []
}

// Dar like/dislike
export async function toggleLikedSong(
  token: string,
  song: AddSongDto,
): Promise<{ liked: boolean; playlist: Playlist }> {
  const baseUrl = await getApiBaseUrl()

  const cleanJamendoId = extractJamendoId({
    id: song.jamendoId,
    audio: song.audio,
    name: song.name,
  })

  const cleanSong = {
    ...song,
    jamendoId: cleanJamendoId,
  }

  const response = await fetch(`${baseUrl}/playlists/liked/toggle`, {
    method: "POST",
    headers: await getAuthHeaders(token),
    body: JSON.stringify(cleanSong),
  })

  if (!response.ok) {
    throw new Error("Error al actualizar favoritos")
  }

  return await response.json()
}
