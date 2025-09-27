import express from "express";
import {
  getAllOccasions,
  getOccasionById,
  getActiveOccasions,
  getUpcomingOccasions,
  createOccasion,
  updateOccasion,
  deleteOccasion,
  toggleOccasionStatus,
  searchOccasions,
  importOccasions,
  uploadSingleImage,
} from "../controllers/heroOccasionsController.js";
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
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("يجب أن يكون الملف صورة"), false);
    }
  },
});

// التحقق من صحة البيانات للمناسبات
const occasionValidation = [
  body("nameAr")
    .notEmpty()
    .withMessage("الاسم العربي مطلوب")
    .isLength({ min: 2, max: 100 })
    .withMessage("الاسم العربي يجب أن يكون بين 2 و 100 حرف"),

  body("nameEn")
    .notEmpty()
    .withMessage("الاسم الإنجليزي مطلوب")
    .isLength({ min: 2, max: 100 })
    .withMessage("الاسم الإنجليزي يجب أن يكون بين 2 و 100 حرف"),

  body("date")
    .notEmpty()
    .withMessage("تاريخ المناسبة مطلوب")
    .isISO8601()
    .withMessage("تاريخ المناسبة يجب أن يكون صحيحاً"),

  body("images")
    .isArray({ min: 1 })
    .withMessage("يجب أن تحتوي المناسبة على صورة واحدة على الأقل")
    .custom((images) => {
      if (!Array.isArray(images) || images.length === 0) {
        throw new Error("يجب أن تحتوي المناسبة على صورة واحدة على الأقل");
      }
      for (const image of images) {
        if (typeof image !== "string" || image.trim() === "") {
          throw new Error("جميع الصور يجب أن تكون روابط صحيحة");
        }
        // التحقق من أن الرابط صحيح (HTTP/HTTPS) أو base64
        if (image.startsWith("data:image")) {
          // صورة base64 - تحقق من التنسيق
          if (!image.match(/^data:image\/(jpeg|jpg|png|gif|webp);base64,/)) {
            throw new Error(
              "تنسيق الصورة غير مدعوم. يرجى استخدام JPG, PNG, GIF, أو WebP"
            );
          }
        } else if (image.startsWith("http")) {
          // رابط HTTP - تحقق من صحة الرابط
          try {
            new URL(image);
          } catch {
            throw new Error("جميع الصور يجب أن تكون روابط صحيحة");
          }
        } else {
          throw new Error(
            "تنسيق الصورة غير صحيح. يجب أن تكون رابط HTTP أو صورة base64"
          );
        }
      }
      return true;
    }),

  body("celebratoryMessageAr")
    .notEmpty()
    .withMessage("الرسالة التهنئة العربية مطلوبة")
    .isLength({ min: 5, max: 500 })
    .withMessage("الرسالة التهنئة العربية يجب أن تكون بين 5 و 500 حرف"),

  body("celebratoryMessageEn")
    .notEmpty()
    .withMessage("الرسالة التهنئة الإنجليزية مطلوبة")
    .isLength({ min: 5, max: 500 })
    .withMessage("الرسالة التهنئة الإنجليزية يجب أن تكون بين 5 و 500 حرف"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("حالة التفعيل يجب أن تكون true أو false"),
];

// التحقق من صحة معرف المناسبة
const occasionIdValidation = [
  param("id")
    .notEmpty()
    .withMessage("معرف المناسبة مطلوب")
    .isMongoId()
    .withMessage("معرف المناسبة غير صحيح"),
];

// التحقق من صحة معاملات البحث
const searchValidation = [
  query("q")
    .notEmpty()
    .withMessage("كلمة البحث مطلوبة")
    .isLength({ min: 2, max: 100 })
    .withMessage("كلمة البحث يجب أن تكون بين 2 و 100 حرف"),

  query("language")
    .optional()
    .isIn(["ar", "en"])
    .withMessage("اللغة يجب أن تكون ar أو en"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("الحد الأقصى للنتائج يجب أن يكون بين 1 و 100"),
];

// التحقق من صحة معاملات الاستعلام
const queryValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("رقم الصفحة يجب أن يكون أكبر من 0"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("الحد الأقصى للنتائج يجب أن يكون بين 1 و 100"),

  query("isActive")
    .optional()
    .isBoolean()
    .withMessage("حالة التفعيل يجب أن تكون true أو false"),

  query("language")
    .optional()
    .isIn(["ar", "en"])
    .withMessage("اللغة يجب أن تكون ar أو en"),

  query("sortBy")
    .optional()
    .isIn(["date", "nameAr", "nameEn", "createdAt"])
    .withMessage("حقل الترتيب غير صحيح"),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("اتجاه الترتيب يجب أن يكون asc أو desc"),
];

// ===== مسارات عامة (لا تحتاج مصادقة) =====

// GET /api/hero-occasions - الحصول على جميع المناسبات (مع فلترة)
router.get("/", queryValidation, getAllOccasions);

// POST /api/hero-occasions/upload - رفع صورة واحدة
router.post(
  "/upload",
  authenticateAdmin,
  upload.single("image"),
  uploadSingleImage
);

// GET /api/hero-occasions/active - الحصول على المناسبات النشطة فقط
router.get("/active", getActiveOccasions);

// GET /api/hero-occasions/upcoming - الحصول على المناسبات القادمة
router.get("/upcoming", getUpcomingOccasions);

// GET /api/hero-occasions/search - البحث في المناسبات
router.get("/search", searchValidation, searchOccasions);

// GET /api/hero-occasions/:id - الحصول على مناسبة واحدة
router.get("/:id", occasionIdValidation, getOccasionById);

// ===== مسارات محمية (تحتاج مصادقة أدمن) =====

// POST /api/hero-occasions - إنشاء مناسبة جديدة
router.post("/", authenticateAdmin, occasionValidation, createOccasion);

// PUT /api/hero-occasions/:id - تحديث مناسبة موجودة
router.put(
  "/:id",
  authenticateAdmin,
  occasionIdValidation,
  occasionValidation,
  updateOccasion
);

// DELETE /api/hero-occasions/:id - حذف مناسبة
router.delete("/:id", authenticateAdmin, occasionIdValidation, deleteOccasion);

// PATCH /api/hero-occasions/:id/toggle - تبديل حالة المناسبة
router.patch(
  "/:id/toggle",
  authenticateAdmin,
  occasionIdValidation,
  toggleOccasionStatus
);

// POST /api/hero-occasions/import - استيراد مناسبات من ملف JSON
router.post(
  "/import",
  authenticateAdmin,
  [
    body("occasions")
      .isArray({ min: 1 })
      .withMessage("يجب أن تكون البيانات مصفوفة من المناسبات")
      .custom((occasions) => {
        for (const occasion of occasions) {
          if (
            !occasion.id ||
            !occasion.nameAr ||
            !occasion.nameEn ||
            !occasion.date
          ) {
            throw new Error(
              "كل مناسبة يجب أن تحتوي على id, nameAr, nameEn, date"
            );
          }
        }
        return true;
      }),
  ],
  importOccasions
);

export default router;
