export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  role?: "admin" | "user" | "editor" | string;
};

export type AuthTokens = {
  token: string;
  refreshToken?: string;
};
