import type { AuthUser } from "../types/auth";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

type LoginPayload = {
  email: string;
  password: string;
};

type LoginResponse = {
  token: string;
  user?: AuthUser;
};

const DEFAULT_DELAY_MS = 600;

const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export async function login(credentials: LoginPayload): Promise<LoginResponse> {
  if (!API_BASE_URL) {
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

  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "No se pudo iniciar sesión");
  }

  const data = (await res.json()) as LoginResponse;

  if (!data?.token) {
    throw new Error("Respuesta inválida del servidor");
  }

  return data;
}
