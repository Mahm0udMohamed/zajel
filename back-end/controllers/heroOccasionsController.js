import HeroOccasion from "../models/HeroOccasion.js";
import { validationResult } from "express-validator";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

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
          flags: "lossless",
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
        flags: "lossless",
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
    const {
      page = 1,
      limit = 10,
      isActive,
      search,
      language = "ar",
      sortBy = "date",
      sortOrder = "asc",
    } = req.query;

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

    res.status(200).json({
      success: true,
      data: occasions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
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

    let filter = { isActive: true };

    const occasions = await HeroOccasion.find(filter)
      .sort({ date: 1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: occasions,
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
    const today = new Date();

    const occasions = await HeroOccasion.find({
      isActive: true,
      date: { $gte: today },
    })
      .sort({ date: 1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: occasions,
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
