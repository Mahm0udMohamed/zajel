import express from "express";
import {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  clearFavorites,
  checkFavorite,
  getFavoritesCount,
} from "../controllers/favoritesController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get user's favorites
router.get("/", getFavorites);

// Get favorites count
router.get("/count", getFavoritesCount);

// Check if product is favorite
router.get("/check/:productId", checkFavorite);

// Add to favorites
router.post("/add", addToFavorites);

// Remove from favorites
router.delete("/remove/:productId", removeFromFavorites);

// Clear all favorites
router.delete("/clear", clearFavorites);

export default router;