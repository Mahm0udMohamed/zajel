import mongoose from "mongoose";

const FavoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    productId: {
      type: Number,
      required: true,
    },
    productData: {
      nameEn: { type: String, required: true },
      nameAr: { type: String, required: true },
      price: { type: Number, required: true },
      imageUrl: { type: String, required: true },
      categoryId: { type: String },
      occasionId: { type: String },
      isBestSeller: { type: Boolean, default: false },
      isSpecialGift: { type: Boolean, default: false },
    },
  },
  { 
    timestamps: true,
    // Compound index to ensure one favorite per user per product
    indexes: [
      { userId: 1, productId: 1 },
    ]
  }
);

// Ensure unique favorite per user per product
FavoriteSchema.index({ userId: 1, productId: 1 }, { unique: true });

const Favorite = mongoose.model("Favorite", FavoriteSchema);
export default Favorite;