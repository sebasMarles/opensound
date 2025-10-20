import { useEffect } from "react";
import { usePlaylistStore } from "@/features/playlists/store/playlistStore";

// Hook centralizado que expone el estado y las acciones del store de playlists.
export function usePlaylists(autoFetch: boolean = true) {
  const {
    playlists,
    isLoading,
    error,
    selectedId,
    fetchAll,
    create,
    update,
    remove,
    select,
    clearError,
  } = usePlaylistStore();

  useEffect(() => {
    if (!autoFetch || playlists.length > 0 || isLoading) return;
    fetchAll().catch(() => {
      // El error se guarda en el store, solo evitamos que rompa la pantalla.
    });
  }, [autoFetch, fetchAll, isLoading, playlists.length]);

  return {
    playlists,
    isLoading,
    error,
    selectedId,
    fetchAll,
    create,
    update,
    remove,
    select,
    clearError,
  };
}
