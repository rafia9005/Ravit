import { createContext } from "react";
import type { AuthUser, AuthTokens } from "../services/auth.service";

export interface AuthContextType {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  error: string | null;
  login: (user: AuthUser, tokens: AuthTokens) => void;
  logout: () => void;
  fetchUser: () => Promise<void>;
  setError: (error: string | null) => void;
  setIsLoading: (loading: boolean) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);
AuthContext.displayName = "AuthContext";