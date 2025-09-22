import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Mail, ArrowRight, ArrowLeft, Key, CheckCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useRecaptcha } from "../../hooks/useRecaptcha";

const ForgotPasswordForm: React.FC = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const { requestPasswordReset } = useAuth();

  const { executeRecaptcha } = useRecaptcha({
    siteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY,
    action: "forgot_password",
  });

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const captchaToken = await executeRecaptcha();
      await requestPasswordReset(email, captchaToken);
      setIsSuccess(true);
    } catch (error) {
      console.error("Password reset error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
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
            className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-8 h-8 text-white" />
          </motion.div>

          <h1 className="text-2xl font-bold text-purple-800 mb-4">
            {isRtl ? "تم إرسال الرابط" : "Link Sent"}
          </h1>
          <p className="text-gray-600 mb-6">
            {isRtl
              ? "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد."
              : "A password reset link has been sent to your email. Please check your inbox."}
          </p>
          <p className="text-purple-600 font-medium mb-8">{email}</p>

          <Link
            to="/auth/login"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium transition-colors"
          >
            {isRtl ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
            <span>{isRtl ? "العودة لتسجيل الدخول" : "Back to login"}</span>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 flex items-center justify-center p-4 font-serif text-neutral-800">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Key className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-purple-800 mb-2">
            {isRtl ? "نسيت كلمة المرور؟" : "Forgot Password?"}
          </h1>
          <p className="text-gray-600">
            {isRtl
              ? "لا تقلق، سنرسل لك رابط إعادة التعيين"
              : "Don't worry, we'll send you a reset link"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isRtl ? "البريد الإلكتروني" : "Email Address"}
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 rtl:pr-10 rtl:pl-4 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder={
                  isRtl ? "أدخل بريدك الإلكتروني" : "Enter your email"
                }
                required
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-xl font-medium hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {isRtl ? "إرسال رابط إعادة التعيين" : "Send Reset Link"}
                </span>
                {isRtl ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            {isRtl ? "تذكرت كلمة المرور؟" : "Remember your password?"}{" "}
            <Link
              to="/auth/login"
              className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              {isRtl ? "تسجيل الدخول" : "Sign in"}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordForm;
