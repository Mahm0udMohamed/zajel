import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requirePhoneVerification?: boolean;
  requireAuthForFavorites?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requirePhoneVerification = false,
  requireAuthForFavorites = false,
  redirectTo = "/auth/login",
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Special case for favorites page - show login prompt instead of redirect
  if (requireAuthForFavorites && !isAuthenticated) {
    // Let the FavoritesPage component handle the login prompt
    return <>{children}</>;
  }
  if (!requireAuth && isAuthenticated) {
    // إذا كان المستخدم مسجل دخول ولكن لم يتحقق من الهاتف، وجهه لصفحة إعداد الهاتف
    if (
      user &&
      !user.isPhoneVerified &&
      location.pathname !== "/auth/phone-setup"
    ) {
      return <Navigate to="/auth/phone-setup" replace />;
    }
    // إذا كان في صفحة إعداد الهاتف وقد تحقق من الهاتف، وجهه للرئيسية
    if (
      user &&
      user.isPhoneVerified &&
      location.pathname === "/auth/phone-setup"
    ) {
      return <Navigate to="/" replace />;
    }
    // إذا كان في صفحات المصادقة الأخرى وقد سجل دخول، وجهه حسب حالة التحقق من الهاتف
    if (
      location.pathname.startsWith("/auth/") &&
      location.pathname !== "/auth/phone-setup"
    ) {
      if (user && !user.isPhoneVerified) {
        return <Navigate to="/auth/phone-setup" replace />;
      }
      return <Navigate to="/" replace />;
    }
  }

  // إذا كان المستخدم مسجل دخول ولكن لم يتحقق من الهاتف، وجهه لصفحة إعداد الهاتف
  if (
    requireAuth &&
    isAuthenticated &&
    user &&
    !user.isPhoneVerified &&
    location.pathname !== "/auth/phone-setup"
  ) {
    return <Navigate to="/auth/phone-setup" replace />;
  }

  // إذا كان يتطلب التحقق من الهاتف وليس متحقق
  if (requirePhoneVerification && user && !user.isPhoneVerified) {
    return <Navigate to="/auth/phone-setup" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
