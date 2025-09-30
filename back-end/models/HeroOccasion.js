import mongoose from "mongoose";

const heroOccasionSchema = new mongoose.Schema(
  {
    nameAr: {
      type: String,
      required: true,
      trim: true,
    },
    nameEn: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
      set: function (v) {
        // تحديد الوقت إلى 00:00:00 من نفس اليوم (UTC)
        if (v) {
          const date = new Date(v);
          date.setUTCHours(0, 0, 0, 0);
          return date;
        }
        return v;
      },
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

          // تحويل التواريخ إلى نفس اليوم للمقارنة (استخدام UTC)
          const startDateOnly = new Date(
            Date.UTC(
              startDate.getUTCFullYear(),
              startDate.getUTCMonth(),
              startDate.getUTCDate()
            )
          );
          const endDateOnly = new Date(
            Date.UTC(
              endDate.getUTCFullYear(),
              endDate.getUTCMonth(),
              endDate.getUTCDate()
            )
          );

          return endDateOnly >= startDateOnly;
        },
        message: "تاريخ الانتهاء يجب أن يكون بعد أو يساوي تاريخ البداية",
      },
      set: function (v) {
        // تحديد الوقت إلى 23:59:59 من نفس اليوم (UTC)
        if (v) {
          const date = new Date(v);
          date.setUTCHours(23, 59, 59, 999);
          return date;
        }
        return v;
      },
    },
    images: [
      {
        type: String,
        required: true,
        validate: {
          validator: function (v) {
            return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
          },
          message: "يجب أن تكون الصورة رابط صحيح",
        },
      },
    ],
    celebratoryMessageAr: {
      type: String,
      required: true,
      trim: true,
    },
    celebratoryMessageEn: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
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
heroOccasionSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
heroOccasionSchema.index({ startDate: 1, endDate: 1 });
heroOccasionSchema.index({ nameAr: "text", nameEn: "text" });

// التحقق من أن كل مناسبة لها على الأقل صورة واحدة
heroOccasionSchema.pre("save", function (next) {
  if (this.images.length === 0) {
    return next(new Error("يجب أن تحتوي المناسبة على صورة واحدة على الأقل"));
  }
  next();
});

// التحقق من أن المناسبة نشطة في الفترة الزمنية المحددة
heroOccasionSchema.virtual("isCurrentlyActive").get(function () {
  const now = new Date();
  return (
    this.isActive &&
    now.getTime() >= this.startDate.getTime() &&
    now.getTime() <= this.endDate.getTime()
  );
});

// دالة للحصول على المناسبات النشطة حالياً
heroOccasionSchema.statics.getActiveOccasions = function (limit = 10) {
  const now = new Date();
  return this.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  })
    .sort({ startDate: 1, createdAt: -1 })
    .limit(limit);
};

// دالة للحصول على المناسبات القادمة
heroOccasionSchema.statics.getUpcomingOccasions = function (limit = 5) {
  const now = new Date();
  return this.find({
    isActive: true,
    startDate: { $gt: now },
  })
    .sort({ startDate: 1 })
    .limit(limit);
};

// دالة للبحث في المناسبات
heroOccasionSchema.statics.searchOccasions = function (query, language = "ar") {
  const searchField = language === "en" ? "nameEn" : "nameAr";
  const now = new Date();
  return this.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
    [searchField]: { $regex: query, $options: "i" },
  }).sort({ startDate: 1, createdAt: -1 });
};

// دالة للحصول على المناسبات المنتهية
heroOccasionSchema.statics.getExpiredOccasions = function (limit = 10) {
  const now = new Date();
  return this.find({
    endDate: { $lt: now },
  })
    .sort({ endDate: -1 })
    .limit(limit);
};

const HeroOccasion = mongoose.model("HeroOccasion", heroOccasionSchema);

export default HeroOccasion;
