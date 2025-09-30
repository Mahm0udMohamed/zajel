import express from "express";
import rateLimit from "express-rate-limit";
import {
  adminLogin,
  refreshAdminToken,
  adminLogout,
  getAdminProfile,
} from "../controllers/adminController.js";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  reorderCategories,
  searchCategories,
  uploadCategoryImage,
  deleteCategoryImage,
  createCategoryWithImage,
} from "../controllers/categoryController.js";
import { authenticateAdmin } from "../middlewares/adminAuthMiddleware.js";
import multer from "multer";

const router = express.Router();

// إعداد multer لرفع الملفات
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    // التحقق من نوع الملف
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("يجب أن يكون الملف صورة"), false);
    }
  },
});

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

// Category Management Routes
router.get("/categories", getAllCategories);
router.get("/categories/search", searchCategories);
router.get("/categories/:id", getCategoryById);
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);
router.patch("/categories/:id/toggle", toggleCategoryStatus);
router.patch("/categories/reorder", reorderCategories);
router.post("/categories/upload", upload.single("image"), uploadCategoryImage);
router.delete("/categories/image/:publicId", deleteCategoryImage);
router.post(
  "/categories/create-with-image",
  upload.single("image"),
  createCategoryWithImage
);

export default router;
