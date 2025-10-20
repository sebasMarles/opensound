import { create } from "zustand";
import {
  fetchPlaylists,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
} from "../api/playlistApi";
import type { Playlist, PlaylistPayload } from "../types";

type PlaylistState = {
  playlists: Playlist[];
  selectedId: string | null;
  isLoading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  create: (payload: PlaylistPayload) => Promise<Playlist>;
  update: (id: string, payload: PlaylistPayload) => Promise<Playlist>;
  remove: (id: string) => Promise<void>;
  select: (id: string | null) => void;
  clearError: () => void;
};

// Estado global para playlists con soporte para peticiones asíncronas y selección activa.
export const usePlaylistStore = create<PlaylistState>((set, get) => ({
  playlists: [],
  selectedId: null,
  isLoading: false,
  error: null,

  async fetchAll() {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchPlaylists();
      set({ playlists: data, isLoading: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudieron cargar las playlists";
      set({ error: message, isLoading: false });
    }
  },

  async create(payload) {
    set({ isLoading: true, error: null });
    try {
      const playlist = await createPlaylist(payload);
      set({
        playlists: [playlist, ...get().playlists],
        isLoading: false,
        selectedId: playlist.id,
      });
      return playlist;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo crear la playlist";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  async update(id, payload) {
    set({ isLoading: true, error: null });
    try {
      const updated = await updatePlaylist(id, payload);
      set({
        playlists: get().playlists.map((playlist) =>
          playlist.id === id ? updated : playlist,
        ),
        isLoading: false,
        selectedId: updated.id,
      });
      return updated;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo actualizar la playlist";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  async remove(id) {
    set({ isLoading: true, error: null });
    try {
      await deletePlaylist(id);
      set({
        playlists: get().playlists.filter((playlist) => playlist.id !== id),
        isLoading: false,
        selectedId: get().selectedId === id ? null : get().selectedId,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo eliminar la playlist";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  select(id) {
    set({ selectedId: id });
  },

  clearError() {
    if (get().error) {
      set({ error: null });
    }
  },
}));
