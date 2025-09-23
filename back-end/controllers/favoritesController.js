import Favorite from "../models/Favorite.js";
import User from "../models/User.js";

// Get user's favorites
export const getFavorites = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const favorites = await Favorite.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    // Transform to match frontend format
    const formattedFavorites = favorites.map(fav => ({
      id: fav.productId,
      nameEn: fav.productData.nameEn,
      nameAr: fav.productData.nameAr,
      price: fav.productData.price,
      imageUrl: fav.productData.imageUrl,
      categoryId: fav.productData.categoryId,
      occasionId: fav.productData.occasionId,
      isBestSeller: fav.productData.isBestSeller,
      isSpecialGift: fav.productData.isSpecialGift,
      dateAdded: fav.createdAt.toISOString(),
    }));

    res.status(200).json({
      favorites: formattedFavorites,
      count: formattedFavorites.length,
    });
  } catch (err) {
    console.error("Error fetching favorites:", err);
    res.status(500).json({ message: "خطأ في جلب المفضلة" });
  }
};

// Add to favorites
export const addToFavorites = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productData } = req.body;

    // Validate required fields
    if (!productData || !productData.id) {
      return res.status(400).json({ message: "بيانات المنتج مطلوبة" });
    }

    // Check if already exists
    const existingFavorite = await Favorite.findOne({
      userId,
      productId: productData.id,
    });

    if (existingFavorite) {
      return res.status(400).json({ message: "المنتج موجود بالفعل في المفضلة" });
    }

    // Create new favorite
    const favorite = new Favorite({
      userId,
      productId: productData.id,
      productData: {
        nameEn: productData.nameEn,
        nameAr: productData.nameAr,
        price: productData.price,
        imageUrl: productData.imageUrl,
        categoryId: productData.categoryId,
        occasionId: productData.occasionId,
        isBestSeller: productData.isBestSeller || false,
        isSpecialGift: productData.isSpecialGift || false,
      },
    });

    await favorite.save();

    res.status(201).json({
      message: "تم إضافة المنتج إلى المفضلة بنجاح",
      favorite: {
        id: productData.id,
        dateAdded: favorite.createdAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("Error adding to favorites:", err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "المنتج موجود بالفعل في المفضلة" });
    }
    res.status(500).json({ message: "خطأ في إضافة المنتج إلى المفضلة" });
  }
};

// Remove from favorites
export const removeFromFavorites = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;

    const result = await Favorite.findOneAndDelete({
      userId,
      productId: parseInt(productId),
    });

    if (!result) {
      return res.status(404).json({ message: "المنتج غير موجود في المفضلة" });
    }

    res.status(200).json({
      message: "تم حذف المنتج من المفضلة بنجاح",
    });
  } catch (err) {
    console.error("Error removing from favorites:", err);
    res.status(500).json({ message: "خطأ في حذف المنتج من المفضلة" });
  }
};

// Clear all favorites
export const clearFavorites = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await Favorite.deleteMany({ userId });

    res.status(200).json({
      message: "تم مسح جميع المفضلة بنجاح",
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error("Error clearing favorites:", err);
    res.status(500).json({ message: "خطأ في مسح المفضلة" });
  }
};

// Check if product is favorite
export const checkFavorite = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;

    const favorite = await Favorite.findOne({
      userId,
      productId: parseInt(productId),
    });

    res.status(200).json({
      isFavorite: !!favorite,
    });
  } catch (err) {
    console.error("Error checking favorite:", err);
    res.status(500).json({ message: "خطأ في التحقق من المفضلة" });
  }
};

// Get favorites count
export const getFavoritesCount = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const count = await Favorite.countDocuments({ userId });

    res.status(200).json({ count });
  } catch (err) {
    console.error("Error getting favorites count:", err);
    res.status(500).json({ message: "خطأ في جلب عدد المفضلة" });
  }
};