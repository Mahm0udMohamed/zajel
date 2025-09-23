import React, { createContext, useContext, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  username?: string;
  profilePicture?: string;
  phoneNumber?: string;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  uploadProfilePicture: (file: File) => Promise<void>;
  requestEmailUpdate: (newEmail: string) => Promise<void>;
  verifyEmailUpdate: (
    verificationCode: string,
    password: string
  ) => Promise<void>;
  deleteAccount: (password: string, confirmation: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const API_BASE_URL = "https://localhost:3002/api/user";

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();

  const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const refreshProfile = async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/me`, {
        headers: getAuthHeaders(),
        credentials: "include",
      });

      if (response.ok) {
        const userData = await response.json();
        setProfile(userData);
      } else {
        throw new Error("فشل في تحميل بيانات المستخدم");
      }
    } catch (error) {
      showError("خطأ", (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/update`, {
        method: "PUT",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setProfile(result.user);
        showSuccess("تم التحديث بنجاح", result.message);

        if (result.requiresVerification) {
          showSuccess("يتطلب التحقق", "يرجى التحقق من رقم الهاتف الجديد");
        }
      } else {
        throw new Error(result.message || "فشل في تحديث البيانات");
      }
    } catch (error) {
      showError("خطأ في التحديث", (error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (oldPassword: string, newPassword: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/update-password`, {
        method: "PUT",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const result = await response.json();

      if (response.ok) {
        showSuccess("تم تحديث كلمة المرور", result.message);
      } else {
        throw new Error(result.error || "فشل في تحديث كلمة المرور");
      }
    } catch (error) {
      showError("خطأ في تحديث كلمة المرور", (error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadProfilePicture = async (file: File) => {
    setIsLoading(true);
    try {
      // Get signature for Cloudinary upload
      const signResponse = await fetch(
        `${API_BASE_URL}/sign-profile-picture-upload`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          credentials: "include",
        }
      );

      if (!signResponse.ok) {
        throw new Error("فشل في الحصول على توقيع التحميل");
      }

      const { signature, timestamp } = await signResponse.json();

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signature);
      formData.append("timestamp", timestamp.toString());
      formData.append("api_key", import.meta.env.VITE_CLOUDINARY_API_KEY || "");
      formData.append("folder", "profile_pictures");

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error("فشل في تحميل الصورة");
      }

      const uploadResult = await uploadResponse.json();

      // Update profile with new image URL
      const updateResponse = await fetch(
        `${API_BASE_URL}/upload-profile-picture`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          credentials: "include",
          body: JSON.stringify({ profilePictureUrl: uploadResult.secure_url }),
        }
      );

      const result = await updateResponse.json();

      if (updateResponse.ok) {
        setProfile((prev) =>
          prev ? { ...prev, profilePicture: result.profilePicture } : null
        );
        showSuccess("تم تحديث الصورة الشخصية", result.message);
      } else {
        throw new Error(result.message || "فشل في تحديث الصورة الشخصية");
      }
    } catch (error) {
      showError("خطأ في تحميل الصورة", (error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const requestEmailUpdate = async (newEmail: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/request-email-update`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ newEmail }),
      });

      const result = await response.json();

      if (response.ok) {
        showSuccess("تم إرسال رمز التحقق", result.message);
      } else {
        throw new Error(result.message || "فشل في طلب تحديث البريد الإلكتروني");
      }
    } catch (error) {
      showError("خطأ في طلب التحديث", (error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmailUpdate = async (
    verificationCode: string,
    password: string
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/verify-email-update`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ verificationCode, password }),
      });

      const result = await response.json();

      if (response.ok) {
        await refreshProfile();
        showSuccess("تم تحديث البريد الإلكتروني", result.message);
      } else {
        throw new Error(result.message || "فشل في التحقق من البريد الإلكتروني");
      }
    } catch (error) {
      showError("خطأ في التحقق", (error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async (password: string, confirmation: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/delete-account`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ password, confirmation }),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.removeItem("accessToken");
        setProfile(null);
        showSuccess("تم حذف الحساب", result.message);
        window.location.href = "/";
      } else {
        throw new Error(result.message || "فشل في حذف الحساب");
      }
    } catch (error) {
      showError("خطأ في حذف الحساب", (error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Load profile when user is authenticated
  React.useEffect(() => {
    if (isAuthenticated && user && !profile) {
      refreshProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  return (
    <UserContext.Provider
      value={{
        profile,
        isLoading,
        updateProfile,
        updatePassword,
        uploadProfilePicture,
        requestEmailUpdate,
        verifyEmailUpdate,
        deleteAccount,
        refreshProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
