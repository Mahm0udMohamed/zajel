import Brand from "../models/Brand.js";
import { validationResult } from "express-validator";
import { cacheLayer } from "../services/cache/index.js";
import cloudinary from "../utils/cloudinary.js";

// دالة مساعدة لمسح جميع كاشات العلامات التجارية (Best Practice)
const clearAllBrandsCache = async () => {
  try {
    console.log("🔄 Clearing all brands cache...");

    // مسح جميع استراتيجيات العلامات التجارية
    const strategies = ["brands", "brands-active", "brand-details"];

    for (const strategy of strategies) {
      await cacheLayer.clear(strategy, "*");
    }

    console.log("✅ All brands cache cleared successfully");
  } catch (error) {
    console.error("❌ Error clearing brands cache:", error.message);
  }
};

/**
 * جلب جميع العلامات التجارية مع إمكانية الفلترة والترتيب
 */
export const getAllBrands = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      isActive,
      language = "ar",
      search,
      sortBy = "sortOrder",
      sortOrder = "asc",
    } = req.query;

    // بناء query object
    const query = {};

    if (isActive !== undefined) {
      query.isActive = isActive === "true";
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
    };

    // محاولة جلب البيانات من الكاش
    let brands;
    let totalCount;

    try {
      const cached = await cacheLayer.get("brands", "all", cacheParams);
      if (cached) {
        return res.status(200).json({
          success: true,
          data: cached.brands,
          pagination: cached.pagination,
          message: "تم جلب العلامات التجارية بنجاح من الكاش",
        });
      }
    } catch (cacheError) {
      console.warn("خطأ في جلب البيانات من الكاش:", cacheError.message);
    }

    // جلب البيانات من قاعدة البيانات
    const [brandsData, total] = await Promise.all([
      Brand.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .populate("createdBy", "name email")
        .populate("updatedBy", "name email")
        .lean(),
      Brand.countDocuments(query),
    ]);

    // تنسيق البيانات حسب اللغة
    const formattedBrands = brandsData.map((brand) => ({
      _id: brand._id,
      name: language === "ar" ? brand.nameAr : brand.nameEn,
      nameAr: brand.nameAr,
      nameEn: brand.nameEn,
      description:
        language === "ar" ? brand.descriptionAr : brand.descriptionEn,
      descriptionAr: brand.descriptionAr,
      descriptionEn: brand.descriptionEn,
      imageUrl: brand.imageUrl,
      isActive: brand.isActive,
      sortOrder: brand.sortOrder,
      productCount: brand.productCount,
      createdBy: brand.createdBy,
      updatedBy: brand.updatedBy,
      createdAt: brand.createdAt,
      updatedAt: brand.updatedAt,
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
      brands: formattedBrands,
      pagination,
    };

    // حفظ البيانات في الكاش لمدة 30 دقيقة
    try {
      await cacheLayer.set("brands", "all", responseData, cacheParams, {
        ttl: 1800, // 30 دقيقة
      });
    } catch (cacheError) {
      console.warn("خطأ في حفظ البيانات في الكاش:", cacheError.message);
    }

    res.status(200).json({
      success: true,
      data: formattedBrands,
      pagination,
      message: "تم جلب العلامات التجارية بنجاح",
    });
  } catch (error) {
    console.error("خطأ في جلب العلامات التجارية:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في جلب العلامات التجارية",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * جلب علامة تجارية محددة بالمعرف
 */
export const getBrandById = async (req, res) => {
  try {
    const { id } = req.params;
    const { language = "ar" } = req.query;

    const cacheKey = `brand:${id}:${language}`;

    // محاولة جلب البيانات من الكاش
    try {
      const cachedBrand = await cacheLayer.get(cacheKey);
      if (cachedBrand) {
        return res.status(200).json({
          success: true,
          data: cachedBrand,
          message: "تم جلب العلامة التجارية بنجاح من الكاش",
        });
      }
    } catch (cacheError) {
      console.warn("خطأ في جلب البيانات من الكاش:", cacheError.message);
    }

    const brand = await Brand.findById(id)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .lean();

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "العلامة التجارية غير موجودة",
      });
    }

    // تنسيق البيانات حسب اللغة
    const formattedBrand = {
      _id: brand._id,
      name: language === "ar" ? brand.nameAr : brand.nameEn,
      nameAr: brand.nameAr,
      nameEn: brand.nameEn,
      description:
        language === "ar" ? brand.descriptionAr : brand.descriptionEn,
      descriptionAr: brand.descriptionAr,
      descriptionEn: brand.descriptionEn,
      imageUrl: brand.imageUrl,
      isActive: brand.isActive,
      sortOrder: brand.sortOrder,
      productCount: brand.productCount,
      createdBy: brand.createdBy,
      updatedBy: brand.updatedBy,
      createdAt: brand.createdAt,
      updatedAt: brand.updatedAt,
    };

    // حفظ البيانات في الكاش لمدة ساعة
    try {
      await cacheLayer.set(cacheKey, formattedBrand, 3600);
    } catch (cacheError) {
      console.warn("خطأ في حفظ البيانات في الكاش:", cacheError.message);
    }

    res.status(200).json({
      success: true,
      data: formattedBrand,
      message: "تم جلب العلامة التجارية بنجاح",
    });
  } catch (error) {
    console.error("خطأ في جلب العلامة التجارية:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في جلب العلامة التجارية",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * إنشاء علامة تجارية جديدة (للمدير)
 */
export const createBrand = async (req, res) => {
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
    } = req.body;

    // التحقق من عدم وجود علامة تجارية بنفس الاسم
    const existingBrand = await Brand.findOne({
      $or: [
        { nameAr: { $regex: new RegExp(`^${nameAr}$`, "i") } },
        { nameEn: { $regex: new RegExp(`^${nameEn}$`, "i") } },
      ],
    });

    if (existingBrand) {
      return res.status(409).json({
        success: false,
        message: "يوجد علامة تجارية بنفس الاسم بالفعل",
      });
    }

    // إنشاء العلامة التجارية الجديدة
    const newBrand = new Brand({
      nameAr,
      nameEn,
      descriptionAr,
      descriptionEn,
      imageUrl,
      isActive,
      sortOrder,
      createdBy: req.admin._id,
    });

    await newBrand.save();

    // مسح الكاش بعد إنشاء علامة تجارية جديدة
    await clearAllBrandsCache();

    res.status(201).json({
      success: true,
      data: newBrand,
      message: "تم إنشاء العلامة التجارية بنجاح",
    });
  } catch (error) {
    console.error("خطأ في إنشاء العلامة التجارية:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في إنشاء العلامة التجارية",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * تحديث علامة تجارية موجودة (للمدير)
 */
export const updateBrand = async (req, res) => {
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

    // التحقق من وجود العلامة التجارية
    const existingBrand = await Brand.findById(id);
    if (!existingBrand) {
      return res.status(404).json({
        success: false,
        message: "العلامة التجارية غير موجودة",
      });
    }

    // التحقق من عدم وجود علامة تجارية أخرى بنفس الاسم (إذا تم تغيير الاسم)
    if (updateData.nameAr || updateData.nameEn) {
      const nameAr = updateData.nameAr || existingBrand.nameAr;
      const nameEn = updateData.nameEn || existingBrand.nameEn;

      const duplicateBrand = await Brand.findOne({
        _id: { $ne: id }, // استبعاد العلامة التجارية الحالية
        $or: [
          { nameAr: { $regex: new RegExp(`^${nameAr}$`, "i") } },
          { nameEn: { $regex: new RegExp(`^${nameEn}$`, "i") } },
        ],
      });

      if (duplicateBrand) {
        return res.status(409).json({
          success: false,
          message: "يوجد علامة تجارية أخرى بنفس الاسم بالفعل",
        });
      }
    }

    // إضافة معلومات التحديث
    updateData.updatedBy = req.admin._id;

    const brand = await Brand.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    // مسح الكاش المتعلق بالعلامات التجارية
    try {
      await cacheLayer.clear("brands", "*");
      await cacheLayer.clear(`brand:${id}`, "*");
    } catch (cacheError) {
      console.warn("خطأ في مسح الكاش:", cacheError.message);
    }

    res.status(200).json({
      success: true,
      data: brand,
      message: "تم تحديث العلامة التجارية بنجاح",
    });
  } catch (error) {
    console.error("خطأ في تحديث العلامة التجارية:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في تحديث العلامة التجارية",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * حذف علامة تجارية (للمدير)
 */
export const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await Brand.findByIdAndDelete(id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "العلامة التجارية غير موجودة",
      });
    }

    // مسح الكاش المتعلق بالعلامات التجارية
    try {
      await cacheLayer.clear("brands", "*");
      await cacheLayer.clear(`brand:${id}`, "*");
    } catch (cacheError) {
      console.warn("خطأ في مسح الكاش:", cacheError.message);
    }

    res.status(200).json({
      success: true,
      message: "تم حذف العلامة التجارية بنجاح",
    });
  } catch (error) {
    console.error("خطأ في حذف العلامة التجارية:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في حذف العلامة التجارية",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * تفعيل/إلغاء تفعيل علامة تجارية (للمدير)
 */
export const toggleBrandStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await Brand.findById(id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "العلامة التجارية غير موجودة",
      });
    }

    brand.isActive = !brand.isActive;
    brand.updatedBy = req.admin._id;
    await brand.save();

    // مسح الكاش المتعلق بالعلامات التجارية
    try {
      await cacheLayer.clear("brands", "*");
      await cacheLayer.clear(`brand:${id}`, "*");
    } catch (cacheError) {
      console.warn("خطأ في مسح الكاش:", cacheError.message);
    }

    res.status(200).json({
      success: true,
      data: brand,
      message: `تم ${
        brand.isActive ? "تفعيل" : "إلغاء تفعيل"
      } العلامة التجارية بنجاح`,
    });
  } catch (error) {
    console.error("خطأ في تغيير حالة العلامة التجارية:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في تغيير حالة العلامة التجارية",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * إعادة ترتيب العلامات التجارية (للمدير)
 */
export const reorderBrands = async (req, res) => {
  try {
    const { brandOrders } = req.body;

    if (!Array.isArray(brandOrders) || brandOrders.length === 0) {
      return res.status(400).json({
        success: false,
        message: "قائمة ترتيب العلامات التجارية مطلوبة",
      });
    }

    // التحقق من صحة البيانات
    for (const item of brandOrders) {
      if (!item.brandId || typeof item.sortOrder !== "number") {
        return res.status(400).json({
          success: false,
          message: "بيانات ترتيب العلامات التجارية غير صحيحة",
        });
      }
    }

    await Brand.reorderBrands(brandOrders);

    // مسح الكاش بعد إعادة ترتيب العلامات التجارية
    await clearAllBrandsCache();

    res.status(200).json({
      success: true,
      message: "تم إعادة ترتيب العلامات التجارية بنجاح",
    });
  } catch (error) {
    console.error("خطأ في إعادة ترتيب العلامات التجارية:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في إعادة ترتيب العلامات التجارية",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * البحث في العلامات التجارية
 */
export const searchBrands = async (req, res) => {
  try {
    const { q: query, language = "ar", limit = 10, page = 1 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "استعلام البحث يجب أن يكون على الأقل حرفين",
      });
    }

    const searchResults = await Brand.searchBrands(query.trim(), language, {
      limit: parseInt(limit),
      page: parseInt(page),
    });

    res.status(200).json({
      success: true,
      data: searchResults,
      message: "تم البحث في العلامات التجارية بنجاح",
    });
  } catch (error) {
    console.error("خطأ في البحث في العلامات التجارية:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في البحث في العلامات التجارية",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * جلب العلامات التجارية النشطة للعرض العام
 */
export const getActiveBrands = async (req, res) => {
  try {
    const { language = "ar" } = req.query;

    const cacheKey = `active-brands:${language}`;

    // محاولة جلب البيانات من الكاش
    try {
      const cachedBrands = await cacheLayer.get(cacheKey);
      if (cachedBrands) {
        return res.status(200).json({
          success: true,
          data: cachedBrands,
          message: "تم جلب العلامات التجارية النشطة بنجاح من الكاش",
        });
      }
    } catch (cacheError) {
      console.warn("خطأ في جلب البيانات من الكاش:", cacheError.message);
    }

    const brands = await Brand.getActiveBrands(language);

    // حفظ البيانات في الكاش لمدة ساعة
    try {
      await cacheLayer.set(cacheKey, brands, 3600);
    } catch (cacheError) {
      console.warn("خطأ في حفظ البيانات في الكاش:", cacheError.message);
    }

    res.status(200).json({
      success: true,
      data: brands,
      message: "تم جلب العلامات التجارية النشطة بنجاح",
    });
  } catch (error) {
    console.error("خطأ في جلب العلامات التجارية النشطة:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في جلب العلامات التجارية النشطة",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * رفع صورة العلامة التجارية إلى Cloudinary
 */
export const uploadBrandImage = async (req, res) => {
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
            folder: "brands",
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

    // مسح كاش العلامات التجارية بعد رفع صورة جديدة
    try {
      await cacheLayer.clear("brands", "*");
    } catch (cacheError) {
      console.warn("خطأ في مسح الكاش:", cacheError.message);
    }

    res.status(200).json({
      success: true,
      message: "تم رفع صورة العلامة التجارية بنجاح",
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
    console.error("خطأ في رفع صورة العلامة التجارية:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في رفع الصورة",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * حذف صورة العلامة التجارية من Cloudinary
 */
export const deleteBrandImage = async (req, res) => {
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

    // مسح كاش العلامات التجارية بعد حذف صورة
    try {
      await cacheLayer.clear("brands", "*");
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
    console.error("خطأ في حذف صورة العلامة التجارية:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في حذف الصورة",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * إنشاء علامة تجارية مع رفع صورة في نفس الوقت
 */
export const createBrandWithImage = async (req, res) => {
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
                folder: "brands",
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
        message: "صورة العلامة التجارية مطلوبة",
      });
    }

    // التحقق من عدم وجود علامة تجارية بنفس الاسم
    const existingBrand = await Brand.findOne({
      $or: [
        { nameAr: { $regex: new RegExp(`^${nameAr}$`, "i") } },
        { nameEn: { $regex: new RegExp(`^${nameEn}$`, "i") } },
      ],
    });

    if (existingBrand) {
      return res.status(409).json({
        success: false,
        message: "يوجد علامة تجارية بنفس الاسم بالفعل",
      });
    }

    // إنشاء العلامة التجارية الجديدة
    const newBrand = new Brand({
      nameAr,
      nameEn,
      descriptionAr,
      descriptionEn,
      imageUrl,
      isActive,
      sortOrder,
      createdBy: req.admin._id,
    });

    await newBrand.save();

    // مسح الكاش بعد إنشاء علامة تجارية جديدة
    await clearAllBrandsCache();

    res.status(201).json({
      success: true,
      data: newBrand,
      message: "تم إنشاء العلامة التجارية مع الصورة بنجاح",
    });
  } catch (error) {
    console.error("خطأ في إنشاء العلامة التجارية مع الصورة:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في إنشاء العلامة التجارية",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
