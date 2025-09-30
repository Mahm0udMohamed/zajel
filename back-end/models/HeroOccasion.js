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
    date: {
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
heroOccasionSchema.index({ isActive: 1, date: 1 });
heroOccasionSchema.index({ date: 1 });
heroOccasionSchema.index({ nameAr: "text", nameEn: "text" });

// التحقق من أن كل مناسبة لها على الأقل صورة واحدة
heroOccasionSchema.pre("save", function (next) {
  if (this.images.length === 0) {
    return next(new Error("يجب أن تحتوي المناسبة على صورة واحدة على الأقل"));
  }
  next();
});

// دالة للحصول على المناسبات النشطة مرتبة حسب التاريخ
heroOccasionSchema.statics.getActiveOccasions = function () {
  return this.find({ isActive: true }).sort({ date: 1 });
};

// دالة للحصول على المناسبات القادمة
heroOccasionSchema.statics.getUpcomingOccasions = function (limit = 5) {
  const today = new Date();
  return this.find({
    isActive: true,
    date: { $gte: today },
  })
    .sort({ date: 1 })
    .limit(limit);
};

// دالة للبحث في المناسبات
heroOccasionSchema.statics.searchOccasions = function (query, language = "ar") {
  const searchField = language === "en" ? "nameEn" : "nameAr";
  return this.find({
    isActive: true,
    [searchField]: { $regex: query, $options: "i" },
  }).sort({ date: 1 });
};

const HeroOccasion = mongoose.model("HeroOccasion", heroOccasionSchema);

export default HeroOccasion;
