import mongoose from "mongoose";
import validator from "validator";

const CategorySchema = new mongoose.Schema(
  {
    nameAr: {
      type: String,
      required: [true, "اسم الفئة بالعربية مطلوب"],
      trim: true,
      minlength: [2, "اسم الفئة بالعربية يجب أن يكون على الأقل حرفين"],
      maxlength: [100, "اسم الفئة بالعربية يجب أن يكون أقل من 100 حرف"],
    },
    nameEn: {
      type: String,
      required: [true, "اسم الفئة بالإنجليزية مطلوب"],
      trim: true,
      minlength: [2, "اسم الفئة بالإنجليزية يجب أن يكون على الأقل حرفين"],
      maxlength: [100, "اسم الفئة بالإنجليزية يجب أن يكون أقل من 100 حرف"],
    },
    descriptionAr: {
      type: String,
      trim: true,
      maxlength: [500, "وصف الفئة بالعربية يجب أن يكون أقل من 500 حرف"],
      default: "",
    },
    descriptionEn: {
      type: String,
      trim: true,
      maxlength: [500, "وصف الفئة بالإنجليزية يجب أن يكون أقل من 500 حرف"],
      default: "",
    },
    imageUrl: {
      type: String,
      required: [true, "صورة الفئة مطلوبة"],
      validate: {
        validator: function (url) {
          return validator.isURL(url, {
            protocols: ["http", "https"],
            require_protocol: true,
          });
        },
        message: "صورة الفئة يجب أن تكون رابط صحيح",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
      min: [0, "ترتيب الفئة يجب أن يكون أكبر من أو يساوي 0"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    // إحصائيات الفئة
    productCount: {
      type: Number,
      default: 0,
      min: [0, "عدد المنتجات يجب أن يكون أكبر من أو يساوي 0"],
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
    showInNavigation: {
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

// إضافة فهرس للبحث
CategorySchema.index({
  nameAr: "text",
  nameEn: "text",
  descriptionAr: "text",
  descriptionEn: "text",
});
CategorySchema.index({ isActive: 1, sortOrder: 1 });
CategorySchema.index({ createdBy: 1 });

// Virtual field للاسم حسب اللغة
CategorySchema.virtual("name").get(function () {
  return this.nameAr || this.nameEn;
});

// Virtual field للوصف حسب اللغة
CategorySchema.virtual("description").get(function () {
  return this.descriptionAr || this.descriptionEn;
});

// Virtual field للعنوان حسب اللغة
CategorySchema.virtual("metaTitle").get(function () {
  return this.metaTitleAr || this.metaTitleEn;
});

// Virtual field للوصف حسب اللغة
CategorySchema.virtual("metaDescription").get(function () {
  return this.metaDescriptionAr || this.metaDescriptionEn;
});

// Middleware قبل الحفظ - تحديث ترتيب الفئات
CategorySchema.pre("save", async function (next) {
  // إذا لم يتم تحديد ترتيب، ضع الفئة في النهاية
  if (this.isNew && this.sortOrder === 0) {
    const lastCategory = await this.constructor.findOne(
      {},
      {},
      { sort: { sortOrder: -1 } }
    );
    this.sortOrder = lastCategory ? lastCategory.sortOrder + 1 : 1;
  }
  next();
});

// Middleware بعد الحفظ - تحديث إحصائيات المنتجات
CategorySchema.post("save", async function (doc) {
  // يمكن إضافة منطق لتحديث عدد المنتجات هنا
  // سيتم تنفيذها لاحقاً عند ربط المنتجات بالفئات
});

// Static method للحصول على الفئات النشطة مرتبة
CategorySchema.statics.getActiveCategories = function (language = "ar") {
  return this.find({ isActive: true })
    .sort({ sortOrder: 1, createdAt: -1 })
    .select(
      `name${language === "ar" ? "Ar" : "En"} description${
        language === "ar" ? "Ar" : "En"
      } imageUrl sortOrder`
    );
};

// Static method للبحث في الفئات
CategorySchema.statics.searchCategories = function (
  query,
  language = "ar",
  options = {}
) {
  const { limit = 10, page = 1, isActive = true } = options;

  const searchFields =
    language === "ar"
      ? {
          nameAr: { $regex: query, $options: "i" },
          descriptionAr: { $regex: query, $options: "i" },
        }
      : {
          nameEn: { $regex: query, $options: "i" },
          descriptionEn: { $regex: query, $options: "i" },
        };

  return this.find({ ...searchFields, isActive })
    .sort({ sortOrder: 1, createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select(
      `name${language === "ar" ? "Ar" : "En"} description${
        language === "ar" ? "Ar" : "En"
      } imageUrl sortOrder`
    );
};

// Static method لإعادة ترتيب الفئات
CategorySchema.statics.reorderCategories = async function (categoryOrders) {
  const bulkOps = categoryOrders.map(({ categoryId, sortOrder }) => ({
    updateOne: {
      filter: { _id: categoryId },
      update: { sortOrder },
    },
  }));

  return this.bulkWrite(bulkOps);
};

// Method لتحديث إحصائيات الفئة
CategorySchema.methods.updateProductCount = async function () {
  // سيتم تنفيذها لاحقاً عند ربط المنتجات
  return this;
};

// Method لتفعيل/إلغاء تفعيل الفئة
CategorySchema.methods.toggleStatus = function () {
  this.isActive = !this.isActive;
  return this.save();
};

const Category = mongoose.model("Category", CategorySchema);
export default Category;
