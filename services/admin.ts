import { getApiBaseUrl } from "../hooks/useApiBaseUrl"
import { buildUrl } from "../utils/url"

const API_BASE_URL = getApiBaseUrl()

export type AdminUser = {
  id: string
  name: string
  email: string
  role: "user" | "admin"
  createdAt: string
}

export type AdminStats = {
  totalUsers: number
  totalAdmins: number
  recentUsers: AdminUser[]
}

export class AdminError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message)
    this.name = "AdminError"
  }
}

async function adminRequest<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
  const url = buildUrl(API_BASE_URL, path)

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    })

    const text = await response.text()
    let data: any = {}

    if (text) {
      try {
        data = JSON.parse(text)
      } catch {
        data = { message: text }
      }
    }

    if (!response.ok) {
      const message = data.message ?? `HTTP ${response.status}`

      if (response.status === 403) {
        throw new AdminError("No tienes permisos de administrador para realizar esta acción.", "FORBIDDEN")
      } else if (response.status === 401) {
        throw new AdminError("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.", "UNAUTHORIZED")
      } else if (response.status === 404) {
        throw new AdminError("Usuario no encontrado.", "NOT_FOUND")
      }

      throw new AdminError(message, "UNKNOWN_ERROR")
    }

    return data as T
  } catch (error) {
    if (error instanceof AdminError) {
      throw error
    }

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new AdminError("No se pudo conectar con el servidor.", "NETWORK_ERROR")
    }

    throw new AdminError(error instanceof Error ? error.message : "Error desconocido", "UNKNOWN_ERROR")
  }
}

export async function getAllUsers(token: string, search?: string): Promise<AdminUser[]> {
  const path = search ? `/admin/users?search=${encodeURIComponent(search)}` : "/admin/users"

  try {
    const result = await adminRequest<any>(path, token)

    const usersArray = result.users || result

    return Array.isArray(usersArray) ? usersArray : []
  } catch (error) {
    throw error
  }
}

export async function updateUser(
  token: string,
  userId: string,
  updates: Partial<Pick<AdminUser, "name" | "email" | "role">>,
): Promise<AdminUser> {
  return adminRequest<AdminUser>(`/admin/users/${userId}`, token, {
    method: "PUT",
    body: JSON.stringify(updates),
  })
}

export async function deleteUser(token: string, userId: string): Promise<{ message: string }> {
  return adminRequest<{ message: string }>(`/admin/users/${userId}`, token, {
    method: "DELETE",
  })
}

export async function getAdminStats(token: string): Promise<AdminStats> {
  const result = await adminRequest<any>("/admin/stats", token)
  return {
    totalUsers: result.totalUsers ?? 0,
    totalAdmins: result.totalAdmins ?? 0,
    recentUsers: result.recentUsers ?? [],
  }
}
