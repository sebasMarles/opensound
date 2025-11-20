"use client"

import { useState, useEffect, useCallback } from "react"
import { getAllUsers, type AdminUser } from "../services/admin"

export function useAdminUsers(token: string | null) {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadUsers = useCallback(async () => {
    if (!token) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await getAllUsers(token)

      const usersArray = Array.isArray(data) ? data : []
      setUsers(usersArray)
      setFilteredUsers(usersArray)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cargar usuarios"
      setError(message)
      setUsers([])
      setFilteredUsers([])
    } finally {
      setLoading(false)
    }
  }, [token])

  const filterUsers = useCallback(
    (searchTerm: string) => {
      if (!searchTerm.trim()) {
        setFilteredUsers(users)
        return
      }

      const term = searchTerm.toLowerCase()
      const filtered = Array.isArray(users)
        ? users.filter((user) => user.name?.toLowerCase().includes(term) || user.email?.toLowerCase().includes(term))
        : []

      setFilteredUsers(filtered)
    },
    [users],
  )

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  return {
    users: filteredUsers,
    allUsers: users,
    loading,
    error,
    reload: loadUsers,
    filterUsers,
  }
}
