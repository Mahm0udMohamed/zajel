// controllers/heroPromotionsController.js - النسخة المحدثة مع Cache Layer/Service الموحد
import HeroPromotion from "../models/HeroPromotion.js";
import { validationResult } from "express-validator";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import {
  cacheLayer,
  cacheMiddleware,
  cacheDecorators,
} from "../services/cache/index.js";

// دالة مساعدة لمسح جميع كاشات العروض الترويجية (Best Practice)
const clearAllPromotionsCache = async () => {
  try {
    console.log("🔄 Clearing all promotions cache...");

    // مسح جميع استراتيجيات العروض الترويجية
    const strategies = [
      "hero-promotions",
      "hero-promotions-active",
      "hero-promotions-upcoming",
      "hero-promotions-search",
    ];

    for (const strategy of strategies) {
      await cacheLayer.clear(strategy, "*");
    }

    console.log("✅ All promotions cache cleared successfully");
  } catch (error) {
    console.error("❌ Error clearing promotions cache:", error.message);
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

// دالة لرفع الصورة إلى Cloudinary
export const uploadPromotionImage = async (req, res) => {
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
        folder: "hero-promotions",
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
    console.error("Error in uploadPromotionImage:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في الخادم",
      error: error.message,
    });
  }
};

// ===== Auto-Update Expired Promotions =====

// دالة بسيطة لتحديث العروض المنتهية
export const checkAndUpdateExpiredPromotions = async () => {
  try {
    const now = new Date();

    // تحديث العروض المنتهية مباشرة
    const result = await HeroPromotion.updateMany(
      {
        isActive: true,
        endDate: { $lt: now },
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
      await clearAllPromotionsCache();
      console.log(`✅ Auto-updated ${result.modifiedCount} expired promotions`);
    }

    return result.modifiedCount;
  } catch (error) {
    console.error("❌ Error auto-updating expired promotions:", error);
    return 0;
  }
};

// دالة للحصول على إحصائيات العروض
export const getPromotionsStats = async () => {
  try {
    const now = new Date();

    const [total, active, expired, upcoming] = await Promise.all([
      HeroPromotion.countDocuments(),
      HeroPromotion.countDocuments({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
      }),
      HeroPromotion.countDocuments({
        endDate: { $lt: now },
      }),
      HeroPromotion.countDocuments({
        isActive: true,
        startDate: { $gt: now },
      }),
    ]);

    return {
      total,
      active,
      expired,
      upcoming,
      timestamp: now.toISOString(),
    };
  } catch (error) {
    console.error("Error getting promotions stats:", error);
    throw error;
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
      result = await cacheLayer.clear("hero-promotions", "*");
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

// الحصول على جميع العروض الترويجية (Cache-Aside Pattern)
export const getAllPromotions = async (req, res) => {
  try {
    // تحديث العروض المنتهية تلقائياً قبل كل طلب
    await checkAndUpdateExpiredPromotions();

    const {
      page = 1,
      limit = 10,
      isActive,
      search,
      language = "ar",
      sortBy = "priority",
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
    const cached = await cacheLayer.get("hero-promotions", "all", params);

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
      const searchField = language === "en" ? "titleEn" : "titleAr";
      filter[searchField] = { $regex: search, $options: "i" };
    }

    // إعداد الترتيب
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    // حساب الصفحات
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // الحصول على البيانات
    const promotions = await HeroPromotion.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .lean();

    // حساب العدد الإجمالي
    const total = await HeroPromotion.countDocuments(filter);

    const responseData = {
      success: true,
      data: promotions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
      cached: false,
      cacheStrategy: "hero-promotions",
      timestamp: new Date().toISOString(),
    };

    // 3. حفظ في الكاش
    await cacheLayer.set("hero-promotions", "all", responseData, params, {
      ttl: CACHE_TTL.ALL,
    });

    console.log("✅ Data cached successfully");
    res.status(200).json(responseData);
  } catch (error) {
    console.error("خطأ في الحصول على العروض الترويجية:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في الخادم",
      error: error.message,
    });
  }
};

// الحصول على عرض ترويجي واحد بالمعرف (Cache-Aside Pattern)
export const getPromotionById = async (req, res) => {
  try {
    const { id } = req.params;
    const params = { id };

    // 1. محاولة الحصول من الكاش
    const cached = await cacheLayer.get("hero-promotions", "single", params);

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
      `🔄 Cache MISS - fetching from database for promotion ID: ${id}`
    );

    const promotion = await HeroPromotion.findById(id)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: "العرض الترويجي غير موجود",
        cached: false,
      });
    }

    const responseData = {
      success: true,
      data: promotion,
      cached: false,
      cacheStrategy: "hero-promotions",
      timestamp: new Date().toISOString(),
    };

    // 3. حفظ في الكاش
    await cacheLayer.set("hero-promotions", "single", responseData, params, {
      ttl: CACHE_TTL.SINGLE,
    });

    console.log("✅ Data cached successfully");
    res.status(200).json(responseData);
  } catch (error) {
    console.error("خطأ في الحصول على العرض الترويجي:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في الخادم",
      error: error.message,
    });
  }
};

// الحصول على العروض الترويجية النشطة فقط
export const getActivePromotions = async (req, res) => {
  try {
    // تحديث العروض المنتهية تلقائياً قبل كل طلب
    await checkAndUpdateExpiredPromotions();

    const { limit = 10 } = req.query;

    // محاولة الحصول من الكاش
    const cached = await cacheLayer.get("hero-promotions-active", "list", {
      limit,
    });

    if (cached) {
      return res.status(200).json({
        success: true,
        data: cached,
        cached: true,
        cacheStrategy: "hero-promotions-active",
      });
    }

    // Cache MISS - الحصول من قاعدة البيانات
    console.log(`🔄 Cache MISS for active promotions, fetching from database`);

    // استخدام isActive فقط بدلاً من فلترة التواريخ
    const promotions = await HeroPromotion.find({
      isActive: true,
    })
      .sort({ priority: 1, createdAt: -1 })
      .limit(parseInt(limit));

    // حفظ في الكاش
    await cacheLayer.set(
      "hero-promotions-active",
      "list",
      promotions,
      { limit },
      {
        ttl: CACHE_TTL.ACTIVE,
      }
    );

    res.status(200).json({
      success: true,
      data: promotions,
      cached: false,
      cacheStrategy: "hero-promotions-active",
    });
  } catch (error) {
    console.error("خطأ في الحصول على العروض الترويجية النشطة:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في الخادم",
      error: error.message,
    });
  }
};

// الحصول على العروض الترويجية القادمة
export const getUpcomingPromotions = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    // محاولة الحصول من الكاش
    const cached = await cacheLayer.get("hero-promotions-upcoming", "list", {
      limit,
    });

    if (cached) {
      return res.status(200).json({
        success: true,
        data: cached,
        cached: true,
        cacheStrategy: "hero-promotions-upcoming",
      });
    }

    // Cache MISS - الحصول من قاعدة البيانات
    console.log(
      `🔄 Cache MISS for upcoming promotions, fetching from database`
    );

    // استخدام isActive فقط للعروض القادمة
    const promotions = await HeroPromotion.find({
      isActive: true,
      startDate: { $gt: now },
    })
      .sort({ startDate: 1, priority: 1 })
      .limit(parseInt(limit));

    // حفظ في الكاش
    await cacheLayer.set(
      "hero-promotions-upcoming",
      "list",
      promotions,
      { limit },
      {
        ttl: CACHE_TTL.UPCOMING,
      }
    );

    res.status(200).json({
      success: true,
      data: promotions,
      cached: false,
      cacheStrategy: "hero-promotions-upcoming",
    });
  } catch (error) {
    console.error("خطأ في الحصول على العروض الترويجية القادمة:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في الخادم",
      error: error.message,
    });
  }
};

// البحث في العروض الترويجية
export const searchPromotions = async (req, res) => {
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
    const cached = await cacheLayer.get("hero-promotions", "search", {
      query: searchQuery,
      language,
      limit,
    });

    if (cached) {
      return res.status(200).json({
        success: true,
        data: cached,
        cached: true,
        cacheStrategy: "hero-promotions",
      });
    }

    // Cache MISS - الحصول من قاعدة البيانات
    console.log(`🔄 Cache MISS for search, fetching from database`);

    // استخدام isActive فقط في البحث
    const searchField = language === "en" ? "titleEn" : "titleAr";
    const promotions = await HeroPromotion.find({
      isActive: true,
      [searchField]: { $regex: searchQuery, $options: "i" },
    }).sort({ priority: 1, createdAt: -1 });
    const limitedPromotions = promotions.slice(0, parseInt(limit));

    // حفظ في الكاش
    await cacheLayer.set(
      "hero-promotions",
      "search",
      limitedPromotions,
      {
        query: searchQuery,
        language,
        limit,
      },
      { ttl: CACHE_TTL.SEARCH }
    );

    res.status(200).json({
      success: true,
      data: limitedPromotions,
      cached: false,
      cacheStrategy: "hero-promotions",
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

// إنشاء عرض ترويجي جديد
export const createPromotion = async (req, res) => {
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
      titleAr,
      titleEn,
      subtitleAr,
      subtitleEn,
      buttonTextAr,
      buttonTextEn,
      link,
      image,
      gradient,
      isActive = true,
      priority = 1,
      startDate,
      endDate,
    } = req.body;

    // التحقق من عدم وجود عرض بنفس العنوان أو الأولوية
    const existingPromotion = await HeroPromotion.findOne({
      $or: [
        { titleAr: { $regex: new RegExp(`^${titleAr}$`, "i") } },
        { titleEn: { $regex: new RegExp(`^${titleEn}$`, "i") } },
        { priority: parseInt(priority) },
      ],
    });

    if (existingPromotion) {
      let conflictField = "";
      if (existingPromotion.titleAr === titleAr)
        conflictField = "العنوان العربي";
      else if (existingPromotion.titleEn === titleEn)
        conflictField = "العنوان الإنجليزي";
      else if (existingPromotion.priority === parseInt(priority))
        conflictField = "الأولوية";

      return res.status(409).json({
        success: false,
        message: `يوجد عرض ترويجي بنفس ${conflictField} بالفعل`,
      });
    }

    // إنشاء العرض الترويجي الجديد
    const newPromotion = new HeroPromotion({
      titleAr,
      titleEn,
      subtitleAr,
      subtitleEn,
      buttonTextAr,
      buttonTextEn,
      link,
      image,
      gradient,
      isActive,
      priority: parseInt(priority),
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
      createdBy: req.adminId,
    });

    await newPromotion.save();
    await newPromotion.populate("createdBy", "name email");

    // التحقق من انتهاء العروض بعد إنشاء عرض جديد
    await checkAndUpdateExpiredPromotions();

    // مسح الكاش بعد إنشاء عرض ترويجي جديد
    await clearAllPromotionsCache();

    res.status(201).json({
      success: true,
      message: "تم إنشاء العرض الترويجي بنجاح",
      data: newPromotion,
    });
  } catch (error) {
    console.error("خطأ في إنشاء العرض الترويجي:", error);

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
        message: "يوجد عرض ترويجي آخر بنفس المعرف",
      });
    }

    res.status(500).json({
      success: false,
      message: "حدث خطأ في الخادم",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// تحديث عرض ترويجي موجود
export const updatePromotion = async (req, res) => {
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

    // التحقق من وجود العرض الترويجي
    const currentPromotion = await HeroPromotion.findById(id);
    if (!currentPromotion) {
      return res.status(404).json({
        success: false,
        message: "العرض الترويجي غير موجود",
      });
    }

    // التحقق من عدم وجود عرض آخر بنفس العنوان أو الأولوية (إذا تم تغييرها)
    if (updateData.titleAr || updateData.titleEn || updateData.priority) {
      const titleAr = updateData.titleAr || currentPromotion.titleAr;
      const titleEn = updateData.titleEn || currentPromotion.titleEn;
      const priority = updateData.priority
        ? parseInt(updateData.priority)
        : currentPromotion.priority;

      const duplicatePromotion = await HeroPromotion.findOne({
        _id: { $ne: id }, // استبعاد العرض الحالي
        $or: [
          { titleAr: { $regex: new RegExp(`^${titleAr}$`, "i") } },
          { titleEn: { $regex: new RegExp(`^${titleEn}$`, "i") } },
          { priority: priority },
        ],
      });

      if (duplicatePromotion) {
        let conflictField = "";
        if (duplicatePromotion.titleAr === titleAr)
          conflictField = "العنوان العربي";
        else if (duplicatePromotion.titleEn === titleEn)
          conflictField = "العنوان الإنجليزي";
        else if (duplicatePromotion.priority === priority)
          conflictField = "الأولوية";

        return res.status(409).json({
          success: false,
          message: `يوجد عرض ترويجي آخر بنفس ${conflictField} بالفعل`,
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

    if (updateData.priority) {
      updateData.priority = parseInt(updateData.priority);
    }

    const promotion = await HeroPromotion.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    // التحقق من انتهاء العرض بعد التحديث
    await checkAndUpdateExpiredPromotions();

    // مسح الكاش بعد تحديث العرض الترويجي
    await clearAllPromotionsCache();

    res.status(200).json({
      success: true,
      message: "تم تحديث العرض الترويجي بنجاح",
      data: promotion,
    });
  } catch (error) {
    console.error("خطأ في تحديث العرض الترويجي:", error);

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
        message: "يوجد عرض ترويجي آخر بنفس المعرف",
      });
    }

    res.status(500).json({
      success: false,
      message: "حدث خطأ في الخادم",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// حذف عرض ترويجي
export const deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;

    const promotion = await HeroPromotion.findByIdAndDelete(id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: "العرض الترويجي غير موجود",
      });
    }

    // مسح الكاش بعد حذف العرض الترويجي
    await clearAllPromotionsCache();

    res.status(200).json({
      success: true,
      message: "تم حذف العرض الترويجي بنجاح",
    });
  } catch (error) {
    console.error("خطأ في حذف العرض الترويجي:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في الخادم",
      error: error.message,
    });
  }
};

// تبديل حالة العرض الترويجي
export const togglePromotionStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const promotion = await HeroPromotion.findById(id);
    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: "العرض الترويجي غير موجود",
      });
    }

    promotion.isActive = !promotion.isActive;
    promotion.updatedBy = req.adminId;
    await promotion.save();

    // التحقق من انتهاء العروض بعد تبديل الحالة
    await checkAndUpdateExpiredPromotions();

    // مسح الكاش بعد تبديل حالة العرض الترويجي
    await clearAllPromotionsCache();

    res.status(200).json({
      success: true,
      message: `تم ${
        promotion.isActive ? "تفعيل" : "إلغاء تفعيل"
      } العرض الترويجي بنجاح`,
      data: promotion,
    });
  } catch (error) {
    console.error("خطأ في تبديل حالة العرض الترويجي:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في الخادم",
      error: error.message,
    });
  }
};

// استيراد البيانات من ملف JSON
export const importPromotions = async (req, res) => {
  try {
    const { promotions } = req.body;

    if (!Array.isArray(promotions)) {
      return res.status(400).json({
        success: false,
        message: "يجب أن تكون البيانات مصفوفة من العروض الترويجية",
      });
    }

    const importedPromotions = [];
    const errors = [];

    for (const promotionData of promotions) {
      try {
        const existingPromotion = await HeroPromotion.findOne({
          _id: promotionData._id,
        });
        if (existingPromotion) {
          errors.push(`العرض الترويجي ${promotionData._id} موجود بالفعل`);
          continue;
        }

        const newPromotion = new HeroPromotion({
          ...promotionData,
          startDate: (() => {
            const startDateObj = new Date(promotionData.startDate);
            startDateObj.setUTCHours(0, 0, 0, 0);
            return startDateObj;
          })(),
          endDate: (() => {
            const endDateObj = new Date(promotionData.endDate);
            endDateObj.setUTCHours(23, 59, 59, 999);
            return endDateObj;
          })(),
          createdBy: req.adminId,
        });

        await newPromotion.save();
        importedPromotions.push(newPromotion);
      } catch (error) {
        errors.push(
          `خطأ في استيراد العرض الترويجي ${promotionData._id}: ${error.message}`
        );
      }
    }

    // مسح الكاش بعد استيراد العروض الترويجية
    await clearAllPromotionsCache();

    res.status(200).json({
      success: true,
      message: `تم استيراد ${importedPromotions.length} عرض ترويجي بنجاح`,
      data: importedPromotions,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("خطأ في استيراد العروض الترويجية:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في الخادم",
      error: error.message,
    });
  }
};
