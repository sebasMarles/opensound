/**
 * Utilidades para manejo de tokens
 */

/**
 * Valida si un token tiene el formato correcto
 */
export function isValidToken(token: string | null | undefined): boolean {
  if (!token || typeof token !== "string") return false
  return token.length > 10 // Validación básica
}

/**
 * Extrae el payload de un JWT sin verificar la firma
 * Útil para debugging, NO para validación de seguridad
 */
export function decodeJWT(token: string): Record<string, any> | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const payload = parts[1]
    const decoded = atob(payload)
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

/**
 * Verifica si un token JWT ha expirado
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token)
  if (!payload || !payload.exp) return true

  const now = Math.floor(Date.now() / 1000)
  return payload.exp < now
}
