import mongoose from "mongoose";

const heroPromotionSchema = new mongoose.Schema(
  {
    titleAr: {
      type: String,
      required: true,
      trim: true,
    },
    titleEn: {
      type: String,
      required: true,
      trim: true,
    },
    subtitleAr: {
      type: String,
      required: true,
      trim: true,
    },
    subtitleEn: {
      type: String,
      required: true,
      trim: true,
    },
    buttonTextAr: {
      type: String,
      required: true,
      trim: true,
    },
    buttonTextEn: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^https?:\/\/.+/.test(v) || v.startsWith("/");
        },
        message: "يجب أن يكون الرابط رابط صحيح",
      },
    },
    image: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
        },
        message: "يجب أن تكون الصورة رابط صحيح",
      },
    },
    gradient: {
      type: String,
      required: true,
      trim: true,
      default: "from-primary-500 to-secondary-500",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
      default: 1,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (v) {
          // التحقق من وجود startDate
          if (!this.startDate) return true;

          // التحقق من صحة التواريخ
          const startDate = new Date(this.startDate);
          const endDate = new Date(v);

          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return false;
          }

          return endDate > startDate;
        },
        message: "تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية",
      },
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// فهرسة للحصول على أفضل أداء
heroPromotionSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
heroPromotionSchema.index({ priority: 1 });
heroPromotionSchema.index({ titleAr: "text", titleEn: "text" });

// التحقق من أن العرض نشط في الفترة الزمنية المحددة
heroPromotionSchema.virtual("isCurrentlyActive").get(function () {
  const now = new Date();
  return this.isActive && now >= this.startDate && now <= this.endDate;
});

// دالة للحصول على العروض النشطة حالياً
heroPromotionSchema.statics.getActivePromotions = function (limit = 10) {
  const now = new Date();
  return this.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  })
    .sort({ priority: 1, createdAt: -1 })
    .limit(limit);
};

// دالة للحصول على العروض القادمة
heroPromotionSchema.statics.getUpcomingPromotions = function (limit = 5) {
  const now = new Date();
  return this.find({
    isActive: true,
    startDate: { $gt: now },
  })
    .sort({ startDate: 1, priority: 1 })
    .limit(limit);
};

// دالة للبحث في العروض
heroPromotionSchema.statics.searchPromotions = function (
  query,
  language = "ar"
) {
  const searchField = language === "en" ? "titleEn" : "titleAr";
  const now = new Date();
  return this.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
    [searchField]: { $regex: query, $options: "i" },
  }).sort({ priority: 1, createdAt: -1 });
};

// دالة للحصول على العروض المنتهية
heroPromotionSchema.statics.getExpiredPromotions = function (limit = 10) {
  const now = new Date();
  return this.find({
    endDate: { $lt: now },
  })
    .sort({ endDate: -1 })
    .limit(limit);
};

const HeroPromotion = mongoose.model("HeroPromotion", heroPromotionSchema);

export default HeroPromotion;
