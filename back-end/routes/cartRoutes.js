import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount,
} from "../controllers/cartController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get user's cart
router.get("/", getCart);

// Get cart count
router.get("/count", getCartCount);

// Add item to cart
router.post("/add", addToCart);

// Update item quantity
router.put("/update/:productId", updateCartItem);

// Remove item from cart
router.delete("/remove/:productId", removeFromCart);

// Clear entire cart
router.delete("/clear", clearCart);

export default router;
