"use client"

import { useState } from "react"
import { updateUser, deleteUser, type AdminUser } from "../services/admin"

export function useAdminActions(token: string | null, onSuccess: () => void) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpdateUser = async (userId: string, updates: Partial<Pick<AdminUser, "name" | "email" | "role">>) => {
    if (!token) return

    try {
      setLoading(true)
      setError(null)
      await updateUser(token, userId, updates)
      onSuccess()
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al actualizar usuario"
      setError(message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!token) return

    try {
      setLoading(true)
      setError(null)
      await deleteUser(token, userId)
      onSuccess()
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al eliminar usuario"
      setError(message)
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    updateUser: handleUpdateUser,
    deleteUser: handleDeleteUser,
    clearError: () => setError(null),
  }
}
