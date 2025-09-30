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
    showInNavigation: {
      type: Boolean,
      default: true,
    },
    // معرف فريد للمناسبة (مثل valentines-day)
    slug: {
      type: String,
      required: [true, "معرف المناسبة مطلوب"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-z0-9-]+$/,
        "معرف المناسبة يجب أن يحتوي على أحرف إنجليزية وأرقام وشرطات فقط",
      ],
    },
    // نوع المناسبة (موسمية، دائمة، إلخ)
    occasionType: {
      type: String,
      enum: ["seasonal", "permanent", "special"],
      default: "permanent",
    },
    // تواريخ المناسبة (للمناسبات الموسمية)
    startDate: {
      type: Date,
      required: function () {
        return this.occasionType === "seasonal";
      },
    },
    endDate: {
      type: Date,
      required: function () {
        return this.occasionType === "seasonal";
      },
    },
    // رسالة احتفالية
    celebratoryMessageAr: {
      type: String,
      trim: true,
      maxlength: [
        200,
        "الرسالة الاحتفالية بالعربية يجب أن تكون أقل من 200 حرف",
      ],
    },
    celebratoryMessageEn: {
      type: String,
      trim: true,
      maxlength: [
        200,
        "الرسالة الاحتفالية بالإنجليزية يجب أن تكون أقل من 200 حرف",
      ],
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
OccasionSchema.index({ slug: 1 });
OccasionSchema.index({ occasionType: 1 });
OccasionSchema.index({ startDate: 1, endDate: 1 });

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

// Virtual field للرسالة الاحتفالية حسب اللغة
OccasionSchema.virtual("celebratoryMessage").get(function () {
  return this.celebratoryMessageAr || this.celebratoryMessageEn;
});

// Virtual field للتحقق من أن المناسبة نشطة حالياً
OccasionSchema.virtual("isCurrentlyActive").get(function () {
  if (this.occasionType !== "seasonal" || !this.startDate || !this.endDate) {
    return this.isActive;
  }

  const now = new Date();
  return this.isActive && now >= this.startDate && now <= this.endDate;
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
      } imageUrl sortOrder slug occasionType startDate endDate celebratoryMessage${
        language === "ar" ? "Ar" : "En"
      }`
    );
};

// Static method للحصول على المناسبات الموسمية النشطة حالياً
OccasionSchema.statics.getCurrentSeasonalOccasions = function (
  language = "ar"
) {
  const now = new Date();
  return this.find({
    isActive: true,
    occasionType: "seasonal",
    startDate: { $lte: now },
    endDate: { $gte: now },
  })
    .sort({ sortOrder: 1, startDate: 1 })
    .select(
      `name${language === "ar" ? "Ar" : "En"} description${
        language === "ar" ? "Ar" : "En"
      } imageUrl sortOrder slug startDate endDate celebratoryMessage${
        language === "ar" ? "Ar" : "En"
      }`
    );
};

// Static method للحصول على المناسبات القادمة
OccasionSchema.statics.getUpcomingOccasions = function (
  language = "ar",
  limit = 5
) {
  const now = new Date();
  return this.find({
    isActive: true,
    occasionType: "seasonal",
    startDate: { $gt: now },
  })
    .sort({ startDate: 1 })
    .limit(limit)
    .select(
      `name${language === "ar" ? "Ar" : "En"} description${
        language === "ar" ? "Ar" : "En"
      } imageUrl sortOrder slug startDate endDate celebratoryMessage${
        language === "ar" ? "Ar" : "En"
      }`
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
      } imageUrl sortOrder slug occasionType startDate endDate celebratoryMessage${
        language === "ar" ? "Ar" : "En"
      }`
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

// Method للتحقق من أن المناسبة نشطة حالياً
OccasionSchema.methods.checkIfCurrentlyActive = function () {
  if (this.occasionType !== "seasonal" || !this.startDate || !this.endDate) {
    return this.isActive;
  }

  const now = new Date();
  return this.isActive && now >= this.startDate && now <= this.endDate;
};

const Occasion = mongoose.model("Occasion", OccasionSchema);
export default Occasion;
