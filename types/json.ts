/**
 * Tipo genérico para objetos JSON
 */
export type Json = Record<string, any>

/**
 * Tipo para valores JSON primitivos
 */
export type JsonPrimitive = string | number | boolean | null

/**
 * Tipo para arrays JSON
 */
export type JsonArray = JsonValue[]

/**
 * Tipo para objetos JSON
 */
export type JsonObject = { [key: string]: JsonValue }

/**
 * Tipo para cualquier valor JSON válido
 */
export type JsonValue = JsonPrimitive | JsonObject | JsonArray
