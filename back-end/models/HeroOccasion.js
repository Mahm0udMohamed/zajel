import mongoose from "mongoose";

const heroOccasionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
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
    priority: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      default: 5,
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
heroOccasionSchema.index({ id: 1 });
heroOccasionSchema.index({ isActive: 1, priority: 1 });
heroOccasionSchema.index({ date: 1 });
heroOccasionSchema.index({ nameAr: "text", nameEn: "text" });

// التحقق من أن كل مناسبة لها على الأقل صورة واحدة
heroOccasionSchema.pre("save", function (next) {
  if (this.images.length === 0) {
    return next(new Error("يجب أن تحتوي المناسبة على صورة واحدة على الأقل"));
  }
  next();
});

// دالة للحصول على المناسبات النشطة مرتبة حسب الأولوية
heroOccasionSchema.statics.getActiveOccasions = function () {
  return this.find({ isActive: true }).sort({ priority: 1, date: 1 });
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
  }).sort({ priority: 1 });
};

const HeroOccasion = mongoose.model("HeroOccasion", heroOccasionSchema);

export default HeroOccasion;
