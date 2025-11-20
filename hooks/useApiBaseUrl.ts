"use client"

import { useMemo } from "react"
import { getConfig } from "./useConfig"

const DEFAULT_API_BASE_URL = "https://opensound.icu"

function sanitizeBaseUrl(url: string): string {
  return url.replace(/\/$/, "")
}

function resolveBaseUrl(): string {
  const config = getConfig()
  const raw = config.apiUrl

  if (!raw) {
    return DEFAULT_API_BASE_URL
  }

  const trimmed = raw.trim()
  const normalized = sanitizeBaseUrl(trimmed)

  if (!/^https?:\/\//i.test(normalized)) {
    return DEFAULT_API_BASE_URL
  }

  return normalized
}

const API_BASE_URL = resolveBaseUrl()

export function getApiBaseUrl(): string {
  return API_BASE_URL
}

export function useApiBaseUrl(): string {
  return useMemo(() => API_BASE_URL, [])
}

export { DEFAULT_API_BASE_URL }
