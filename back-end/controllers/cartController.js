import Cart from "../models/Cart.js";
import User from "../models/User.js";

// Get user's cart
export const getCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      // Create empty cart if doesn't exist
      cart = new Cart({
        userId,
        items: [],
        totalAmount: 0,
        totalItems: 0,
      });
      await cart.save();
    }

    // Transform to match frontend format
    const formattedCart = {
      items: cart.items.map(item => ({
        id: item.productId,
        nameEn: item.productData.nameEn,
        nameAr: item.productData.nameAr,
        price: item.productData.price,
        imageUrl: item.productData.imageUrl,
        quantity: item.quantity,
        categoryId: item.productData.categoryId,
        occasionId: item.productData.occasionId,
        isBestSeller: item.productData.isBestSeller,
        isSpecialGift: item.productData.isSpecialGift,
      })),
      totalAmount: cart.totalAmount,
      totalItems: cart.totalItems,
      cartCount: cart.totalItems,
    };

    res.status(200).json(formattedCart);
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ message: "خطأ في جلب السلة" });
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productData, quantity = 1 } = req.body;

    // Validate required fields
    if (!productData || !productData.id) {
      return res.status(400).json({ message: "بيانات المنتج مطلوبة" });
    }

    if (quantity < 1) {
      return res.status(400).json({ message: "الكمية يجب أن تكون أكبر من صفر" });
    }

    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      cart = new Cart({
        userId,
        items: [],
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.productId === productData.id
    );

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      cart.items.push({
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
        quantity: quantity,
      });
    }

    await cart.save();

    res.status(200).json({
      message: "تم إضافة المنتج إلى السلة بنجاح",
      cart: {
        totalItems: cart.totalItems,
        totalAmount: cart.totalAmount,
      },
    });
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ message: "خطأ في إضافة المنتج إلى السلة" });
  }
};

// Update item quantity in cart
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: "الكمية يجب أن تكون أكبر من صفر" });
    }

    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({ message: "السلة غير موجودة" });
    }

    const itemIndex = cart.items.findIndex(
      item => item.productId === parseInt(productId)
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "المنتج غير موجود في السلة" });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    res.status(200).json({
      message: "تم تحديث الكمية بنجاح",
      cart: {
        totalItems: cart.totalItems,
        totalAmount: cart.totalAmount,
      },
    });
  } catch (err) {
    console.error("Error updating cart item:", err);
    res.status(500).json({ message: "خطأ في تحديث المنتج" });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({ message: "السلة غير موجودة" });
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      item => item.productId !== parseInt(productId)
    );

    if (cart.items.length === initialLength) {
      return res.status(404).json({ message: "المنتج غير موجود في السلة" });
    }

    await cart.save();

    res.status(200).json({
      message: "تم حذف المنتج من السلة بنجاح",
      cart: {
        totalItems: cart.totalItems,
        totalAmount: cart.totalAmount,
      },
    });
  } catch (err) {
    console.error("Error removing from cart:", err);
    res.status(500).json({ message: "خطأ في حذف المنتج من السلة" });
  }
};

// Clear entire cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({ message: "السلة غير موجودة" });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      message: "تم مسح السلة بنجاح",
      cart: {
        totalItems: 0,
        totalAmount: 0,
      },
    });
  } catch (err) {
    console.error("Error clearing cart:", err);
    res.status(500).json({ message: "خطأ في مسح السلة" });
  }
};

// Get cart count
export const getCartCount = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const cart = await Cart.findOne({ userId });
    const count = cart ? cart.totalItems : 0;

    res.status(200).json({ count });
  } catch (err) {
    console.error("Error getting cart count:", err);
    res.status(500).json({ message: "خطأ في جلب عدد عناصر السلة" });
  }
};

// Sync local cart with server cart (for when user logs in)
export const syncCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { localCartItems } = req.body;

    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      cart = new Cart({
        userId,
        items: [],
      });
    }

    // Merge local cart items with server cart
    if (localCartItems && Array.isArray(localCartItems)) {
      for (const localItem of localCartItems) {
        const existingItemIndex = cart.items.findIndex(
          item => item.productId === localItem.id
        );

        if (existingItemIndex > -1) {
          // Update quantity if item exists
          cart.items[existingItemIndex].quantity += localItem.quantity;
        } else {
          // Add new item to cart
          cart.items.push({
            productId: localItem.id,
            productData: {
              nameEn: localItem.nameEn,
              nameAr: localItem.nameAr,
              price: localItem.price,
              imageUrl: localItem.imageUrl,
              categoryId: localItem.categoryId,
              occasionId: localItem.occasionId,
              isBestSeller: localItem.isBestSeller || false,
              isSpecialGift: localItem.isSpecialGift || false,
            },
            quantity: localItem.quantity,
          });
        }
      }
    }

    await cart.save();

    // Return updated cart
    const formattedCart = {
      items: cart.items.map(item => ({
        id: item.productId,
        nameEn: item.productData.nameEn,
        nameAr: item.productData.nameAr,
        price: item.productData.price,
        imageUrl: item.productData.imageUrl,
        quantity: item.quantity,
        categoryId: item.productData.categoryId,
        occasionId: item.productData.occasionId,
        isBestSeller: item.productData.isBestSeller,
        isSpecialGift: item.productData.isSpecialGift,
      })),
      totalAmount: cart.totalAmount,
      totalItems: cart.totalItems,
      cartCount: cart.totalItems,
    };

    res.status(200).json({
      message: "تم مزامنة السلة بنجاح",
      cart: formattedCart,
    });
  } catch (err) {
    console.error("Error syncing cart:", err);
    res.status(500).json({ message: "خطأ في مزامنة السلة" });
  }
};