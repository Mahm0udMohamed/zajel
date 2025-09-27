// controllers/heroOccasionsController.js - النسخة المحدثة مع Cache Service الموحد
import HeroOccasion from "../models/HeroOccasion.js";
import { validationResult } from "express-validator";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import cacheManager from "../services/cacheManager.js";
import { cacheable, cacheInvalidate } from "../decorators/cacheDecorators.js";

// تسجيل namespace للـ Hero Occasions
cacheManager.registerNamespace("hero-occasions", {
  ttl: 3600, // ساعة واحدة افتراضياً
  compression: true,
  invalidationStrategy: "immediate",
  keyPrefix: "hero-occasions",
});

// تسجيل controller
cacheManager.registerController("heroOccasionsController", {
  namespace: "hero-occasions",
  ttl: 1800, // 30 دقيقة
  compression: true,
  invalidationStrategy: "immediate",
  keyPatterns: {
    active: "active:{limit}",
    upcoming: "upcoming:{limit}",
    all: "all:{page}:{limit}:{isActive}:{search}:{language}:{sortBy}:{sortOrder}",
    single: "single:{id}",
    search: "search:{query}:{language}:{limit}",
  },
});

// Cache TTL Constants
const CACHE_TTL = {
  ACTIVE: 2 * 60 * 60, // ساعتان
  UPCOMING: 4 * 60 * 60, // 4 ساعات
  ALL: 6 * 60 * 60, // 6 ساعات
  SINGLE: 12 * 60 * 60, // 12 ساعة
  SEARCH: 30 * 60, // 30 دقيقة
};

// دالة لرفع الصور إلى Cloudinary
const uploadImagesToCloudinary = async (images) => {
  const httpImages = [];
  const base64Images = [];
  const invalidImages = [];

  images.forEach((image, index) => {
    if (image.startsWith("http")) {
      httpImages.push({ image, index });
    } else if (image.startsWith("data:image")) {
      base64Images.push({ image, index });
    } else {
      console.warn("Invalid image URL:", image);
      invalidImages.push({ image, index });
    }
  });

  const uploadedImages = new Array(images.length);
  httpImages.forEach(({ image, index }) => {
    uploadedImages[index] = image;
  });

  if (base64Images.length > 0) {
    try {
      const uploadPromises = base64Images.map(async ({ image, index }) => {
        const result = await cloudinary.uploader.upload(image, {
          folder: "hero-occasions",
          resource_type: "image",
          quality: 100,
          fetch_format: "auto",
        });
        return { url: result.secure_url, index };
      });

      const results = await Promise.all(uploadPromises);
      results.forEach(({ url, index }) => {
        uploadedImages[index] = url;
      });
    } catch (error) {
      console.error("Error uploading images to Cloudinary:", error);
      throw new Error("فشل في رفع الصور");
    }
  }

  return uploadedImages.filter((image) => image !== undefined);
};

// دالة لرفع صورة واحدة إلى Cloudinary
export const uploadSingleImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "لم يتم رفع أي صورة",
      });
    }

    const result = await cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: "hero-occasions",
        quality: 100,
        fetch_format: "auto",
      },
      (error, result) => {
        if (error) {
          console.error("Error uploading to Cloudinary:", error);
          return res.status(500).json({
            success: false,
            message: "فشل في رفع الصورة",
            error: error.message,
          });
        }

        res.status(200).json({
          success: true,
          message: "تم رفع الصورة بنجاح",
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    result.end(req.file.buffer);
  } catch (error) {
    console.error("Error in uploadSingleImage:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في الخادم",
      error: error.message,
    });
  }
};

// ===== Cache Management APIs =====

// إحصائيات الكاش
export const getCacheStats = async (req, res) => {
  try {
    const stats = await cacheManager.getAllStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error getting cache stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get cache statistics",
      error: error.message,
    });
  }
};

// مسح الكاش يدوياً
export const clearCache = async (req, res) => {
  try {
    const { namespace, pattern } = req.query;

    let result;
    if (namespace) {
      result = await cacheManager.clearNamespace(namespace, pattern || "*");
    } else {
      // مسح جميع namespaces
      result = await cacheManager.clearNamespace("hero-occasions");
    }

    res.status(200).json({
      success: true,
      message: `تم مسح ${result} مفتاح من الكاش`,
      deletedKeys: result,
    });
  } catch (error) {
    console.error("Error clearing cache:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear cache",
      error: error.message,
    });
  }
};

// تشخيص Redis
export const diagnoseRedis = async (req, res) => {
  try {
    const testResult = await cacheManager.cacheService.testConnection();
    const stats = cacheManager.cacheService.getStats();

    res.status(200).json({
      success: true,
      data: {
        ...testResult,
        stats,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error diagnosing Redis:", error);
    res.status(500).json({
      success: false,
      message: "Failed to diagnose Redis",
      error: error.message,
    });
  }
};

// ===== CRUD Operations with Cache =====

// الحصول على جميع المناسبات
export const getAllOccasions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      isActive,
      search,
      language = "ar",
      sortBy = "date",
      sortOrder = "asc",
    } = req.query;

    // محاولة الحصول من الكاش
    const cacheKey = `all:${page}:${limit}:${isActive}:${search}:${language}:${sortBy}:${sortOrder}`;
    const cached = await cacheManager.get("hero-occasions", "all", {
      page,
      limit,
      isActive,
      search,
      language,
      sortBy,
      sortOrder,
    });

    if (cached) {
      return res.status(200).json({
        success: true,
        ...cached,
        cached: true,
        cacheKey: cacheKey,
      });
    }

    // Cache MISS - الحصول من قاعدة البيانات
    console.log(`🔄 Cache MISS for all occasions, fetching from database`);

    // بناء فلتر البحث
    let filter = {};

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    if (search) {
      const searchField = language === "en" ? "nameEn" : "nameAr";
      filter[searchField] = { $regex: search, $options: "i" };
    }

    // إعداد الترتيب
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    // حساب الصفحات
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // الحصول على البيانات
    const occasions = await HeroOccasion.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .lean();

    // حساب العدد الإجمالي
    const total = await HeroOccasion.countDocuments(filter);

    const responseData = {
      success: true,
      data: occasions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
      cached: false,
      cacheKey: cacheKey,
    };

    // حفظ في الكاش
    if (responseData.data && responseData.data.length > 0) {
      await cacheManager.set(
        "hero-occasions",
        "all",
        responseData,
        {
          page,
          limit,
          isActive,
          search,
          language,
          sortBy,
          sortOrder,
        },
        { ttl: CACHE_TTL.ALL }
      );
    }

    res.status(200).json(responseData);
  } catch (error) {
    console.error("خطأ في الحصول على المناسبات:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في الخادم",
      error: error.message,
    });
  }
};

// الحصول على مناسبة واحدة بالمعرف
export const getOccasionById = async (req, res) => {
  try {
    const { id } = req.params;

    // محاولة الحصول من الكاش
    const cached = await cacheManager.get("hero-occasions", "single", { id });

    if (cached) {
      return res.status(200).json({
        success: true,
        data: cached,
        cached: true,
        cacheKey: `single:${id}`,
      });
    }

    // Cache MISS - الحصول من قاعدة البيانات
    console.log(`🔄 Cache MISS for occasion by ID: ${id}`);

    const occasion = await HeroOccasion.findById(id)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!occasion) {
      return res.status(404).json({
        success: false,
        message: "المناسبة غير موجودة",
      });
    }

    // حفظ في الكاش
    await cacheManager.set(
      "hero-occasions",
      "single",
      occasion,
      { id },
      {
        ttl: CACHE_TTL.SINGLE,
      }
    );

    res.status(200).json({
      success: true,
      data: occasion,
      cached: false,
      cacheKey: `single:${id}`,
    });
  } catch (error) {
    console.error("خطأ في الحصول على المناسبة:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في الخادم",
      error: error.message,
    });
  }
};

// الحصول على المناسبات النشطة فقط
export const getActiveOccasions = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // محاولة الحصول من الكاش
    const cached = await cacheManager.get("hero-occasions", "active", {
      limit,
    });

    if (cached) {
      return res.status(200).json({
        success: true,
        data: cached,
        cached: true,
        cacheKey: `active:${limit}`,
      });
    }

    // Cache MISS - الحصول من قاعدة البيانات
    console.log(`🔄 Cache MISS for active occasions, fetching from database`);

    const occasions = await HeroOccasion.find({ isActive: true })
      .sort({ date: 1 })
      .limit(parseInt(limit));

    // حفظ في الكاش
    await cacheManager.set(
      "hero-occasions",
      "active",
      occasions,
      { limit },
      {
        ttl: CACHE_TTL.ACTIVE,
      }
    );

    res.status(200).json({
      success: true,
      data: occasions,
      cached: false,
      cacheKey: `active:${limit}`,
    });
  } catch (error) {
    console.error("خطأ في الحصول على المناسبات النشطة:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في الخادم",
      error: error.message,
    });
  }
};

// الحصول على المناسبات القادمة
export const getUpcomingOccasions = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    // محاولة الحصول من الكاش
    const cached = await cacheManager.get("hero-occasions", "upcoming", {
      limit,
    });

    if (cached) {
      return res.status(200).json({
        success: true,
        data: cached,
        cached: true,
        cacheKey: `upcoming:${limit}`,
      });
    }

    // Cache MISS - الحصول من قاعدة البيانات
    console.log(`🔄 Cache MISS for upcoming occasions, fetching from database`);

    const today = new Date();
    const occasions = await HeroOccasion.find({
      isActive: true,
      date: { $gte: today },
    })
      .sort({ date: 1 })
      .limit(parseInt(limit));

    // حفظ في الكاش
    await cacheManager.set(
      "hero-occasions",
      "upcoming",
      occasions,
      { limit },
      {
        ttl: CACHE_TTL.UPCOMING,
      }
    );

    res.status(200).json({
      success: true,
      data: occasions,
      cached: false,
      cacheKey: `upcoming:${limit}`,
    });
  } catch (error) {
    console.error("خطأ في الحصول على المناسبات القادمة:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في الخادم",
      error: error.message,
    });
  }
};

// البحث في المناسبات
export const searchOccasions = async (req, res) => {
  try {
    const { q, language = "ar", limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "يجب إدخال كلمة بحث مكونة من حرفين على الأقل",
      });
    }

    const searchQuery = q.trim();

    // محاولة الحصول من الكاش
    const cached = await cacheManager.get("hero-occasions", "search", {
      query: searchQuery,
      language,
      limit,
    });

    if (cached) {
      return res.status(200).json({
        success: true,
        data: cached,
        cached: true,
        cacheKey: `search:${searchQuery}:${language}:${limit}`,
      });
    }

    // Cache MISS - الحصول من قاعدة البيانات
    console.log(`🔄 Cache MISS for search, fetching from database`);

    const occasions = await HeroOccasion.searchOccasions(searchQuery, language);
    const limitedOccasions = occasions.slice(0, parseInt(limit));

    // حفظ في الكاش
    await cacheManager.set(
      "hero-occasions",
      "search",
      limitedOccasions,
      {
        query: searchQuery,
        language,
        limit,
      },
      { ttl: CACHE_TTL.SEARCH }
    );

    res.status(200).json({
      success: true,
      data: limitedOccasions,
      cached: false,
      cacheKey: `search:${searchQuery}:${language}:${limit}`,
    });
  } catch (error) {
    console.error("خطأ في البحث:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في الخادم",
      error: error.message,
    });
  }
};

// ===== Write Operations with Cache Invalidation =====

// إنشاء مناسبة جديدة
export const createOccasion = async (req, res) => {
  try {
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
      date,
      images,
      celebratoryMessageAr,
      celebratoryMessageEn,
      isActive = true,
    } = req.body;

    // رفع الصور إلى Cloudinary
    const uploadedImages = await uploadImagesToCloudinary(images);

    // إنشاء المناسبة الجديدة
    const newOccasion = new HeroOccasion({
      nameAr,
      nameEn,
      date: new Date(date),
      images: uploadedImages,
      celebratoryMessageAr,
      celebratoryMessageEn,
      isActive,
      createdBy: req.adminId,
    });

    await newOccasion.save();
    await newOccasion.populate("createdBy", "name email");

    // مسح الكاش بعد إنشاء مناسبة جديدة
    await cacheManager.invalidate("hero-occasions", "immediate");

    res.status(201).json({
      success: true,
      message: "تم إنشاء المناسبة بنجاح",
      data: newOccasion,
    });
  } catch (error) {
    console.error("خطأ في إنشاء المناسبة:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "بيانات غير صحيحة",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "يوجد مناسبة أخرى بنفس المعرف",
      });
    }

    res.status(500).json({
      success: false,
      message: "حدث خطأ في الخادم",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// تحديث مناسبة موجودة
export const updateOccasion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "بيانات غير صحيحة",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const updateData = { ...req.body, updatedBy: req.adminId };

    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }

    if (updateData.images) {
      updateData.images = await uploadImagesToCloudinary(updateData.images);
    }

    const occasion = await HeroOccasion.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!occasion) {
      return res.status(404).json({
        success: false,
        message: "المناسبة غير موجودة",
      });
    }

    // مسح الكاش بعد تحديث المناسبة
    await cacheManager.invalidate("hero-occasions", "immediate");

    res.status(200).json({
      success: true,
      message: "تم تحديث المناسبة بنجاح",
      data: occasion,
    });
  } catch (error) {
    console.error("خطأ في تحديث المناسبة:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "بيانات غير صحيحة",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "يوجد مناسبة أخرى بنفس المعرف",
      });
    }

    res.status(500).json({
      success: false,
      message: "حدث خطأ في الخادم",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// حذف مناسبة
export const deleteOccasion = async (req, res) => {
  try {
    const { id } = req.params;

    const occasion = await HeroOccasion.findByIdAndDelete(id);

    if (!occasion) {
      return res.status(404).json({
        success: false,
        message: "المناسبة غير موجودة",
      });
    }

    // مسح الكاش بعد حذف المناسبة
    await cacheManager.invalidate("hero-occasions", "immediate");

    res.status(200).json({
      success: true,
      message: "تم حذف المناسبة بنجاح",
    });
  } catch (error) {
    console.error("خطأ في حذف المناسبة:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في الخادم",
      error: error.message,
    });
  }
};

// تبديل حالة المناسبة
export const toggleOccasionStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const occasion = await HeroOccasion.findById(id);
    if (!occasion) {
      return res.status(404).json({
        success: false,
        message: "المناسبة غير موجودة",
      });
    }

    occasion.isActive = !occasion.isActive;
    occasion.updatedBy = req.adminId;
    await occasion.save();

    // مسح الكاش بعد تبديل حالة المناسبة
    await cacheManager.invalidate("hero-occasions", "immediate");

    res.status(200).json({
      success: true,
      message: `تم ${
        occasion.isActive ? "تفعيل" : "إلغاء تفعيل"
      } المناسبة بنجاح`,
      data: occasion,
    });
  } catch (error) {
    console.error("خطأ في تبديل حالة المناسبة:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في الخادم",
      error: error.message,
    });
  }
};

// استيراد البيانات من ملف JSON
export const importOccasions = async (req, res) => {
  try {
    const { occasions } = req.body;

    if (!Array.isArray(occasions)) {
      return res.status(400).json({
        success: false,
        message: "يجب أن تكون البيانات مصفوفة من المناسبات",
      });
    }

    const importedOccasions = [];
    const errors = [];

    for (const occasionData of occasions) {
      try {
        const existingOccasion = await HeroOccasion.findOne({
          id: occasionData.id,
        });
        if (existingOccasion) {
          errors.push(`المناسبة ${occasionData.id} موجودة بالفعل`);
          continue;
        }

        const newOccasion = new HeroOccasion({
          ...occasionData,
          date: new Date(occasionData.date),
          createdBy: req.adminId,
        });

        await newOccasion.save();
        importedOccasions.push(newOccasion);
      } catch (error) {
        errors.push(
          `خطأ في استيراد المناسبة ${occasionData.id}: ${error.message}`
        );
      }
    }

    // مسح الكاش بعد استيراد المناسبات
    await cacheManager.invalidate("hero-occasions", "immediate");

    res.status(200).json({
      success: true,
      message: `تم استيراد ${importedOccasions.length} مناسبة بنجاح`,
      data: importedOccasions,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("خطأ في استيراد المناسبات:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في الخادم",
      error: error.message,
    });
  }
};
