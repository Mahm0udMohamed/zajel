import mongoose from "mongoose";
import validator from "validator";

const BrandSchema = new mongoose.Schema(
  {
    nameAr: {
      type: String,
      required: [true, "اسم العلامة التجارية بالعربية مطلوب"],
      trim: true,
      minlength: [
        2,
        "اسم العلامة التجارية بالعربية يجب أن يكون على الأقل حرفين",
      ],
      maxlength: [
        100,
        "اسم العلامة التجارية بالعربية يجب أن يكون أقل من 100 حرف",
      ],
    },
    nameEn: {
      type: String,
      required: [true, "اسم العلامة التجارية بالإنجليزية مطلوب"],
      trim: true,
      minlength: [
        2,
        "اسم العلامة التجارية بالإنجليزية يجب أن يكون على الأقل حرفين",
      ],
      maxlength: [
        100,
        "اسم العلامة التجارية بالإنجليزية يجب أن يكون أقل من 100 حرف",
      ],
    },
    descriptionAr: {
      type: String,
      trim: true,
      maxlength: [
        500,
        "وصف العلامة التجارية بالعربية يجب أن يكون أقل من 500 حرف",
      ],
      default: "",
    },
    descriptionEn: {
      type: String,
      trim: true,
      maxlength: [
        500,
        "وصف العلامة التجارية بالإنجليزية يجب أن يكون أقل من 500 حرف",
      ],
      default: "",
    },
    imageUrl: {
      type: String,
      required: [true, "صورة العلامة التجارية مطلوبة"],
      validate: {
        validator: function (url) {
          return validator.isURL(url, {
            protocols: ["http", "https"],
            require_protocol: true,
          });
        },
        message: "صورة العلامة التجارية يجب أن تكون رابط صحيح",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
      min: [0, "ترتيب العلامة التجارية يجب أن يكون أكبر من أو يساوي 0"],
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
    // إحصائيات العلامة التجارية
    productCount: {
      type: Number,
      default: 0,
      min: [0, "عدد المنتجات يجب أن يكون أكبر من أو يساوي 0"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// إضافة فهرس للبحث
BrandSchema.index({
  nameAr: "text",
  nameEn: "text",
  descriptionAr: "text",
  descriptionEn: "text",
});
BrandSchema.index({ isActive: 1, sortOrder: 1 });
BrandSchema.index({ createdBy: 1 });

// إضافة فهارس فريدة للأسماء
BrandSchema.index({ nameAr: 1 }, { unique: true, sparse: true });
BrandSchema.index({ nameEn: 1 }, { unique: true, sparse: true });

// Virtual field للاسم حسب اللغة
BrandSchema.virtual("name").get(function () {
  return this.nameAr || this.nameEn;
});

// Virtual field للوصف حسب اللغة
BrandSchema.virtual("description").get(function () {
  return this.descriptionAr || this.descriptionEn;
});

// Middleware قبل الحفظ - تحديث ترتيب العلامات التجارية
BrandSchema.pre("save", async function (next) {
  // إذا لم يتم تحديد ترتيب، ضع العلامة التجارية في النهاية
  if (this.isNew && this.sortOrder === 0) {
    const lastBrand = await this.constructor.findOne(
      {},
      {},
      { sort: { sortOrder: -1 } }
    );
    this.sortOrder = lastBrand ? lastBrand.sortOrder + 1 : 1;
  }
  next();
});

// Middleware بعد الحفظ - تحديث إحصائيات المنتجات
BrandSchema.post("save", async function (doc) {
  // يمكن إضافة منطق لتحديث عدد المنتجات هنا
  // سيتم تنفيذها لاحقاً عند ربط المنتجات بالعلامات التجارية
});

// Static method للحصول على العلامات التجارية النشطة مرتبة
BrandSchema.statics.getActiveBrands = function (language = "ar") {
  return this.find({ isActive: true })
    .sort({ sortOrder: 1, createdAt: -1 })
    .select(
      `name${language === "ar" ? "Ar" : "En"} description${
        language === "ar" ? "Ar" : "En"
      } imageUrl sortOrder`
    );
};

// Static method للبحث في العلامات التجارية
BrandSchema.statics.searchBrands = function (
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

// Static method لإعادة ترتيب العلامات التجارية
BrandSchema.statics.reorderBrands = async function (brandOrders) {
  const bulkOps = brandOrders.map(({ brandId, sortOrder }) => ({
    updateOne: {
      filter: { _id: brandId },
      update: { sortOrder },
    },
  }));

  return this.bulkWrite(bulkOps);
};

// Method لتحديث إحصائيات العلامة التجارية
BrandSchema.methods.updateProductCount = async function () {
  // سيتم تنفيذها لاحقاً عند ربط المنتجات
  return this;
};

// Method لتفعيل/إلغاء تفعيل العلامة التجارية
BrandSchema.methods.toggleStatus = function () {
  this.isActive = !this.isActive;
  return this.save();
};

const Brand = mongoose.model("Brand", BrandSchema);
export default Brand;
