//  routes/authRoutes.js
import express from "express";
import rateLimit from "express-rate-limit";
import {
  signup,
  verifyEmail,
  login,
  requestPasswordReset,
  resetPassword,
  resendCode,
  refreshAccessToken,
  logout,
  checkUsername,
  ping,
  sendPhoneVerification,
  verifyPhoneNumber,
  loginWithPhone,
  verifyPhoneLogin,
} from "../controllers/authController.js";
import passport from "../config/passport.js";
import {
  googleAuth,
  googleAuthCallback,
} from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { isTwilioConfigured } from "../config/twilio.js";
const router = express.Router();

// إعداد معدل التحديد للمسارات الحساسة (5 محاولات خلال 15 دقيقة)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 5000, // عدد المحاولات القصوى
  message: { error: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
// تطبيق الـ Rate Limiting على المسارات الحساسة
router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);
router.post("/password-reset", authLimiter, requestPasswordReset);
router.post("/verify-email", authLimiter, verifyEmail);
router.post("/resend-code", authLimiter, resendCode);
router.get("/check-username", checkUsername);
router.get("/google", googleAuth); // بدء عملية تسجيل الدخول بـ Google
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/auth/login?error=google_auth_failed`,
  }),
  googleAuthCallback // رد الاتصال بعد المصادقة
);
router.get("/ping", ping);
// باقي المسارات بدون Rate Limiting
router.post("/reset-password", resetPassword);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", logout);

// مسارات التحقق من الهاتف (مع التحقق من إعدادات Twilio)
router.post("/send-phone-verification", authMiddleware, (req, res, next) => {
  if (!isTwilioConfigured()) {
    return res.status(503).json({ 
      message: "Phone verification service is currently unavailable. Please contact support." 
    });
  }
  next();
}, sendPhoneVerification);

router.post("/verify-phone", authMiddleware, (req, res, next) => {
  if (!isTwilioConfigured()) {
    return res.status(503).json({ 
      message: "Phone verification service is currently unavailable. Please contact support." 
    });
  }
  next();
}, verifyPhoneNumber);

router.post("/login-phone", (req, res, next) => {
  if (!isTwilioConfigured()) {
    return res.status(503).json({ 
      message: "Phone login service is currently unavailable. Please use email login instead." 
    });
  }
  next();
}, loginWithPhone);

router.post("/verify-phone-login", (req, res, next) => {
  if (!isTwilioConfigured()) {
    return res.status(503).json({ 
      message: "Phone verification service is currently unavailable. Please contact support." 
    });
  }
  next();
}, verifyPhoneLogin);

// نقطة نهاية للتحقق من حالة خدمة الهاتف
router.get("/phone-service-status", (req, res) => {
  res.json({
    available: isTwilioConfigured(),
    message: isTwilioConfigured() 
      ? "Phone verification service is available" 
      : "Phone verification service is not configured"
  });
});

export default router;
