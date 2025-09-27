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
} from "../controllers/heroOccasionsController.js";
import { authenticateAdmin } from "../middlewares/adminAuthMiddleware.js";
import { body, param, query } from "express-validator";

const router = express.Router();

// التحقق من صحة البيانات للمناسبات
const occasionValidation = [
  body("id")
    .notEmpty()
    .withMessage("معرف المناسبة مطلوب")
    .isLength({ min: 2, max: 50 })
    .withMessage("معرف المناسبة يجب أن يكون بين 2 و 50 حرف")
    .matches(/^[a-z0-9-]+$/)
    .withMessage("معرف المناسبة يجب أن يحتوي على أحرف صغيرة وأرقام وشرطات فقط"),

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
        // التحقق من أن الرابط صحيح
        try {
          new URL(image);
        } catch {
          throw new Error("جميع الصور يجب أن تكون روابط صحيحة");
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

  body("priority")
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage("الأولوية يجب أن تكون رقم بين 1 و 10"),

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
    .isLength({ min: 2, max: 50 })
    .withMessage("معرف المناسبة يجب أن يكون بين 2 و 50 حرف"),
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

  query("priority")
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage("الأولوية يجب أن تكون رقم بين 1 و 10"),

  query("language")
    .optional()
    .isIn(["ar", "en"])
    .withMessage("اللغة يجب أن تكون ar أو en"),

  query("sortBy")
    .optional()
    .isIn(["priority", "date", "nameAr", "nameEn", "createdAt"])
    .withMessage("حقل الترتيب غير صحيح"),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("اتجاه الترتيب يجب أن يكون asc أو desc"),
];

// ===== مسارات عامة (لا تحتاج مصادقة) =====

// GET /api/hero-occasions - الحصول على جميع المناسبات (مع فلترة)
router.get("/", queryValidation, getAllOccasions);

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
