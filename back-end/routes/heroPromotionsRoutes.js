import express from "express";
import {
  getAllPromotions,
  getPromotionById,
  getActivePromotions,
  getUpcomingPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  togglePromotionStatus,
  searchPromotions,
  importPromotions,
  uploadPromotionImage,
  getCacheStats,
  clearCache,
  diagnoseRedis,
  checkAndUpdateExpiredPromotions,
  getPromotionsStats,
} from "../controllers/heroPromotionsController.js";
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

// التحقق من صحة البيانات للعروض الترويجية
const promotionValidation = [
  body("titleAr")
    .notEmpty()
    .withMessage("العنوان العربي مطلوب")
    .isLength({ min: 2, max: 100 })
    .withMessage("العنوان العربي يجب أن يكون بين 2 و 100 حرف"),

  body("titleEn")
    .notEmpty()
    .withMessage("العنوان الإنجليزي مطلوب")
    .isLength({ min: 2, max: 100 })
    .withMessage("العنوان الإنجليزي يجب أن يكون بين 2 و 100 حرف"),

  body("subtitleAr")
    .notEmpty()
    .withMessage("العنوان الفرعي العربي مطلوب")
    .isLength({ min: 5, max: 200 })
    .withMessage("العنوان الفرعي العربي يجب أن يكون بين 5 و 200 حرف"),

  body("subtitleEn")
    .notEmpty()
    .withMessage("العنوان الفرعي الإنجليزي مطلوب")
    .isLength({ min: 5, max: 200 })
    .withMessage("العنوان الفرعي الإنجليزي يجب أن يكون بين 5 و 200 حرف"),

  body("buttonTextAr")
    .notEmpty()
    .withMessage("نص الزر العربي مطلوب")
    .isLength({ min: 2, max: 50 })
    .withMessage("نص الزر العربي يجب أن يكون بين 2 و 50 حرف"),

  body("buttonTextEn")
    .notEmpty()
    .withMessage("نص الزر الإنجليزي مطلوب")
    .isLength({ min: 2, max: 50 })
    .withMessage("نص الزر الإنجليزي يجب أن يكون بين 2 و 50 حرف"),

  body("link")
    .notEmpty()
    .withMessage("الرابط مطلوب")
    .custom((value) => {
      if (value.startsWith("http") || value.startsWith("/")) {
        return true;
      }
      throw new Error("الرابط يجب أن يبدأ بـ http أو /");
    }),

  body("image")
    .notEmpty()
    .withMessage("الصورة مطلوبة")
    .custom((value) => {
      if (
        value.startsWith("http") &&
        /\.(jpg|jpeg|png|gif|webp)$/i.test(value)
      ) {
        return true;
      }
      throw new Error("الصورة يجب أن تكون رابط صحيح");
    }),

  body("gradient").optional().isString().withMessage("التدرج يجب أن يكون نص"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("حالة التفعيل يجب أن تكون true أو false"),

  body("priority")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("الأولوية يجب أن تكون بين 1 و 100"),

  body("startDate")
    .notEmpty()
    .withMessage("تاريخ البداية مطلوب")
    .isISO8601()
    .withMessage("تاريخ البداية يجب أن يكون صحيحاً"),

  body("endDate")
    .notEmpty()
    .withMessage("تاريخ الانتهاء مطلوب")
    .isISO8601()
    .withMessage("تاريخ الانتهاء يجب أن يكون صحيحاً")
    .custom((value, { req }) => {
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(value);

      // التحقق من صحة التواريخ
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error("تواريخ غير صحيحة");
      }

      // تحويل التواريخ إلى نفس اليوم مع أوقات مختلفة للمقارنة (استخدام UTC)
      const startDateOnly = new Date(
        Date.UTC(
          startDate.getUTCFullYear(),
          startDate.getUTCMonth(),
          startDate.getUTCDate()
        )
      );
      const endDateOnly = new Date(
        Date.UTC(
          endDate.getUTCFullYear(),
          endDate.getUTCMonth(),
          endDate.getUTCDate()
        )
      );

      // التحقق من أن تاريخ الانتهاء بعد أو يساوي تاريخ البداية
      if (endDateOnly < startDateOnly) {
        throw new Error(
          "تاريخ الانتهاء يجب أن يكون بعد أو يساوي تاريخ البداية"
        );
      }

      return true;
    }),
];

// التحقق من صحة معرف العرض الترويجي
const promotionIdValidation = [
  param("id")
    .notEmpty()
    .withMessage("معرف العرض الترويجي مطلوب")
    .isMongoId()
    .withMessage("معرف العرض الترويجي غير صحيح"),
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
    .isIn([
      "priority",
      "titleAr",
      "titleEn",
      "startDate",
      "endDate",
      "createdAt",
    ])
    .withMessage("حقل الترتيب غير صحيح"),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("اتجاه الترتيب يجب أن يكون asc أو desc"),
];

// ===== مسارات عامة (لا تحتاج مصادقة) =====

// GET /api/hero-promotions - الحصول على جميع العروض الترويجية (مع فلترة)
router.get("/", queryValidation, getAllPromotions);

// POST /api/hero-promotions/upload - رفع صورة واحدة
router.post(
  "/upload",
  authenticateAdmin,
  upload.single("image"),
  uploadPromotionImage
);

// GET /api/hero-promotions/active - الحصول على العروض الترويجية النشطة فقط
router.get("/active", getActivePromotions);

// GET /api/hero-promotions/upcoming - الحصول على العروض الترويجية القادمة
router.get("/upcoming", getUpcomingPromotions);

// GET /api/hero-promotions/search - البحث في العروض الترويجية
router.get("/search", searchValidation, searchPromotions);

// GET /api/hero-promotions/:id - الحصول على عرض ترويجي واحد
router.get("/:id", promotionIdValidation, getPromotionById);

// ===== مسارات محمية (تحتاج مصادقة أدمن) =====

// POST /api/hero-promotions - إنشاء عرض ترويجي جديد
router.post("/", authenticateAdmin, promotionValidation, createPromotion);

// PUT /api/hero-promotions/:id - تحديث عرض ترويجي موجود
router.put(
  "/:id",
  authenticateAdmin,
  promotionIdValidation,
  promotionValidation,
  updatePromotion
);

// DELETE /api/hero-promotions/:id - حذف عرض ترويجي
router.delete(
  "/:id",
  authenticateAdmin,
  promotionIdValidation,
  deletePromotion
);

// PATCH /api/hero-promotions/:id/toggle - تبديل حالة العرض الترويجي
router.patch(
  "/:id/toggle",
  authenticateAdmin,
  promotionIdValidation,
  togglePromotionStatus
);

// POST /api/hero-promotions/import - استيراد عروض ترويجية من ملف JSON
router.post(
  "/import",
  authenticateAdmin,
  [
    body("promotions")
      .isArray({ min: 1 })
      .withMessage("يجب أن تكون البيانات مصفوفة من العروض الترويجية")
      .custom((promotions) => {
        for (const promotion of promotions) {
          if (
            !promotion.titleAr ||
            !promotion.titleEn ||
            !promotion.startDate ||
            !promotion.endDate
          ) {
            throw new Error(
              "كل عرض ترويجي يجب أن يحتوي على titleAr, titleEn, startDate, endDate"
            );
          }
        }
        return true;
      }),
  ],
  importPromotions
);

// ===== مسارات إدارة الكاش (تحتاج مصادقة أدمن) =====

// GET /api/hero-promotions/cache/stats - الحصول على إحصائيات الكاش
router.get("/cache/stats", authenticateAdmin, getCacheStats);

// GET /api/hero-promotions/cache/diagnose - تشخيص Redis
router.get("/cache/diagnose", authenticateAdmin, diagnoseRedis);

// DELETE /api/hero-promotions/cache/clear - مسح الكاش يدوياً
router.delete("/cache/clear", authenticateAdmin, clearCache);

// ===== مسارات إدارة العروض المنتهية (تحتاج مصادقة أدمن) =====

// POST /api/hero-promotions/update-expired - تحديث العروض المنتهية يدوياً
router.post("/update-expired", authenticateAdmin, async (req, res) => {
  try {
    const updated = await checkAndUpdateExpiredPromotions();
    res.status(200).json({
      success: true,
      message: `تم تحديث ${updated} عرض ترويجي منتهي`,
      data: { updated },
    });
  } catch (error) {
    console.error("Error updating expired promotions:", error);
    res.status(500).json({
      success: false,
      message: "فشل في تحديث العروض المنتهية",
      error: error.message,
    });
  }
});

// GET /api/hero-promotions/stats - الحصول على إحصائيات العروض
router.get("/stats", authenticateAdmin, async (req, res) => {
  try {
    const stats = await getPromotionsStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error getting promotions stats:", error);
    res.status(500).json({
      success: false,
      message: "فشل في الحصول على إحصائيات العروض",
      error: error.message,
    });
  }
});

export default router;
