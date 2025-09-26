import { createContext } from "react";
import type { AdminProfile } from "../services/api";

export interface AdminAuthContextType {
  isAuthenticated: boolean;
  admin: AdminProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined
);
