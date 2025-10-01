import express from "express";
import {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
  toggleBrandStatus,
  reorderBrands,
  searchBrands,
  getActiveBrands,
  uploadBrandImage,
  deleteBrandImage,
  createBrandWithImage,
} from "../controllers/brandController.js";
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
const createBrandValidation = [
  body("nameAr")
    .notEmpty()
    .withMessage("اسم العلامة التجارية بالعربية مطلوب")
    .isLength({ min: 2, max: 100 })
    .withMessage("اسم العلامة التجارية بالعربية يجب أن يكون بين 2 و 100 حرف"),
  body("nameEn")
    .notEmpty()
    .withMessage("اسم العلامة التجارية بالإنجليزية مطلوب")
    .isLength({ min: 2, max: 100 })
    .withMessage(
      "اسم العلامة التجارية بالإنجليزية يجب أن يكون بين 2 و 100 حرف"
    ),
  body("imageUrl")
    .notEmpty()
    .withMessage("صورة العلامة التجارية مطلوبة")
    .isURL()
    .withMessage("صورة العلامة التجارية يجب أن تكون رابط صحيح"),
  body("descriptionAr")
    .optional()
    .isLength({ max: 500 })
    .withMessage("وصف العلامة التجارية بالعربية يجب أن يكون أقل من 500 حرف"),
  body("descriptionEn")
    .optional()
    .isLength({ max: 500 })
    .withMessage("وصف العلامة التجارية بالإنجليزية يجب أن يكون أقل من 500 حرف"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("حالة النشاط يجب أن تكون true أو false"),
  body("sortOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage(
      "ترتيب العلامة التجارية يجب أن يكون رقم صحيح أكبر من أو يساوي 0"
    ),
];

const updateBrandValidation = [
  param("id").isMongoId().withMessage("معرف العلامة التجارية غير صحيح"),
  body("nameAr")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("اسم العلامة التجارية بالعربية يجب أن يكون بين 2 و 100 حرف"),
  body("nameEn")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage(
      "اسم العلامة التجارية بالإنجليزية يجب أن يكون بين 2 و 100 حرف"
    ),
  body("imageUrl")
    .optional()
    .isURL()
    .withMessage("صورة العلامة التجارية يجب أن تكون رابط صحيح"),
  body("descriptionAr")
    .optional()
    .isLength({ max: 500 })
    .withMessage("وصف العلامة التجارية بالعربية يجب أن يكون أقل من 500 حرف"),
  body("descriptionEn")
    .optional()
    .isLength({ max: 500 })
    .withMessage("وصف العلامة التجارية بالإنجليزية يجب أن يكون أقل من 500 حرف"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("حالة النشاط يجب أن تكون true أو false"),
  body("sortOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage(
      "ترتيب العلامة التجارية يجب أن يكون رقم صحيح أكبر من أو يساوي 0"
    ),
];

const brandIdValidation = [
  param("id").isMongoId().withMessage("معرف العلامة التجارية غير صحيح"),
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
  body("brandOrders")
    .isArray({ min: 1 })
    .withMessage("قائمة ترتيب العلامات التجارية مطلوبة"),
  body("brandOrders.*.brandId")
    .isMongoId()
    .withMessage("معرف العلامة التجارية غير صحيح"),
  body("brandOrders.*.sortOrder")
    .isInt({ min: 0 })
    .withMessage(
      "ترتيب العلامة التجارية يجب أن يكون رقم صحيح أكبر من أو يساوي 0"
    ),
];

// Public routes (لا تحتاج مصادقة)
router.get("/", getAllBrands);
router.get("/active", getActiveBrands);
router.get("/search", searchValidation, searchBrands);
router.get("/:id", brandIdValidation, getBrandById);

// Admin routes (تحتاج مصادقة المدير)
router.post("/", authenticateAdmin, createBrandValidation, createBrand);
router.put("/:id", authenticateAdmin, updateBrandValidation, updateBrand);
router.delete("/:id", authenticateAdmin, brandIdValidation, deleteBrand);
router.patch(
  "/:id/toggle",
  authenticateAdmin,
  brandIdValidation,
  toggleBrandStatus
);
router.patch("/reorder", authenticateAdmin, reorderValidation, reorderBrands);

// رفع صورة العلامة التجارية
router.post(
  "/upload",
  authenticateAdmin,
  upload.single("image"),
  uploadBrandImage
);

// حذف صورة العلامة التجارية
router.delete("/image/:publicId", authenticateAdmin, deleteBrandImage);

// إنشاء علامة تجارية مع رفع صورة
router.post(
  "/create-with-image",
  authenticateAdmin,
  upload.single("image"),
  createBrandWithImage
);

export default router;
