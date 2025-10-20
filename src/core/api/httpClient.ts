import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApiBaseUrl } from "./baseUrl";
import {
  AUTH_TOKEN_STORAGE_KEY,
  extractTokenFromStorageValue,
} from "../auth/authStorage";

const API_BASE_URL = getApiBaseUrl();

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type Json = Record<string, any>;

// Anexa el token almacenado en AsyncStorage a cada petición saliente.
async function withAuthHeaders(headers: HeadersInit = {}): Promise<HeadersInit> {
  try {
    const raw = await AsyncStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    const token = extractTokenFromStorageValue(raw);
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    };
  } catch {
    return { "Content-Type": "application/json", ...headers };
  }
}

function resolveUrl(path: string): string {
  if (path.startsWith("http")) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

// Envoltorio genérico para realizar peticiones HTTP y parsear respuestas JSON.
async function request<T>(method: HttpMethod, path: string, body?: Json): Promise<T> {
  const url = resolveUrl(path);
  const headers = await withAuthHeaders();

  const res = await fetch(url, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    let message = errorBody;
    try {
      const parsed = JSON.parse(errorBody);
      message = parsed?.message ?? parsed?.error ?? errorBody;
    } catch {
      // El cuerpo de error no es JSON
    }
    throw new Error(message || `HTTP ${res.status} en ${path}`);
  }

  if (res.status === 204) return {} as T;

  const text = await res.text();
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("La respuesta del servidor no es JSON válido");
  }
}

export const http = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: Json) => request<T>("POST", path, body),
  put: <T>(path: string, body?: Json) => request<T>("PUT", path, body),
  patch: <T>(path: string, body?: Json) => request<T>("PATCH", path, body),
  del: <T>(path: string) => request<T>("DELETE", path),
};
