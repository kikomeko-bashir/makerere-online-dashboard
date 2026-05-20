import { createContext, useContext, useState, type ReactNode } from "react";
import type { UserRole } from "@/lib/types";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface AuthContextValue {
  user: AuthUser;
  setRole: (role: UserRole) => void;
}

const defaultUser: AuthUser = {
  id: "usr-001",
  name: "Nakamya Florence",
  email: "florence.nakamya@mak.ac.ug",
  role: "super_admin",
  avatar: undefined,
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>(defaultUser);

  const setRole = (role: UserRole) => {
    setUser((prev) => ({ ...prev, role }));
  };

  return (
    <AuthContext.Provider value={{ user, setRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
