/**
 * Utilidades para manejo de URLs
 */

/**
 * Elimina la barra final de una URL
 */
export function sanitizeBaseUrl(url: string): string {
  return url.replace(/\/$/, "")
}

/**
 * Valida si una URL tiene el formato correcto
 */
export function isValidUrl(url: string): boolean {
  return /^https?:\/\//i.test(url)
}

/**
 * Construye una URL completa desde una base y un path
 */
export function buildUrl(baseUrl: string, path: string): string {
  const normalizedBase = sanitizeBaseUrl(baseUrl)
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${normalizedBase}${normalizedPath}`
}
