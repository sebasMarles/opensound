// Endpoints públicos del catálogo de Jamendo.
const DEFAULT_JAMENDO_BASE_URL = "https://api.jamendo.com/v3.0";
const JAMENDO_API_URL =
  process.env.EXPO_PUBLIC_JAMENDO_API_URL ?? DEFAULT_JAMENDO_BASE_URL;
const JAMENDO_CLIENT_ID =
  process.env.EXPO_PUBLIC_JAMENDO_CLIENT_ID ?? "c8500442";

export type JamendoResponse<T> = {
  headers: Record<string, unknown>;
  results: T[];
};

export async function apiFetch<T>(
  endpoint: string,
  params: Record<string, string | number | boolean | undefined> = {},
): Promise<JamendoResponse<T>> {
  const endpointPath = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = new URL(`${JAMENDO_API_URL}${endpointPath}`);

  const allParams = {
    client_id: JAMENDO_CLIENT_ID,
    format: "json",
    ...params,
  };

  Object.entries(allParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Error en la API de Jamendo: ${response.status}`);
  }

  return (await response.json()) as JamendoResponse<T>;
}
