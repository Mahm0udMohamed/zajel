import { useState, useEffect, type ReactNode } from "react";
import { apiService, type AdminProfile } from "../services/api";
import {
  AdminAuthContext,
  type AdminAuthContextType,
} from "./AdminAuthContext";

interface AdminAuthProviderProps {
  children: ReactNode;
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // تحميل معلومات المدير عند التهيئة
  useEffect(() => {
    const initializeAuth = async () => {
      if (apiService.isAuthenticated()) {
        try {
          const adminProfile = await apiService.getAdminProfile();
          setAdmin(adminProfile);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Failed to load admin profile:", error);
          // إذا فشل تحميل الملف الشخصي، امسح التوكنات
          await apiService.logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      await apiService.login({ email, password });

      // تحميل معلومات المدير بعد تسجيل الدخول
      const adminProfile = await apiService.getAdminProfile();

      setAdmin(adminProfile);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await apiService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setAdmin(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!isAuthenticated) return;

    try {
      const adminProfile = await apiService.getAdminProfile();
      setAdmin(adminProfile);
    } catch (error) {
      console.error("Failed to refresh profile:", error);
      // إذا فشل تحديث الملف الشخصي، امسح التوكنات
      await logout();
    }
  };

  const value: AdminAuthContextType = {
    isAuthenticated,
    admin,
    isLoading,
    login,
    logout,
    refreshProfile,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}
