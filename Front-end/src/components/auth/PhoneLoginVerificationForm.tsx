import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Phone, RefreshCw, CheckCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const PhoneLoginVerificationForm: React.FC = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyPhoneLogin, loginWithPhone } = useAuth();

  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    const phoneFromState = location.state?.phoneNumber;
    if (phoneFromState) {
      setPhoneNumber(phoneFromState);
    } else {
      navigate("/auth/login");
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await verifyPhoneLogin(phoneNumber, verificationCode);
      navigate("/");
    } catch (error) {
      console.error("Phone login verification error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;

    setIsResending(true);
    try {
      await loginWithPhone(phoneNumber);
      setCountdown(60);
    } catch (error) {
      console.error("Resend error:", error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 flex items-center justify-center p-4 font-serif text-text-primary">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background-primary rounded-2xl shadow-2xl p-8 w-full max-w-md border border-border-primary"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-gradient-to-r from-info-500 to-info-600 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Phone className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-primary-800 mb-2">
            {isRtl ? "تحقق من رقم الهاتف" : "Verify Phone Number"}
          </h1>
          <p className="text-text-secondary mb-4">
            {isRtl ? "أدخل الرمز المرسل إلى" : "Enter the code sent to"}
          </p>
          <p className="text-info-600 font-medium">{phoneNumber}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {isRtl ? "رمز التحقق" : "Verification Code"}
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="w-full px-4 py-3 border border-border-primary rounded-xl focus:ring-2 focus:ring-info-500 focus:border-transparent transition-all text-center text-lg font-mono tracking-widest"
              placeholder="000000"
              maxLength={6}
              required
            />
          </div>

          <motion.button
            type="submit"
            disabled={isLoading || verificationCode.length !== 6}
            className="w-full bg-gradient-to-r from-info-500 to-info-600 text-white py-3 px-4 rounded-xl font-medium hover:from-info-600 hover:to-info-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle size={18} />
                <span>{isRtl ? "تسجيل الدخول" : "Sign In"}</span>
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-text-secondary mb-4">
            {isRtl ? "لم تستلم الرمز؟" : "Didn't receive the code?"}
          </p>
          <button
            onClick={handleResendCode}
            disabled={countdown > 0 || isResending}
            className="text-info-600 hover:text-info-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            {isResending ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            <span>
              {countdown > 0
                ? `${isRtl ? "إعادة الإرسال خلال" : "Resend in"} ${countdown}s`
                : isRtl
                ? "إعادة إرسال الرمز"
                : "Resend Code"}
            </span>
          </button>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/auth/login")}
            className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            {isRtl ? "العودة لتسجيل الدخول" : "Back to login"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PhoneLoginVerificationForm;
