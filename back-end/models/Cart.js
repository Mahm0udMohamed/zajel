import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema({
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
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
}, { _id: false });

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    items: [CartItemSchema],
    totalAmount: {
      type: Number,
      default: 0,
    },
    totalItems: {
      type: Number,
      default: 0,
    },
  },
  { 
    timestamps: true,
  }
);

// Calculate totals before saving
CartSchema.pre('save', function(next) {
  this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.totalAmount = this.items.reduce((sum, item) => sum + (item.productData.price * item.quantity), 0);
  next();
});

const Cart = mongoose.model("Cart", CartSchema);
export default Cart;