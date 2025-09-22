import axios from 'axios';
import { Playlist, CreatePlaylistDto, UpdatePlaylistDto } from '../types/playlist';
import { Track } from './jamendo';
import { StorageService } from './storage';

// Configuración base de la API
const API_BASE_URL = 'https://api.opensound.com'; // Cambiar por tu API real

const playlistApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token automáticamente
playlistApi.interceptors.request.use(
  async (config) => {
    const token = await StorageService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export class PlaylistService {
  // Crear nueva playlist
  static async create(playlistData: CreatePlaylistDto): Promise<Playlist> {
    try {
      console.log('🎵 Simulando creación de playlist:', playlistData.name);
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockPlaylist: Playlist = {
        id: Date.now().toString(),
        name: playlistData.name,
        description: playlistData.description,
        tracks: [],
        userId: '1', // Obtener del contexto de auth
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: playlistData.isPublic ?? false,
        coverImage: undefined,
      };

      // Guardar en storage local para persistencia
      await this.savePlaylistToLocal(mockPlaylist);

      console.log('✅ Playlist creada exitosamente');
      return mockPlaylist;
    } catch (error) {
      console.error('Create playlist error:', error);
      throw new Error('Error al crear playlist');
    }
  }

  // Obtener todas las playlists del usuario
  static async getAll(userId: string): Promise<Playlist[]> {
    try {
      console.log('📋 Simulando obtención de playlists para usuario:', userId);
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Obtener de storage local
      const localPlaylists = await this.getPlaylistsFromLocal();
      console.log(`✅ ${localPlaylists.length} playlists obtenidas`);
      return localPlaylists;
    } catch (error) {
      console.error('Get playlists error:', error);
      // Si falla, retornar array vacío
      return [];
    }
  }

  // Obtener playlist por ID
  static async getById(id: string): Promise<Playlist> {
    try {
      console.log('🔍 Simulando búsqueda de playlist:', id);
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Buscar en storage local
      const localPlaylists = await this.getPlaylistsFromLocal();
      const playlist = localPlaylists.find(p => p.id === id);
      
      if (!playlist) {
        throw new Error('Playlist no encontrada');
      }
      
      console.log('✅ Playlist encontrada:', playlist.name);
      return playlist;
    } catch (error) {
      console.error('Get playlist by ID error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al obtener playlist');
    }
  }

  // Actualizar playlist
  static async update(id: string, updateData: UpdatePlaylistDto): Promise<Playlist> {
    try {
      console.log('✏️ Simulando actualización de playlist:', id);
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Actualizar en storage local
      const localPlaylists = await this.getPlaylistsFromLocal();
      const playlistIndex = localPlaylists.findIndex(p => p.id === id);
      
      if (playlistIndex === -1) {
        throw new Error('Playlist no encontrada');
      }
      
      const updatedPlaylist = {
        ...localPlaylists[playlistIndex],
        ...updateData,
        updatedAt: new Date(),
      };
      
      localPlaylists[playlistIndex] = updatedPlaylist;
      await this.savePlaylistsToLocal(localPlaylists);
      
      console.log('✅ Playlist actualizada exitosamente');
      return updatedPlaylist;
    } catch (error) {
      console.error('Update playlist error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al actualizar playlist');
    }
  }

  // Eliminar playlist
  static async delete(id: string): Promise<void> {
    try {
      console.log('🗑️ Simulando eliminación de playlist:', id);
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Eliminar de storage local
      const localPlaylists = await this.getPlaylistsFromLocal();
      const filteredPlaylists = localPlaylists.filter(p => p.id !== id);
      await this.savePlaylistsToLocal(filteredPlaylists);
      
      console.log('✅ Playlist eliminada exitosamente');
    } catch (error) {
      console.error('Delete playlist error:', error);
      throw new Error('Error al eliminar playlist');
    }
  }

  // Agregar track a playlist
  static async addTrack(playlistId: string, track: Track): Promise<void> {
    try {
      console.log('➕ Simulando agregar canción a playlist:', track.name);
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Actualizar storage local
      const localPlaylists = await this.getPlaylistsFromLocal();
      const playlistIndex = localPlaylists.findIndex(p => p.id === playlistId);
      
      if (playlistIndex !== -1) {
        // Verificar que el track no esté ya en la playlist
        const existingTrack = localPlaylists[playlistIndex].tracks.find(t => t.id === track.id);
        if (!existingTrack) {
          localPlaylists[playlistIndex].tracks.push(track);
          localPlaylists[playlistIndex].updatedAt = new Date();
          await this.savePlaylistsToLocal(localPlaylists);
          console.log('✅ Canción agregada exitosamente');
        } else {
          console.log('⚠️ La canción ya está en la playlist');
        }
      }
    } catch (error) {
      console.error('Add track to playlist error:', error);
      throw new Error('Error al agregar canción a playlist');
    }
  }

  // Remover track de playlist
  static async removeTrack(playlistId: string, trackId: string): Promise<void> {
    try {
      console.log('➖ Simulando remover canción de playlist:', trackId);
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Actualizar storage local
      const localPlaylists = await this.getPlaylistsFromLocal();
      const playlistIndex = localPlaylists.findIndex(p => p.id === playlistId);
      
      if (playlistIndex !== -1) {
        localPlaylists[playlistIndex].tracks = localPlaylists[playlistIndex].tracks.filter(
          t => t.id !== trackId
        );
        localPlaylists[playlistIndex].updatedAt = new Date();
        await this.savePlaylistsToLocal(localPlaylists);
        console.log('✅ Canción removida exitosamente');
      }
    } catch (error) {
      console.error('Remove track from playlist error:', error);
      throw new Error('Error al remover canción de playlist');
    }
  }

  // Reordenar tracks en playlist
  static async reorderTracks(playlistId: string, trackIds: string[]): Promise<void> {
    try {
      await playlistApi.put(`/playlists/${playlistId}/reorder`, { trackIds });
      
      // Actualizar storage local
      const localPlaylists = await this.getPlaylistsFromLocal();
      const playlistIndex = localPlaylists.findIndex(p => p.id === playlistId);
      
      if (playlistIndex !== -1) {
        const playlist = localPlaylists[playlistIndex];
        const reorderedTracks = trackIds.map(id => 
          playlist.tracks.find(track => track.id === id)
        ).filter(Boolean) as Track[];
        
        localPlaylists[playlistIndex].tracks = reorderedTracks;
        localPlaylists[playlistIndex].updatedAt = new Date();
        await this.savePlaylistsToLocal(localPlaylists);
      }
    } catch (error) {
      console.error('Reorder tracks error:', error);
      throw new Error('Error al reordenar canciones');
    }
  }

  // Obtener playlists públicas
  static async getPublicPlaylists(limit: number = 20, offset: number = 0): Promise<Playlist[]> {
    try {
      const response = await playlistApi.get(`/playlists/public?limit=${limit}&offset=${offset}`);
      
      // Simulación - retornar playlists mock
      return [];
    } catch (error) {
      console.error('Get public playlists error:', error);
      return [];
    }
  }

  // Buscar playlists
  static async search(query: string, limit: number = 20): Promise<Playlist[]> {
    try {
      const response = await playlistApi.get(`/playlists/search?q=${encodeURIComponent(query)}&limit=${limit}`);
      
      // Simulación - buscar en storage local
      const localPlaylists = await this.getPlaylistsFromLocal();
      return localPlaylists.filter(playlist => 
        playlist.name.toLowerCase().includes(query.toLowerCase()) ||
        (playlist.description && playlist.description.toLowerCase().includes(query.toLowerCase()))
      );
    } catch (error) {
      console.error('Search playlists error:', error);
      return [];
    }
  }

  // Métodos privados para storage local
  private static async savePlaylistToLocal(playlist: Playlist): Promise<void> {
    try {
      const existingPlaylists = await this.getPlaylistsFromLocal();
      const updatedPlaylists = [...existingPlaylists, playlist];
      await StorageService.setPreferences({ playlists: updatedPlaylists });
    } catch (error) {
      console.error('Save playlist to local error:', error);
    }
  }

  private static async savePlaylistsToLocal(playlists: Playlist[]): Promise<void> {
    try {
      await StorageService.setPreferences({ playlists });
    } catch (error) {
      console.error('Save playlists to local error:', error);
    }
  }

  private static async getPlaylistsFromLocal(): Promise<Playlist[]> {
    try {
      const preferences = await StorageService.getPreferences();
      return preferences?.playlists || [];
    } catch (error) {
      console.error('Get playlists from local error:', error);
      return [];
    }
  }
}
