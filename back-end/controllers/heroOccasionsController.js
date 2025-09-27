import HeroOccasion from "../models/HeroOccasion.js";
import { validationResult } from "express-validator";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import redis from "../config/redisClient.js";

// Cache Keys Constants
const CACHE_KEYS = {
  ACTIVE_OCCASIONS: "hero-occasions:active",
  UPCOMING_OCCASIONS: "hero-occasions:upcoming",
  ALL_OCCASIONS: "hero-occasions:all",
  OCCASION_BY_ID: "hero-occasions:id:",
  SEARCH_RESULTS: "hero-occasions:search:",
};

// Cache TTL (Time To Live) in seconds
// TTL كـ "safety net" فقط - التحديث الفوري يتم عبر Cache Invalidation
const CACHE_TTL = {
  ACTIVE: 2 * 60 * 60, // ساعتان (safety net)
  UPCOMING: 4 * 60 * 60, // 4 ساعات (safety net)
  ALL: 6 * 60 * 60, // 6 ساعات (safety net)
  SINGLE: 12 * 60 * 60, // 12 ساعة (safety net)
  SEARCH: 30 * 60, // 30 دقيقة (safety net)
};

// دالة لمسح الكاش عند التحديث
const invalidateOccasionsCache = async () => {
  try {
    if (!redis.isReady()) {
      console.warn("Redis not ready, skipping cache invalidation");
      return;
    }

    const keys = await redis.keys("hero-occasions:*");
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(
        `✅ Invalidated ${keys.length} cache keys for hero occasions`
      );
    }
  } catch (redisError) {
    console.warn(
      "❌ Failed to invalidate hero occasions cache:",
      redisError.message
    );
  }
};

// دالة لمسح الكاش الفاسد
const clearInvalidCache = async () => {
  try {
    if (!redis.isReady()) {
      console.warn("Redis not ready, skipping cache cleanup");
      return;
    }

    const keys = await redis.keys("hero-occasions:*");
    let clearedCount = 0;

    for (const key of keys) {
      const value = await redis.get(key);
      if (value === "{}" || value === "[]" || value === "null") {
        await redis.del(key);
        clearedCount++;
        console.log(`🗑️ Cleared invalid cache key: ${key}`);
      }
    }

    if (clearedCount > 0) {
      console.log(`✅ Cleared ${clearedCount} invalid cache keys`);
    }
  } catch (redisError) {
    console.warn("❌ Failed to clear invalid cache:", redisError.message);
  }
};

// دالة للحصول على إحصائيات الكاش
export const getCacheStats = async (req, res) => {
  try {
    if (!redis.isReady()) {
      return res.status(200).json({
        success: true,
        data: {
          redisConnected: false,
          message: "Redis not connected",
        },
      });
    }

    const keys = await redis.keys("hero-occasions:*");
    const stats = {
      redisConnected: true,
      totalKeys: keys.length,
      keysByType: {
        active: keys.filter((key) => key.includes(":active:")).length,
        upcoming: keys.filter((key) => key.includes(":upcoming:")).length,
        all: keys.filter((key) => key.includes(":all:")).length,
        search: keys.filter((key) => key.includes(":search:")).length,
        single: keys.filter((key) => key.includes(":id:")).length,
      },
      allKeys: keys,
    };

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

// دالة لمسح الكاش يدوياً
export const clearCache = async (req, res) => {
  try {
    await invalidateOccasionsCache();
    res.status(200).json({
      success: true,
      message: "تم مسح الكاش بنجاح",
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

// دالة لتشخيص Redis
export const diagnoseRedis = async (req, res) => {
  try {
    const diagnosis = {
      redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
      status: redis.status,
      isReady: redis.isReady(),
      connectionTest: false,
      error: null,
      timestamp: new Date().toISOString(),
    };

    try {
      diagnosis.connectionTest = await redis.testConnection();
    } catch (error) {
      diagnosis.error = error.message;
    }

    res.status(200).json({
      success: true,
      data: diagnosis,
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

// دالة لرفع الصور إلى Cloudinary
const uploadImagesToCloudinary = async (images) => {
  const uploadedImages = [];

  for (const image of images) {
    if (image.startsWith("http")) {
      // إذا كان الرابط موجود بالفعل، استخدمه كما هو
      uploadedImages.push(image);
    } else if (image.startsWith("data:image")) {
      // إذا كان base64، ارفعه إلى Cloudinary
      try {
        const result = await cloudinary.uploader.upload(image, {
          folder: "hero-occasions",
          resource_type: "image",
          quality: 100,
          fetch_format: "auto",
        });
        uploadedImages.push(result.secure_url);
      } catch (error) {
        console.error("Error uploading image to Cloudinary:", error);
        throw new Error("فشل في رفع الصورة");
      }
    } else {
      // إذا كان رابط غير صحيح، تجاهله
      console.warn("Invalid image URL:", image);
    }
  }

  return uploadedImages;
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

    // رفع الصورة إلى Cloudinary
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

    // إرسال البيانات إلى Cloudinary
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

// الحصول على جميع المناسبات
export const getAllOccasions = async (req, res) => {
  try {
    // مسح الكاش الفاسد في بداية كل استعلام
    try {
      await clearInvalidCache();
    } catch (error) {
      console.warn("⚠️ Failed to clear invalid cache:", error.message);
      // مسح جميع الكاش عند فشل مسح الكاش الفاسد
      try {
        await invalidateOccasionsCache();
        console.log("🗑️ Cleared all cache due to cleanup error");
      } catch (cacheError) {
        console.warn("⚠️ Failed to clear all cache:", cacheError.message);
      }
    }

    const {
      page = 1,
      limit = 10,
      isActive,
      search,
      language = "ar",
      sortBy = "date",
      sortOrder = "asc",
    } = req.query;

    // إنشاء cache key فريد بناءً على المعاملات
    const cacheKey = `${CACHE_KEYS.ALL_OCCASIONS}:${page}:${limit}:${isActive}:${search}:${language}:${sortBy}:${sortOrder}`;

    // محاولة الحصول من الكاش
    try {
      if (redis.isReady()) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          const parsedCache = JSON.parse(cached);
          // التحقق من أن الكاش يحتوي على بيانات صحيحة
          if (parsedCache.data && Array.isArray(parsedCache.data)) {
            console.log(
              `✅ Cache HIT for all occasions (page: ${page}, limit: ${limit})`
            );
            return res.status(200).json({
              success: true,
              ...parsedCache,
              cached: true,
              cacheKey: cacheKey,
            });
          } else {
            // مسح الكاش الفاسد
            console.log(`🗑️ Clearing invalid cache for key: ${cacheKey}`);
            try {
              await redis.del(cacheKey);
            } catch (delError) {
              console.warn(
                "⚠️ Failed to delete invalid cache key:",
                delError.message
              );
              // مسح جميع الكاش عند فشل حذف مفتاح واحد
              try {
                await invalidateOccasionsCache();
                console.log("🗑️ Cleared all cache due to delete error");
              } catch (cacheError) {
                console.warn(
                  "⚠️ Failed to clear all cache:",
                  cacheError.message
                );
              }
            }
          }
        }
      }
    } catch (redisError) {
      console.warn(
        "❌ Redis not available for all occasions, fetching from database:",
        redisError.message
      );
      // مسح الكاش عند حدوث خطأ في Redis
      try {
        await invalidateOccasionsCache();
        console.log("🗑️ Cleared cache due to Redis read error");
      } catch (cacheError) {
        console.warn(
          "⚠️ Failed to clear cache after Redis read error:",
          cacheError.message
        );
      }
    }

    // الحصول من قاعدة البيانات
    console.log(
      `🔄 Cache MISS for all occasions (page: ${page}, limit: ${limit}), fetching from database`
    );

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
      .lean(); // استخدام lean() لتحسين الأداء

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
    try {
      if (redis.isReady()) {
        // التحقق من أن البيانات ليست فارغة قبل الحفظ
        if (responseData.data && responseData.data.length > 0) {
          try {
            await redis.setex(
              cacheKey,
              CACHE_TTL.ALL,
              JSON.stringify(responseData)
            );
            console.log(
              `✅ Cached all occasions (page: ${page}, limit: ${limit}) for ${CACHE_TTL.ALL} seconds`
            );
          } catch (setError) {
            console.warn("⚠️ Failed to cache data:", setError.message);
            // مسح الكاش عند فشل الحفظ
            try {
              await invalidateOccasionsCache();
              console.log("🗑️ Cleared cache due to save error");
            } catch (cacheError) {
              console.warn(
                "⚠️ Failed to clear cache after save error:",
                cacheError.message
              );
            }
          }
        } else {
          console.log(
            `⚠️ Skipping cache for empty data (page: ${page}, limit: ${limit})`
          );
        }
      }
    } catch (redisError) {
      console.warn("❌ Failed to cache all occasions:", redisError.message);
      // مسح الكاش عند حدوث خطأ في Redis
      try {
        await invalidateOccasionsCache();
        console.log("🗑️ Cleared cache due to Redis error");
      } catch (cacheError) {
        console.warn(
          "⚠️ Failed to clear cache after Redis error:",
          cacheError.message
        );
      }
    }

    res.status(200).json(responseData);
  } catch (error) {
    console.error("خطأ في الحصول على المناسبات:", error);

    // مسح الكاش عند حدوث خطأ في قاعدة البيانات
    try {
      await invalidateOccasionsCache();
      console.log("🗑️ Cleared cache due to database error");
    } catch (cacheError) {
      console.warn("⚠️ Failed to clear cache after error:", cacheError.message);
    }

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

    const occasion = await HeroOccasion.findById(id)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!occasion) {
      return res.status(404).json({
        success: false,
        message: "المناسبة غير موجودة",
      });
    }

    res.status(200).json({
      success: true,
      data: occasion,
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
    const cacheKey = `${CACHE_KEYS.ACTIVE_OCCASIONS}:${limit}`;

    // محاولة الحصول من الكاش
    try {
      if (redis.isReady()) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          console.log(`✅ Cache HIT for active occasions (limit: ${limit})`);
          return res.status(200).json({
            success: true,
            data: JSON.parse(cached),
            cached: true,
            cacheKey: cacheKey,
          });
        }
      }
    } catch (redisError) {
      console.warn(
        "❌ Redis not available for active occasions, fetching from database:",
        redisError.message
      );
    }

    // الحصول من قاعدة البيانات
    console.log(
      `🔄 Cache MISS for active occasions (limit: ${limit}), fetching from database`
    );
    let filter = { isActive: true };

    const occasions = await HeroOccasion.find(filter)
      .sort({ date: 1 })
      .limit(parseInt(limit));

    // حفظ في الكاش
    try {
      if (redis.isReady()) {
        await redis.setex(
          cacheKey,
          CACHE_TTL.ACTIVE,
          JSON.stringify(occasions)
        );
        console.log(
          `✅ Cached active occasions (limit: ${limit}) for ${CACHE_TTL.ACTIVE} seconds`
        );
      }
    } catch (redisError) {
      console.warn("❌ Failed to cache active occasions:", redisError.message);
    }

    res.status(200).json({
      success: true,
      data: occasions,
      cached: false,
      cacheKey: cacheKey,
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
    const cacheKey = `${CACHE_KEYS.UPCOMING_OCCASIONS}:${limit}`;

    // محاولة الحصول من الكاش
    try {
      if (redis.isReady()) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          console.log(`✅ Cache HIT for upcoming occasions (limit: ${limit})`);
          return res.status(200).json({
            success: true,
            data: JSON.parse(cached),
            cached: true,
            cacheKey: cacheKey,
          });
        } else {
          console.log(
            `🔄 Cache MISS for upcoming occasions (limit: ${limit}) - Key not found in cache`
          );
        }
      } else {
        console.log(
          `🔄 Cache MISS for upcoming occasions (limit: ${limit}) - Redis not ready (status: ${redis.status})`
        );
      }
    } catch (redisError) {
      console.warn(
        "❌ Redis error for upcoming occasions, fetching from database:",
        redisError.message
      );
    }

    // الحصول من قاعدة البيانات
    console.log(
      `🔄 Cache MISS for upcoming occasions (limit: ${limit}), fetching from database`
    );
    const today = new Date();

    const occasions = await HeroOccasion.find({
      isActive: true,
      date: { $gte: today },
    })
      .sort({ date: 1 })
      .limit(parseInt(limit));

    // حفظ في الكاش
    try {
      if (redis.isReady()) {
        await redis.setex(
          cacheKey,
          CACHE_TTL.UPCOMING,
          JSON.stringify(occasions)
        );
        console.log(
          `✅ Cached upcoming occasions (limit: ${limit}) for ${CACHE_TTL.UPCOMING} seconds`
        );
      }
    } catch (redisError) {
      console.warn(
        "❌ Failed to cache upcoming occasions:",
        redisError.message
      );
    }

    res.status(200).json({
      success: true,
      data: occasions,
      cached: false,
      cacheKey: cacheKey,
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

// إنشاء مناسبة جديدة
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
      date: new Date(date), // تحويل التاريخ إلى كائن Date
      images: uploadedImages, // استخدام الصور المرفوعة
      celebratoryMessageAr,
      celebratoryMessageEn,
      isActive,
      createdBy: req.adminId,
    });

    await newOccasion.save();

    // إرجاع المناسبة مع بيانات منشئها
    await newOccasion.populate("createdBy", "name email");

    // مسح الكاش بعد إنشاء مناسبة جديدة
    await invalidateOccasionsCache();

    res.status(201).json({
      success: true,
      message: "تم إنشاء المناسبة بنجاح",
      data: newOccasion,
    });
  } catch (error) {
    console.error("خطأ في إنشاء المناسبة:", error);

    // معالجة أخطاء محددة
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
    const updateData = { ...req.body, updatedBy: req.adminId };

    // إذا تم تحديث التاريخ، تحويله إلى كائن Date
    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }

    // رفع الصور إلى Cloudinary إذا تم تحديثها
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
    await invalidateOccasionsCache();

    res.status(200).json({
      success: true,
      message: "تم تحديث المناسبة بنجاح",
      data: occasion,
    });
  } catch (error) {
    console.error("خطأ في تحديث المناسبة:", error);

    // معالجة أخطاء محددة
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
    await invalidateOccasionsCache();

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

// تبديل حالة المناسبة (نشط/غير نشط)
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
    await invalidateOccasionsCache();

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

    const occasions = await HeroOccasion.searchOccasions(q.trim(), language);

    res.status(200).json({
      success: true,
      data: occasions.slice(0, parseInt(limit)),
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

// استيراد البيانات من ملف JSON (للمرحلة الانتقالية)
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
        // التحقق من وجود المناسبة
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
    await invalidateOccasionsCache();

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
