/**
 * Utilidades de validación para formularios
 * Contiene patrones regex y funciones de validación reutilizables
 */

// Patrones de validación
export const ValidationPatterns = {
  // Email: RFC 5322 simplificado
  email:
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,

  // Contraseña: al menos 8 caracteres, 1 mayúscula, 1 minúscula, 1 número
  passwordStrong: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,

  // Contraseña básica: mínimo 6 caracteres
  passwordBasic: /^.{6,}$/,

  // Nombre: solo letras, espacios, guiones y apóstrofes
  name: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]{2,50}$/,

  // Username: alfanumérico, guiones bajos y puntos
  username: /^[a-zA-Z0-9._]{3,20}$/,

  // Búsqueda: permite caracteres alfanuméricos y espacios
  search: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]{1,100}$/,
} as const

// Límites de longitud
export const ValidationLimits = {
  name: { min: 2, max: 50 },
  email: { min: 5, max: 100 },
  password: { min: 6, max: 128 },
  passwordStrong: { min: 8, max: 128 },
  username: { min: 3, max: 20 },
  search: { min: 1, max: 100 },
  bio: { min: 0, max: 500 },
  comment: { min: 1, max: 1000 },
} as const

// Mensajes de error en español
export const ValidationMessages = {
  required: (field: string) => `${field} es obligatorio`,
  email: "Ingresa un correo electrónico válido",
  emailInvalid: "El formato del correo no es válido",
  passwordMin: (min: number) => `La contraseña debe tener al menos ${min} caracteres`,
  passwordMax: (max: number) => `La contraseña no puede exceder ${max} caracteres`,
  passwordStrong: "La contraseña debe contener al menos 8 caracteres, una mayúscula, una minúscula y un número",
  passwordMatch: "Las contraseñas no coinciden",
  nameMin: (min: number) => `El nombre debe tener al menos ${min} caracteres`,
  nameMax: (max: number) => `El nombre no puede exceder ${max} caracteres`,
  nameInvalid: "El nombre solo puede contener letras, espacios y guiones",
  usernameMin: (min: number) => `El nombre de usuario debe tener al menos ${min} caracteres`,
  usernameMax: (max: number) => `El nombre de usuario no puede exceder ${max} caracteres`,
  usernameInvalid: "El nombre de usuario solo puede contener letras, números, puntos y guiones bajos",
  searchMin: "Ingresa al menos 1 carácter para buscar",
  searchMax: (max: number) => `La búsqueda no puede exceder ${max} caracteres`,
  minLength: (field: string, min: number) => `${field} debe tener al menos ${min} caracteres`,
  maxLength: (field: string, max: number) => `${field} no puede exceder ${max} caracteres`,
} as const

// Funciones de validación
export const validateEmail = (email: string): boolean => {
  return ValidationPatterns.email.test(email.trim())
}

export const validatePassword = (password: string, strong = false): boolean => {
  const pattern = strong ? ValidationPatterns.passwordStrong : ValidationPatterns.passwordBasic
  return pattern.test(password)
}

export const validateName = (name: string): boolean => {
  return ValidationPatterns.name.test(name.trim())
}

export const validateUsername = (username: string): boolean => {
  return ValidationPatterns.username.test(username.trim())
}

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/\s+/g, " ")
}

// Reglas de validación para react-hook-form
export const getEmailRules = () => ({
  required: ValidationMessages.required("El correo"),
  minLength: {
    value: ValidationLimits.email.min,
    message: ValidationMessages.minLength("El correo", ValidationLimits.email.min),
  },
  maxLength: {
    value: ValidationLimits.email.max,
    message: ValidationMessages.maxLength("El correo", ValidationLimits.email.max),
  },
  pattern: {
    value: ValidationPatterns.email,
    message: ValidationMessages.emailInvalid,
  },
  validate: (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return ValidationMessages.required("El correo")
    if (!validateEmail(trimmed)) return ValidationMessages.emailInvalid
    return true
  },
})

export const getPasswordRules = (strong = false) => ({
  required: ValidationMessages.required("La contraseña"),
  minLength: {
    value: strong ? ValidationLimits.passwordStrong.min : ValidationLimits.password.min,
    message: strong ? ValidationMessages.passwordStrong : ValidationMessages.passwordMin(ValidationLimits.password.min),
  },
  maxLength: {
    value: ValidationLimits.password.max,
    message: ValidationMessages.passwordMax(ValidationLimits.password.max),
  },
  ...(strong && {
    pattern: {
      value: ValidationPatterns.passwordStrong,
      message: ValidationMessages.passwordStrong,
    },
  }),
})

export const getNameRules = () => ({
  required: ValidationMessages.required("El nombre"),
  minLength: {
    value: ValidationLimits.name.min,
    message: ValidationMessages.nameMin(ValidationLimits.name.min),
  },
  maxLength: {
    value: ValidationLimits.name.max,
    message: ValidationMessages.nameMax(ValidationLimits.name.max),
  },
  pattern: {
    value: ValidationPatterns.name,
    message: ValidationMessages.nameInvalid,
  },
  validate: (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return ValidationMessages.required("El nombre")
    if (!validateName(trimmed)) return ValidationMessages.nameInvalid
    return true
  },
})

export const getConfirmPasswordRules = (password: string) => ({
  required: ValidationMessages.required("La confirmación de contraseña"),
  validate: (value: string) => {
    if (value !== password) return ValidationMessages.passwordMatch
    return true
  },
})
