import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  UserPlus,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useRecaptcha } from "../../hooks/useRecaptcha";

const SignupForm: React.FC = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const navigate = useNavigate();
  const { signup } = useAuth();

  const { executeRecaptcha } = useRecaptcha({
    siteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY,
    action: "signup",
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    setIsLoading(true);

    try {
      const captchaToken = await executeRecaptcha();

      await signup(
        formData.name,
        formData.email,
        formData.password,
        captchaToken
      );
      navigate("/auth/verify-email", {
        state: { email: formData.email },
      });
    } catch (error) {
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength < 25) return "bg-red-500";
    if (passwordStrength < 50) return "bg-yellow-500";
    if (passwordStrength < 75) return "bg-blue-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (passwordStrength < 25) return isRtl ? "ضعيف" : "Weak";
    if (passwordStrength < 50) return isRtl ? "متوسط" : "Fair";
    if (passwordStrength < 75) return isRtl ? "جيد" : "Good";
    return isRtl ? "قوي" : "Strong";
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
            className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <UserPlus className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-purple-800 mb-2">
            {isRtl ? "إنشاء حساب جديد" : "Create Account"}
          </h1>
          <p className="text-gray-600">
            {isRtl ? "انضم إلينا اليوم" : "Join us today"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isRtl ? "الاسم الكامل" : "Full Name"}
            </label>
            <div className="relative">
              <User
                size={18}
                className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-10 rtl:pr-10 rtl:pl-4 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder={
                  isRtl ? "أدخل اسمك الكامل" : "Enter your full name"
                }
                required
              />
            </div>
          </div>

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
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 rtl:pr-10 rtl:pl-4 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder={
                  isRtl ? "أدخل بريدك الإلكتروني" : "Enter your email"
                }
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isRtl ? "كلمة المرور" : "Password"}
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 rtl:pr-10 pr-12 rtl:pl-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder={isRtl ? "أدخل كلمة المرور" : "Enter your password"}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 rtl:left-3 rtl:right-auto top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">
                    {getStrengthText()}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isRtl ? "تأكيد كلمة المرور" : "Confirm Password"}
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-10 rtl:pr-10 pr-12 rtl:pl-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder={
                  isRtl ? "أعد إدخال كلمة المرور" : "Confirm your password"
                }
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 rtl:left-3 rtl:right-auto top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {formData.confirmPassword &&
              formData.password !== formData.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {isRtl
                    ? "كلمات المرور غير متطابقة"
                    : "Passwords do not match"}
                </p>
              )}
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mt-1"
              required
            />
            <span className="ml-2 rtl:mr-2 rtl:ml-0 text-sm text-gray-600">
              {isRtl ? "أوافق على" : "I agree to the"}{" "}
              <Link
                to="/terms"
                className="text-purple-600 hover:text-purple-700"
              >
                {isRtl ? "الشروط والأحكام" : "Terms & Conditions"}
              </Link>{" "}
              {isRtl ? "و" : "and"}{" "}
              <Link
                to="/privacy"
                className="text-purple-600 hover:text-purple-700"
              >
                {isRtl ? "سياسة الخصوصية" : "Privacy Policy"}
              </Link>
            </span>
          </div>

          <motion.button
            type="submit"
            disabled={
              isLoading || formData.password !== formData.confirmPassword
            }
            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 px-4 rounded-xl font-medium hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isRtl ? "إنشاء الحساب" : "Create Account"}</span>
                {isRtl ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            {isRtl ? "لديك حساب بالفعل؟" : "Already have an account?"}{" "}
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

export default SignupForm;
