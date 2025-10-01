import Occasion from "../models/Occasion.js";
import { validationResult } from "express-validator";
import { cacheLayer } from "../services/cache/index.js";
import cloudinary from "../utils/cloudinary.js";

// دالة مساعدة لمسح جميع كاشات المناسبات (Best Practice)
const clearAllOccasionsCache = async () => {
  try {
    console.log("🔄 Clearing all occasions cache...");

    // مسح جميع استراتيجيات المناسبات
    const strategies = ["occasions", "occasions-active", "occasion-details"];

    for (const strategy of strategies) {
      await cacheLayer.clear(strategy, "*");
    }

    console.log("✅ All occasions cache cleared successfully");
  } catch (error) {
    console.error("❌ Error clearing occasions cache:", error.message);
  }
};

/**
 * جلب جميع المناسبات مع إمكانية الفلترة والترتيب
 */
export const getAllOccasions = async (req, res) => {
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
    let occasions;
    let totalCount;

    try {
      const cached = await cacheLayer.get("occasions", "all", cacheParams);
      if (cached) {
        return res.status(200).json({
          success: true,
          data: cached.occasions,
          pagination: cached.pagination,
          message: "تم جلب المناسبات بنجاح من الكاش",
        });
      }
    } catch (cacheError) {
      console.warn("خطأ في جلب البيانات من الكاش:", cacheError.message);
    }

    // جلب البيانات من قاعدة البيانات
    const [occasionsData, total] = await Promise.all([
      Occasion.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .populate("createdBy", "name email")
        .populate("updatedBy", "name email")
        .lean(),
      Occasion.countDocuments(query),
    ]);

    // تنسيق البيانات حسب اللغة
    const formattedOccasions = occasionsData.map((occasion) => ({
      _id: occasion._id,
      name: language === "ar" ? occasion.nameAr : occasion.nameEn,
      nameAr: occasion.nameAr,
      nameEn: occasion.nameEn,
      description:
        language === "ar" ? occasion.descriptionAr : occasion.descriptionEn,
      descriptionAr: occasion.descriptionAr,
      descriptionEn: occasion.descriptionEn,
      imageUrl: occasion.imageUrl,
      isActive: occasion.isActive,
      sortOrder: occasion.sortOrder,
      productCount: occasion.productCount,
      showInHomePage: occasion.showInHomePage,
      metaTitle:
        language === "ar" ? occasion.metaTitleAr : occasion.metaTitleEn,
      metaDescription:
        language === "ar"
          ? occasion.metaDescriptionAr
          : occasion.metaDescriptionEn,
      createdBy: occasion.createdBy,
      updatedBy: occasion.updatedBy,
      createdAt: occasion.createdAt,
      updatedAt: occasion.updatedAt,
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
      occasions: formattedOccasions,
      pagination,
    };

    // حفظ البيانات في الكاش لمدة 30 دقيقة
    try {
      await cacheLayer.set("occasions", "all", responseData, cacheParams, {
        ttl: 1800, // 30 دقيقة
      });
    } catch (cacheError) {
      console.warn("خطأ في حفظ البيانات في الكاش:", cacheError.message);
    }

    res.status(200).json({
      success: true,
      data: formattedOccasions,
      pagination,
      message: "تم جلب المناسبات بنجاح",
    });
  } catch (error) {
    console.error("خطأ في جلب المناسبات:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في جلب المناسبات",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * جلب مناسبة محددة بالمعرف
 */
export const getOccasionById = async (req, res) => {
  try {
    const { id } = req.params;
    const { language = "ar" } = req.query;

    const cacheKey = `occasion:${id}:${language}`;

    // محاولة جلب البيانات من الكاش
    try {
      const cachedOccasion = await cacheLayer.get(cacheKey);
      if (cachedOccasion) {
        return res.status(200).json({
          success: true,
          data: cachedOccasion,
          message: "تم جلب المناسبة بنجاح من الكاش",
        });
      }
    } catch (cacheError) {
      console.warn("خطأ في جلب البيانات من الكاش:", cacheError.message);
    }

    const occasion = await Occasion.findById(id)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .lean();

    if (!occasion) {
      return res.status(404).json({
        success: false,
        message: "المناسبة غير موجودة",
      });
    }

    // تنسيق البيانات حسب اللغة
    const formattedOccasion = {
      _id: occasion._id,
      name: language === "ar" ? occasion.nameAr : occasion.nameEn,
      nameAr: occasion.nameAr,
      nameEn: occasion.nameEn,
      description:
        language === "ar" ? occasion.descriptionAr : occasion.descriptionEn,
      descriptionAr: occasion.descriptionAr,
      descriptionEn: occasion.descriptionEn,
      imageUrl: occasion.imageUrl,
      isActive: occasion.isActive,
      sortOrder: occasion.sortOrder,
      productCount: occasion.productCount,
      showInHomePage: occasion.showInHomePage,
      metaTitle:
        language === "ar" ? occasion.metaTitleAr : occasion.metaTitleEn,
      metaDescription:
        language === "ar"
          ? occasion.metaDescriptionAr
          : occasion.metaDescriptionEn,
      createdBy: occasion.createdBy,
      updatedBy: occasion.updatedBy,
      createdAt: occasion.createdAt,
      updatedAt: occasion.updatedAt,
    };

    // حفظ البيانات في الكاش لمدة ساعة
    try {
      await cacheLayer.set(cacheKey, formattedOccasion, 3600);
    } catch (cacheError) {
      console.warn("خطأ في حفظ البيانات في الكاش:", cacheError.message);
    }

    res.status(200).json({
      success: true,
      data: formattedOccasion,
      message: "تم جلب المناسبة بنجاح",
    });
  } catch (error) {
    console.error("خطأ في جلب المناسبة:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في جلب المناسبة",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * إنشاء مناسبة جديدة (للمدير)
 */
export const createOccasion = async (req, res) => {
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

    // التحقق من عدم وجود مناسبة بنفس الاسم
    const existingOccasion = await Occasion.findOne({
      $or: [
        { nameAr: { $regex: new RegExp(`^${nameAr}$`, "i") } },
        { nameEn: { $regex: new RegExp(`^${nameEn}$`, "i") } },
      ],
    });

    if (existingOccasion) {
      return res.status(409).json({
        success: false,
        message: "يوجد مناسبة بنفس الاسم بالفعل",
      });
    }

    // إنشاء المناسبة الجديدة
    const newOccasion = new Occasion({
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

    await newOccasion.save();

    // مسح الكاش بعد إنشاء مناسبة جديدة
    await clearAllOccasionsCache();

    res.status(201).json({
      success: true,
      data: newOccasion,
      message: "تم إنشاء المناسبة بنجاح",
    });
  } catch (error) {
    console.error("خطأ في إنشاء المناسبة:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في إنشاء المناسبة",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * تحديث مناسبة موجودة (للمدير)
 */
export const updateOccasion = async (req, res) => {
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

    // التحقق من وجود المناسبة
    const existingOccasion = await Occasion.findById(id);
    if (!existingOccasion) {
      return res.status(404).json({
        success: false,
        message: "المناسبة غير موجودة",
      });
    }

    // التحقق من عدم وجود مناسبة أخرى بنفس الاسم (إذا تم تغيير الاسم)
    if (updateData.nameAr || updateData.nameEn) {
      const nameAr = updateData.nameAr || existingOccasion.nameAr;
      const nameEn = updateData.nameEn || existingOccasion.nameEn;

      const duplicateOccasion = await Occasion.findOne({
        _id: { $ne: id }, // استبعاد المناسبة الحالية
        $or: [
          { nameAr: { $regex: new RegExp(`^${nameAr}$`, "i") } },
          { nameEn: { $regex: new RegExp(`^${nameEn}$`, "i") } },
        ],
      });

      if (duplicateOccasion) {
        return res.status(409).json({
          success: false,
          message: "يوجد مناسبة أخرى بنفس الاسم بالفعل",
        });
      }
    }

    // إضافة معلومات التحديث
    updateData.updatedBy = req.admin._id;

    const occasion = await Occasion.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    // مسح الكاش المتعلق بالمناسبات
    try {
      await cacheLayer.clear("occasions", "*");
      await cacheLayer.clear(`occasion:${id}`, "*");
    } catch (cacheError) {
      console.warn("خطأ في مسح الكاش:", cacheError.message);
    }

    res.status(200).json({
      success: true,
      data: occasion,
      message: "تم تحديث المناسبة بنجاح",
    });
  } catch (error) {
    console.error("خطأ في تحديث المناسبة:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في تحديث المناسبة",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * حذف مناسبة (للمدير)
 */
export const deleteOccasion = async (req, res) => {
  try {
    const { id } = req.params;

    const occasion = await Occasion.findByIdAndDelete(id);

    if (!occasion) {
      return res.status(404).json({
        success: false,
        message: "المناسبة غير موجودة",
      });
    }

    // مسح الكاش المتعلق بالمناسبات
    try {
      await cacheLayer.clear("occasions", "*");
      await cacheLayer.clear(`occasion:${id}`, "*");
    } catch (cacheError) {
      console.warn("خطأ في مسح الكاش:", cacheError.message);
    }

    res.status(200).json({
      success: true,
      message: "تم حذف المناسبة بنجاح",
    });
  } catch (error) {
    console.error("خطأ في حذف المناسبة:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في حذف المناسبة",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * تفعيل/إلغاء تفعيل مناسبة (للمدير)
 */
export const toggleOccasionStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const occasion = await Occasion.findById(id);

    if (!occasion) {
      return res.status(404).json({
        success: false,
        message: "المناسبة غير موجودة",
      });
    }

    occasion.isActive = !occasion.isActive;
    occasion.updatedBy = req.admin._id;
    await occasion.save();

    // مسح الكاش المتعلق بالمناسبات
    try {
      await cacheLayer.clear("occasions", "*");
      await cacheLayer.clear(`occasion:${id}`, "*");
    } catch (cacheError) {
      console.warn("خطأ في مسح الكاش:", cacheError.message);
    }

    res.status(200).json({
      success: true,
      data: occasion,
      message: `تم ${
        occasion.isActive ? "تفعيل" : "إلغاء تفعيل"
      } المناسبة بنجاح`,
    });
  } catch (error) {
    console.error("خطأ في تغيير حالة المناسبة:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في تغيير حالة المناسبة",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * إعادة ترتيب المناسبات (للمدير)
 */
export const reorderOccasions = async (req, res) => {
  try {
    const { occasionOrders } = req.body;

    if (!Array.isArray(occasionOrders) || occasionOrders.length === 0) {
      return res.status(400).json({
        success: false,
        message: "قائمة ترتيب المناسبات مطلوبة",
      });
    }

    // التحقق من صحة البيانات
    for (const item of occasionOrders) {
      if (!item.occasionId || typeof item.sortOrder !== "number") {
        return res.status(400).json({
          success: false,
          message: "بيانات ترتيب المناسبات غير صحيحة",
        });
      }
    }

    await Occasion.reorderOccasions(occasionOrders);

    // مسح الكاش بعد إعادة ترتيب المناسبات
    await clearAllOccasionsCache();

    res.status(200).json({
      success: true,
      message: "تم إعادة ترتيب المناسبات بنجاح",
    });
  } catch (error) {
    console.error("خطأ في إعادة ترتيب المناسبات:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في إعادة ترتيب المناسبات",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * البحث في المناسبات
 */
export const searchOccasions = async (req, res) => {
  try {
    const { q: query, language = "ar", limit = 10, page = 1 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "استعلام البحث يجب أن يكون على الأقل حرفين",
      });
    }

    const searchResults = await Occasion.searchOccasions(
      query.trim(),
      language,
      { limit: parseInt(limit), page: parseInt(page) }
    );

    res.status(200).json({
      success: true,
      data: searchResults,
      message: "تم البحث في المناسبات بنجاح",
    });
  } catch (error) {
    console.error("خطأ في البحث في المناسبات:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في البحث في المناسبات",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * جلب المناسبات النشطة للعرض العام
 */
export const getActiveOccasions = async (req, res) => {
  try {
    const { language = "ar" } = req.query;

    const cacheKey = `active-occasions:${language}`;

    // محاولة جلب البيانات من الكاش
    try {
      const cachedOccasions = await cacheLayer.get(cacheKey);
      if (cachedOccasions) {
        return res.status(200).json({
          success: true,
          data: cachedOccasions,
          message: "تم جلب المناسبات النشطة بنجاح من الكاش",
        });
      }
    } catch (cacheError) {
      console.warn("خطأ في جلب البيانات من الكاش:", cacheError.message);
    }

    const occasions = await Occasion.getActiveOccasions(language);

    // حفظ البيانات في الكاش لمدة ساعة
    try {
      await cacheLayer.set(cacheKey, occasions, 3600);
    } catch (cacheError) {
      console.warn("خطأ في حفظ البيانات في الكاش:", cacheError.message);
    }

    res.status(200).json({
      success: true,
      data: occasions,
      message: "تم جلب المناسبات النشطة بنجاح",
    });
  } catch (error) {
    console.error("خطأ في جلب المناسبات النشطة:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في جلب المناسبات النشطة",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * رفع صورة المناسبة إلى Cloudinary
 */
export const uploadOccasionImage = async (req, res) => {
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
            folder: "occasions",
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

    // مسح كاش المناسبات بعد رفع صورة جديدة
    try {
      await cacheLayer.clear("occasions", "*");
    } catch (cacheError) {
      console.warn("خطأ في مسح الكاش:", cacheError.message);
    }

    res.status(200).json({
      success: true,
      message: "تم رفع صورة المناسبة بنجاح",
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
    console.error("خطأ في رفع صورة المناسبة:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في رفع الصورة",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * حذف صورة المناسبة من Cloudinary
 */
export const deleteOccasionImage = async (req, res) => {
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

    // مسح كاش المناسبات بعد حذف صورة
    try {
      await cacheLayer.clear("occasions", "*");
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
    console.error("خطأ في حذف صورة المناسبة:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في حذف الصورة",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * إنشاء مناسبة مع رفع صورة في نفس الوقت
 */
export const createOccasionWithImage = async (req, res) => {
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
                folder: "occasions",
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
        message: "صورة المناسبة مطلوبة",
      });
    }

    // التحقق من عدم وجود مناسبة بنفس الاسم
    const existingOccasion = await Occasion.findOne({
      $or: [
        { nameAr: { $regex: new RegExp(`^${nameAr}$`, "i") } },
        { nameEn: { $regex: new RegExp(`^${nameEn}$`, "i") } },
      ],
    });

    if (existingOccasion) {
      return res.status(409).json({
        success: false,
        message: "يوجد مناسبة بنفس الاسم بالفعل",
      });
    }

    // إنشاء المناسبة الجديدة
    const newOccasion = new Occasion({
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

    await newOccasion.save();

    // مسح الكاش بعد إنشاء مناسبة جديدة
    await clearAllOccasionsCache();

    res.status(201).json({
      success: true,
      data: newOccasion,
      message: "تم إنشاء المناسبة مع الصورة بنجاح",
    });
  } catch (error) {
    console.error("خطأ في إنشاء المناسبة مع الصورة:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في إنشاء المناسبة",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
