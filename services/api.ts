const JAMENDO_API_URL = "https://api.jamendo.com/v3.0";
const CLIENT_ID = "c8500442";

export async function apiFetch(endpoint: string, params: Record<string, any> = {}) {
  const url = new URL(JAMENDO_API_URL + endpoint);

  params.client_id = CLIENT_ID;

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error("Error en la API de Jamendo");
  }
  return res.json();
}