import type { AuthUser } from "../types/auth";
import { getApiBaseUrl } from "../hooks/useApiBaseUrl";

const API_BASE_URL = getApiBaseUrl();

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

type AuthResponse = {
  token?: string;
  user?: AuthUser;
  message?: string;
  error?: string;
};

function ensureAuthUser(
  incomingUser: AuthUser | undefined,
  fallbackEmail: string,
  fallbackName?: string,
): AuthUser {
  const email = incomingUser?.email ?? fallbackEmail;
  const name = incomingUser?.name ?? fallbackName ?? email.split("@")[0] ?? email;

  return {
    ...incomingUser,
    id: incomingUser?.id ?? email,
    email,
    name,
  };
}

function buildUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

async function postAuth(path: string, body: unknown): Promise<AuthResponse> {
  const response = await fetch(buildUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await response.text();

  let payload: AuthResponse = {};
  if (text) {
    try {
      payload = JSON.parse(text) as AuthResponse;
    } catch {
      payload = { message: text };
    }
  }

  if (!response.ok) {
    const message = payload.message ?? payload.error ?? `HTTP ${response.status}`;
    throw new Error(message);
  }

  if (!text) {
    throw new Error("La respuesta del servidor no contiene datos");
  }

  if (!payload || typeof payload !== "object") {
    throw new Error("La respuesta del servidor no es JSON válido");
  }

  return payload;
}

export async function login(credentials: LoginPayload): Promise<LoginResponse> {
  const payload = await postAuth("/auth/login", credentials);

  if (!payload.token) {
    throw new Error("La respuesta del servidor no contiene un token válido");
  }

  const user = ensureAuthUser(payload.user, credentials.email);
  return { token: payload.token, user };
}

export async function register(payload: RegisterPayload): Promise<LoginResponse> {
  const response = await postAuth("/auth/register", payload);

  if (!response.token) {
    throw new Error("La respuesta del servidor no contiene un token válido");
  }

  const user = ensureAuthUser(response.user, payload.email, payload.name);
  return { token: response.token, user };
}

export { ensureAuthUser };
