import type { AuthUser } from "../types/auth"
import { getApiBaseUrl } from "../hooks/useApiBaseUrl"
import { buildUrl } from "../utils/url"

const API_BASE_URL = getApiBaseUrl()

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = {
  email: string;
  name: string;
  password: string;
}

export type LoginResponse = {
  token: string
  user: AuthUser
}

type AuthResponse = {
  token?: string
  user?: AuthUser
  message?: string
  error?: string
}

export class AuthError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message)
    this.name = "AuthError"
  }
}

// Nos aseguramos de que el usuario tenga nombre y ID
export function ensureAuthUser(
  incomingUser: AuthUser | undefined,
  fallbackEmail: string,
  fallbackName?: string,
): AuthUser {
  const email = incomingUser?.email ?? fallbackEmail
  const name = incomingUser?.name ?? fallbackName ?? email.split("@")[0] ?? email

  return {
    ...incomingUser,
    id: incomingUser?.id ?? email,
    email,
    name,
  }
}

// Funcion generica para hacer peticiones de auth
async function postAuth(path: string, body: unknown): Promise<AuthResponse> {
  const url = buildUrl(API_BASE_URL, path)

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const text = await response.text()

    let payload: AuthResponse = {}
    if (text) {
      try {
        payload = JSON.parse(text) as AuthResponse
      } catch {
        payload = { message: text }
      }
    }

    if (!response.ok) {
      const message = payload.message ?? payload.error ?? `HTTP ${response.status}`

      if (response.status === 401) {
        throw new AuthError(
          "Las credenciales que ingresaste no pertenecen a ningún usuario. Por favor, verifica tu correo y contraseña.",
          "INVALID_CREDENTIALS",
        )
      } else if (response.status === 404) {
        throw new AuthError(
          "No existe una cuenta con este correo electrónico. Por favor, regístrate primero.",
          "USER_NOT_FOUND",
        )
      } else if (response.status === 409) {
        throw new AuthError("Este correo ya está registrado. Intenta iniciar sesión.", "EMAIL_EXISTS")
      } else if (response.status === 400) {
        throw new AuthError(message || "Los datos proporcionados no son válidos.", "INVALID_DATA")
      } else if (response.status >= 500) {
        throw new AuthError("Error en el servidor. Por favor, intenta más tarde.", "SERVER_ERROR")
      }

      throw new AuthError(message, "UNKNOWN_ERROR")
    }

    if (!text) {
      throw new AuthError("La respuesta del servidor no contiene datos", "EMPTY_RESPONSE")
    }

    if (!payload || typeof payload !== "object") {
      throw new AuthError("La respuesta del servidor no es JSON válido", "INVALID_RESPONSE")
    }

    return payload
  } catch (error) {
    if (error instanceof AuthError) {
      throw error
    }

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new AuthError("No se pudo conectar con el servidor. Verifica tu conexión a internet.", "NETWORK_ERROR")
    }

    throw new AuthError(error instanceof Error ? error.message : "Error desconocido", "UNKNOWN_ERROR")
  }
}

// Iniciar sesion
export async function login(credentials: LoginPayload): Promise<LoginResponse> {
  const payload = await postAuth("/auth/login", credentials)

  if (!payload.token) {
    throw new AuthError("La respuesta del servidor no contiene un token válido", "INVALID_TOKEN")
  }

  const user = ensureAuthUser(payload.user, credentials.email)
  return { token: payload.token, user }
}

// Verificar si el email existe
export async function checkEmailExists(email: string): Promise<boolean> {
  const url = buildUrl(API_BASE_URL, "/auth/check-email")

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    const data = await response.json()
    return data.exists === true
  } catch (error) {
    console.error("Error checking email:", error)
    throw new AuthError("No se pudo verificar el correo. Revisa tu conexión.", "NETWORK_ERROR")
  }
}

// Registrar usuario
export async function register(payload: RegisterPayload): Promise<LoginResponse> {
  const response = await postAuth("/auth/register", payload)

  if (!response.token) {
    throw new AuthError("La respuesta del servidor no contiene un token válido", "INVALID_TOKEN")
  }

  const user = ensureAuthUser(response.user, payload.email, payload.name)
  return { token: response.token, user }
}

// Actualizar perfil
export async function updateProfile(data: { name?: string; description?: string }, token: string): Promise<AuthUser> {
  const url = buildUrl(API_BASE_URL, "/auth/profile")

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new AuthError(errorData.message || "Error al actualizar perfil", "UPDATE_ERROR")
    }

    const json = await response.json()
    return json.user
  } catch (error) {
    if (error instanceof AuthError) throw error
    throw new AuthError("Error al actualizar perfil", "UPDATE_ERROR")
  }
}
