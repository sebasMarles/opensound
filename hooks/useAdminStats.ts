"use client"

import { useState, useEffect, useCallback } from "react"
import { getAdminStats, type AdminStats } from "../services/admin"

export function useAdminStats(token: string | null) {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStats = useCallback(async () => {
    if (!token) return

    try {
      setLoading(true)
      setError(null)
      const data = await getAdminStats(token)
      setStats(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cargar estadísticas"
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  return {
    stats,
    loading,
    error,
    reload: loadStats,
  }
}
