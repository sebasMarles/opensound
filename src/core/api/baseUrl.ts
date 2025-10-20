import { useMemo } from "react";

// Dominio público por defecto para las peticiones del backend propio de OpenSound.
const DEFAULT_API_BASE_URL = "https://opensound.icu";

function sanitizeBaseUrl(url: string): string {
  return url.replace(/\/$/, "");
}

function resolveBaseUrl(): string {
  const raw = process.env.EXPO_PUBLIC_API_URL;
  if (!raw) {
    console.warn(
      `⚠️ EXPO_PUBLIC_API_URL no está definido. Usando dominio por defecto: ${DEFAULT_API_BASE_URL}`,
    );
    return DEFAULT_API_BASE_URL;
  }

  const trimmed = raw.trim();
  const normalized = sanitizeBaseUrl(trimmed);

  if (!/^https?:\/\//i.test(normalized)) {
    console.warn(
      `⚠️ EXPO_PUBLIC_API_URL parece inválido (${raw}). Usando dominio por defecto: ${DEFAULT_API_BASE_URL}`,
    );
    return DEFAULT_API_BASE_URL;
  }

  return normalized;
}

const API_BASE_URL = resolveBaseUrl();

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

export function useApiBaseUrl(): string {
  return useMemo(() => API_BASE_URL, []);
}

export { DEFAULT_API_BASE_URL };
