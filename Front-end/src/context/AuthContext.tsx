import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useToast } from "./ToastContext";

interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  profilePicture?: string;
  isVerified: boolean;
  isPhoneVerified: boolean;
  phoneNumber?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
    captchaToken: string
  ) => Promise<void>;
  signup: (
    name: string,
    email: string,
    password: string,
    captchaToken: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (email: string, verificationCode: string) => Promise<void>;
  requestPasswordReset: (email: string, captchaToken: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  resendCode: (email: string) => Promise<void>;
  refreshToken: () => Promise<void>;
  sendPhoneVerification: (phoneNumber: string) => Promise<void>;
  verifyPhoneNumber: (code: string) => Promise<void>;
  loginWithPhone: (phoneNumber: string) => Promise<void>;
  verifyPhoneLogin: (phoneNumber: string, code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = "https://localhost:3002/api/auth";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  const isAuthenticated = !!user;

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuthStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch("https://localhost:3002/api/user/me", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem("accessToken");
        await refreshToken();
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      localStorage.removeItem("accessToken");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    email: string,
    password: string,
    captchaToken: string
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password, captchaToken }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("accessToken", data.accessToken);
        await checkAuthStatus();
        showSuccess("تم تسجيل الدخول بنجاح", "مرحباً بك مرة أخرى!");
      } else {
        throw new Error(data.message || "فشل في تسجيل الدخول");
      }
    } catch (error) {
      showError("خطأ في تسجيل الدخول", (error as Error).message);
      throw error;
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    captchaToken: string
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name, email, password, captchaToken }),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess("تم إنشاء الحساب بنجاح", data.message);
      } else {
        throw new Error(data.message || "فشل في إنشاء الحساب");
      }
    } catch (error) {
      showError("خطأ في إنشاء الحساب", (error as Error).message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      localStorage.removeItem("accessToken");
      setUser(null);
      showSuccess("تم تسجيل الخروج بنجاح", "نراك قريباً!");
    }
  };

  const verifyEmail = async (email: string, verificationCode: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, verificationCode }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("accessToken", data.accessToken);
        await checkAuthStatus();
        showSuccess("تم التحقق من البريد الإلكتروني", data.message);
      } else {
        throw new Error(data.message || "فشل في التحقق من البريد الإلكتروني");
      }
    } catch (error) {
      showError("خطأ في التحقق", (error as Error).message);
      throw error;
    }
  };

  const requestPasswordReset = async (email: string, captchaToken?: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/password-reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          captchaToken: captchaToken || "dummy-captcha-token",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess("تم إرسال رابط إعادة التعيين", data.message);
      } else {
        throw new Error(data.message || "فشل في إرسال رابط إعادة التعيين");
      }
    } catch (error) {
      showError("خطأ في إعادة تعيين كلمة المرور", (error as Error).message);
      throw error;
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess("تم تغيير كلمة المرور بنجاح", data.message);
      } else {
        throw new Error(data.message || "فشل في تغيير كلمة المرور");
      }
    } catch (error) {
      showError("خطأ في تغيير كلمة المرور", (error as Error).message);
      throw error;
    }
  };

  const resendCode = async (email: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/resend-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess("تم إعادة إرسال الرمز", data.message);
      } else {
        throw new Error(data.message || "فشل في إعادة إرسال الرمز");
      }
    } catch (error) {
      showError("خطأ في إعادة الإرسال", (error as Error).message);
      throw error;
    }
  };

  const refreshToken = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/refresh-token`, {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("accessToken", data.accessToken);
        await checkAuthStatus();
      } else {
        localStorage.removeItem("accessToken");
        setUser(null);
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      localStorage.removeItem("accessToken");
      setUser(null);
    }
  };

  const sendPhoneVerification = async (phoneNumber: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${API_BASE_URL}/send-phone-verification`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess("تم إرسال رمز التحقق", data.message);
      } else {
        throw new Error(data.message || "فشل في إرسال رمز التحقق");
      }
    } catch (error) {
      showError("خطأ في إرسال رمز التحقق", (error as Error).message);
      throw error;
    }
  };

  const verifyPhoneNumber = async (code: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${API_BASE_URL}/verify-phone`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (response.ok) {
        await checkAuthStatus();
        showSuccess("تم التحقق من رقم الهاتف", data.message);
      } else {
        throw new Error(data.message || "فشل في التحقق من رقم الهاتف");
      }
    } catch (error) {
      showError("خطأ في التحقق من الهاتف", (error as Error).message);
      throw error;
    }
  };

  const loginWithPhone = async (phoneNumber: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login-phone`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess("تم إرسال رمز التحقق", data.message);
      } else {
        throw new Error(data.message || "فشل في إرسال رمز التحقق");
      }
    } catch (error) {
      showError("خطأ في تسجيل الدخول بالهاتف", (error as Error).message);
      throw error;
    }
  };

  const verifyPhoneLogin = async (phoneNumber: string, code: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/verify-phone-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ phoneNumber, code }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("accessToken", data.accessToken);
        await checkAuthStatus();
        showSuccess("تم تسجيل الدخول بنجاح", data.message);
      } else {
        throw new Error(data.message || "فشل في تسجيل الدخول");
      }
    } catch (error) {
      showError("خطأ في التحقق من الهاتف", (error as Error).message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        signup,
        logout,
        verifyEmail,
        requestPasswordReset,
        resetPassword,
        resendCode,
        refreshToken,
        sendPhoneVerification,
        verifyPhoneNumber,
        loginWithPhone,
        verifyPhoneLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
