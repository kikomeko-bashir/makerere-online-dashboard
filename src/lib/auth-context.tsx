import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { UserRole } from "@/lib/types";
import { api, type ApiUser } from "@/lib/api";

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
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const defaultUser: AuthUser = {
  id: "usr-001",
  name: "Guest",
  email: "",
  role: "student",
  avatar: undefined,
};

function apiUserToAuthUser(apiUser: ApiUser): AuthUser {
  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    role: apiUser.role as UserRole,
    avatar: apiUser.avatar ?? undefined,
  };
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>(defaultUser);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      try {
        const parsed = JSON.parse(savedUser) as AuthUser;
        setUser(parsed);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    const authUser = apiUserToAuthUser(response.user);
    localStorage.setItem("access_token", response.access_token);
    localStorage.setItem("user", JSON.stringify(authUser));
    setUser(authUser);
    setIsAuthenticated(true);
  };

  const register = async (
    name: string,
    email: string,
    password: string,
  ) => {
    const response = await api.register(name, email, password);
    const authUser = apiUserToAuthUser(response.user);
    localStorage.setItem("access_token", response.access_token);
    localStorage.setItem("user", JSON.stringify(authUser));
    setUser(authUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setUser(defaultUser);
    setIsAuthenticated(false);
  };

  const setRole = (role: UserRole) => {
    const updated = { ...user, role };
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{ user, setRole, login, register, logout, isAuthenticated, isLoading }}
    >
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
