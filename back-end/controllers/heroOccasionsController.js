// controllers/heroOccasionsController.js - النسخة المحدثة مع Cache Layer/Service الموحد
import HeroOccasion from "../models/HeroOccasion.js";
import { validationResult } from "express-validator";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import {
  cacheLayer,
  cacheMiddleware,
  cacheDecorators,
} from "../services/cache/index.js";

// دالة مساعدة لمسح جميع كاشات المناسبات (Best Practice)
const clearAllOccasionsCache = async () => {
  try {
    console.log("🔄 Clearing all occasions cache...");

    // مسح جميع استراتيجيات المناسبات
    const strategies = [
      "hero-occasions",
      "hero-occasions-active",
      "hero-occasions-upcoming",
      "hero-occasions-search",
    ];

    for (const strategy of strategies) {
      await cacheLayer.clear(strategy, "*");
    }

    console.log("✅ All occasions cache cleared successfully");
  } catch (error) {
    console.error("❌ Error clearing occasions cache:", error.message);
  }
};

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
    const stats = cacheLayer.getStats();
    const health = await cacheLayer.getHealth();

    res.status(200).json({
      success: true,
      data: {
        stats,
        health,
        timestamp: new Date().toISOString(),
      },
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
    const { strategy, pattern } = req.query;

    let result;
    if (strategy) {
      result = await cacheLayer.clear(strategy, pattern || "*");
    } else {
      // مسح جميع الاستراتيجيات
      result = await cacheLayer.clear("hero-occasions", "*");
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
    const testResult = await cacheLayer.cacheService.testConnection();
    const stats = cacheLayer.getStats();
    const health = await cacheLayer.getHealth();

    res.status(200).json({
      success: true,
      data: {
        ...testResult,
        stats,
        health,
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

// الحصول على جميع المناسبات مع ضمان دقة البيانات
// الحصول على جميع المناسبات (Cache-Aside Pattern)
export const getAllOccasions = async (req, res) => {
  try {
    // تحديث المناسبات المنتهية تلقائياً قبل كل طلب
    await checkAndUpdateExpiredOccasions();

    const {
      page = 1,
      limit = 10,
      isActive,
      search,
      language = "ar",
      sortBy = "startDate",
      sortOrder = "asc",
    } = req.query;

    const params = {
      page,
      limit,
      isActive,
      search,
      language,
      sortBy,
      sortOrder,
    };

    // 1. محاولة الحصول من الكاش
    const cached = await cacheLayer.get("hero-occasions", "all", params);

    if (cached) {
      console.log("✅ Data retrieved from cache");
      return res.status(200).json({
        ...cached,
        cached: true,
        timestamp: new Date().toISOString(),
      });
    }

    // 2. Cache MISS - جلب من قاعدة البيانات
    console.log("🔄 Cache MISS - fetching from database");

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
      cacheStrategy: "hero-occasions",
      timestamp: new Date().toISOString(),
    };

    // 3. حفظ في الكاش
    await cacheLayer.set("hero-occasions", "all", responseData, params, {
      ttl: CACHE_TTL.ALL,
    });

    console.log("✅ Data cached successfully");
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

// الحصول على مناسبة واحدة بالمعرف (Cache-Aside Pattern)
export const getOccasionById = async (req, res) => {
  try {
    const { id } = req.params;
    const params = { id };

    // 1. محاولة الحصول من الكاش
    const cached = await cacheLayer.get("hero-occasions", "single", params);

    if (cached) {
      console.log("✅ Data retrieved from cache");
      return res.status(200).json({
        ...cached,
        cached: true,
        timestamp: new Date().toISOString(),
      });
    }

    // 2. Cache MISS - جلب من قاعدة البيانات
    console.log(
      `🔄 Cache MISS - fetching from database for occasion ID: ${id}`
    );

    const occasion = await HeroOccasion.findById(id)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!occasion) {
      return res.status(404).json({
        success: false,
        message: "المناسبة غير موجودة",
        cached: false,
      });
    }

    const responseData = {
      success: true,
      data: occasion,
      cached: false,
      cacheStrategy: "hero-occasions",
      timestamp: new Date().toISOString(),
    };

    // 3. حفظ في الكاش
    await cacheLayer.set("hero-occasions", "single", responseData, params, {
      ttl: CACHE_TTL.SINGLE,
    });

    console.log("✅ Data cached successfully");
    res.status(200).json(responseData);
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
    // تحديث المناسبات المنتهية تلقائياً قبل كل طلب
    await checkAndUpdateExpiredOccasions();

    const { limit = 10 } = req.query;

    // محاولة الحصول من الكاش
    const cached = await cacheLayer.get("hero-occasions-active", "list", {
      limit,
    });

    if (cached) {
      return res.status(200).json({
        success: true,
        data: cached,
        cached: true,
        cacheStrategy: "hero-occasions-active",
      });
    }

    // Cache MISS - الحصول من قاعدة البيانات
    console.log(`🔄 Cache MISS for active occasions, fetching from database`);

    const occasions = await HeroOccasion.find({ isActive: true })
      .sort({ startDate: 1 })
      .limit(parseInt(limit));

    // حفظ في الكاش
    await cacheLayer.set(
      "hero-occasions-active",
      "list",
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
      cacheStrategy: "hero-occasions-active",
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

// الحصول على المناسبات القادمة (فقط المناسبات التي لم تبدأ بعد)
export const getUpcomingOccasions = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    // محاولة الحصول من الكاش
    const cached = await cacheLayer.get("hero-occasions-upcoming", "list", {
      limit,
    });

    if (cached) {
      return res.status(200).json({
        success: true,
        data: cached,
        cached: true,
        cacheStrategy: "hero-occasions-upcoming",
      });
    }

    // Cache MISS - الحصول من قاعدة البيانات
    console.log(`🔄 Cache MISS for upcoming occasions, fetching from database`);

    const now = new Date();
    const occasions = await HeroOccasion.find({
      isActive: true,
      startDate: { $gt: now }, // فقط المناسبات القادمة
    })
      .sort({ startDate: 1 })
      .limit(parseInt(limit));

    // حفظ في الكاش
    await cacheLayer.set(
      "hero-occasions-upcoming",
      "list",
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
      cacheStrategy: "hero-occasions-upcoming",
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

// الحصول على المناسبات الحالية (مناسبة نشطة واحدة أو القادمة)
export const getCurrentOccasions = async (req, res) => {
  try {
    const { limit = 1 } = req.query; // افتراضياً مناسبة واحدة فقط

    // محاولة الحصول من الكاش
    const cached = await cacheLayer.get("hero-occasions-current", "list", {
      limit,
    });

    if (cached) {
      return res.status(200).json({
        success: true,
        data: cached,
        cached: true,
        cacheStrategy: "hero-occasions-current",
      });
    }

    // Cache MISS - الحصول من قاعدة البيانات
    console.log(`🔄 Cache MISS for current occasions, fetching from database`);

    const now = new Date();
    let occasions = [];

    // أولاً: البحث عن مناسبة نشطة حالياً
    const activeOccasions = await HeroOccasion.find({
      isActive: true,
      startDate: { $lte: now }, // بدأت بالفعل
      endDate: { $gt: now }, // لم تنته بعد
    })
      .sort({ startDate: 1 })
      .limit(1);

    if (activeOccasions.length > 0) {
      // إذا وجدت مناسبة نشطة، أرسلها
      occasions = activeOccasions;
      console.log(`✅ Found active occasion: ${activeOccasions[0].nameAr}`);
    } else {
      // إذا لم توجد مناسبة نشطة، ابحث عن القادمة
      const upcomingOccasions = await HeroOccasion.find({
        isActive: true,
        startDate: { $gt: now }, // لم تبدأ بعد
      })
        .sort({ startDate: 1 })
        .limit(1);

      occasions = upcomingOccasions;
      if (upcomingOccasions.length > 0) {
        console.log(
          `✅ Found upcoming occasion: ${upcomingOccasions[0].nameAr}`
        );
      } else {
        console.log(`ℹ️ No active or upcoming occasions found`);
      }
    }

    // حفظ في الكاش
    await cacheLayer.set(
      "hero-occasions-current",
      "list",
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
      cacheStrategy: "hero-occasions-current",
    });
  } catch (error) {
    console.error("خطأ في الحصول على المناسبات الحالية:", error);
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
    const cached = await cacheLayer.get("hero-occasions", "search", {
      query: searchQuery,
      language,
      limit,
    });

    if (cached) {
      return res.status(200).json({
        success: true,
        data: cached,
        cached: true,
        cacheStrategy: "hero-occasions",
      });
    }

    // Cache MISS - الحصول من قاعدة البيانات
    console.log(`🔄 Cache MISS for search, fetching from database`);

    // استخدام isActive فقط في البحث
    const searchField = language === "en" ? "nameEn" : "nameAr";
    const occasions = await HeroOccasion.find({
      isActive: true,
      [searchField]: { $regex: searchQuery, $options: "i" },
    }).sort({ startDate: 1, createdAt: -1 });
    const limitedOccasions = occasions.slice(0, parseInt(limit));

    // حفظ في الكاش
    await cacheLayer.set(
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
      cacheStrategy: "hero-occasions",
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

// ===== Auto-Update Expired Occasions =====

// دالة بسيطة لتحديث المناسبات المنتهية
export const checkAndUpdateExpiredOccasions = async () => {
  try {
    const now = new Date();

    // إنشاء تاريخ نهاية اليوم الحالي (23:59:59.999)
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    // تحديث المناسبات المنتهية - يجب أن تكون endDate أقل من بداية اليوم التالي
    // وليس فقط أقل من الوقت الحالي. هذا يضمن أن المناسبات تبقى نشطة حتى 23:59:59
    const startOfTomorrow = new Date(now);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    startOfTomorrow.setHours(0, 0, 0, 0);

    const result = await HeroOccasion.updateMany(
      {
        isActive: true,
        endDate: { $lt: startOfTomorrow },
      },
      {
        $set: {
          isActive: false,
          updatedAt: now,
        },
      }
    );

    // مسح الكاش فقط إذا تم تحديث شيء
    if (result.modifiedCount > 0) {
      await clearAllOccasionsCache();
      console.log(`✅ Auto-updated ${result.modifiedCount} expired occasions`);
    }

    return result.modifiedCount;
  } catch (error) {
    console.error("❌ Error auto-updating expired occasions:", error);
    return 0;
  }
};

// دالة للتحقق من التواريخ المتداخلة
const checkDateOverlap = async (startDate, endDate, excludeId = null) => {
  const query = {
    isActive: true,
    $or: [
      // المناسبة الجديدة تبدأ داخل فترة مناسبة موجودة
      {
        startDate: { $lte: startDate },
        endDate: { $gte: startDate },
      },
      // المناسبة الجديدة تنتهي داخل فترة مناسبة موجودة
      {
        startDate: { $lte: endDate },
        endDate: { $gte: endDate },
      },
      // المناسبة الجديدة تحتوي على مناسبة موجودة بالكامل
      {
        startDate: { $gte: startDate },
        endDate: { $lte: endDate },
      },
    ],
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const overlappingOccasions = await HeroOccasion.find(query);
  return overlappingOccasions;
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
      startDate,
      endDate,
      images,
      celebratoryMessageAr,
      celebratoryMessageEn,
      isActive = true,
    } = req.body;

    // التحقق من عدم وجود مناسبة بنفس الاسم
    const existingOccasion = await HeroOccasion.findOne({
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

    // التحقق من التواريخ المتداخلة
    const overlappingOccasions = await checkDateOverlap(startDate, endDate);
    if (overlappingOccasions.length > 0) {
      return res.status(400).json({
        success: false,
        message: "يوجد مناسبة أخرى في نفس الفترة الزمنية",
        overlappingOccasions: overlappingOccasions.map((occ) => ({
          nameAr: occ.nameAr,
          nameEn: occ.nameEn,
          startDate: occ.startDate,
          endDate: occ.endDate,
        })),
      });
    }

    // رفع الصور إلى Cloudinary
    const uploadedImages = await uploadImagesToCloudinary(images);

    // إنشاء المناسبة الجديدة
    const newOccasion = new HeroOccasion({
      nameAr,
      nameEn,
      startDate: (() => {
        const startDateObj = new Date(startDate);
        startDateObj.setUTCHours(0, 0, 0, 0);
        return startDateObj;
      })(),
      endDate: (() => {
        const endDateObj = new Date(endDate);
        endDateObj.setUTCHours(23, 59, 59, 999);
        return endDateObj;
      })(),
      images: uploadedImages,
      celebratoryMessageAr,
      celebratoryMessageEn,
      isActive,
      createdBy: req.adminId,
    });

    await newOccasion.save();
    await newOccasion.populate("createdBy", "name email");

    // التحقق من انتهاء المناسبات بعد إنشاء مناسبة جديدة
    await checkAndUpdateExpiredOccasions();

    // مسح الكاش بعد إنشاء مناسبة جديدة
    await clearAllOccasionsCache();

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

    // التحقق من وجود المناسبة
    const currentOccasion = await HeroOccasion.findById(id);
    if (!currentOccasion) {
      return res.status(404).json({
        success: false,
        message: "المناسبة غير موجودة",
      });
    }

    // التحقق من عدم وجود مناسبة أخرى بنفس الاسم (إذا تم تغيير الاسم)
    if (updateData.nameAr || updateData.nameEn) {
      const nameAr = updateData.nameAr || currentOccasion.nameAr;
      const nameEn = updateData.nameEn || currentOccasion.nameEn;

      const duplicateOccasion = await HeroOccasion.findOne({
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

    // التحقق من التواريخ المتداخلة إذا تم تحديث التواريخ
    if (updateData.startDate || updateData.endDate) {
      const startDate = updateData.startDate || currentOccasion.startDate;
      const endDate = updateData.endDate || currentOccasion.endDate;

      const overlappingOccasions = await checkDateOverlap(
        startDate,
        endDate,
        id
      );
      if (overlappingOccasions.length > 0) {
        return res.status(400).json({
          success: false,
          message: "يوجد مناسبة أخرى في نفس الفترة الزمنية",
          overlappingOccasions: overlappingOccasions.map((occ) => ({
            nameAr: occ.nameAr,
            nameEn: occ.nameEn,
            startDate: occ.startDate,
            endDate: occ.endDate,
          })),
        });
      }
    }

    if (updateData.startDate) {
      const startDate = new Date(updateData.startDate);
      startDate.setUTCHours(0, 0, 0, 0);
      updateData.startDate = startDate;
    }

    if (updateData.endDate) {
      const endDate = new Date(updateData.endDate);
      endDate.setUTCHours(23, 59, 59, 999);
      updateData.endDate = endDate;
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

    // التحقق من انتهاء المناسبة بعد التحديث
    await checkAndUpdateExpiredOccasions();

    // مسح الكاش بعد تحديث المناسبة
    await clearAllOccasionsCache();

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
    await clearAllOccasionsCache();

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
    await clearAllOccasionsCache();

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
          date: (() => {
            const dateObj = new Date(occasionData.date);
            dateObj.setUTCHours(0, 0, 0, 0);
            return dateObj;
          })(),
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
    await clearAllOccasionsCache();

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
