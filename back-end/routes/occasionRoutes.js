import express from "express";
import {
  getAllOccasions,
  getOccasionById,
  getOccasionBySlug,
  createOccasion,
  updateOccasion,
  deleteOccasion,
  toggleOccasionStatus,
  reorderOccasions,
  searchOccasions,
  getActiveOccasions,
  getCurrentSeasonalOccasions,
  getUpcomingOccasions,
  uploadOccasionImage,
  deleteOccasionImage,
  createOccasionWithImage,
} from "../controllers/occasionController.js";
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
const createOccasionValidation = [
  body("nameAr")
    .notEmpty()
    .withMessage("اسم المناسبة بالعربية مطلوب")
    .isLength({ min: 2, max: 100 })
    .withMessage("اسم المناسبة بالعربية يجب أن يكون بين 2 و 100 حرف"),
  body("nameEn")
    .notEmpty()
    .withMessage("اسم المناسبة بالإنجليزية مطلوب")
    .isLength({ min: 2, max: 100 })
    .withMessage("اسم المناسبة بالإنجليزية يجب أن يكون بين 2 و 100 حرف"),
  body("imageUrl")
    .notEmpty()
    .withMessage("صورة المناسبة مطلوبة")
    .isURL()
    .withMessage("صورة المناسبة يجب أن تكون رابط صحيح"),
  body("slug")
    .notEmpty()
    .withMessage("معرف المناسبة مطلوب")
    .matches(/^[a-z0-9-]+$/)
    .withMessage(
      "معرف المناسبة يجب أن يحتوي على أحرف إنجليزية وأرقام وشرطات فقط"
    ),
  body("descriptionAr")
    .optional()
    .isLength({ max: 500 })
    .withMessage("وصف المناسبة بالعربية يجب أن يكون أقل من 500 حرف"),
  body("descriptionEn")
    .optional()
    .isLength({ max: 500 })
    .withMessage("وصف المناسبة بالإنجليزية يجب أن يكون أقل من 500 حرف"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("حالة النشاط يجب أن تكون true أو false"),
  body("sortOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("ترتيب المناسبة يجب أن يكون رقم صحيح أكبر من أو يساوي 0"),
  body("showInHomePage")
    .optional()
    .isBoolean()
    .withMessage("عرض في الصفحة الرئيسية يجب أن يكون true أو false"),
  body("showInNavigation")
    .optional()
    .isBoolean()
    .withMessage("عرض في التنقل يجب أن يكون true أو false"),
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
  body("occasionType")
    .optional()
    .isIn(["seasonal", "permanent", "special"])
    .withMessage("نوع المناسبة يجب أن يكون seasonal أو permanent أو special"),
  body("startDate")
    .optional()
    .isISO8601()
    .withMessage("تاريخ البداية يجب أن يكون تاريخ صحيح"),
  body("endDate")
    .optional()
    .isISO8601()
    .withMessage("تاريخ النهاية يجب أن يكون تاريخ صحيح"),
  body("celebratoryMessageAr")
    .optional()
    .isLength({ max: 200 })
    .withMessage("الرسالة الاحتفالية بالعربية يجب أن تكون أقل من 200 حرف"),
  body("celebratoryMessageEn")
    .optional()
    .isLength({ max: 200 })
    .withMessage("الرسالة الاحتفالية بالإنجليزية يجب أن تكون أقل من 200 حرف"),
];

const updateOccasionValidation = [
  param("id").isMongoId().withMessage("معرف المناسبة غير صحيح"),
  body("nameAr")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("اسم المناسبة بالعربية يجب أن يكون بين 2 و 100 حرف"),
  body("nameEn")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("اسم المناسبة بالإنجليزية يجب أن يكون بين 2 و 100 حرف"),
  body("imageUrl")
    .optional()
    .isURL()
    .withMessage("صورة المناسبة يجب أن تكون رابط صحيح"),
  body("slug")
    .optional()
    .matches(/^[a-z0-9-]+$/)
    .withMessage(
      "معرف المناسبة يجب أن يحتوي على أحرف إنجليزية وأرقام وشرطات فقط"
    ),
  body("descriptionAr")
    .optional()
    .isLength({ max: 500 })
    .withMessage("وصف المناسبة بالعربية يجب أن يكون أقل من 500 حرف"),
  body("descriptionEn")
    .optional()
    .isLength({ max: 500 })
    .withMessage("وصف المناسبة بالإنجليزية يجب أن يكون أقل من 500 حرف"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("حالة النشاط يجب أن تكون true أو false"),
  body("sortOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("ترتيب المناسبة يجب أن يكون رقم صحيح أكبر من أو يساوي 0"),
  body("showInHomePage")
    .optional()
    .isBoolean()
    .withMessage("عرض في الصفحة الرئيسية يجب أن يكون true أو false"),
  body("showInNavigation")
    .optional()
    .isBoolean()
    .withMessage("عرض في التنقل يجب أن يكون true أو false"),
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
  body("occasionType")
    .optional()
    .isIn(["seasonal", "permanent", "special"])
    .withMessage("نوع المناسبة يجب أن يكون seasonal أو permanent أو special"),
  body("startDate")
    .optional()
    .isISO8601()
    .withMessage("تاريخ البداية يجب أن يكون تاريخ صحيح"),
  body("endDate")
    .optional()
    .isISO8601()
    .withMessage("تاريخ النهاية يجب أن يكون تاريخ صحيح"),
  body("celebratoryMessageAr")
    .optional()
    .isLength({ max: 200 })
    .withMessage("الرسالة الاحتفالية بالعربية يجب أن تكون أقل من 200 حرف"),
  body("celebratoryMessageEn")
    .optional()
    .isLength({ max: 200 })
    .withMessage("الرسالة الاحتفالية بالإنجليزية يجب أن تكون أقل من 200 حرف"),
];

const occasionIdValidation = [
  param("id").isMongoId().withMessage("معرف المناسبة غير صحيح"),
];

const slugValidation = [
  param("slug")
    .matches(/^[a-z0-9-]+$/)
    .withMessage("معرف المناسبة غير صحيح"),
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
  body("occasionOrders")
    .isArray({ min: 1 })
    .withMessage("قائمة ترتيب المناسبات مطلوبة"),
  body("occasionOrders.*.occasionId")
    .isMongoId()
    .withMessage("معرف المناسبة غير صحيح"),
  body("occasionOrders.*.sortOrder")
    .isInt({ min: 0 })
    .withMessage("ترتيب المناسبة يجب أن يكون رقم صحيح أكبر من أو يساوي 0"),
];

// Public routes (لا تحتاج مصادقة)
router.get("/", getAllOccasions);
router.get("/active", getActiveOccasions);
router.get("/current-seasonal", getCurrentSeasonalOccasions);
router.get("/upcoming", getUpcomingOccasions);
router.get("/search", searchValidation, searchOccasions);
router.get("/slug/:slug", slugValidation, getOccasionBySlug);
router.get("/:id", occasionIdValidation, getOccasionById);

// Admin routes (تحتاج مصادقة المدير)
router.post("/", authenticateAdmin, createOccasionValidation, createOccasion);
router.put("/:id", authenticateAdmin, updateOccasionValidation, updateOccasion);
router.delete("/:id", authenticateAdmin, occasionIdValidation, deleteOccasion);
router.patch(
  "/:id/toggle",
  authenticateAdmin,
  occasionIdValidation,
  toggleOccasionStatus
);
router.patch(
  "/reorder",
  authenticateAdmin,
  reorderValidation,
  reorderOccasions
);

// رفع صورة المناسبة
router.post(
  "/upload",
  authenticateAdmin,
  upload.single("image"),
  uploadOccasionImage
);

// حذف صورة المناسبة
router.delete("/image/:publicId", authenticateAdmin, deleteOccasionImage);

// إنشاء مناسبة مع رفع صورة
router.post(
  "/create-with-image",
  authenticateAdmin,
  upload.single("image"),
  createOccasionWithImage
);

export default router;
