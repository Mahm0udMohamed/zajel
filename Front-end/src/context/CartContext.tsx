// src/context/CartContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

interface CartItem {
  id: number;
  nameEn: string;
  nameAr: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: CartItem) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const API_BASE_URL = "https://localhost:3002/api/cart";

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { showSuccess, showError } = useToast();

  // إضافة ref لتتبع حالة التحميل من الخادم
  const hasLoadedFromServer = useRef(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  // Load cart from server when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // إعادة تعيين حالة التحميل عند تغيير المستخدم
      hasLoadedFromServer.current = false;
      loadCartFromServer();
    } else {
      // مسح السلة عند تسجيل الخروج
      setCart([]);
      hasLoadedFromServer.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);

  const loadCartFromServer = async () => {
    if (!isAuthenticated || hasLoadedFromServer.current) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}`, {
        headers: getAuthHeaders(),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data.items || []);
        hasLoadedFromServer.current = true; // تمييز أنه تم التحميل
        console.log("تم تحميل السلة من الخادم:", data.items);
      } else {
        console.error("Failed to fetch cart from server");
      }
    } catch (error) {
      console.error("Error fetching cart from server:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (product: CartItem) => {
    if (!isAuthenticated) {
      showError(
        "تسجيل الدخول مطلوب",
        "يجب تسجيل الدخول لإضافة المنتجات إلى السلة"
      );
      return;
    }

    try {
      await addToCartServer(product);
    } catch (error) {
      console.error("خطأ في إضافة المنتج إلى عربة التسوق:", error);
      throw error;
    }
  };

  const addToCartServer = async (product: CartItem) => {
    try {
      const response = await fetch(`${API_BASE_URL}/add`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({
          productData: product,
          quantity: product.quantity || 1,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update local state
        setCart((prev) => {
          const existingItem = prev.find((item) => item.id === product.id);

          if (existingItem) {
            return prev.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + (product.quantity || 1) }
                : item
            );
          } else {
            const newItem = { ...product, quantity: product.quantity || 1 };
            return [...prev, newItem];
          }
        });

        showSuccess(
          "تم الإضافة للسلة",
          `تم إضافة ${product.nameAr} إلى السلة`,
          undefined,
          "cart-success"
        );
      } else {
        throw new Error(data.message || "فشل في إضافة المنتج");
      }
    } catch (error) {
      console.error("Error adding to cart server:", error);
      showError("خطأ", (error as Error).message);
      throw error;
    }
  };

  const removeFromCart = async (id: number) => {
    if (!isAuthenticated) {
      showError("تسجيل الدخول مطلوب", "يجب تسجيل الدخول لإدارة السلة");
      return;
    }

    try {
      await removeFromCartServer(id);
    } catch (error) {
      console.error("خطأ في حذف المنتج من عربة التسوق:", error);
      showError("خطأ", "حدث خطأ أثناء حذف المنتج من السلة");
    }
  };

  const removeFromCartServer = async (productId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/remove/${productId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        // Remove from local state
        setCart((prev) => prev.filter((item) => item.id !== productId));
        console.log(`تم حذف المنتج ${productId} من عربة التسوق`);
      } else {
        throw new Error(data.message || "فشل في حذف المنتج");
      }
    } catch (error) {
      console.error("Error removing from cart server:", error);
      showError("خطأ", (error as Error).message);
      throw error;
    }
  };

  const updateQuantity = async (id: number, quantity: number) => {
    if (!isAuthenticated) {
      showError("تسجيل الدخول مطلوب", "يجب تسجيل الدخول لإدارة السلة");
      return;
    }

    try {
      if (quantity <= 0) {
        await removeFromCart(id);
        return;
      }

      await updateQuantityServer(id, quantity);
    } catch (error) {
      console.error("خطأ في تحديث كمية المنتج:", error);
      showError("خطأ", "حدث خطأ أثناء تحديث الكمية");
    }
  };

  const updateQuantityServer = async (productId: number, quantity: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/update/${productId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ quantity }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update local state
        setCart((prev) =>
          prev.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          )
        );
        console.log(`تم تحديث كمية المنتج ${productId} إلى ${quantity}`);
      } else {
        throw new Error(data.message || "فشل في تحديث الكمية");
      }
    } catch (error) {
      console.error("Error updating quantity server:", error);
      showError("خطأ", (error as Error).message);
      throw error;
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      showError("تسجيل الدخول مطلوب", "يجب تسجيل الدخول لإدارة السلة");
      return;
    }

    try {
      await clearCartServer();
    } catch (error) {
      console.error("خطأ في مسح عربة التسوق:", error);
      showError("خطأ", "حدث خطأ أثناء مسح السلة");
    }
  };

  const clearCartServer = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/clear`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setCart([]);
        showSuccess("تم المسح", "تم مسح السلة بنجاح");
        console.log("تم مسح عربة التسوق");
      } else {
        throw new Error(data.message || "فشل في مسح السلة");
      }
    } catch (error) {
      console.error("Error clearing cart server:", error);
      showError("خطأ", (error as Error).message);
      throw error;
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
