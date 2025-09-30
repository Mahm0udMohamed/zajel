import express from "express";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  reorderCategories,
  searchCategories,
  getActiveCategories,
  uploadCategoryImage,
  deleteCategoryImage,
  createCategoryWithImage,
} from "../controllers/categoryController.js";
import { authenticateAdmin } from "../middlewares/adminAuthMiddleware.js";
import { body, param, query } from "express-validator";
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

// Validation rules
const createCategoryValidation = [
  body("nameAr")
    .notEmpty()
    .withMessage("اسم الفئة بالعربية مطلوب")
    .isLength({ min: 2, max: 100 })
    .withMessage("اسم الفئة بالعربية يجب أن يكون بين 2 و 100 حرف"),
  body("nameEn")
    .notEmpty()
    .withMessage("اسم الفئة بالإنجليزية مطلوب")
    .isLength({ min: 2, max: 100 })
    .withMessage("اسم الفئة بالإنجليزية يجب أن يكون بين 2 و 100 حرف"),
  body("imageUrl")
    .notEmpty()
    .withMessage("صورة الفئة مطلوبة")
    .isURL()
    .withMessage("صورة الفئة يجب أن تكون رابط صحيح"),
  body("descriptionAr")
    .optional()
    .isLength({ max: 500 })
    .withMessage("وصف الفئة بالعربية يجب أن يكون أقل من 500 حرف"),
  body("descriptionEn")
    .optional()
    .isLength({ max: 500 })
    .withMessage("وصف الفئة بالإنجليزية يجب أن يكون أقل من 500 حرف"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("حالة النشاط يجب أن تكون true أو false"),
  body("sortOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("ترتيب الفئة يجب أن يكون رقم صحيح أكبر من أو يساوي 0"),
  body("showInHomePage")
    .optional()
    .isBoolean()
    .withMessage("عرض في الصفحة الرئيسية يجب أن يكون true أو false"),
  body("metaTitleAr")
    .optional()
    .isLength({ max: 60 })
    .withMessage("عنوان SEO بالعربية يجب أن يكون أقل من 60 حرف"),
  body("metaTitleEn")
    .optional()
    .isLength({ max: 60 })
    .withMessage("عنوان SEO بالإنجليزية يجب أن يكون أقل من 60 حرف"),
  body("metaDescriptionAr")
    .optional()
    .isLength({ max: 160 })
    .withMessage("وصف SEO بالعربية يجب أن يكون أقل من 160 حرف"),
  body("metaDescriptionEn")
    .optional()
    .isLength({ max: 160 })
    .withMessage("وصف SEO بالإنجليزية يجب أن يكون أقل من 160 حرف"),
];

const updateCategoryValidation = [
  param("id").isMongoId().withMessage("معرف الفئة غير صحيح"),
  body("nameAr")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("اسم الفئة بالعربية يجب أن يكون بين 2 و 100 حرف"),
  body("nameEn")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("اسم الفئة بالإنجليزية يجب أن يكون بين 2 و 100 حرف"),
  body("imageUrl")
    .optional()
    .isURL()
    .withMessage("صورة الفئة يجب أن تكون رابط صحيح"),
  body("descriptionAr")
    .optional()
    .isLength({ max: 500 })
    .withMessage("وصف الفئة بالعربية يجب أن يكون أقل من 500 حرف"),
  body("descriptionEn")
    .optional()
    .isLength({ max: 500 })
    .withMessage("وصف الفئة بالإنجليزية يجب أن يكون أقل من 500 حرف"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("حالة النشاط يجب أن تكون true أو false"),
  body("sortOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("ترتيب الفئة يجب أن يكون رقم صحيح أكبر من أو يساوي 0"),
  body("showInHomePage")
    .optional()
    .isBoolean()
    .withMessage("عرض في الصفحة الرئيسية يجب أن يكون true أو false"),
  body("metaTitleAr")
    .optional()
    .isLength({ max: 60 })
    .withMessage("عنوان SEO بالعربية يجب أن يكون أقل من 60 حرف"),
  body("metaTitleEn")
    .optional()
    .isLength({ max: 60 })
    .withMessage("عنوان SEO بالإنجليزية يجب أن يكون أقل من 60 حرف"),
  body("metaDescriptionAr")
    .optional()
    .isLength({ max: 160 })
    .withMessage("وصف SEO بالعربية يجب أن يكون أقل من 160 حرف"),
  body("metaDescriptionEn")
    .optional()
    .isLength({ max: 160 })
    .withMessage("وصف SEO بالإنجليزية يجب أن يكون أقل من 160 حرف"),
];

const categoryIdValidation = [
  param("id").isMongoId().withMessage("معرف الفئة غير صحيح"),
];

const searchValidation = [
  query("q")
    .notEmpty()
    .withMessage("استعلام البحث مطلوب")
    .isLength({ min: 2 })
    .withMessage("استعلام البحث يجب أن يكون على الأقل حرفين"),
  query("language")
    .optional()
    .isIn(["ar", "en"])
    .withMessage("اللغة يجب أن تكون ar أو en"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("الحد الأقصى للنتائج يجب أن يكون بين 1 و 100"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("رقم الصفحة يجب أن يكون أكبر من 0"),
];

const reorderValidation = [
  body("categoryOrders")
    .isArray({ min: 1 })
    .withMessage("قائمة ترتيب الفئات مطلوبة"),
  body("categoryOrders.*.categoryId")
    .isMongoId()
    .withMessage("معرف الفئة غير صحيح"),
  body("categoryOrders.*.sortOrder")
    .isInt({ min: 0 })
    .withMessage("ترتيب الفئة يجب أن يكون رقم صحيح أكبر من أو يساوي 0"),
];

// Public routes (لا تحتاج مصادقة)
router.get("/", getAllCategories);
router.get("/active", getActiveCategories);
router.get("/search", searchValidation, searchCategories);
router.get("/:id", categoryIdValidation, getCategoryById);

// Admin routes (تحتاج مصادقة المدير)
router.post("/", authenticateAdmin, createCategoryValidation, createCategory);
router.put("/:id", authenticateAdmin, updateCategoryValidation, updateCategory);
router.delete("/:id", authenticateAdmin, categoryIdValidation, deleteCategory);
router.patch(
  "/:id/toggle",
  authenticateAdmin,
  categoryIdValidation,
  toggleCategoryStatus
);
router.patch(
  "/reorder",
  authenticateAdmin,
  reorderValidation,
  reorderCategories
);

// رفع صورة الفئة
router.post(
  "/upload",
  authenticateAdmin,
  upload.single("image"),
  uploadCategoryImage
);

// حذف صورة الفئة
router.delete("/image/:publicId", authenticateAdmin, deleteCategoryImage);

// إنشاء فئة مع رفع صورة
router.post(
  "/create-with-image",
  authenticateAdmin,
  upload.single("image"),
  createCategoryWithImage
);

export default router;
