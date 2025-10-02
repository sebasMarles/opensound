import axios from 'axios';
import { Playlist, CreatePlaylistDto, UpdatePlaylistDto } from '../types/playlist';
import { Track } from './jamendo';
import { StorageService } from './storage';
import { authApi } from './auth';
import { getApiBaseUrl } from '../config/env';

const API_BASE_URL = getApiBaseUrl();

type PlaylistApiResponse = Omit<Playlist, 'tracks'> & { tracks?: Track[] };

const normalizePlaylist = (playlist: PlaylistApiResponse): Playlist => ({
  ...playlist,
  tracks: playlist.tracks ?? [],
});

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string | string[] } | undefined;
    if (data?.message) {
      if (Array.isArray(data.message)) {
        return data.message.join(', ');
      }
      return data.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

export class PlaylistService {
  static async create(playlistData: CreatePlaylistDto): Promise<Playlist> {
    try {
      const storedUser = await StorageService.getUserData();
      const payload = {
        name: playlistData.name,
        description: playlistData.description,
        isPublic: playlistData.isPublic ?? false,
        coverImage: playlistData.coverImage,
        ...(playlistData.userId ? { userId: playlistData.userId } : storedUser?.id ? { userId: storedUser.id } : {}),
      };

      const { data } = await authApi.post<PlaylistApiResponse>('/playlists', payload);
      return normalizePlaylist(data);
    } catch (error) {
      const message = extractErrorMessage(error, 'Error al crear playlist');
      throw new Error(message);
    }
  }

  static async getAll(userId?: string): Promise<Playlist[]> {
    try {
      const params = userId ? { userId } : undefined;
      const { data } = await authApi.get<PlaylistApiResponse[]>('/playlists', { params });
      return data.map(normalizePlaylist);
    } catch (error) {
      console.error('Get playlists error:', error);
      return [];
    }
  }

  static async getById(id: string): Promise<Playlist> {
    try {
      const { data } = await authApi.get<PlaylistApiResponse>(`/playlists/${id}`);
      return normalizePlaylist(data);
    } catch (error) {
      const message = extractErrorMessage(error, 'Error al obtener playlist');
      throw new Error(message);
    }
  }

  static async update(id: string, updateData: UpdatePlaylistDto): Promise<Playlist> {
    try {
      const { data } = await authApi.put<PlaylistApiResponse>(`/playlists/${id}`, updateData);
      return normalizePlaylist(data);
    } catch (error) {
      const message = extractErrorMessage(error, 'Error al actualizar playlist');
      throw new Error(message);
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      await authApi.delete(`/playlists/${id}`);
    } catch (error) {
      const message = extractErrorMessage(error, 'Error al eliminar playlist');
      throw new Error(message);
    }
  }

  static async addTrack(playlistId: string, track: Track): Promise<Playlist> {
    try {
      const { data } = await authApi.post<PlaylistApiResponse>(`/playlists/${playlistId}/tracks`, { track });
      return normalizePlaylist(data);
    } catch (error) {
      const message = extractErrorMessage(error, 'Error al agregar canción a la playlist');
      throw new Error(message);
    }
  }

  static async removeTrack(playlistId: string, trackId: string): Promise<Playlist> {
    try {
      const { data } = await authApi.delete<PlaylistApiResponse>(`/playlists/${playlistId}/tracks/${trackId}`);
      return normalizePlaylist(data);
    } catch (error) {
      const message = extractErrorMessage(error, 'Error al remover canción de la playlist');
      throw new Error(message);
    }
  }

  static async reorderTracks(playlistId: string, trackIds: string[]): Promise<Playlist> {
    try {
      const { data } = await authApi.put<PlaylistApiResponse>(`/playlists/${playlistId}/reorder`, { trackIds });
      return normalizePlaylist(data);
    } catch (error) {
      const message = extractErrorMessage(error, 'Error al reordenar canciones');
      throw new Error(message);
    }
  }

  static async getPublicPlaylists(limit: number = 20, offset: number = 0): Promise<Playlist[]> {
    try {
      const { data } = await axios.get<PlaylistApiResponse[]>(`${API_BASE_URL}/playlists/public`, {
        params: { limit, offset },
      });
      return data.map(normalizePlaylist);
    } catch (error) {
      console.error('Get public playlists error:', error);
      return [];
    }
  }

  static async search(query: string, limit: number = 20): Promise<Playlist[]> {
    if (!query) {
      return [];
    }

    try {
      const { data } = await axios.get<PlaylistApiResponse[]>(`${API_BASE_URL}/playlists/search`, {
        params: { q: query, limit },
      });
      return data.map(normalizePlaylist);
    } catch (error) {
      console.error('Search playlists error:', error);
      return [];
    }
  }
}
