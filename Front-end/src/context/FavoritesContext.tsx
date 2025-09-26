import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

interface FavoriteItem {
  id: number;
  nameEn: string;
  nameAr: string;
  price: number;
  imageUrl: string;
  categoryId?: string;
  occasionId?: string;
  isBestSeller?: boolean;
  isSpecialGift?: boolean;
  dateAdded: string;
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  addToFavorites: (item: Omit<FavoriteItem, "dateAdded">) => void;
  removeFromFavorites: (id: number) => void;
  isFavorite: (id: number) => boolean;
  clearFavorites: () => void;
  favoritesCount: number;
  isLoading: boolean;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

const API_BASE_URL = "https://localhost:3002/api/favorites";
export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  // Load favorites from server when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshFavorites();
    } else {
      // Clear favorites when user logs out
      setFavorites([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  const refreshFavorites = async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}`, {
        headers: getAuthHeaders(),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites || []);
      } else {
        console.error("Failed to fetch favorites");
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToFavorites = (item: Omit<FavoriteItem, "dateAdded">) => {
    if (!isAuthenticated) {
      showError(
        "تسجيل الدخول مطلوب",
        "يجب تسجيل الدخول لإضافة المنتجات إلى المفضلة"
      );
      return;
    }

    try {
      // Check if already exists locally
      if (favorites.some((fav) => fav.id === item.id)) {
        showInfo("موجود بالفعل", "هذا المنتج موجود بالفعل في المفضلة");
        return;
      }

      // Add to server
      addToFavoritesServer(item);
    } catch (error) {
      console.error("خطأ في إضافة المنتج إلى المفضلة:", error);
      showError("خطأ", "حدث خطأ أثناء إضافة المنتج إلى المفضلة");
      throw error;
    }
  };

  const addToFavoritesServer = async (
    item: Omit<FavoriteItem, "dateAdded">
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/add`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ productData: item }),
      });

      const data = await response.json();

      if (response.ok) {
        // Add to local state immediately for better UX
        const newFavorite: FavoriteItem = {
          ...item,
          dateAdded: data.favorite.dateAdded,
        };
        setFavorites((prev) => [newFavorite, ...prev]);

        showSuccess(
          "تم الإضافة للمفضلة",
          `تم إضافة ${item.nameAr} إلى المفضلة`
        );
      } else {
        throw new Error(data.message || "فشل في إضافة المنتج");
      }
    } catch (error) {
      console.error("Error adding to favorites server:", error);
      showError("خطأ", (error as Error).message);
      throw error;
    }
  };
  const removeFromFavorites = (id: number) => {
    if (!isAuthenticated) {
      showError("تسجيل الدخول مطلوب", "يجب تسجيل الدخول لإدارة المفضلة");
      return;
    }

    try {
      removeFromFavoritesServer(id);
    } catch (error) {
      console.error("خطأ في حذف المنتج من المفضلة:", error);
      showError("خطأ", "حدث خطأ أثناء حذف المنتج من المفضلة");
    }
  };

  const removeFromFavoritesServer = async (productId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/remove/${productId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        // Remove from local state immediately
        setFavorites((prev) => prev.filter((item) => item.id !== productId));

        const removedItem = favorites.find((item) => item.id === productId);
        if (removedItem) {
          showInfo(
            "تم الحذف من المفضلة",
            `تم حذف ${removedItem.nameAr} من المفضلة`
          );
        }
      } else {
        throw new Error(data.message || "فشل في حذف المنتج");
      }
    } catch (error) {
      console.error("Error removing from favorites server:", error);
      showError("خطأ", (error as Error).message);
      throw error;
    }
  };
  const isFavorite = (id: number): boolean => {
    return favorites.some((item) => item.id === id);
  };

  const clearFavorites = () => {
    if (!isAuthenticated) {
      showError("تسجيل الدخول مطلوب", "يجب تسجيل الدخول لإدارة المفضلة");
      return;
    }

    try {
      clearFavoritesServer();
    } catch (error) {
      console.error("خطأ في مسح المفضلة:", error);
      showError("خطأ", "حدث خطأ أثناء مسح المفضلة");
    }
  };

  const clearFavoritesServer = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/clear`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setFavorites([]);
        showSuccess("تم المسح", "تم مسح جميع المفضلة بنجاح");
      } else {
        throw new Error(data.message || "فشل في مسح المفضلة");
      }
    } catch (error) {
      console.error("Error clearing favorites server:", error);
      showError("خطأ", (error as Error).message);
      throw error;
    }
  };
  const favoritesCount = favorites.length;

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        clearFavorites,
        favoritesCount,
        isLoading,
        refreshFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};
