import Category from "../models/Category.js";
import { validationResult } from "express-validator";
import { cacheLayer } from "../services/cache/index.js";
import cloudinary from "../utils/cloudinary.js";

// دالة مساعدة لمسح جميع كاشات الفئات (Best Practice)
const clearAllCategoriesCache = async () => {
  try {
    console.log("🔄 Clearing all categories cache...");

    // مسح جميع استراتيجيات الفئات
    const strategies = ["categories", "categories-active", "category-details"];

    for (const strategy of strategies) {
      await cacheLayer.clear(strategy, "*");
    }

    console.log("✅ All categories cache cleared successfully");
  } catch (error) {
    console.error("❌ Error clearing categories cache:", error.message);
  }
};

/**
 * جلب جميع الفئات مع إمكانية الفلترة والترتيب
 */
export const getAllCategories = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      isActive,
      language = "ar",
      search,
      sortBy = "sortOrder",
      sortOrder = "asc",
      showInHomePage,
    } = req.query;

    // بناء query object
    const query = {};

    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    if (showInHomePage !== undefined) {
      query.showInHomePage = showInHomePage === "true";
    }

    // إضافة البحث
    if (search) {
      const searchRegex = new RegExp(search, "i");
      if (language === "ar") {
        query.$or = [{ nameAr: searchRegex }, { descriptionAr: searchRegex }];
      } else {
        query.$or = [{ nameEn: searchRegex }, { descriptionEn: searchRegex }];
      }
    }

    // إعداد الترتيب
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    // إعداد Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // بناء معاملات الكاش
    const cacheParams = {
      page: pageNum,
      limit: limitNum,
      isActive,
      language,
      search,
      sortBy,
      sortOrder,
      showInHomePage,
    };

    // محاولة جلب البيانات من الكاش
    let categories;
    let totalCount;

    try {
      const cached = await cacheLayer.get("categories", "all", cacheParams);
      if (cached) {
        return res.status(200).json({
          success: true,
          data: cached.categories,
          pagination: cached.pagination,
          message: "تم جلب الفئات بنجاح من الكاش",
        });
      }
    } catch (cacheError) {
      console.warn("خطأ في جلب البيانات من الكاش:", cacheError.message);
    }

    // جلب البيانات من قاعدة البيانات
    const [categoriesData, total] = await Promise.all([
      Category.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .populate("createdBy", "name email")
        .populate("updatedBy", "name email")
        .lean(),
      Category.countDocuments(query),
    ]);

    // تنسيق البيانات حسب اللغة
    const formattedCategories = categoriesData.map((category) => ({
      _id: category._id,
      name: language === "ar" ? category.nameAr : category.nameEn,
      nameAr: category.nameAr,
      nameEn: category.nameEn,
      description:
        language === "ar" ? category.descriptionAr : category.descriptionEn,
      descriptionAr: category.descriptionAr,
      descriptionEn: category.descriptionEn,
      imageUrl: category.imageUrl,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
      productCount: category.productCount,
      showInHomePage: category.showInHomePage,
      metaTitle:
        language === "ar" ? category.metaTitleAr : category.metaTitleEn,
      metaDescription:
        language === "ar"
          ? category.metaDescriptionAr
          : category.metaDescriptionEn,
      createdBy: category.createdBy,
      updatedBy: category.updatedBy,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }));

    const pagination = {
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalItems: total,
      itemsPerPage: limitNum,
      hasNextPage: pageNum < Math.ceil(total / limitNum),
      hasPrevPage: pageNum > 1,
    };

    const responseData = {
      categories: formattedCategories,
      pagination,
    };

    // حفظ البيانات في الكاش لمدة 30 دقيقة
    try {
      await cacheLayer.set("categories", "all", responseData, cacheParams, {
        ttl: 1800, // 30 دقيقة
      });
    } catch (cacheError) {
      console.warn("خطأ في حفظ البيانات في الكاش:", cacheError.message);
    }

    res.status(200).json({
      success: true,
      data: formattedCategories,
      pagination,
      message: "تم جلب الفئات بنجاح",
    });
  } catch (error) {
    console.error("خطأ في جلب الفئات:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في جلب الفئات",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * جلب فئة محددة بالمعرف
 */
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const { language = "ar" } = req.query;

    const cacheKey = `category:${id}:${language}`;

    // محاولة جلب البيانات من الكاش
    try {
      const cachedCategory = await cacheLayer.get(cacheKey);
      if (cachedCategory) {
        return res.status(200).json({
          success: true,
          data: cachedCategory,
          message: "تم جلب الفئة بنجاح من الكاش",
        });
      }
    } catch (cacheError) {
      console.warn("خطأ في جلب البيانات من الكاش:", cacheError.message);
    }

    const category = await Category.findById(id)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .lean();

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "الفئة غير موجودة",
      });
    }

    // تنسيق البيانات حسب اللغة
    const formattedCategory = {
      _id: category._id,
      name: language === "ar" ? category.nameAr : category.nameEn,
      nameAr: category.nameAr,
      nameEn: category.nameEn,
      description:
        language === "ar" ? category.descriptionAr : category.descriptionEn,
      descriptionAr: category.descriptionAr,
      descriptionEn: category.descriptionEn,
      imageUrl: category.imageUrl,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
      productCount: category.productCount,
      showInHomePage: category.showInHomePage,
      metaTitle:
        language === "ar" ? category.metaTitleAr : category.metaTitleEn,
      metaDescription:
        language === "ar"
          ? category.metaDescriptionAr
          : category.metaDescriptionEn,
      createdBy: category.createdBy,
      updatedBy: category.updatedBy,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };

    // حفظ البيانات في الكاش لمدة ساعة
    try {
      await cacheLayer.set(cacheKey, formattedCategory, 3600);
    } catch (cacheError) {
      console.warn("خطأ في حفظ البيانات في الكاش:", cacheError.message);
    }

    res.status(200).json({
      success: true,
      data: formattedCategory,
      message: "تم جلب الفئة بنجاح",
    });
  } catch (error) {
    console.error("خطأ في جلب الفئة:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في جلب الفئة",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * إنشاء فئة جديدة (للمدير)
 */
export const createCategory = async (req, res) => {
  try {
    // التحقق من صحة البيانات
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "بيانات غير صحيحة",
        errors: errors.array(),
      });
    }

    const {
      nameAr,
      nameEn,
      descriptionAr = "",
      descriptionEn = "",
      imageUrl,
      isActive = true,
      sortOrder = 0,
      showInHomePage = true,
      metaTitleAr = "",
      metaTitleEn = "",
      metaDescriptionAr = "",
      metaDescriptionEn = "",
    } = req.body;

    // التحقق من عدم وجود فئة بنفس الاسم
    const existingCategory = await Category.findOne({
      $or: [
        { nameAr: { $regex: new RegExp(`^${nameAr}$`, "i") } },
        { nameEn: { $regex: new RegExp(`^${nameEn}$`, "i") } },
      ],
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "يوجد فئة بنفس الاسم بالفعل",
      });
    }

    // إنشاء الفئة الجديدة
    const newCategory = new Category({
      nameAr,
      nameEn,
      descriptionAr,
      descriptionEn,
      imageUrl,
      isActive,
      sortOrder,
      showInHomePage,
      metaTitleAr,
      metaTitleEn,
      metaDescriptionAr,
      metaDescriptionEn,
      createdBy: req.admin._id,
    });

    await newCategory.save();

    // مسح الكاش بعد إنشاء فئة جديدة
    await clearAllCategoriesCache();

    res.status(201).json({
      success: true,
      data: newCategory,
      message: "تم إنشاء الفئة بنجاح",
    });
  } catch (error) {
    console.error("خطأ في إنشاء الفئة:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في إنشاء الفئة",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * تحديث فئة موجودة (للمدير)
 */
export const updateCategory = async (req, res) => {
  try {
    // التحقق من صحة البيانات
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "بيانات غير صحيحة",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    // التحقق من وجود الفئة
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "الفئة غير موجودة",
      });
    }

    // التحقق من عدم وجود فئة أخرى بنفس الاسم (إذا تم تغيير الاسم)
    if (updateData.nameAr || updateData.nameEn) {
      const nameAr = updateData.nameAr || existingCategory.nameAr;
      const nameEn = updateData.nameEn || existingCategory.nameEn;

      const duplicateCategory = await Category.findOne({
        _id: { $ne: id }, // استبعاد الفئة الحالية
        $or: [
          { nameAr: { $regex: new RegExp(`^${nameAr}$`, "i") } },
          { nameEn: { $regex: new RegExp(`^${nameEn}$`, "i") } },
        ],
      });

      if (duplicateCategory) {
        return res.status(409).json({
          success: false,
          message: "يوجد فئة أخرى بنفس الاسم بالفعل",
        });
      }
    }

    // إضافة معلومات التحديث
    updateData.updatedBy = req.admin._id;

    const category = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    // مسح الكاش المتعلق بالفئات
    try {
      await cacheLayer.clear("categories", "*");
      await cacheLayer.clear(`category:${id}`, "*");
    } catch (cacheError) {
      console.warn("خطأ في مسح الكاش:", cacheError.message);
    }

    res.status(200).json({
      success: true,
      data: category,
      message: "تم تحديث الفئة بنجاح",
    });
  } catch (error) {
    console.error("خطأ في تحديث الفئة:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في تحديث الفئة",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * حذف فئة (للمدير)
 */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "الفئة غير موجودة",
      });
    }

    // مسح الكاش المتعلق بالفئات
    try {
      await cacheLayer.clear("categories", "*");
      await cacheLayer.clear(`category:${id}`, "*");
    } catch (cacheError) {
      console.warn("خطأ في مسح الكاش:", cacheError.message);
    }

    res.status(200).json({
      success: true,
      message: "تم حذف الفئة بنجاح",
    });
  } catch (error) {
    console.error("خطأ في حذف الفئة:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في حذف الفئة",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * تفعيل/إلغاء تفعيل فئة (للمدير)
 */
export const toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "الفئة غير موجودة",
      });
    }

    category.isActive = !category.isActive;
    category.updatedBy = req.admin._id;
    await category.save();

    // مسح الكاش المتعلق بالفئات
    try {
      await cacheLayer.clear("categories", "*");
      await cacheLayer.clear(`category:${id}`, "*");
    } catch (cacheError) {
      console.warn("خطأ في مسح الكاش:", cacheError.message);
    }

    res.status(200).json({
      success: true,
      data: category,
      message: `تم ${category.isActive ? "تفعيل" : "إلغاء تفعيل"} الفئة بنجاح`,
    });
  } catch (error) {
    console.error("خطأ في تغيير حالة الفئة:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في تغيير حالة الفئة",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * إعادة ترتيب الفئات (للمدير)
 */
export const reorderCategories = async (req, res) => {
  try {
    const { categoryOrders } = req.body;

    if (!Array.isArray(categoryOrders) || categoryOrders.length === 0) {
      return res.status(400).json({
        success: false,
        message: "قائمة ترتيب الفئات مطلوبة",
      });
    }

    // التحقق من صحة البيانات
    for (const item of categoryOrders) {
      if (!item.categoryId || typeof item.sortOrder !== "number") {
        return res.status(400).json({
          success: false,
          message: "بيانات ترتيب الفئات غير صحيحة",
        });
      }
    }

    await Category.reorderCategories(categoryOrders);

    // مسح الكاش بعد إنشاء فئة جديدة
    await clearAllCategoriesCache();

    res.status(200).json({
      success: true,
      message: "تم إعادة ترتيب الفئات بنجاح",
    });
  } catch (error) {
    console.error("خطأ في إعادة ترتيب الفئات:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في إعادة ترتيب الفئات",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * البحث في الفئات
 */
export const searchCategories = async (req, res) => {
  try {
    const { q: query, language = "ar", limit = 10, page = 1 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "استعلام البحث يجب أن يكون على الأقل حرفين",
      });
    }

    const searchResults = await Category.searchCategories(
      query.trim(),
      language,
      { limit: parseInt(limit), page: parseInt(page) }
    );

    res.status(200).json({
      success: true,
      data: searchResults,
      message: "تم البحث في الفئات بنجاح",
    });
  } catch (error) {
    console.error("خطأ في البحث في الفئات:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في البحث في الفئات",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * جلب الفئات النشطة للعرض العام
 */
export const getActiveCategories = async (req, res) => {
  try {
    const { language = "ar" } = req.query;

    const cacheKey = `active-categories:${language}`;

    // محاولة جلب البيانات من الكاش
    try {
      const cachedCategories = await cacheLayer.get(cacheKey);
      if (cachedCategories) {
        return res.status(200).json({
          success: true,
          data: cachedCategories,
          message: "تم جلب الفئات النشطة بنجاح من الكاش",
        });
      }
    } catch (cacheError) {
      console.warn("خطأ في جلب البيانات من الكاش:", cacheError.message);
    }

    const categories = await Category.getActiveCategories(language);

    // حفظ البيانات في الكاش لمدة ساعة
    try {
      await cacheLayer.set(cacheKey, categories, 3600);
    } catch (cacheError) {
      console.warn("خطأ في حفظ البيانات في الكاش:", cacheError.message);
    }

    res.status(200).json({
      success: true,
      data: categories,
      message: "تم جلب الفئات النشطة بنجاح",
    });
  } catch (error) {
    console.error("خطأ في جلب الفئات النشطة:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في جلب الفئات النشطة",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * رفع صورة الفئة إلى Cloudinary
 */
export const uploadCategoryImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "لم يتم رفع أي صورة",
      });
    }

    // رفع الصورة إلى Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            folder: "categories",
            quality: 100,
            fetch_format: "auto",
            transformation: [
              { width: 800, height: 600, crop: "fill", gravity: "center" },
              { quality: "auto" },
            ],
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        )
        .end(req.file.buffer);
    });

    // مسح كاش الفئات بعد رفع صورة جديدة
    try {
      await cacheLayer.clear("categories", "*");
    } catch (cacheError) {
      console.warn("خطأ في مسح الكاش:", cacheError.message);
    }

    res.status(200).json({
      success: true,
      message: "تم رفع صورة الفئة بنجاح",
      data: {
        imageUrl: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes,
      },
    });
  } catch (error) {
    console.error("خطأ في رفع صورة الفئة:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في رفع الصورة",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * حذف صورة الفئة من Cloudinary
 */
export const deleteCategoryImage = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: "معرف الصورة مطلوب",
      });
    }

    // حذف الصورة من Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "not found") {
      return res.status(404).json({
        success: false,
        message: "الصورة غير موجودة",
      });
    }

    // مسح كاش الفئات بعد حذف صورة
    try {
      await cacheLayer.clear("categories", "*");
    } catch (cacheError) {
      console.warn("خطأ في مسح الكاش:", cacheError.message);
    }

    res.status(200).json({
      success: true,
      message: "تم حذف الصورة بنجاح",
      data: {
        publicId: result.public_id,
        result: result.result,
      },
    });
  } catch (error) {
    console.error("خطأ في حذف صورة الفئة:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في حذف الصورة",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * إنشاء فئة مع رفع صورة في نفس الوقت
 */
export const createCategoryWithImage = async (req, res) => {
  try {
    // التحقق من صحة البيانات
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "بيانات غير صحيحة",
        errors: errors.array(),
      });
    }

    const {
      nameAr,
      nameEn,
      descriptionAr = "",
      descriptionEn = "",
      isActive = true,
      sortOrder = 0,
      showInHomePage = true,
      metaTitleAr = "",
      metaTitleEn = "",
      metaDescriptionAr = "",
      metaDescriptionEn = "",
    } = req.body;

    let imageUrl = "";

    // إذا تم رفع صورة
    if (req.file) {
      try {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                resource_type: "image",
                folder: "categories",
                quality: 100,
                fetch_format: "auto",
                transformation: [
                  { width: 800, height: 600, crop: "fill", gravity: "center" },
                  { quality: "auto" },
                ],
              },
              (error, result) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(result);
                }
              }
            )
            .end(req.file.buffer);
        });

        imageUrl = result.secure_url;
      } catch (uploadError) {
        console.error("خطأ في رفع الصورة:", uploadError);
        return res.status(500).json({
          success: false,
          message: "فشل في رفع الصورة",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "صورة الفئة مطلوبة",
      });
    }

    // التحقق من عدم وجود فئة بنفس الاسم
    const existingCategory = await Category.findOne({
      $or: [
        { nameAr: { $regex: new RegExp(`^${nameAr}$`, "i") } },
        { nameEn: { $regex: new RegExp(`^${nameEn}$`, "i") } },
      ],
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "يوجد فئة بنفس الاسم بالفعل",
      });
    }

    // إنشاء الفئة الجديدة
    const newCategory = new Category({
      nameAr,
      nameEn,
      descriptionAr,
      descriptionEn,
      imageUrl,
      isActive,
      sortOrder,
      showInHomePage,
      metaTitleAr,
      metaTitleEn,
      metaDescriptionAr,
      metaDescriptionEn,
      createdBy: req.admin._id,
    });

    await newCategory.save();

    // مسح الكاش بعد إنشاء فئة جديدة
    await clearAllCategoriesCache();

    res.status(201).json({
      success: true,
      data: newCategory,
      message: "تم إنشاء الفئة مع الصورة بنجاح",
    });
  } catch (error) {
    console.error("خطأ في إنشاء الفئة مع الصورة:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في إنشاء الفئة",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
