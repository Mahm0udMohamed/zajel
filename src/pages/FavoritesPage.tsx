import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Sparkles,
  Grid,
  List,
  Search,
  Crown,
  Calendar,
  Eye,
  Filter,
  X,
  ChevronDown,
  Flame,
  CheckCircle,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  Variants,
} from "framer-motion";
import { allProducts } from "../data/index";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { useAuth } from "../context/AuthContext";
import { ProductImage } from "../features/images";
import { useImagePreloader } from "../features/images";
import AddToCartButton from "../components/ui/AddToCartButton";
import FavoriteButton from "../components/ui/FavoriteButton";

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

const FavoritesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const { addToCart } = useCart();
  const { favorites, removeFromFavorites, clearFavorites, isLoading } =
    useFavorites();
  const { isAuthenticated } = useAuth();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("recent");
  const [filterBy, setFilterBy] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 200], [1, 0.8]);
  const headerScale = useTransform(scrollY, [0, 200], [1, 0.95]);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredFavorites = favorites
    .filter((item) => {
      const matchesSearch =
        searchTerm === "" ||
        (isRtl ? item.nameAr : item.nameEn)
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterBy === "all" ||
        (filterBy === "bestseller" && item.isBestSeller) ||
        (filterBy === "special" && item.isSpecialGift) ||
        (filterBy === "recent" &&
          new Date(item.dateAdded) >
            new Date(Date.now() - 1000 * 60 * 60 * 24));

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name":
          return isRtl
            ? a.nameAr.localeCompare(b.nameAr)
            : a.nameEn.localeCompare(b.nameEn);
        case "recent":
        default:
          return (
            new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
          );
      }
    });

  const favoriteImages = useMemo(
    () => filteredFavorites.slice(0, 12).map((item) => item.imageUrl),
    [filteredFavorites]
  );
  useImagePreloader(favoriteImages, { priority: false });

  const handleAddToCart = (product: FavoriteItem) => {
    try {
      addToCart({
        id: product.id,
        nameEn: product.nameEn,
        nameAr: product.nameAr,
        price: product.price,
        imageUrl: product.imageUrl,
        quantity: 1,
      });
    } catch (error) {
      console.error("Error adding product to cart:", error);
    }
  };

  const toggleSelectItem = (productId: number) => {
    setSelectedItems((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAllItems = () => {
    setSelectedItems(filteredFavorites.map((item) => item.id));
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  const removeSelectedItems = () => {
    selectedItems.forEach((id) => {
      removeFromFavorites(id);
    });
    setSelectedItems([]);
  };

  const addSelectedToCart = () => {
    selectedItems.forEach((id) => {
      const item = favorites.find((fav) => fav.id === id);
      if (item) {
        handleAddToCart(item);
      }
    });
    setSelectedItems([]);
  };

  const filterOptions = [
    { value: "all", label: isRtl ? "الكل" : "All", icon: Heart },
    { value: "recent", label: isRtl ? "الأحدث" : "Recent", icon: Calendar },
    {
      value: "bestseller",
      label: isRtl ? "الأكثر مبيعاً" : "Best Sellers",
      icon: Sparkles,
    },
    {
      value: "special",
      label: isRtl ? "هدايا مميزة" : "Special Gifts",
      icon: Crown,
    },
  ];

  const suggestedProducts = allProducts
    .filter((product) => !favorites.some((fav) => fav.id === product.id))
    .slice(0, 8);

  const hasActiveFilters = filterBy !== "all" || searchTerm.length > 0;
  const activeFiltersCount =
    (filterBy !== "all" ? 1 : 0) + (searchTerm.length > 0 ? 1 : 0);

  const clearFilters = () => {
    setFilterBy("all");
    setSearchTerm("");
  };

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 flex items-center justify-center p-4 font-serif text-neutral-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Heart className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-purple-800 mb-4">
            {isRtl ? "تسجيل الدخول مطلوب" : "Login Required"}
          </h1>
          <p className="text-gray-600 mb-8">
            {isRtl
              ? "يجب تسجيل الدخول لعرض وإدارة المفضلة الخاصة بك"
              : "Please login to view and manage your favorites"}
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/auth/login"
              className="bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 px-6 rounded-xl font-medium hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg"
            >
              {isRtl ? "تسجيل الدخول" : "Login"}
            </Link>
            <Link
              to="/auth/signup"
              className="bg-white text-purple-600 border border-purple-200 py-3 px-6 rounded-xl font-medium hover:bg-purple-50 transition-all"
            >
              {isRtl ? "إنشاء حساب جديد" : "Create Account"}
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            {isRtl ? "جاري تحميل المفضلة..." : "Loading favorites..."}
          </p>
        </div>
      </div>
    );
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 px-4 sm:px-6 lg:px-8 font-serif text-neutral-800">
      <div className="max-w-7xl mx-auto py-8">
        <motion.div
          style={{ opacity: headerOpacity, scale: headerScale }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mb-6"
          >
            <Heart className="w-8 h-8 text-white" fill="currentColor" />
          </motion.div>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-medium text-purple-800 leading-tight">
            {t("favorites.title")}
          </h1>
          <p className="mt-2.5 text-sm sm:text-base max-w-xs sm:max-w-md md:max-w-lg mx-auto leading-relaxed">
            {t("favorites.description")}
          </p>
        </motion.div>

        {favorites.length === 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center py-20"
          >
            <motion.div
              variants={itemVariants}
              className="w-32 h-32 bg-gradient-to-r from-pink-200 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-8"
            >
              <Heart size={48} className="text-pink-500" />
            </motion.div>

            <motion.h3
              variants={itemVariants}
              className="text-3xl font-bold text-gray-800 mb-4"
            >
              {t("favorites.empty")}
            </motion.h3>
            <motion.p
              variants={itemVariants}
              className="text-gray-600 mb-8 max-w-md mx-auto text-lg"
            >
              {isRtl
                ? "ابدأ في إضافة المنتجات المفضلة لديك لتجدها هنا بسهولة"
                : "Start adding your favorite products to find them here easily"}
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <Link
                to="/categories"
                className="inline-flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl text-base transition-all duration-300 hover:from-purple-600 hover:to-pink-600 shadow-lg"
              >
                <ShoppingCart size={20} className="mr-2 rtl:ml-2 rtl:mr-0" />
                {t("favorites.startShopping")}
              </Link>
              <Link
                to="/special-gifts"
                className="inline-flex items-center justify-center bg-white text-purple-600 border border-purple-200 font-semibold py-3 px-6 rounded-xl text-base transition-all duration-300 hover:bg-purple-50 shadow-lg"
              >
                <Sparkles size={20} className="mr-2 rtl:ml-2 rtl:mr-0" />
                {isRtl ? "الهدايا المميزة" : "Special Gifts"}
              </Link>
            </motion.div>

            <motion.div variants={containerVariants} className="mt-16">
              <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
                {t("favorites.recommendations")}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {suggestedProducts.slice(0, 6).map((product) => (
                  <motion.div
                    key={product.id}
                    variants={itemVariants}
                    className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <ProductImage
                        src={product.imageUrl}
                        alt={isRtl ? product.nameAr : product.nameEn}
                        className="w-full h-full object-cover transition-transform duration-300"
                        width={160}
                        height={160}
                        aspectRatio="square"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 160px"
                        quality={100}
                        priority={false}
                        showZoom={false}
                        placeholderSize={24}
                        fallbackSrc="https://images.pexels.com/photos/1058775/pexels-photo-1058775.jpeg?auto=compress&cs=tinysrgb&w=400"
                      />
                      <div className="absolute top-2 right-2 rtl:left-2 rtl:right-auto opacity-0 group-hover:opacity-100 transition-opacity">
                        <FavoriteButton
                          product={product}
                          className="w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full shadow-md"
                          size={12}
                        />
                      </div>
                    </div>
                    <div className="p-3">
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-medium text-gray-800 text-xs line-clamp-2 mb-2 hover:text-primary transition-colors min-h-[2rem]">
                          {isRtl ? product.nameAr : product.nameEn}
                        </h3>
                      </Link>
                      <div className="flex items-center justify-between">
                        <p className="text-primary font-bold text-sm">
                          {product.price} {isRtl ? "ر.س" : "SAR"}
                        </p>
                        <AddToCartButton
                          product={product}
                          variant="icon"
                          size="sm"
                          showLabel={false}
                          className="w-6 h-6 text-xs"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-lg p-5 border border-neutral-100 mb-6"
            >
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-4">
                <div className="relative flex-1 w-full lg:max-w-md">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
                  />
                  <input
                    type="text"
                    placeholder={
                      isRtl ? "ابحث في المفضلة..." : "Search favorites..."
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-purple-400 text-sm bg-neutral-50 placeholder-neutral-400"
                  />
                  {searchTerm && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      <X size={16} />
                    </motion.button>
                  )}
                </div>

                {isMobile && (
                  <motion.button
                    variants={itemVariants}
                    onClick={() => setShowMobileFilters(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors shadow-md w-full justify-center"
                  >
                    <Filter size={14} />
                    {isRtl ? "فلتر" : "Filter"}
                    {hasActiveFilters && (
                      <span className="bg-white text-purple-600 rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">
                        {activeFiltersCount}
                      </span>
                    )}
                  </motion.button>
                )}

                <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
                  <div className="text-sm text-neutral-700 font-medium">
                    <span className="font-bold text-purple-600">
                      {filteredFavorites.length}
                    </span>{" "}
                    {isRtl ? "عنصر" : "items"}
                  </div>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none pl-4 pr-10 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-purple-400 text-sm bg-neutral-50 cursor-pointer font-medium"
                    >
                      <option value="recent">
                        {isRtl ? "الأحدث" : "Recent"}
                      </option>
                      <option value="price-low">
                        {isRtl
                          ? "السعر: منخفض إلى مرتفع"
                          : "Price: Low to High"}
                      </option>
                      <option value="price-high">
                        {isRtl
                          ? "السعر: مرتفع إلى منخفض"
                          : "Price: High to Low"}
                      </option>
                      <option value="name">{isRtl ? "الاسم" : "Name"}</option>
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 pointer-events-none"
                    />
                  </div>
                  <div className="flex bg-neutral-100 rounded-lg p-1 shadow-inner">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === "grid"
                          ? "bg-white text-purple-600 shadow-sm"
                          : "text-neutral-500 hover:bg-neutral-200"
                      }`}
                    >
                      <Grid size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === "list"
                          ? "bg-white text-purple-600 shadow-sm"
                          : "text-neutral-500 hover:bg-neutral-200"
                      }`}
                    >
                      <List size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {!isMobile && (
                <motion.div
                  variants={containerVariants}
                  className="mt-4 flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hidden"
                >
                  {filterOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <motion.button
                        key={option.value}
                        variants={itemVariants}
                        onClick={() => setFilterBy(option.value)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                          filterBy === option.value
                            ? "bg-purple-50 text-purple-700 border-purple-100"
                            : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100"
                        }`}
                      >
                        <Icon size={12} />
                        {option.label}
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}

              <AnimatePresence>
                {selectedItems.length > 0 && (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    exit={{ opacity: 0, scaleY: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 25,
                    }}
                    style={{ originY: 0 }}
                    className="mt-6 pt-6 border-t border-gray-200 overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <span className="text-gray-600 font-medium">
                          {selectedItems.length}{" "}
                          {isRtl ? "عنصر محدد" : "items selected"}
                        </span>
                        <button
                          onClick={clearSelection}
                          className="text-gray-500 hover:text-gray-700 font-medium text-sm"
                        >
                          {isRtl ? "إلغاء التحديد" : "Clear selection"}
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          onClick={addSelectedToCart}
                          className="flex items-center gap-2 px-4 sm:px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg text-sm sm:text-base"
                        >
                          <ShoppingCart size={16} />
                          {isRtl ? "أضف للسلة" : "Add to Cart"}
                        </motion.button>
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          onClick={removeSelectedItems}
                          className="flex items-center gap-2 px-4 sm:px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all shadow-lg text-sm sm:text-base"
                        >
                          <Trash2 size={16} />
                          {isRtl ? "حذف" : "Remove"}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {filteredFavorites.length > 0 && (
              <motion.div
                variants={itemVariants}
                className="flex items-center justify-between mb-6"
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={selectAllItems}
                    className="text-purple-600 hover:text-purple-700 font-semibold"
                  >
                    {isRtl ? "تحديد الكل" : "Select All"}
                  </button>
                  <span className="text-gray-500">
                    {filteredFavorites.length} {isRtl ? "عنصر" : "items"}
                  </span>
                </div>
                <button
                  onClick={clearFavorites}
                  className="text-red-500 hover:text-red-600 font-semibold flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  {isRtl ? "مسح الكل" : "Clear All"}
                </button>
              </motion.div>
            )}

            <motion.div variants={containerVariants} className="pb-8">
              <AnimatePresence mode="wait">
                {filteredFavorites.length > 0 ? (
                  viewMode === "grid" ? (
                    <motion.div
                      key="grid"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    >
                      {filteredFavorites.map((item, index) => (
                        <motion.div
                          key={item.id}
                          variants={itemVariants}
                          className="bg-white rounded-xl shadow-md border border-neutral-100 overflow-hidden relative transition-transform duration-300"
                        >
                          <div className="absolute top-2 left-2 rtl:right-2 rtl:left-auto z-20">
                            <motion.button
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              onClick={() => toggleSelectItem(item.id)}
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shadow-md ${
                                selectedItems.includes(item.id)
                                  ? "bg-gradient-to-r from-pink-500 to-purple-500 border-transparent text-white"
                                  : "bg-white/90 border-gray-300 hover:border-pink-500"
                              }`}
                            >
                              {selectedItems.includes(item.id) && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="w-2 h-2 bg-white rounded-full"
                                />
                              )}
                            </motion.button>
                          </div>

                          <Link to={`/product/${item.id}`} className="block">
                            <div className="relative aspect-[4/3] overflow-hidden group">
                              <ProductImage
                                src={item.imageUrl}
                                alt={isRtl ? item.nameAr : item.nameEn}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                width={240}
                                height={180}
                                aspectRatio="landscape"
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                quality={100}
                                priority={index < 8}
                                showZoom={false}
                                placeholderSize={28}
                              />
                              <div className="absolute top-2 left-2 flex flex-col gap-1">
                                {item.isBestSeller && (
                                  <span className="bg-amber-100 text-amber-800 text-xs font-bold py-0.5 px-1.5 rounded-full flex items-center gap-1 shadow-sm">
                                    <Flame size={10} />
                                    {isRtl ? "الأكثر مبيعاً" : "Best Seller"}
                                  </span>
                                )}
                                {item.isSpecialGift && (
                                  <span className="bg-purple-100 text-purple-800 text-xs font-bold py-0.5 px-1.5 rounded-full flex items-center gap-1 shadow-sm">
                                    <Sparkles size={10} />
                                    {isRtl ? "مميز" : "Special"}
                                  </span>
                                )}
                              </div>
                            </div>
                          </Link>
                          <div className="p-3 relative">
                            <div className="absolute top-0 right-3 transform -translate-y-1/2">
                              <FavoriteButton
                                product={item}
                                className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-rose-500 border border-neutral-100 transition-all duration-300"
                                size={16}
                              />
                            </div>
                            <Link to={`/product/${item.id}`}>
                              <h3 className="text-sm font-bold text-neutral-800 hover:text-purple-600 transition-colors line-clamp-2 mb-1 min-h-[2.5rem]">
                                {isRtl ? item.nameAr : item.nameEn}
                              </h3>
                            </Link>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-base font-bold text-purple-700">
                                {item.price} {isRtl ? "ر.س" : "SAR"}
                              </p>
                              <AddToCartButton
                                product={item}
                                variant="primary"
                                size="sm"
                                className="px-3 py-1.5 bg-purple-600 text-white rounded-lg shadow-md text-xs font-semibold hover:bg-purple-700 transition-colors"
                                showLabel={!isMobile}
                              />
                            </div>
                            <div className="mt-2">
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                {isRtl ? "أُضيف في" : "Added on"}{" "}
                                {new Date(item.dateAdded).toLocaleDateString(
                                  isRtl ? "ar-EG" : "en-US"
                                )}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="list"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-4"
                    >
                      {filteredFavorites.map((item, index) => (
                        <motion.div
                          key={item.id}
                          variants={itemVariants}
                          className="bg-white rounded-xl shadow-md border border-neutral-100 p-4 flex flex-col sm:flex-row gap-4 items-start transition-transform duration-300"
                        >
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <motion.button
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              onClick={() => toggleSelectItem(item.id)}
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                selectedItems.includes(item.id)
                                  ? "bg-gradient-to-r from-pink-500 to-purple-500 border-transparent text-white"
                                  : "bg-white border-gray-300 hover:border-pink-500"
                              }`}
                            >
                              {selectedItems.includes(item.id) && (
                                <div className="w-2 h-2 bg-white rounded-full" />
                              )}
                            </motion.button>
                            <Link
                              to={`/product/${item.id}`}
                              className="w-28 h-28"
                            >
                              <ProductImage
                                src={item.imageUrl}
                                alt={isRtl ? item.nameAr : item.nameEn}
                                className="w-full h-full object-cover rounded-lg shadow-sm"
                                width={112}
                                height={112}
                                aspectRatio="square"
                                sizes="112px"
                                quality={100}
                                priority={index < 4}
                                showZoom={false}
                              />
                            </Link>
                          </div>

                          <div className="flex-1 flex flex-col justify-between w-full">
                            <div>
                              <Link to={`/product/${item.id}`}>
                                <h3 className="text-base font-bold text-neutral-800 hover:text-purple-600 transition-colors mb-1">
                                  {isRtl ? item.nameAr : item.nameEn}
                                </h3>
                              </Link>
                              <div className="flex flex-wrap gap-1.5 mb-2">
                                {item.isBestSeller && (
                                  <span className="bg-amber-100 text-amber-800 text-xs px-1.5 py-0.5 rounded-full font-semibold">
                                    {isRtl ? "الأكثر مبيعاً" : "Best Seller"}
                                  </span>
                                )}
                                {item.isSpecialGift && (
                                  <span className="bg-purple-100 text-purple-800 text-xs px-1.5 py-0.5 rounded-full font-semibold">
                                    {isRtl ? "مميز" : "Special"}
                                  </span>
                                )}
                                <span className="text-xs text-gray-500">
                                  {new Date(item.dateAdded).toLocaleDateString(
                                    isRtl ? "ar-EG" : "en-US"
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-3">
                              <p className="text-lg font-bold text-purple-700">
                                {item.price} {isRtl ? "ر.س" : "SAR"}
                              </p>
                              <div className="flex items-center gap-2">
                                <AddToCartButton
                                  product={item}
                                  variant="primary"
                                  size="sm"
                                  className="px-3 py-1.5 bg-purple-600 text-white rounded-lg shadow-md text-xs font-semibold hover:bg-purple-700 transition-colors"
                                  showLabel={true}
                                />
                                <motion.button
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  onClick={() => removeFromFavorites(item.id)}
                                  className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-2 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all shadow-lg"
                                >
                                  <Trash2 size={16} />
                                </motion.button>
                                <Link
                                  to={`/product/${item.id}`}
                                  className="bg-gray-100 text-gray-700 p-2 rounded-xl hover:bg-gray-200 transition-all"
                                >
                                  <Eye size={16} />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )
                ) : (
                  <motion.div
                    key="no-results"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-center py-16 bg-white rounded-xl shadow-md border border-neutral-100"
                  >
                    <motion.div
                      variants={itemVariants}
                      className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner"
                    >
                      <Search size={32} className="text-neutral-400" />
                    </motion.div>
                    <motion.h3
                      variants={itemVariants}
                      className="text-lg font-bold text-neutral-800 mb-2"
                    >
                      {isRtl ? "لا توجد نتائج" : "No Results Found"}
                    </motion.h3>
                    <motion.p
                      variants={itemVariants}
                      className="text-neutral-600 mb-6 text-sm max-w-sm mx-auto font-medium"
                    >
                      {isRtl
                        ? "لا توجد منتجات تطابق معايير البحث أو الفلتر"
                        : "No products match your search or filter criteria"}
                    </motion.p>
                    <motion.button
                      variants={itemVariants}
                      onClick={clearFilters}
                      className="px-5 py-2.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors flex items-center gap-2 mx-auto text-sm font-bold shadow-md"
                    >
                      <X size={14} />
                      {isRtl ? "مسح الفلاتر" : "Clear Filters"}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {favorites.length > 0 && (
              <motion.div variants={containerVariants} className="mt-16">
                <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
                  {t("favorites.recommendations")}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {suggestedProducts.slice(0, 6).map((product) => (
                    <motion.div
                      key={product.id}
                      variants={itemVariants}
                      className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
                    >
                      <div className="relative aspect-square overflow-hidden">
                        <ProductImage
                          src={product.imageUrl}
                          alt={isRtl ? product.nameAr : product.nameEn}
                          className="w-full h-full object-cover transition-transform duration-300"
                          width={160}
                          height={160}
                          aspectRatio="square"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 160px"
                          quality={100}
                          priority={false}
                          showZoom={false}
                          placeholderSize={20}
                          fallbackSrc="https://images.pexels.com/photos/1058775/pexels-photo-1058775.jpeg?auto=compress&cs=tinysrgb&w=400"
                        />
                        <div className="absolute top-2 right-2 rtl:left-2 rtl:right-auto opacity-0 group-hover:opacity-100 transition-opacity">
                          <FavoriteButton
                            product={product}
                            className="w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full shadow-md"
                            size={12}
                          />
                        </div>
                      </div>
                      <div className="p-3">
                        <Link to={`/product/${product.id}`}>
                          <h3 className="font-medium text-gray-800 text-xs line-clamp-2 mb-2 hover:text-primary transition-colors min-h-[2rem]">
                            {isRtl ? product.nameAr : product.nameEn}
                          </h3>
                        </Link>
                        <div className="flex items-center justify-between">
                          <p className="text-primary font-bold text-sm">
                            {product.price} {isRtl ? "ر.س" : "SAR"}
                          </p>
                          <AddToCartButton
                            product={product}
                            variant="icon"
                            size="sm"
                            showLabel={false}
                            className="w-6 h-6 text-xs"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showMobileFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
            onClick={() => setShowMobileFilters(false)}
          >
            <motion.div
              initial={{ x: isRtl ? "100%" : "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: isRtl ? "100%" : "-100%", opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className={`fixed inset-y-0 ${
                isRtl ? "right-0" : "left-0"
              } w-11/12 max-w-sm bg-white shadow-2xl overflow-y-auto p-6 transition-transform ease-out`}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex items-center justify-between mb-6 border-b border-neutral-200 pb-3"
              >
                <h3 className="flex items-center gap-2 text-lg font-bold text-purple-800">
                  <Filter size={18} />
                  {isRtl ? "فلاتر البحث" : "Search Filters"}
                </h3>
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-600"
                >
                  <X size={18} />
                </motion.button>
              </motion.div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-5"
              >
                <div>
                  <motion.h4
                    variants={itemVariants}
                    className="flex items-center gap-2 text-sm font-bold text-neutral-800 mb-3"
                  >
                    <Sparkles size={16} className="text-purple-600" />
                    {isRtl ? "فلاتر سريعة" : "Quick Filters"}
                  </motion.h4>
                  <div className="space-y-3">
                    {filterOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <motion.label
                          key={option.value}
                          variants={itemVariants}
                          className="flex items-center gap-3 text-sm text-neutral-700 cursor-pointer hover:text-purple-600 transition-colors"
                        >
                          <input
                            type="radio"
                            name="filterBy"
                            checked={filterBy === option.value}
                            onChange={() => setFilterBy(option.value)}
                            className="rounded-full border-neutral-300 text-purple-500 focus:ring-purple-500 w-4 h-4"
                          />
                          <Icon size={16} />
                          <span className="font-medium">{option.label}</span>
                        </motion.label>
                      );
                    })}
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="mt-8 mb-16 pt-5 border-t border-neutral-200 space-y-3 absolute bottom-6 left-6 right-6"
              >
                <motion.div
                  variants={itemVariants}
                  className="text-sm text-neutral-600 text-center font-medium"
                >
                  {filteredFavorites.length}{" "}
                  {isRtl ? "عنصر موجود" : "items found"}
                </motion.div>
                <motion.button
                  variants={itemVariants}
                  onClick={clearFilters}
                  className="w-full px-4 py-3 bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 transition-colors flex items-center justify-center gap-2 font-bold text-sm shadow-sm"
                >
                  <X size={16} />
                  {isRtl ? "مسح الفلاتر" : "Clear Filters"}
                </motion.button>
                <motion.button
                  variants={itemVariants}
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 font-bold text-sm shadow-md"
                >
                  <CheckCircle size={16} />
                  {isRtl ? "تطبيق الفلاتر" : "Apply Filters"}
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FavoritesPage;
