import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Occasion from "../models/Occasion.js";
import Brand from "../models/Brand.js";
import { validationResult } from "express-validator";
import { cacheLayer } from "../services/cache/index.js";
import cloudinary from "../utils/cloudinary.js";

// دالة مساعدة لمسح جميع كاشات المنتجات (Best Practice)
const clearAllProductsCache = async () => {
  try {
    console.log("🔄 Clearing all products cache...");

    // مسح جميع استراتيجيات المنتجات
    const strategies = ["products", "products-active", "product-details"];

    for (const strategy of strategies) {
      await cacheLayer.clear(strategy, "*");
    }

    console.log("✅ All products cache cleared successfully");
  } catch (error) {
    console.error("❌ Error clearing products cache:", error.message);
  }
};

/**
 * جلب جميع المنتجات مع إمكانية الفلترة والترتيب
 */
export const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      isActive,
      language = "ar",
      search,
      sortBy = "sortOrder",
      sortOrder = "asc",
      category,
      occasion,
      brand,
      productStatus,
      targetAudience,
      showInHomePage,
      isFeatured,
      minPrice,
      maxPrice,
    } = req.query;

    // بناء query object
    const query = {};

    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    if (category) {
      query.category = category;
    }

    if (occasion) {
      query.occasion = occasion;
    }

    if (brand) {
      query.brand = brand;
    }

    if (productStatus) {
      query.productStatus = productStatus;
    }

    if (targetAudience) {
      query.targetAudience = targetAudience;
    }

    if (showInHomePage !== undefined) {
      query.showInHomePage = showInHomePage === "true";
    }

    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === "true";
    }

    // فلترة السعر
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        query.price.$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        query.price.$lte = parseFloat(maxPrice);
      }
    }

    // إضافة البحث
    if (search) {
      const searchRegex = new RegExp(search, "i");
      if (language === "ar") {
        query.$or = [
          { nameAr: searchRegex },
          { descriptionAr: searchRegex },
          { careInstructions: searchRegex },
          { arrangementContents: searchRegex },
        ];
      } else {
        query.$or = [
          { nameEn: searchRegex },
          { descriptionEn: searchRegex },
          { careInstructions: searchRegex },
          { arrangementContents: searchRegex },
        ];
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
      category,
      occasion,
      brand,
      productStatus,
      targetAudience,
      showInHomePage,
      isFeatured,
      minPrice,
      maxPrice,
    };

    // محاولة جلب البيانات من الكاش
    let products;
    let totalCount;

    try {
      const cached = await cacheLayer.get("products", "all", cacheParams);
      if (cached) {
        return res.status(200).json({
          success: true,
          data: cached.products,
          pagination: cached.pagination,
          message: "تم جلب المنتجات بنجاح من الكاش",
        });
      }
    } catch (cacheError) {
      console.warn("خطأ في جلب البيانات من الكاش:", cacheError.message);
    }

    // جلب البيانات من قاعدة البيانات
    const [productsData, total] = await Promise.all([
      Product.find(query)
        .populate("category", "nameAr nameEn imageUrl")
        .populate("occasion", "nameAr nameEn imageUrl")
        .populate("brand", "nameAr nameEn imageUrl")
        .populate("createdBy", "name email")
        .populate("updatedBy", "name email")
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(query),
    ]);

    // تنسيق البيانات حسب اللغة
    const formattedProducts = productsData.map((product) => ({
      _id: product._id,
      name: language === "ar" ? product.nameAr : product.nameEn,
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      description:
        language === "ar" ? product.descriptionAr : product.descriptionEn,
      descriptionAr: product.descriptionAr,
      descriptionEn: product.descriptionEn,
      mainImage: product.mainImage,
      additionalImages: product.additionalImages,
      price: product.price,
      category: product.category,
      occasion: product.occasion,
      brand: product.brand,
      productStatus: product.productStatus,
      targetAudience: product.targetAudience,
      careInstructions: product.careInstructions,
      dimensions: product.dimensions,
      arrangementContents: product.arrangementContents,
      isActive: product.isActive,
      sortOrder: product.sortOrder,
      viewCount: product.viewCount,
      purchaseCount: product.purchaseCount,
      isFeatured: product.isFeatured,
      showInHomePage: product.showInHomePage,
      metaTitle: language === "ar" ? product.metaTitleAr : product.metaTitleEn,
      metaDescription:
        language === "ar"
          ? product.metaDescriptionAr
          : product.metaDescriptionEn,
      createdBy: product.createdBy,
      updatedBy: product.updatedBy,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
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
      products: formattedProducts,
      pagination,
    };

    // حفظ البيانات في الكاش لمدة 30 دقيقة
    try {
      await cacheLayer.set("products", "all", responseData, cacheParams, {
        ttl: 1800, // 30 دقيقة
      });
    } catch (cacheError) {
      console.warn("خطأ في حفظ البيانات في الكاش:", cacheError.message);
    }

    res.status(200).json({
      success: true,
      data: formattedProducts,
      pagination,
      message: "تم جلب المنتجات بنجاح",
    });
  } catch (error) {
    console.error("خطأ في جلب المنتجات:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في جلب المنتجات",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * جلب منتج محدد بالمعرف
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const { language = "ar" } = req.query;

    const cacheKey = `product:${id}:${language}`;

    // محاولة جلب البيانات من الكاش
    try {
      const cachedProduct = await cacheLayer.get(cacheKey);
      if (cachedProduct) {
        return res.status(200).json({
          success: true,
          data: cachedProduct,
          message: "تم جلب المنتج بنجاح من الكاش",
        });
      }
    } catch (cacheError) {
      console.warn("خطأ في جلب البيانات من الكاش:", cacheError.message);
    }

    const product = await Product.findById(id)
      .populate("category", "nameAr nameEn imageUrl")
      .populate("occasion", "nameAr nameEn imageUrl")
      .populate("brand", "nameAr nameEn imageUrl")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "المنتج غير موجود",
      });
    }

    // تنسيق البيانات حسب اللغة
    const formattedProduct = {
      _id: product._id,
      name: language === "ar" ? product.nameAr : product.nameEn,
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      description:
        language === "ar" ? product.descriptionAr : product.descriptionEn,
      descriptionAr: product.descriptionAr,
      descriptionEn: product.descriptionEn,
      mainImage: product.mainImage,
      additionalImages: product.additionalImages,
      price: product.price,
      category: product.category,
      occasion: product.occasion,
      brand: product.brand,
      productStatus: product.productStatus,
      targetAudience: product.targetAudience,
      careInstructions: product.careInstructions,
      dimensions: product.dimensions,
      arrangementContents: product.arrangementContents,
      isActive: product.isActive,
      sortOrder: product.sortOrder,
      viewCount: product.viewCount,
      purchaseCount: product.purchaseCount,
      isFeatured: product.isFeatured,
      showInHomePage: product.showInHomePage,
      metaTitle: language === "ar" ? product.metaTitleAr : product.metaTitleEn,
      metaDescription:
        language === "ar"
          ? product.metaDescriptionAr
          : product.metaDescriptionEn,
      createdBy: product.createdBy,
      updatedBy: product.updatedBy,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };

    // حفظ البيانات في الكاش لمدة ساعة
    try {
      await cacheLayer.set(cacheKey, formattedProduct, 3600);
    } catch (cacheError) {
      console.warn("خطأ في حفظ البيانات في الكاش:", cacheError.message);
    }

    res.status(200).json({
      success: true,
      data: formattedProduct,
      message: "تم جلب المنتج بنجاح",
    });
  } catch (error) {
    console.error("خطأ في جلب المنتج:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في جلب المنتج",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * إنشاء منتج جديد (للمدير)
 */
export const createProduct = async (req, res) => {
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
      mainImage,
      additionalImages = [],
      price,
      category,
      occasion,
      brand,
      descriptionAr = "",
      descriptionEn = "",
      productStatus,
      targetAudience,
      careInstructions = "",
      dimensions = {},
      arrangementContents = "",
      isActive = true,
      sortOrder = 0,
      showInHomePage = true,
      isFeatured = false,
      metaTitleAr = "",
      metaTitleEn = "",
      metaDescriptionAr = "",
      metaDescriptionEn = "",
    } = req.body;

    // التحقق من وجود الفئة والمناسبة والعلامة التجارية
    const [categoryExists, occasionExists, brandExists] = await Promise.all([
      Category.findById(category),
      Occasion.findById(occasion),
      Brand.findById(brand),
    ]);

    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "الفئة المحددة غير موجودة",
      });
    }

    if (!occasionExists) {
      return res.status(400).json({
        success: false,
        message: "المناسبة المحددة غير موجودة",
      });
    }

    if (!brandExists) {
      return res.status(400).json({
        success: false,
        message: "العلامة التجارية المحددة غير موجودة",
      });
    }

    // التحقق من عدم وجود منتج بنفس الاسم
    const existingProduct = await Product.findOne({
      $or: [
        { nameAr: { $regex: new RegExp(`^${nameAr}$`, "i") } },
        { nameEn: { $regex: new RegExp(`^${nameEn}$`, "i") } },
      ],
    });

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "يوجد منتج بنفس الاسم بالفعل",
      });
    }

    // إنشاء المنتج الجديد
    const newProduct = new Product({
      nameAr,
      nameEn,
      mainImage,
      additionalImages,
      price,
      category,
      occasion,
      brand,
      descriptionAr,
      descriptionEn,
      productStatus,
      targetAudience,
      careInstructions,
      dimensions,
      arrangementContents,
      isActive,
      sortOrder,
      showInHomePage,
      isFeatured,
      metaTitleAr,
      metaTitleEn,
      metaDescriptionAr,
      metaDescriptionEn,
      createdBy: req.admin._id,
    });

    await newProduct.save();

    // مسح الكاش بعد إنشاء منتج جديد
    await clearAllProductsCache();

    res.status(201).json({
      success: true,
      data: newProduct,
      message: "تم إنشاء المنتج بنجاح",
    });
  } catch (error) {
    console.error("خطأ في إنشاء المنتج:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في إنشاء المنتج",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * تحديث منتج موجود (للمدير)
 */
export const updateProduct = async (req, res) => {
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

    // التحقق من وجود المنتج
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "المنتج غير موجود",
      });
    }

    // التحقق من وجود الفئة والمناسبة والعلامة التجارية إذا تم تحديثها
    if (updateData.category || updateData.occasion || updateData.brand) {
      const checks = [];

      if (updateData.category) {
        checks.push(Category.findById(updateData.category));
      }
      if (updateData.occasion) {
        checks.push(Occasion.findById(updateData.occasion));
      }
      if (updateData.brand) {
        checks.push(Brand.findById(updateData.brand));
      }

      const results = await Promise.all(checks);

      if (updateData.category && !results[0]) {
        return res.status(400).json({
          success: false,
          message: "الفئة المحددة غير موجودة",
        });
      }
      if (updateData.occasion && !results[1]) {
        return res.status(400).json({
          success: false,
          message: "المناسبة المحددة غير موجودة",
        });
      }
      if (updateData.brand && !results[2]) {
        return res.status(400).json({
          success: false,
          message: "العلامة التجارية المحددة غير موجودة",
        });
      }
    }

    // التحقق من عدم وجود منتج آخر بنفس الاسم (إذا تم تغيير الاسم)
    if (updateData.nameAr || updateData.nameEn) {
      const nameAr = updateData.nameAr || existingProduct.nameAr;
      const nameEn = updateData.nameEn || existingProduct.nameEn;

      const duplicateProduct = await Product.findOne({
        _id: { $ne: id }, // استبعاد المنتج الحالي
        $or: [
          { nameAr: { $regex: new RegExp(`^${nameAr}$`, "i") } },
          { nameEn: { $regex: new RegExp(`^${nameEn}$`, "i") } },
        ],
      });

      if (duplicateProduct) {
        return res.status(409).json({
          success: false,
          message: "يوجد منتج آخر بنفس الاسم بالفعل",
        });
      }
    }

    // إضافة معلومات التحديث
    updateData.updatedBy = req.admin._id;

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("category", "nameAr nameEn imageUrl")
      .populate("occasion", "nameAr nameEn imageUrl")
      .populate("brand", "nameAr nameEn imageUrl")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    // مسح الكاش المتعلق بالمنتجات
    try {
      await cacheLayer.clear("products", "*");
      await cacheLayer.clear(`product:${id}`, "*");
    } catch (cacheError) {
      console.warn("خطأ في مسح الكاش:", cacheError.message);
    }

    res.status(200).json({
      success: true,
      data: product,
      message: "تم تحديث المنتج بنجاح",
    });
  } catch (error) {
    console.error("خطأ في تحديث المنتج:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في تحديث المنتج",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * حذف منتج (للمدير)
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "المنتج غير موجود",
      });
    }

    // مسح الكاش المتعلق بالمنتجات
    try {
      await cacheLayer.clear("products", "*");
      await cacheLayer.clear(`product:${id}`, "*");
    } catch (cacheError) {
      console.warn("خطأ في مسح الكاش:", cacheError.message);
    }

    res.status(200).json({
      success: true,
      message: "تم حذف المنتج بنجاح",
    });
  } catch (error) {
    console.error("خطأ في حذف المنتج:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في حذف المنتج",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * تفعيل/إلغاء تفعيل منتج (للمدير)
 */
export const toggleProductStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "المنتج غير موجود",
      });
    }

    product.isActive = !product.isActive;
    product.updatedBy = req.admin._id;
    await product.save();

    // مسح الكاش المتعلق بالمنتجات
    try {
      await cacheLayer.clear("products", "*");
      await cacheLayer.clear(`product:${id}`, "*");
    } catch (cacheError) {
      console.warn("خطأ في مسح الكاش:", cacheError.message);
    }

    res.status(200).json({
      success: true,
      data: product,
      message: `تم ${product.isActive ? "تفعيل" : "إلغاء تفعيل"} المنتج بنجاح`,
    });
  } catch (error) {
    console.error("خطأ في تغيير حالة المنتج:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في تغيير حالة المنتج",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * إعادة ترتيب المنتجات (للمدير)
 */
export const reorderProducts = async (req, res) => {
  try {
    const { productOrders } = req.body;

    if (!Array.isArray(productOrders) || productOrders.length === 0) {
      return res.status(400).json({
        success: false,
        message: "قائمة ترتيب المنتجات مطلوبة",
      });
    }

    // التحقق من صحة البيانات
    for (const item of productOrders) {
      if (!item.productId || typeof item.sortOrder !== "number") {
        return res.status(400).json({
          success: false,
          message: "بيانات ترتيب المنتجات غير صحيحة",
        });
      }
    }

    await Product.reorderProducts(productOrders);

    // مسح الكاش بعد إعادة ترتيب المنتجات
    await clearAllProductsCache();

    res.status(200).json({
      success: true,
      message: "تم إعادة ترتيب المنتجات بنجاح",
    });
  } catch (error) {
    console.error("خطأ في إعادة ترتيب المنتجات:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في إعادة ترتيب المنتجات",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * البحث في المنتجات
 */
export const searchProducts = async (req, res) => {
  try {
    const {
      q: query,
      language = "ar",
      limit = 10,
      page = 1,
      filters = {},
    } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "استعلام البحث يجب أن يكون على الأقل حرفين",
      });
    }

    const searchResults = await Product.searchProducts(query.trim(), language, {
      limit: parseInt(limit),
      page: parseInt(page),
      filters,
    });

    res.status(200).json({
      success: true,
      data: searchResults,
      message: "تم البحث في المنتجات بنجاح",
    });
  } catch (error) {
    console.error("خطأ في البحث في المنتجات:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في البحث في المنتجات",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * جلب المنتجات النشطة للعرض العام
 */
export const getActiveProducts = async (req, res) => {
  try {
    const { language = "ar", filters = {} } = req.query;

    const cacheKey = `active-products:${language}:${JSON.stringify(filters)}`;

    // محاولة جلب البيانات من الكاش
    try {
      const cachedProducts = await cacheLayer.get(cacheKey);
      if (cachedProducts) {
        return res.status(200).json({
          success: true,
          data: cachedProducts,
          message: "تم جلب المنتجات النشطة بنجاح من الكاش",
        });
      }
    } catch (cacheError) {
      console.warn("خطأ في جلب البيانات من الكاش:", cacheError.message);
    }

    const products = await Product.getActiveProducts(language, filters);

    // حفظ البيانات في الكاش لمدة ساعة
    try {
      await cacheLayer.set(cacheKey, products, 3600);
    } catch (cacheError) {
      console.warn("خطأ في حفظ البيانات في الكاش:", cacheError.message);
    }

    res.status(200).json({
      success: true,
      data: products,
      message: "تم جلب المنتجات النشطة بنجاح",
    });
  } catch (error) {
    console.error("خطأ في جلب المنتجات النشطة:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في جلب المنتجات النشطة",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * رفع صورة المنتج إلى Cloudinary
 */
export const uploadProductImage = async (req, res) => {
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
            folder: "products",
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

    // مسح كاش المنتجات بعد رفع صورة جديدة
    try {
      await cacheLayer.clear("products", "*");
    } catch (cacheError) {
      console.warn("خطأ في مسح الكاش:", cacheError.message);
    }

    res.status(200).json({
      success: true,
      message: "تم رفع صورة المنتج بنجاح",
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
    console.error("خطأ في رفع صورة المنتج:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في رفع الصورة",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * حذف صورة المنتج من Cloudinary
 */
export const deleteProductImage = async (req, res) => {
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

    // مسح كاش المنتجات بعد حذف صورة
    try {
      await cacheLayer.clear("products", "*");
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
    console.error("خطأ في حذف صورة المنتج:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في حذف الصورة",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * إنشاء منتج مع رفع صورة في نفس الوقت
 */
export const createProductWithImage = async (req, res) => {
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
      additionalImages = [],
      price,
      category,
      occasion,
      brand,
      descriptionAr = "",
      descriptionEn = "",
      productStatus,
      targetAudience,
      careInstructions = "",
      dimensions = {},
      arrangementContents = "",
      isActive = true,
      sortOrder = 0,
      showInHomePage = true,
      isFeatured = false,
      metaTitleAr = "",
      metaTitleEn = "",
      metaDescriptionAr = "",
      metaDescriptionEn = "",
    } = req.body;

    let mainImage = "";

    // إذا تم رفع صورة
    if (req.file) {
      try {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                resource_type: "image",
                folder: "products",
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

        mainImage = result.secure_url;
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
        message: "صورة المنتج الأساسية مطلوبة",
      });
    }

    // التحقق من وجود الفئة والمناسبة والعلامة التجارية
    const [categoryExists, occasionExists, brandExists] = await Promise.all([
      Category.findById(category),
      Occasion.findById(occasion),
      Brand.findById(brand),
    ]);

    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "الفئة المحددة غير موجودة",
      });
    }

    if (!occasionExists) {
      return res.status(400).json({
        success: false,
        message: "المناسبة المحددة غير موجودة",
      });
    }

    if (!brandExists) {
      return res.status(400).json({
        success: false,
        message: "العلامة التجارية المحددة غير موجودة",
      });
    }

    // التحقق من عدم وجود منتج بنفس الاسم
    const existingProduct = await Product.findOne({
      $or: [
        { nameAr: { $regex: new RegExp(`^${nameAr}$`, "i") } },
        { nameEn: { $regex: new RegExp(`^${nameEn}$`, "i") } },
      ],
    });

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "يوجد منتج بنفس الاسم بالفعل",
      });
    }

    // إنشاء المنتج الجديد
    const newProduct = new Product({
      nameAr,
      nameEn,
      mainImage,
      additionalImages,
      price,
      category,
      occasion,
      brand,
      descriptionAr,
      descriptionEn,
      productStatus,
      targetAudience,
      careInstructions,
      dimensions,
      arrangementContents,
      isActive,
      sortOrder,
      showInHomePage,
      isFeatured,
      metaTitleAr,
      metaTitleEn,
      metaDescriptionAr,
      metaDescriptionEn,
      createdBy: req.admin._id,
    });

    await newProduct.save();

    // مسح الكاش بعد إنشاء منتج جديد
    await clearAllProductsCache();

    res.status(201).json({
      success: true,
      data: newProduct,
      message: "تم إنشاء المنتج مع الصورة بنجاح",
    });
  } catch (error) {
    console.error("خطأ في إنشاء المنتج مع الصورة:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في إنشاء المنتج",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * زيادة عدد المشاهدات للمنتج
 */
export const incrementProductViews = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "المنتج غير موجود",
      });
    }

    await product.incrementViewCount();

    res.status(200).json({
      success: true,
      message: "تم تحديث عدد المشاهدات بنجاح",
    });
  } catch (error) {
    console.error("خطأ في تحديث عدد المشاهدات:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في تحديث عدد المشاهدات",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * زيادة عدد المشتريات للمنتج
 */
export const incrementProductPurchases = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "المنتج غير موجود",
      });
    }

    await product.incrementPurchaseCount();

    res.status(200).json({
      success: true,
      message: "تم تحديث عدد المشتريات بنجاح",
    });
  } catch (error) {
    console.error("خطأ في تحديث عدد المشتريات:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في تحديث عدد المشتريات",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
