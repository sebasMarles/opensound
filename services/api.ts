// services/api.ts
const JAMENDO_API_URL = "https://api.jamendo.com/v3.0";
const CLIENT_ID = "c8500442";

export type JamendoResponse<T> = {
  headers: any;
  results: T[];
};

export async function apiFetch<T>(
  endpoint: string,
  params: Record<string, any> = {}
): Promise<JamendoResponse<T>> {
  // Asegura el slash inicial
  const endpointPath = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = new URL(`${JAMENDO_API_URL}${endpointPath}`);

  // Agrega client_id y formato por conveniencia
  const allParams = { client_id: CLIENT_ID, format: "json", ...params };
  Object.entries(allParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Error en la API de Jamendo: ${res.status}`);
  }
  return res.json();
}