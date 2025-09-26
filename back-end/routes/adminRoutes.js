import express from "express";
import rateLimit from "express-rate-limit";
import {
  adminLogin,
  refreshAdminToken,
  adminLogout,
  getAdminProfile,
} from "../controllers/adminController.js";
import { authenticateAdmin } from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

// Rate limiting خاص بتسجيل الدخول
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 5, // 5 محاولات كحد أقصى
  message: {
    success: false,
    message:
      "تم تجاوز الحد الأقصى لمحاولات تسجيل الدخول. حاول مرة أخرى بعد 15 دقيقة",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes التي لا تحتاج مصادقة
router.post("/login", loginLimiter, adminLogin);
router.post("/refresh-token", refreshAdminToken);

// Routes التي تحتاج مصادقة
router.use(authenticateAdmin); // تطبيق middleware على جميع الـ routes التالية

router.post("/logout", adminLogout);
router.get("/profile", getAdminProfile);

export default router;
