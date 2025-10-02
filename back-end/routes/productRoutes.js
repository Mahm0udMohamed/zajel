import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  reorderProducts,
  searchProducts,
  getActiveProducts,
  uploadProductImage,
  deleteProductImage,
  createProductWithImage,
  incrementProductViews,
  incrementProductPurchases,
} from "../controllers/productController.js";
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
const createProductValidation = [
  body("nameAr")
    .notEmpty()
    .withMessage("اسم المنتج بالعربية مطلوب")
    .isLength({ min: 2, max: 200 })
    .withMessage("اسم المنتج بالعربية يجب أن يكون بين 2 و 200 حرف"),
  body("nameEn")
    .notEmpty()
    .withMessage("اسم المنتج بالإنجليزية مطلوب")
    .isLength({ min: 2, max: 200 })
    .withMessage("اسم المنتج بالإنجليزية يجب أن يكون بين 2 و 200 حرف"),
  body("mainImage")
    .notEmpty()
    .withMessage("الصورة الأساسية للمنتج مطلوبة")
    .isURL()
    .withMessage("الصورة الأساسية يجب أن تكون رابط صحيح"),
  body("additionalImages")
    .optional()
    .isArray()
    .withMessage("الصور الإضافية يجب أن تكون مصفوفة"),
  body("additionalImages.*")
    .optional()
    .isURL()
    .withMessage("الصور الإضافية يجب أن تكون روابط صحيحة"),
  body("price")
    .notEmpty()
    .withMessage("سعر المنتج مطلوب")
    .isFloat({ min: 0 })
    .withMessage("سعر المنتج يجب أن يكون رقم أكبر من أو يساوي 0"),
  body("category")
    .notEmpty()
    .withMessage("فئة المنتج مطلوبة")
    .isMongoId()
    .withMessage("معرف الفئة غير صحيح"),
  body("occasion")
    .notEmpty()
    .withMessage("مناسبة المنتج مطلوبة")
    .isMongoId()
    .withMessage("معرف المناسبة غير صحيح"),
  body("brand")
    .notEmpty()
    .withMessage("علامة المنتج التجارية مطلوبة")
    .isMongoId()
    .withMessage("معرف العلامة التجارية غير صحيح"),
  body("descriptionAr")
    .optional()
    .isLength({ max: 2000 })
    .withMessage("وصف المنتج بالعربية يجب أن يكون أقل من 2000 حرف"),
  body("descriptionEn")
    .optional()
    .isLength({ max: 2000 })
    .withMessage("وصف المنتج بالإنجليزية يجب أن يكون أقل من 2000 حرف"),
  body("productStatus")
    .notEmpty()
    .withMessage("حالة المنتج مطلوبة")
    .isIn(["الأكثر مبيعًا", "المجموعات المميزة", "هدايا فاخرة", "مناسبة خاصة"])
    .withMessage(
      "حالة المنتج يجب أن تكون واحدة من: الأكثر مبيعًا، المجموعات المميزة، هدايا فاخرة، مناسبة خاصة"
    ),
  body("targetAudience")
    .notEmpty()
    .withMessage("الجمهور المستهدف مطلوب")
    .isIn(["له", "لها", "لكابلز"])
    .withMessage("الجمهور المستهدف يجب أن يكون: له، لها، لكابلز"),
  body("careInstructions")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("نصائح العناية يجب أن تكون أقل من 1000 حرف"),
  body("dimensions")
    .optional()
    .isObject()
    .withMessage("الأبعاد يجب أن تكون كائن"),
  body("dimensions.length")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("الطول يجب أن يكون رقم أكبر من أو يساوي 0"),
  body("dimensions.width")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("العرض يجب أن يكون رقم أكبر من أو يساوي 0"),
  body("dimensions.height")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("الارتفاع يجب أن يكون رقم أكبر من أو يساوي 0"),
  body("dimensions.unit")
    .optional()
    .isIn(["سم", "م", "بوصة", "قدم"])
    .withMessage("وحدة القياس يجب أن تكون: سم، م، بوصة، قدم"),
  body("arrangementContents")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("محتويات التنسيق يجب أن تكون أقل من 1000 حرف"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("حالة النشاط يجب أن تكون true أو false"),
  body("sortOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("ترتيب المنتج يجب أن يكون رقم صحيح أكبر من أو يساوي 0"),
  body("showInHomePage")
    .optional()
    .isBoolean()
    .withMessage("عرض في الصفحة الرئيسية يجب أن يكون true أو false"),
  body("isFeatured")
    .optional()
    .isBoolean()
    .withMessage("المنتج المميز يجب أن يكون true أو false"),
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

const updateProductValidation = [
  param("id").isMongoId().withMessage("معرف المنتج غير صحيح"),
  body("nameAr")
    .optional()
    .isLength({ min: 2, max: 200 })
    .withMessage("اسم المنتج بالعربية يجب أن يكون بين 2 و 200 حرف"),
  body("nameEn")
    .optional()
    .isLength({ min: 2, max: 200 })
    .withMessage("اسم المنتج بالإنجليزية يجب أن يكون بين 2 و 200 حرف"),
  body("mainImage")
    .optional()
    .isURL()
    .withMessage("الصورة الأساسية يجب أن تكون رابط صحيح"),
  body("additionalImages")
    .optional()
    .isArray()
    .withMessage("الصور الإضافية يجب أن تكون مصفوفة"),
  body("additionalImages.*")
    .optional()
    .isURL()
    .withMessage("الصور الإضافية يجب أن تكون روابط صحيحة"),
  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("سعر المنتج يجب أن يكون رقم أكبر من أو يساوي 0"),
  body("category").optional().isMongoId().withMessage("معرف الفئة غير صحيح"),
  body("occasion").optional().isMongoId().withMessage("معرف المناسبة غير صحيح"),
  body("brand")
    .optional()
    .isMongoId()
    .withMessage("معرف العلامة التجارية غير صحيح"),
  body("descriptionAr")
    .optional()
    .isLength({ max: 2000 })
    .withMessage("وصف المنتج بالعربية يجب أن يكون أقل من 2000 حرف"),
  body("descriptionEn")
    .optional()
    .isLength({ max: 2000 })
    .withMessage("وصف المنتج بالإنجليزية يجب أن يكون أقل من 2000 حرف"),
  body("productStatus")
    .optional()
    .isIn(["الأكثر مبيعًا", "المجموعات المميزة", "هدايا فاخرة", "مناسبة خاصة"])
    .withMessage(
      "حالة المنتج يجب أن تكون واحدة من: الأكثر مبيعًا، المجموعات المميزة، هدايا فاخرة، مناسبة خاصة"
    ),
  body("targetAudience")
    .optional()
    .isIn(["له", "لها", "لكابلز"])
    .withMessage("الجمهور المستهدف يجب أن يكون: له، لها، لكابلز"),
  body("careInstructions")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("نصائح العناية يجب أن تكون أقل من 1000 حرف"),
  body("dimensions")
    .optional()
    .isObject()
    .withMessage("الأبعاد يجب أن تكون كائن"),
  body("dimensions.length")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("الطول يجب أن يكون رقم أكبر من أو يساوي 0"),
  body("dimensions.width")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("العرض يجب أن يكون رقم أكبر من أو يساوي 0"),
  body("dimensions.height")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("الارتفاع يجب أن يكون رقم أكبر من أو يساوي 0"),
  body("dimensions.unit")
    .optional()
    .isIn(["سم", "م", "بوصة", "قدم"])
    .withMessage("وحدة القياس يجب أن تكون: سم، م، بوصة، قدم"),
  body("arrangementContents")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("محتويات التنسيق يجب أن تكون أقل من 1000 حرف"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("حالة النشاط يجب أن تكون true أو false"),
  body("sortOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("ترتيب المنتج يجب أن يكون رقم صحيح أكبر من أو يساوي 0"),
  body("showInHomePage")
    .optional()
    .isBoolean()
    .withMessage("عرض في الصفحة الرئيسية يجب أن يكون true أو false"),
  body("isFeatured")
    .optional()
    .isBoolean()
    .withMessage("المنتج المميز يجب أن يكون true أو false"),
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

const productIdValidation = [
  param("id").isMongoId().withMessage("معرف المنتج غير صحيح"),
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
  query("category").optional().isMongoId().withMessage("معرف الفئة غير صحيح"),
  query("occasion")
    .optional()
    .isMongoId()
    .withMessage("معرف المناسبة غير صحيح"),
  query("brand")
    .optional()
    .isMongoId()
    .withMessage("معرف العلامة التجارية غير صحيح"),
  query("productStatus")
    .optional()
    .isIn(["الأكثر مبيعًا", "المجموعات المميزة", "هدايا فاخرة", "مناسبة خاصة"])
    .withMessage("حالة المنتج غير صحيحة"),
  query("targetAudience")
    .optional()
    .isIn(["له", "لها", "لكابلز"])
    .withMessage("الجمهور المستهدف غير صحيح"),
  query("minPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("الحد الأدنى للسعر يجب أن يكون رقم أكبر من أو يساوي 0"),
  query("maxPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("الحد الأقصى للسعر يجب أن يكون رقم أكبر من أو يساوي 0"),
];

const reorderValidation = [
  body("productOrders")
    .isArray({ min: 1 })
    .withMessage("قائمة ترتيب المنتجات مطلوبة"),
  body("productOrders.*.productId")
    .isMongoId()
    .withMessage("معرف المنتج غير صحيح"),
  body("productOrders.*.sortOrder")
    .isInt({ min: 0 })
    .withMessage("ترتيب المنتج يجب أن يكون رقم صحيح أكبر من أو يساوي 0"),
];

// Public routes (لا تحتاج مصادقة)
router.get("/", getAllProducts);
router.get("/active", getActiveProducts);
router.get("/search", searchValidation, searchProducts);
router.get("/:id", productIdValidation, getProductById);

// Public routes للمشاهدات والمشتريات
router.patch("/:id/views", productIdValidation, incrementProductViews);
router.patch("/:id/purchases", productIdValidation, incrementProductPurchases);

// Admin routes (تحتاج مصادقة المدير)
router.post("/", authenticateAdmin, createProductValidation, createProduct);
router.put("/:id", authenticateAdmin, updateProductValidation, updateProduct);
router.delete("/:id", authenticateAdmin, productIdValidation, deleteProduct);
router.patch(
  "/:id/toggle",
  authenticateAdmin,
  productIdValidation,
  toggleProductStatus
);
router.patch("/reorder", authenticateAdmin, reorderValidation, reorderProducts);

// رفع صورة المنتج
router.post(
  "/upload",
  authenticateAdmin,
  upload.single("image"),
  uploadProductImage
);

// حذف صورة المنتج
router.delete("/image/:publicId", authenticateAdmin, deleteProductImage);

// إنشاء منتج مع رفع صورة
router.post(
  "/create-with-image",
  authenticateAdmin,
  upload.single("image"),
  createProductWithImage
);

export default router;
