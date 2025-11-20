import Constants from "expo-constants"

/**
 * Hook para acceder a la configuración de la app
 * Lee desde process.env (desarrollo) o desde app.json extra (producción)
 */
export function useConfig() {
  const extra = Constants.expoConfig?.extra ?? {}

  return {
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? extra.apiUrl ?? "https://opensound.icu",
    jamendoClientId: process.env.EXPO_PUBLIC_JAMENDO_CLIENT_ID ?? extra.jamendoClientId ?? "c8500442",
    jamendoApiUrl: process.env.EXPO_PUBLIC_JAMENDO_API_URL ?? extra.jamendoApiUrl ?? "https://api.jamendo.com/v3.0",
  }
}

/**
 * Función para obtener la configuración sin usar hooks
 */
export function getConfig() {
  const extra = Constants.expoConfig?.extra ?? {}

  return {
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? extra.apiUrl ?? "https://opensound.icu",
    jamendoClientId: process.env.EXPO_PUBLIC_JAMENDO_CLIENT_ID ?? extra.jamendoClientId ?? "c8500442",
    jamendoApiUrl: process.env.EXPO_PUBLIC_JAMENDO_API_URL ?? extra.jamendoApiUrl ?? "https://api.jamendo.com/v3.0",
  }
}
