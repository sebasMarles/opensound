"use client"

import { useEffect } from "react"
import type { AuthUser } from "../../types/auth"

type UseAuthSyncParams = {
  user: AuthUser | null
  token: string | null
  restoring: boolean
  persistSession: (user: AuthUser, token: string) => Promise<void>
}

/**
 * Hook para sincronizar el estado de autenticación con AsyncStorage
 * Se ejecuta cada vez que cambia el usuario o token
 */
export function useAuthSync({ user, token, restoring, persistSession }: UseAuthSyncParams) {
  useEffect(() => {
    if (restoring) return
    if (!user || !token) return

    persistSession(user, token).catch((error) => {
      console.warn("No se pudo guardar la sesión", error)
    })
  }, [persistSession, restoring, token, user])
}
