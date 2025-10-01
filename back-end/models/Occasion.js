import mongoose from "mongoose";
import validator from "validator";

const OccasionSchema = new mongoose.Schema(
  {
    nameAr: {
      type: String,
      required: [true, "اسم المناسبة بالعربية مطلوب"],
      trim: true,
      minlength: [2, "اسم المناسبة بالعربية يجب أن يكون على الأقل حرفين"],
      maxlength: [100, "اسم المناسبة بالعربية يجب أن يكون أقل من 100 حرف"],
    },
    nameEn: {
      type: String,
      required: [true, "اسم المناسبة بالإنجليزية مطلوب"],
      trim: true,
      minlength: [2, "اسم المناسبة بالإنجليزية يجب أن يكون على الأقل حرفين"],
      maxlength: [100, "اسم المناسبة بالإنجليزية يجب أن يكون أقل من 100 حرف"],
    },
    descriptionAr: {
      type: String,
      trim: true,
      maxlength: [500, "وصف المناسبة بالعربية يجب أن يكون أقل من 500 حرف"],
      default: "",
    },
    descriptionEn: {
      type: String,
      trim: true,
      maxlength: [500, "وصف المناسبة بالإنجليزية يجب أن يكون أقل من 500 حرف"],
      default: "",
    },
    imageUrl: {
      type: String,
      required: [true, "صورة المناسبة مطلوبة"],
      validate: {
        validator: function (url) {
          return validator.isURL(url, {
            protocols: ["http", "https"],
            require_protocol: true,
          });
        },
        message: "صورة المناسبة يجب أن تكون رابط صحيح",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
      min: [0, "ترتيب المناسبة يجب أن يكون أكبر من أو يساوي 0"],
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
    // إحصائيات المناسبة
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// إضافة فهرس للبحث
OccasionSchema.index({
  nameAr: "text",
  nameEn: "text",
  descriptionAr: "text",
  descriptionEn: "text",
});
OccasionSchema.index({ isActive: 1, sortOrder: 1 });
OccasionSchema.index({ createdBy: 1 });

// إضافة فهارس فريدة للأسماء
OccasionSchema.index({ nameAr: 1 }, { unique: true, sparse: true });
OccasionSchema.index({ nameEn: 1 }, { unique: true, sparse: true });

// Virtual field للاسم حسب اللغة
OccasionSchema.virtual("name").get(function () {
  return this.nameAr || this.nameEn;
});

// Virtual field للوصف حسب اللغة
OccasionSchema.virtual("description").get(function () {
  return this.descriptionAr || this.descriptionEn;
});

// Virtual field للعنوان حسب اللغة
OccasionSchema.virtual("metaTitle").get(function () {
  return this.metaTitleAr || this.metaTitleEn;
});

// Virtual field للوصف حسب اللغة
OccasionSchema.virtual("metaDescription").get(function () {
  return this.metaDescriptionAr || this.metaDescriptionEn;
});

// Middleware قبل الحفظ - تحديث ترتيب المناسبات
OccasionSchema.pre("save", async function (next) {
  // إذا لم يتم تحديد ترتيب، ضع المناسبة في النهاية
  if (this.isNew && this.sortOrder === 0) {
    const lastOccasion = await this.constructor.findOne(
      {},
      {},
      { sort: { sortOrder: -1 } }
    );
    this.sortOrder = lastOccasion ? lastOccasion.sortOrder + 1 : 1;
  }
  next();
});

// Middleware بعد الحفظ - تحديث إحصائيات المنتجات
OccasionSchema.post("save", async function (doc) {
  // يمكن إضافة منطق لتحديث عدد المنتجات هنا
  // سيتم تنفيذها لاحقاً عند ربط المنتجات بالمناسبات
});

// Static method للحصول على المناسبات النشطة مرتبة
OccasionSchema.statics.getActiveOccasions = function (language = "ar") {
  return this.find({ isActive: true })
    .sort({ sortOrder: 1, createdAt: -1 })
    .select(
      `name${language === "ar" ? "Ar" : "En"} description${
        language === "ar" ? "Ar" : "En"
      } imageUrl sortOrder`
    );
};

// Static method للبحث في المناسبات
OccasionSchema.statics.searchOccasions = function (
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

// Static method لإعادة ترتيب المناسبات
OccasionSchema.statics.reorderOccasions = async function (occasionOrders) {
  const bulkOps = occasionOrders.map(({ occasionId, sortOrder }) => ({
    updateOne: {
      filter: { _id: occasionId },
      update: { sortOrder },
    },
  }));

  return this.bulkWrite(bulkOps);
};

// Method لتحديث إحصائيات المناسبة
OccasionSchema.methods.updateProductCount = async function () {
  // سيتم تنفيذها لاحقاً عند ربط المنتجات
  return this;
};

// Method لتفعيل/إلغاء تفعيل المناسبة
OccasionSchema.methods.toggleStatus = function () {
  this.isActive = !this.isActive;
  return this.save();
};

const Occasion = mongoose.model("Occasion", OccasionSchema);
export default Occasion;
