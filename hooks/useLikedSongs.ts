"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../context/AuthContext"
import * as playlistService from "../services/playlists"
import type { AddSongDto } from "../types/playlist"

export function useLikedSongs() {
  const { token } = useAuth()
  const [likedSongs, setLikedSongs] = useState<AddSongDto[]>([])
  const [loading, setLoading] = useState(false)

  const fetchLikedSongs = useCallback(async () => {
    if (!token) return

    setLoading(true)
    try {
      const songs = await playlistService.getLikedSongs(token)
      setLikedSongs(songs)
    } catch (err) {
    } finally {
      setLoading(false)
    }
  }, [token])

  const toggleLike = useCallback(
    async (song: AddSongDto) => {
      if (!token) throw new Error("No autenticado")

      const result = await playlistService.toggleLikedSong(token, song)
      if (result.liked) {
        setLikedSongs((prev) => [...prev, song])
      } else {
        setLikedSongs((prev) => prev.filter((s) => s.jamendoId !== song.jamendoId))
      }
      // Refetch para sincronizar con el servidor
      await fetchLikedSongs()
      return result.liked
    },
    [token, fetchLikedSongs],
  )

  const isLiked = useCallback(
    (jamendoId: string) => {
      return likedSongs.some((s) => s.jamendoId === jamendoId)
    },
    [likedSongs],
  )

  useEffect(() => {
    fetchLikedSongs()
  }, [fetchLikedSongs])

  return {
    likedSongs,
    loading,
    toggleLike,
    isLiked,
    refetch: fetchLikedSongs,
  }
}
