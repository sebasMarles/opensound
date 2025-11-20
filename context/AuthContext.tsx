import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useAuthSession } from "../hooks/useAuthSession";

export type AuthContextType = ReturnType<typeof useAuthSession>;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const value = useAuthSession();
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de un AuthProvider");
  }
  return context;
};
