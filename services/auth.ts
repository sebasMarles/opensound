// services/api.ts

// URL base de Jamendo
const EXPO_PUBLIC_JAMENDO_API_URL = "https://api.jamendo.com/v3.0";

/// services/auth.ts
import type { AuthUser } from "../types/auth";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// Tipos
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
  user?: AuthUser;
};

const DEFAULT_DELAY_MS = 600;
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * LOGIN (Iniciar sesión)
 */
export async function login(credentials: LoginPayload): Promise<LoginResponse> {
  if (!API_BASE_URL) {
    console.warn("⚠️ No hay API_BASE_URL — usando modo demo");
    await delay(DEFAULT_DELAY_MS);
    return {
      token: `demo-token-${Date.now()}`,
      user: {
        id: credentials.email,
        email: credentials.email,
        name: credentials.email.split("@")[0] ?? credentials.email,
        role: "user",
      },
    };
  }

  console.log("Enviando petición de LOGIN a:", `${API_BASE_URL}/auth/login`);
  console.log("Payload:", credentials);

  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "No se pudo iniciar sesión");
  }

  const data = (await res.json()) as LoginResponse;
  if (!data?.token) throw new Error("Respuesta inválida del servidor");

  console.log("Login exitoso:", data);
  return data;
}

/**
 * REGISTER (Registrar usuario)
 */
export async function register(
  payload: RegisterPayload
): Promise<LoginResponse> {
  if (!API_BASE_URL) {
    console.warn("⚠️ No hay API_BASE_URL — usando modo demo");
    await delay(DEFAULT_DELAY_MS);
    return {
      token: `demo-token-${Date.now()}`,
      user: {
        id: payload.email,
        email: payload.email,
        name: payload.name,
        role: "user",
      },
    };
  }

  console.log(
    "Enviando petición de REGISTER a:",
    `${API_BASE_URL}/auth/register`
  );
  console.log("Payload:", payload);

  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "No se pudo registrar el usuario");
  }

  const data = (await res.json()) as LoginResponse;
  if (!data?.token) throw new Error("Respuesta inválida del servidor");

  console.log("Registro exitoso:", data);
  return data;
}

