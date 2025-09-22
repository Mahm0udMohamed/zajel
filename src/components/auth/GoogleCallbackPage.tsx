import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const GoogleCallbackPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshToken } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const accessToken = searchParams.get("accessToken");
      const error = searchParams.get("error");

      if (error) {
        console.error("Google authentication error:", error);
        let errorMessage = "حدث خطأ أثناء تسجيل الدخول بجوجل";

        switch (error) {
          case "authentication_failed":
            errorMessage = "فشل في المصادقة مع جوجل";
            break;
          case "server_error":
            errorMessage = "خطأ في الخادم، يرجى المحاولة مرة أخرى";
            break;
          case "google_auth_failed":
            errorMessage = "تم إلغاء تسجيل الدخول بجوجل";
            break;
          default:
            errorMessage = "حدث خطأ غير متوقع";
        }

        alert(errorMessage);
        setTimeout(() => navigate("/auth/login"), 3000);
        return;
      }

      if (accessToken) {
        console.log("Access token received, storing and refreshing");
        localStorage.setItem("accessToken", accessToken);

        try {
          await refreshToken();
          setTimeout(() => navigate("/"), 1500);
        } catch (refreshError) {
          console.error("Error refreshing token:", refreshError);
          setTimeout(() => navigate("/auth/login"), 2000);
        }
      } else {
        console.log("No access token received");
        setTimeout(() => navigate("/auth/login"), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, refreshToken]);

  const hasError = searchParams.get("error");
  const hasToken = searchParams.get("accessToken");

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 flex items-center justify-center p-4 font-serif text-neutral-800">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
            hasError
              ? "bg-gradient-to-r from-red-500 to-pink-500"
              : "bg-gradient-to-r from-green-500 to-emerald-500"
          }`}
        >
          {hasError ? (
            <AlertCircle className="w-8 h-8 text-white" />
          ) : (
            <CheckCircle className="w-8 h-8 text-white" />
          )}
        </motion.div>

        {hasError ? (
          <>
            <h1 className="text-2xl font-bold text-purple-800 mb-4">
              {isRtl ? "فشل في المصادقة" : "Authentication Failed"}
            </h1>
            <p className="text-gray-600 mb-6">
              {isRtl
                ? "حدث خطأ أثناء تسجيل الدخول بجوجل. سيتم إعادة توجيهك لصفحة تسجيل الدخول."
                : "An error occurred during Google sign-in. You will be redirected to the login page."}
            </p>
          </>
        ) : hasToken ? (
          <>
            <h1 className="text-2xl font-bold text-purple-800 mb-4">
              {isRtl ? "تم تسجيل الدخول بنجاح" : "Successfully Signed In"}
            </h1>
            <p className="text-gray-600 mb-6">
              {isRtl
                ? "مرحباً بك! سيتم إعادة توجيهك للصفحة الرئيسية."
                : "Welcome! You will be redirected to the homepage."}
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-purple-800 mb-4">
              {isRtl ? "جاري المعالجة..." : "Processing..."}
            </h1>
            <p className="text-gray-600 mb-6">
              {isRtl
                ? "يرجى الانتظار بينما نقوم بمعالجة تسجيل دخولك."
                : "Please wait while we process your sign-in."}
            </p>
          </>
        )}

        <motion.div
          className="flex justify-center space-x-2 rtl:space-x-reverse"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className={`w-2 h-2 rounded-full ${
                hasError ? "bg-red-500" : "bg-green-500"
              }`}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default GoogleCallbackPage;
