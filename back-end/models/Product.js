import mongoose from "mongoose";
import validator from "validator";

const ProductSchema = new mongoose.Schema(
  {
    // الأسماء الأساسية
    nameAr: {
      type: String,
      required: [true, "اسم المنتج بالعربية مطلوب"],
      trim: true,
      minlength: [2, "اسم المنتج بالعربية يجب أن يكون على الأقل حرفين"],
      maxlength: [200, "اسم المنتج بالعربية يجب أن يكون أقل من 200 حرف"],
    },
    nameEn: {
      type: String,
      required: [true, "اسم المنتج بالإنجليزية مطلوب"],
      trim: true,
      minlength: [2, "اسم المنتج بالإنجليزية يجب أن يكون على الأقل حرفين"],
      maxlength: [200, "اسم المنتج بالإنجليزية يجب أن يكون أقل من 200 حرف"],
    },

    // الصور
    mainImage: {
      type: String,
      required: [true, "الصورة الأساسية للمنتج مطلوبة"],
      validate: {
        validator: function (url) {
          return validator.isURL(url, {
            protocols: ["http", "https"],
            require_protocol: true,
          });
        },
        message: "الصورة الأساسية يجب أن تكون رابط صحيح",
      },
    },
    additionalImages: [
      {
        type: String,
        validate: {
          validator: function (url) {
            return validator.isURL(url, {
              protocols: ["http", "https"],
              require_protocol: true,
            });
          },
          message: "الصور الإضافية يجب أن تكون روابط صحيحة",
        },
      },
    ],

    // السعر
    price: {
      type: Number,
      required: [true, "سعر المنتج مطلوب"],
      min: [0, "سعر المنتج يجب أن يكون أكبر من أو يساوي 0"],
    },

    // العلاقات
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "فئة المنتج مطلوبة"],
    },
    occasion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Occasion",
      required: [true, "مناسبة المنتج مطلوبة"],
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: [true, "علامة المنتج التجارية مطلوبة"],
    },

    // الأوصاف
    descriptionAr: {
      type: String,
      trim: true,
      maxlength: [2000, "وصف المنتج بالعربية يجب أن يكون أقل من 2000 حرف"],
      default: "",
    },
    descriptionEn: {
      type: String,
      trim: true,
      maxlength: [2000, "وصف المنتج بالإنجليزية يجب أن يكون أقل من 2000 حرف"],
      default: "",
    },

    // حالة المنتج
    productStatus: {
      type: [String],
      enum: {
        values: [
          "الأكثر مبيعًا",
          "المجموعات المميزة",
          "هدايا فاخرة",
          "مناسبة خاصة",
        ],
        message:
          "حالة المنتج يجب أن تكون واحدة من: الأكثر مبيعًا، المجموعات المميزة، هدايا فاخرة، مناسبة خاصة",
      },
      default: [],
    },

    // الجمهور المستهدف
    targetAudience: {
      type: String,
      enum: {
        values: ["له", "لها", "لكابلز"],
        message: "الجمهور المستهدف يجب أن يكون: له، لها، لكابلز",
      },
      required: [true, "الجمهور المستهدف مطلوب"],
    },

    // نصائح العناية
    careInstructionsAr: {
      type: String,
      trim: true,
      maxlength: [1000, "نصائح العناية بالعربية يجب أن تكون أقل من 1000 حرف"],
      default: "",
    },
    careInstructionsEn: {
      type: String,
      trim: true,
      maxlength: [
        1000,
        "نصائح العناية بالإنجليزية يجب أن تكون أقل من 1000 حرف",
      ],
      default: "",
    },

    // الأبعاد
    dimensions: {
      height: {
        type: Number,
        min: [0, "الارتفاع يجب أن يكون أكبر من أو يساوي 0"],
      },
      width: {
        type: Number,
        min: [0, "العرض يجب أن يكون أكبر من أو يساوي 0"],
      },
      unit: {
        type: String,
        enum: ["سم", "م"],
        default: "سم",
      },
    },

    // الوزن
    weight: {
      value: {
        type: Number,
        min: [0, "الوزن يجب أن يكون أكبر من أو يساوي 0"],
      },
      unit: {
        type: String,
        enum: ["جرام", "كيلوجرام"],
        default: "جرام",
      },
    },

    // محتويات التنسيق
    arrangementContentsAr: {
      type: String,
      trim: true,
      maxlength: [1000, "محتويات التنسيق بالعربية يجب أن تكون أقل من 1000 حرف"],
      default: "",
    },
    arrangementContentsEn: {
      type: String,
      trim: true,
      maxlength: [
        1000,
        "محتويات التنسيق بالإنجليزية يجب أن تكون أقل من 1000 حرف",
      ],
      default: "",
    },

    // الحالة العامة
    isActive: {
      type: Boolean,
      default: true,
    },

    // ترتيب العرض
    sortOrder: {
      type: Number,
      default: 0,
      min: [0, "ترتيب المنتج يجب أن يكون أكبر من أو يساوي 0"],
    },

    // معلومات الإدارة
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },

    // إحصائيات
    viewCount: {
      type: Number,
      default: 0,
      min: [0, "عدد المشاهدات يجب أن يكون أكبر من أو يساوي 0"],
    },
    purchaseCount: {
      type: Number,
      default: 0,
      min: [0, "عدد المشتريات يجب أن يكون أكبر من أو يساوي 0"],
    },

    // SEO fields
    metaTitleAr: {
      type: String,
      trim: true,
      maxlength: [60, "عنوان SEO بالعربية يجب أن يكون أقل من 60 حرف"],
    },
    metaTitleEn: {
      type: String,
      trim: true,
      maxlength: [60, "عنوان SEO بالإنجليزية يجب أن يكون أقل من 60 حرف"],
    },
    metaDescriptionAr: {
      type: String,
      trim: true,
      maxlength: [160, "وصف SEO بالعربية يجب أن يكون أقل من 160 حرف"],
    },
    metaDescriptionEn: {
      type: String,
      trim: true,
      maxlength: [160, "وصف SEO بالإنجليزية يجب أن يكون أقل من 160 حرف"],
    },

    // إعدادات إضافية
    showInHomePage: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// إضافة فهارس للبحث
ProductSchema.index({
  nameAr: "text",
  nameEn: "text",
  descriptionAr: "text",
  descriptionEn: "text",
  careInstructionsAr: "text",
  careInstructionsEn: "text",
  arrangementContentsAr: "text",
  arrangementContentsEn: "text",
});

// فهارس للعلاقات
ProductSchema.index({ category: 1 });
ProductSchema.index({ occasion: 1 });
ProductSchema.index({ brand: 1 });
ProductSchema.index({ isActive: 1, sortOrder: 1 });
ProductSchema.index({ productStatus: 1 });
ProductSchema.index({ targetAudience: 1 });
ProductSchema.index({ createdBy: 1 });

// فهارس مركبة
ProductSchema.index({ category: 1, occasion: 1, brand: 1 });
ProductSchema.index({ isActive: 1, productStatus: 1 });
ProductSchema.index({ isActive: 1, targetAudience: 1 });

// Virtual field للاسم حسب اللغة
ProductSchema.virtual("name").get(function () {
  return this.nameAr || this.nameEn;
});

// Virtual field للوصف حسب اللغة
ProductSchema.virtual("description").get(function () {
  return this.descriptionAr || this.descriptionEn;
});

// Virtual field للعنوان حسب اللغة
ProductSchema.virtual("metaTitle").get(function () {
  return this.metaTitleAr || this.metaTitleEn;
});

// Virtual field للوصف حسب اللغة
ProductSchema.virtual("metaDescription").get(function () {
  return this.metaDescriptionAr || this.metaDescriptionEn;
});

// Virtual field للأبعاد كاملة
ProductSchema.virtual("fullDimensions").get(function () {
  if (!this.dimensions.height && !this.dimensions.width) {
    return null;
  }
  const { height, width, unit } = this.dimensions;
  return `الارتفاع: ${height || 0} × العرض: ${width || 0} ${unit}`;
});

// Virtual field للأبعاد بالإنجليزية
ProductSchema.virtual("fullDimensionsEn").get(function () {
  if (!this.dimensions.height && !this.dimensions.width) {
    return null;
  }
  const { height, width, unit } = this.dimensions;

  // تحويل الوحدة للإنجليزية
  const unitMap = {
    سم: "cm",
    م: "m",
  };

  const unitEn = unitMap[unit] || unit;
  return `Height: ${height || 0} × Width: ${width || 0} ${unitEn}`;
});

// Virtual field للوزن بالعربية
ProductSchema.virtual("fullWeight").get(function () {
  if (!this.weight.value) {
    return null;
  }
  const { value, unit } = this.weight;
  return `الوزن: ${value} ${unit}`;
});

// Virtual field للوزن بالإنجليزية
ProductSchema.virtual("fullWeightEn").get(function () {
  if (!this.weight.value) {
    return null;
  }
  const { value, unit } = this.weight;

  // تحويل وحدة الوزن للإنجليزية
  const weightUnitMap = {
    جرام: "g",
    كيلوجرام: "kg",
  };

  const unitEn = weightUnitMap[unit] || unit;
  return `Weight: ${value} ${unitEn}`;
});

// Middleware قبل الحفظ - تحديث ترتيب المنتجات
ProductSchema.pre("save", async function (next) {
  // إذا لم يتم تحديد ترتيب، ضع المنتج في النهاية
  if (this.isNew && this.sortOrder === 0) {
    const lastProduct = await this.constructor.findOne(
      {},
      {},
      { sort: { sortOrder: -1 } }
    );
    this.sortOrder = lastProduct ? lastProduct.sortOrder + 1 : 1;
  }
  next();
});

// Middleware بعد الحفظ - تحديث إحصائيات الفئات والمناسبات والعلامات التجارية
ProductSchema.post("save", async function (doc) {
  // تحديث عدد المنتجات في الفئة
  if (doc.category) {
    const categoryCount = await this.constructor.countDocuments({
      category: doc.category,
      isActive: true,
    });
    await mongoose.model("Category").findByIdAndUpdate(doc.category, {
      productCount: categoryCount,
    });
  }

  // تحديث عدد المنتجات في المناسبة
  if (doc.occasion) {
    const occasionCount = await this.constructor.countDocuments({
      occasion: doc.occasion,
      isActive: true,
    });
    await mongoose.model("Occasion").findByIdAndUpdate(doc.occasion, {
      productCount: occasionCount,
    });
  }

  // تحديث عدد المنتجات في العلامة التجارية
  if (doc.brand) {
    const brandCount = await this.constructor.countDocuments({
      brand: doc.brand,
      isActive: true,
    });
    await mongoose.model("Brand").findByIdAndUpdate(doc.brand, {
      productCount: brandCount,
    });
  }
});

// Middleware بعد الحذف - تحديث إحصائيات الفئات والمناسبات والعلامات التجارية
ProductSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    // تحديث عدد المنتجات في الفئة
    if (doc.category) {
      const categoryCount = await mongoose.model("Product").countDocuments({
        category: doc.category,
        isActive: true,
      });
      await mongoose.model("Category").findByIdAndUpdate(doc.category, {
        productCount: categoryCount,
      });
    }

    // تحديث عدد المنتجات في المناسبة
    if (doc.occasion) {
      const occasionCount = await mongoose.model("Product").countDocuments({
        occasion: doc.occasion,
        isActive: true,
      });
      await mongoose.model("Occasion").findByIdAndUpdate(doc.occasion, {
        productCount: occasionCount,
      });
    }

    // تحديث عدد المنتجات في العلامة التجارية
    if (doc.brand) {
      const brandCount = await mongoose.model("Product").countDocuments({
        brand: doc.brand,
        isActive: true,
      });
      await mongoose.model("Brand").findByIdAndUpdate(doc.brand, {
        productCount: brandCount,
      });
    }
  }
});

// Static method للحصول على المنتجات النشطة مرتبة
ProductSchema.statics.getActiveProducts = function (
  language = "ar",
  filters = {}
) {
  const query = { isActive: true, ...filters };

  return this.find(query)
    .populate("category", `name${language === "ar" ? "Ar" : "En"} imageUrl`)
    .populate("occasion", `name${language === "ar" ? "Ar" : "En"} imageUrl`)
    .populate("brand", `name${language === "ar" ? "Ar" : "En"} imageUrl`)
    .sort({ sortOrder: 1, createdAt: -1 })
    .select(
      `name${language === "ar" ? "Ar" : "En"} description${
        language === "ar" ? "Ar" : "En"
      } mainImage additionalImages price productStatus targetAudience sortOrder`
    );
};

// Static method للبحث في المنتجات
ProductSchema.statics.searchProducts = function (
  query,
  language = "ar",
  options = {}
) {
  const { limit = 10, page = 1, isActive = true, filters = {} } = options;

  const searchFields =
    language === "ar"
      ? {
          nameAr: { $regex: query, $options: "i" },
          descriptionAr: { $regex: query, $options: "i" },
          careInstructionsAr: { $regex: query, $options: "i" },
          arrangementContentsAr: { $regex: query, $options: "i" },
        }
      : {
          nameEn: { $regex: query, $options: "i" },
          descriptionEn: { $regex: query, $options: "i" },
          careInstructionsEn: { $regex: query, $options: "i" },
          arrangementContentsEn: { $regex: query, $options: "i" },
        };

  return this.find({ ...searchFields, isActive, ...filters })
    .populate("category", `name${language === "ar" ? "Ar" : "En"} imageUrl`)
    .populate("occasion", `name${language === "ar" ? "Ar" : "En"} imageUrl`)
    .populate("brand", `name${language === "ar" ? "Ar" : "En"} imageUrl`)
    .sort({ sortOrder: 1, createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select(
      `name${language === "ar" ? "Ar" : "En"} description${
        language === "ar" ? "Ar" : "En"
      } mainImage additionalImages price productStatus targetAudience sortOrder`
    );
};

// Static method لإعادة ترتيب المنتجات
ProductSchema.statics.reorderProducts = async function (productOrders) {
  const bulkOps = productOrders.map(({ productId, sortOrder }) => ({
    updateOne: {
      filter: { _id: productId },
      update: { sortOrder },
    },
  }));

  return this.bulkWrite(bulkOps);
};

// Method لتحديث إحصائيات المنتج
ProductSchema.methods.incrementViewCount = function () {
  this.viewCount += 1;
  return this.save();
};

ProductSchema.methods.incrementPurchaseCount = function () {
  this.purchaseCount += 1;
  return this.save();
};

// Static method لزيادة المشاهدات تلقائياً عند جلب المنتج
ProductSchema.statics.incrementViewsOnGet = async function (productId) {
  try {
    await this.findByIdAndUpdate(
      productId,
      { $inc: { viewCount: 1 } },
      { new: false } // لا نعيد المنتج المحدث لتوفير الأداء
    );
  } catch (error) {
    console.error("Error incrementing view count:", error);
  }
};

// Static method لزيادة المشتريات تلقائياً عند إنشاء طلب
ProductSchema.statics.incrementPurchasesOnOrder = async function (productIds) {
  try {
    if (!Array.isArray(productIds) || productIds.length === 0) return;

    await this.updateMany(
      { _id: { $in: productIds } },
      { $inc: { purchaseCount: 1 } }
    );
  } catch (error) {
    console.error("Error incrementing purchase count:", error);
  }
};

// Method لتفعيل/إلغاء تفعيل المنتج
ProductSchema.methods.toggleStatus = function () {
  this.isActive = !this.isActive;
  return this.save();
};

const Product = mongoose.model("Product", ProductSchema);
export default Product;
