import { create } from 'zustand';
import { Playlist, CreatePlaylistDto, UpdatePlaylistDto, PlaylistState } from '../types/playlist';
import { Track } from '../services/jamendo';
import { PlaylistService } from '../services/playlists';

interface PlaylistStore extends PlaylistState {
  // Actions
  createPlaylist: (playlistData: CreatePlaylistDto) => Promise<Playlist>;
  fetchPlaylists: (userId: string) => Promise<void>;
  fetchPlaylistById: (id: string) => Promise<void>;
  updatePlaylist: (id: string, updateData: UpdatePlaylistDto) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  addTrackToPlaylist: (playlistId: string, track: Track) => Promise<void>;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  reorderPlaylistTracks: (playlistId: string, trackIds: string[]) => Promise<void>;
  searchPlaylists: (query: string) => Promise<Playlist[]>;
  setCurrentPlaylist: (playlist: Playlist | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const usePlaylistStore = create<PlaylistStore>((set, get) => ({
  // Initial state
  playlists: [],
  currentPlaylist: null,
  isLoading: false,
  error: null,

  // Actions
  createPlaylist: async (playlistData: CreatePlaylistDto) => {
    try {
      set({ isLoading: true, error: null });
      
      const newPlaylist = await PlaylistService.create(playlistData);
      
      set(state => ({
        playlists: [...state.playlists, newPlaylist],
        isLoading: false,
        error: null,
      }));
      
      return newPlaylist;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear playlist';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  fetchPlaylists: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const playlists = await PlaylistService.getAll(userId);
      
      set({
        playlists,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar playlists';
      set({
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  fetchPlaylistById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const playlist = await PlaylistService.getById(id);
      
      set({
        currentPlaylist: playlist,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar playlist';
      set({
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  updatePlaylist: async (id: string, updateData: UpdatePlaylistDto) => {
    try {
      set({ isLoading: true, error: null });
      
      const updatedPlaylist = await PlaylistService.update(id, updateData);
      
      set(state => ({
        playlists: state.playlists.map(playlist =>
          playlist.id === id ? updatedPlaylist : playlist
        ),
        currentPlaylist: state.currentPlaylist?.id === id ? updatedPlaylist : state.currentPlaylist,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar playlist';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  deletePlaylist: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      
      await PlaylistService.delete(id);
      
      set(state => ({
        playlists: state.playlists.filter(playlist => playlist.id !== id),
        currentPlaylist: state.currentPlaylist?.id === id ? null : state.currentPlaylist,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar playlist';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  addTrackToPlaylist: async (playlistId: string, track: Track) => {
    try {
      set({ error: null });
      
      await PlaylistService.addTrack(playlistId, track);
      
      set(state => ({
        playlists: state.playlists.map(playlist =>
          playlist.id === playlistId
            ? {
                ...playlist,
                tracks: [...playlist.tracks, track],
                updatedAt: new Date(),
              }
            : playlist
        ),
        currentPlaylist: state.currentPlaylist?.id === playlistId
          ? {
              ...state.currentPlaylist,
              tracks: [...state.currentPlaylist.tracks, track],
              updatedAt: new Date(),
            }
          : state.currentPlaylist,
        error: null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al agregar canción';
      set({ error: errorMessage });
      throw error;
    }
  },

  removeTrackFromPlaylist: async (playlistId: string, trackId: string) => {
    try {
      set({ error: null });
      
      await PlaylistService.removeTrack(playlistId, trackId);
      
      set(state => ({
        playlists: state.playlists.map(playlist =>
          playlist.id === playlistId
            ? {
                ...playlist,
                tracks: playlist.tracks.filter(track => track.id !== trackId),
                updatedAt: new Date(),
              }
            : playlist
        ),
        currentPlaylist: state.currentPlaylist?.id === playlistId
          ? {
              ...state.currentPlaylist,
              tracks: state.currentPlaylist.tracks.filter(track => track.id !== trackId),
              updatedAt: new Date(),
            }
          : state.currentPlaylist,
        error: null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al remover canción';
      set({ error: errorMessage });
      throw error;
    }
  },

  reorderPlaylistTracks: async (playlistId: string, trackIds: string[]) => {
    try {
      set({ error: null });
      
      await PlaylistService.reorderTracks(playlistId, trackIds);
      
      set(state => {
        const updateTracks = (playlist: Playlist) => {
          const reorderedTracks = trackIds.map(id =>
            playlist.tracks.find(track => track.id === id)
          ).filter(Boolean) as Track[];
          
          return {
            ...playlist,
            tracks: reorderedTracks,
            updatedAt: new Date(),
          };
        };

        return {
          playlists: state.playlists.map(playlist =>
            playlist.id === playlistId ? updateTracks(playlist) : playlist
          ),
          currentPlaylist: state.currentPlaylist?.id === playlistId
            ? updateTracks(state.currentPlaylist)
            : state.currentPlaylist,
          error: null,
        };
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al reordenar canciones';
      set({ error: errorMessage });
      throw error;
    }
  },

  searchPlaylists: async (query: string) => {
    try {
      const results = await PlaylistService.search(query);
      return results;
    } catch (error) {
      console.error('Search playlists error:', error);
      return [];
    }
  },

  setCurrentPlaylist: (playlist: Playlist | null) => {
    set({ currentPlaylist: playlist });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },
}));
