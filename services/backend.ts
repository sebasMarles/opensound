// services/backend.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const DEFAULT_API_BASE_URL = "https://opensound.icu";
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ?? DEFAULT_API_BASE_URL;

if (!process.env.EXPO_PUBLIC_API_URL) {
  console.warn(
    `⚠️ EXPO_PUBLIC_API_URL no está definido. Usando dominio por defecto: ${DEFAULT_API_BASE_URL}`
  );
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type Json = Record<string, any>;

async function withAuthHeaders(headers: HeadersInit = {}): Promise<HeadersInit> {
  try {
    const raw = await AsyncStorage.getItem("@opensound:tokens");
    const token = raw ? (JSON.parse(raw)?.token as string | undefined) : undefined;
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    };
  } catch {
    return { "Content-Type": "application/json", ...headers };
  }
}

async function request<T>(method: HttpMethod, path: string, body?: Json): Promise<T> {
  if (!API_BASE_URL) throw new Error("API_BASE_URL no configurado");

  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const headers = await withAuthHeaders();

  const res = await fetch(url, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status} en ${path}`);
  }

  // si el backend responde 204 No Content
  if (res.status === 204) return {} as T;

  return (await res.json()) as T;
}

export const http = {
  get:  <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: Json) => request<T>("POST", path, body),
  put:  <T>(path: string, body?: Json) => request<T>("PUT", path, body),
  patch:<T>(path: string, body?: Json) => request<T>("PATCH", path, body),
  del:  <T>(path: string) => request<T>("DELETE", path),
};
