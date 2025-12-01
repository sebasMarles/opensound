
export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  role?: "admin" | "user" | "editor" | string;
  description?: string;
};

export type AuthTokens = {
  token: string;
  refreshToken?: string;
};

// 👇 Nuevo tipo
export type RegisterCredentials = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};
