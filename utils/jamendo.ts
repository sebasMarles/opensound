/**
 * Extrae el jamendoId de una canción de Jamendo
 * Prioridad: 1) campo id, 2) trackid del audio URL, 3) fallback
 */
export function extractJamendoId(track: any): string {
  // Si tiene un campo id directo, usarlo
  if (track.id) {
    return String(track.id)
  }

  // Si tiene audio URL, extraer el trackid del query param
  if (track.audio) {
    try {
      const url = new URL(track.audio)
      const trackid = url.searchParams.get("trackid")
      if (trackid) {
        return trackid
      }
    } catch (e) {}
  }

  // Fallback: usar el nombre como ID único
  return track.name || track.title || "unknown"
}
