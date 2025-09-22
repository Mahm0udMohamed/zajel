import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Phone, Send, CheckCircle, RefreshCw, Shield } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const PhoneSetupForm: React.FC = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const navigate = useNavigate();
  const { sendPhoneVerification, verifyPhoneNumber } = useAuth();

  const [step, setStep] = useState<"input" | "verify">("input");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await sendPhoneVerification(phoneNumber);
      setStep("verify");
      setCountdown(60);
    } catch (error) {
      console.error("Phone verification error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await verifyPhoneNumber(verificationCode);
      navigate("/");
    } catch (error) {
      console.error("Phone verification error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;

    setIsResending(true);
    try {
      await sendPhoneVerification(phoneNumber);
      setCountdown(60);
    } catch (error) {
      console.error("Resend error:", error);
    } finally {
      setIsResending(false);
    }
  };

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
            className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            {step === "input" ? (
              <Phone className="w-8 h-8 text-white" />
            ) : (
              <Shield className="w-8 h-8 text-white" />
            )}
          </motion.div>
          <h1 className="text-2xl font-bold text-purple-800 mb-2">
            {step === "input"
              ? isRtl
                ? "أضف رقم هاتفك"
                : "Add Your Phone Number"
              : isRtl
              ? "تحقق من رقم الهاتف"
              : "Verify Phone Number"}
          </h1>
          <p className="text-gray-600">
            {step === "input"
              ? isRtl
                ? "لاستكمال إنشاء حسابك، يرجى إضافة رقم هاتفك وتأكيده"
                : "To complete your account setup, please add and verify your phone number"
              : isRtl
              ? "أدخل الرمز المرسل إلى رقم هاتفك"
              : "Enter the code sent to your phone number"}
          </p>
        </div>

        {step === "input" ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isRtl ? "رقم الهاتف" : "Phone Number"}
              </label>
              <div className="relative">
                <Phone
                  size={18}
                  className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-10 rtl:pr-10 rtl:pl-4 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder={isRtl ? "+966501234567" : "+966501234567"}
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {isRtl
                  ? "يرجى إدخال رقم الهاتف السعودي (مثال: +966501234567)"
                  : "Please enter Saudi phone number (e.g., +966501234567)"}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                <Shield size={16} />
                {isRtl
                  ? "لماذا نحتاج رقم هاتفك؟"
                  : "Why do we need your phone number?"}
              </h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>
                  •{" "}
                  {isRtl
                    ? "تأمين حسابك بشكل إضافي"
                    : "Additional account security"}
                </li>
                <li>
                  •{" "}
                  {isRtl
                    ? "إشعارات الطلبات المهمة"
                    : "Important order notifications"}
                </li>
                <li>
                  •{" "}
                  {isRtl
                    ? "تسجيل دخول سريع بالهاتف"
                    : "Quick phone login option"}
                </li>
                <li>• {isRtl ? "تحديثات التوصيل" : "Delivery updates"}</li>
              </ul>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading || !phoneNumber}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={18} />
                  <span>
                    {isRtl ? "إرسال رمز التحقق" : "Send Verification Code"}
                  </span>
                </>
              )}
            </motion.button>
          </form>
        ) : (
          <form onSubmit={handleVerificationSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <p className="text-gray-600 mb-2">
                {isRtl
                  ? "تم إرسال رمز التحقق إلى:"
                  : "Verification code sent to:"}
              </p>
              <p className="text-green-600 font-medium">
                {phoneNumber.replace(/(\+\d{1,3})\d+(\d{4})/, "$1****$2")}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isRtl ? "رمز التحقق" : "Verification Code"}
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-center text-lg font-mono tracking-widest"
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>

            <motion.button
              type="submit"
              disabled={isLoading || verificationCode.length !== 6}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle size={18} />
                  <span>
                    {isRtl
                      ? "تأكيد وإنهاء التسجيل"
                      : "Verify & Complete Registration"}
                  </span>
                </>
              )}
            </motion.button>

            <div className="text-center">
              <p className="text-gray-600 mb-4">
                {isRtl ? "لم تستلم الرمز؟" : "Didn't receive the code?"}
              </p>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={countdown > 0 || isResending}
                className="text-green-600 hover:text-green-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
              >
                {isResending ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <RefreshCw size={16} />
                )}
                <span>
                  {countdown > 0
                    ? `${
                        isRtl ? "إعادة الإرسال خلال" : "Resend in"
                      } ${countdown}s`
                    : isRtl
                    ? "إعادة إرسال الرمز"
                    : "Resend Code"}
                </span>
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep("input")}
                className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
              >
                {isRtl ? "تغيير رقم الهاتف" : "Change Phone Number"}
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            {isRtl
              ? "هذه الخطوة مطلوبة لتأمين حسابك وتحسين تجربة التسوق"
              : "This step is required to secure your account and improve your shopping experience"}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PhoneSetupForm;
