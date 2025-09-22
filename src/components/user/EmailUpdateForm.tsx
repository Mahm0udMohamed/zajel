import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Send, CheckCircle } from "lucide-react";
import { useUser } from "../../context/UserContext";

const EmailUpdateForm: React.FC = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const { profile, requestEmailUpdate, verifyEmailUpdate, isLoading } =
    useUser();

  const [step, setStep] = useState<"request" | "verify">("request");
  const [formData, setFormData] = useState({
    newEmail: "",
    verificationCode: "",
    password: "",
  });

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await requestEmailUpdate(formData.newEmail);
      setStep("verify");
    } catch (error) {
      console.error("Email update request error:", error);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await verifyEmailUpdate(formData.verificationCode, formData.password);
      setStep("request");
      setFormData({
        newEmail: "",
        verificationCode: "",
        password: "",
      });
    } catch (error) {
      console.error("Email verification error:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
    >
      <div className="flex items-center mb-8">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mr-4 rtl:ml-4 rtl:mr-0">
          <Mail className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {isRtl ? "تحديث البريد الإلكتروني" : "Update Email Address"}
          </h2>
          <p className="text-gray-600">
            {isRtl ? "البريد الحالي:" : "Current email:"}{" "}
            <span className="font-medium">{profile?.email}</span>
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === "request" ? (
          <motion.form
            key="request"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleRequestSubmit}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isRtl ? "البريد الإلكتروني الجديد" : "New Email Address"}
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  name="newEmail"
                  value={formData.newEmail}
                  onChange={handleChange}
                  className="w-full pl-10 rtl:pr-10 rtl:pl-4 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={
                    isRtl
                      ? "أدخل البريد الإلكتروني الجديد"
                      : "Enter new email address"
                  }
                  required
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-medium text-blue-800 mb-2">
                {isRtl ? "ملاحظة مهمة" : "Important Note"}
              </h4>
              <p className="text-blue-700 text-sm">
                {isRtl
                  ? "سيتم إرسال رمز التحقق إلى البريد الإلكتروني الجديد. ستحتاج أيضاً إلى إدخال كلمة المرور الحالية للتأكيد."
                  : "A verification code will be sent to the new email address. You will also need to enter your current password for confirmation."}
              </p>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading || !formData.newEmail}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          </motion.form>
        ) : (
          <motion.form
            key="verify"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleVerifySubmit}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {isRtl ? "تحقق من البريد الجديد" : "Verify New Email"}
              </h3>
              <p className="text-gray-600">
                {isRtl
                  ? "تم إرسال رمز التحقق إلى:"
                  : "Verification code sent to:"}
              </p>
              <p className="text-blue-600 font-medium">{formData.newEmail}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isRtl ? "رمز التحقق" : "Verification Code"}
              </label>
              <input
                type="text"
                name="verificationCode"
                value={formData.verificationCode}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-center text-lg font-mono tracking-widest"
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isRtl ? "كلمة المرور الحالية" : "Current Password"}
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 rtl:pr-10 rtl:pl-4 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder={
                    isRtl
                      ? "أدخل كلمة المرور للتأكيد"
                      : "Enter password to confirm"
                  }
                  required
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep("request")}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-all"
              >
                {isRtl ? "العودة" : "Back"}
              </button>
              <motion.button
                type="submit"
                disabled={
                  isLoading || !formData.verificationCode || !formData.password
                }
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle size={18} />
                    <span>{isRtl ? "تحديث البريد" : "Update Email"}</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EmailUpdateForm;
