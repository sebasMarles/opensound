import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useAuthSession } from "../hooks/useAuthSession";

// The AuthContextType is derived from the return type of useAuthSession.
// To add updateUser to the context, it must be added to the return type of useAuthSession.
// Assuming useAuthSession now returns an object that includes updateUser.
export type AuthContextType = ReturnType<typeof useAuthSession>;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // The value now includes updateUser because useAuthSession has been updated to return it.
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
