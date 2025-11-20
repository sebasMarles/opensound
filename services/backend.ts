import AsyncStorage from "@react-native-async-storage/async-storage"
import { getApiBaseUrl } from "../hooks/useApiBaseUrl"
import { extractTokenFromStorageValue } from "../hooks/auth/useAuthPersistence"
import { AUTH_TOKEN_STORAGE_KEY } from "../hooks/auth/useAuthPersistence"
import { buildUrl } from "../utils/url"
import type { Json } from "../types/json"

const API_BASE_URL = getApiBaseUrl()

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

async function withAuthHeaders(headers: HeadersInit = {}): Promise<HeadersInit> {
  try {
    const raw = await AsyncStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
    const token = extractTokenFromStorageValue(raw)
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    }
  } catch {
    return { "Content-Type": "application/json", ...headers }
  }
}

async function request<T>(method: HttpMethod, path: string, body?: Json): Promise<T> {
  const url = path.startsWith("http") ? path : buildUrl(API_BASE_URL, path)
  const headers = await withAuthHeaders()

  const res = await fetch(url, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  if (!res.ok) {
    const errorBody = await res.text()
    let message = errorBody
    try {
      const parsed = JSON.parse(errorBody)
      message = parsed?.message ?? parsed?.error ?? errorBody
    } catch {
      // El cuerpo de error no es JSON
    }
    throw new Error(message || `HTTP ${res.status} en ${path}`)
  }

  if (res.status === 204) return {} as T

  const text = await res.text()
  if (!text) return {} as T
  try {
    return JSON.parse(text) as T
  } catch {
    throw new Error("La respuesta del servidor no es JSON válido")
  }
}

export const http = {
  get: (path: string) => request<any>("GET", path),
  post: (path: string, body?: Json) => request<any>("POST", path, body),
  put: (path: string, body?: Json) => request<any>("PUT", path, body),
  patch: (path: string, body?: Json) => request<any>("PATCH", path, body),
  del: (path: string) => request<any>("DELETE", path),
}
