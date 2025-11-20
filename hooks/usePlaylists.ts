"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../context/AuthContext"
import * as playlistService from "../services/playlists"
import type { Playlist, CreatePlaylistDto, UpdatePlaylistDto, AddSongDto } from "../types/playlist"

export function usePlaylists() {
  const { token } = useAuth()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPlaylists = useCallback(async () => {
    if (!token) {
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await playlistService.getAllPlaylists(token)
      setPlaylists(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar playlists")
    } finally {
      setLoading(false)
    }
  }, [token])

  const createPlaylist = useCallback(
    async (data: CreatePlaylistDto) => {
      if (!token) throw new Error("No autenticado")

      const newPlaylist = await playlistService.createPlaylist(token, data)
      setPlaylists((prev) => [...prev, newPlaylist])
      return newPlaylist
    },
    [token],
  )

  const updatePlaylist = useCallback(
    async (playlistId: string, data: UpdatePlaylistDto) => {
      if (!token) throw new Error("No autenticado")

      const updated = await playlistService.updatePlaylist(token, playlistId, data)
      setPlaylists((prev) => prev.map((p) => (p._id === playlistId ? updated : p)))
      return updated
    },
    [token],
  )

  const deletePlaylist = useCallback(
    async (playlistId: string) => {
      if (!token) throw new Error("No autenticado")

      await playlistService.deletePlaylist(token, playlistId)
      setPlaylists((prev) => prev.filter((p) => p._id !== playlistId))
    },
    [token],
  )

  const addSongToPlaylist = useCallback(
    async (playlistId: string, song: AddSongDto) => {
      if (!token) throw new Error("No autenticado")

      const updated = await playlistService.addSongToPlaylist(token, playlistId, song)
      setPlaylists((prev) => prev.map((p) => (p._id === playlistId ? updated : p)))
      return updated
    },
    [token],
  )

  const removeSongFromPlaylist = useCallback(
    async (playlistId: string, jamendoId: string) => {
      if (!token) throw new Error("No autenticado")

      const updated = await playlistService.removeSongFromPlaylist(token, playlistId, jamendoId)
      setPlaylists((prev) => prev.map((p) => (p._id === playlistId ? updated : p)))
      return updated
    },
    [token],
  )

  useEffect(() => {
    fetchPlaylists()
  }, [fetchPlaylists])

  return {
    playlists,
    loading,
    error,
    refetch: fetchPlaylists,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
  }
}
