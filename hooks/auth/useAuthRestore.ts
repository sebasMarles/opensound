"use client"

import { useEffect, useState } from "react"
import type { AuthUser } from "../../types/auth"

type UseAuthRestoreParams = {
  restoreSession: () => Promise<{ user: AuthUser; token: string } | null>
  setSession: (session: { user: AuthUser; tokens: { token: string } }) => void
}

/**
 * Hook para restaurar la sesión desde AsyncStorage al iniciar la app
 * Separado de la lógica principal de autenticación
 */
export function useAuthRestore({ restoreSession, setSession }: UseAuthRestoreParams) {
  const [restoring, setRestoring] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const stored = await restoreSession()
        if (stored) {
          setSession({ user: stored.user, tokens: { token: stored.token } })
        }
      } catch (error) {
        console.warn("No se pudo restaurar la sesión", error)
      } finally {
        setRestoring(false)
      }
    })()
  }, [restoreSession, setSession])

  return { restoring }
}
