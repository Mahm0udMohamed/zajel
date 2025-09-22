import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Grid,
  List,
  SlidersHorizontal,
  X,
  ChevronDown,
  Flame,
  Crown,
  Sparkles,
  Tag,
  DollarSign,
  Gift,
} from "lucide-react";
import { motion, AnimatePresence, Variants, Easing } from "framer-motion";
import { getSpecialGifts } from "../data";
import { ProductImage, usePreloadCriticalImages } from "../features/images";
import FavoriteButton from "../components/ui/FavoriteButton";
import AddToCartButton from "../components/ui/AddToCartButton";

interface Product {
  id: number;
  nameEn: string;
  nameAr: string;
  price: number;
  imageUrl: string;
  isSpecialGift: boolean;
  isBestSeller?: boolean;
  categoryId?: string;
  occasionId?: string;
  descriptionEn?: string;
  descriptionAr?: string;
}

interface FilterState {
  priceRange: [number, number];
  features: string[];
  sortBy: string;
}

const RiyalSymbol = ({ className = "w-4 h-4" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1124.14 1256.39"
    className={className}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z" />
    <path d="M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.88c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-24.4,73.83-49.24l68.78-101.97v-.02c7.14-10.55,11.3-23.27,11.3-36.97v-149.98l132.25-28.11v270.4l424.53-90.28Z" />
  </svg>
);

const SpecialGiftsPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState("price");

  const specialGiftsData: Product[] = useMemo(() => getSpecialGifts(), []);
  const imageUrls = useMemo(
    () => specialGiftsData.map((p) => p.imageUrl),
    [specialGiftsData]
  );
  usePreloadCriticalImages(imageUrls);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(e.target as Node)
      ) {
        setShowSortOptions(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, Infinity],
    features: [],
    sortBy: "featured",
  });

  const priceRanges = useMemo(
    () => [
      {
        id: "under-350",
        label: isRtl ? "أقل من 350" : "Under 350",
        range: [0, 349] as [number, number],
      },
      {
        id: "350-700",
        label: isRtl ? "350 إلى 700" : "350 to 700",
        range: [350, 700] as [number, number],
      },
      {
        id: "700-1000",
        label: isRtl ? "700 إلى 1000" : "700 to 1000",
        range: [701, 1000] as [number, number],
      },
      {
        id: "over-1000",
        label: isRtl ? "أكثر من 1000" : "Over 1000",
        range: [1001, Infinity] as [number, number],
      },
    ],
    [isRtl]
  );

  const filterOptions = {
    features: [
      {
        id: "bestseller",
        nameKey: isRtl ? "الأكثر مبيعاً" : "Best Seller",
        icon: <Flame size={14} />,
      },
      {
        id: "premium",
        nameKey: isRtl ? "فاخر" : "Premium",
        icon: <Crown size={14} />,
      },
      {
        id: "affordable",
        nameKey: isRtl ? "بأسعار معقولة" : "Affordable",
        icon: <Tag size={14} />,
      },
    ],
    sortOptions: [
      {
        value: "featured",
        label: isRtl ? "مميز" : "Featured",
        icon: <Sparkles size={14} />,
      },
      {
        value: "price-low",
        label: isRtl ? "السعر: منخفض إلى مرتفع" : "Price: Low to High",
        icon: <DollarSign size={14} />,
      },
      {
        value: "price-high",
        label: isRtl ? "السعر: مرتفع إلى منخفض" : "Price: High to Low",
        icon: <DollarSign size={14} />,
      },
      {
        value: "name",
        label: isRtl ? "الاسم" : "Name",
        icon: <Tag size={14} />,
      },
    ],
  };

  const filteredProducts = useMemo(() => {
    let products = specialGiftsData;

    if (searchTerm) {
      products = products.filter((product) =>
        (isRtl ? product.nameAr : product.nameEn)
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    products = products.filter(
      (product) =>
        product.price >= filters.priceRange[0] &&
        product.price <= filters.priceRange[1]
    );

    if (filters.features.length > 0) {
      products = products.filter((product) =>
        filters.features.every((feature) => {
          switch (feature) {
            case "bestseller":
              return product.isBestSeller;
            case "premium":
              return product.price > 300;
            case "affordable":
              return product.price <= 200;
            default:
              return true;
          }
        })
      );
    }

    return products.sort((a, b) => {
      switch (filters.sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name":
          return isRtl
            ? a.nameAr.localeCompare(b.nameAr)
            : a.nameEn.localeCompare(b.nameEn);
        default:
          return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
      }
    });
  }, [searchTerm, filters, isRtl, specialGiftsData]);

  const updateFilter = (
    key: keyof FilterState,
    value: FilterState[keyof FilterState]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key: "features", value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((item) => item !== value)
        : [...prev[key], value],
    }));
  };

  const handlePriceRangeSelect = (min: number, max: number) => {
    setFilters((prev) => ({ ...prev, priceRange: [min, max] }));
  };

  const clearFilters = () => {
    setFilters({ priceRange: [0, Infinity], features: [], sortBy: "featured" });
    setSearchTerm("");
  };

  const hasActiveFilters =
    filters.features.length > 0 ||
    filters.priceRange[0] !== 0 ||
    filters.priceRange[1] !== Infinity ||
    searchTerm.length > 0;

  const activeFiltersCount =
    filters.features.length +
    (filters.priceRange[0] !== 0 || filters.priceRange[1] !== Infinity
      ? 1
      : 0) +
    (searchTerm.length > 0 ? 1 : 0);

  const getSortLabel = (sortByValue: string): string => {
    const sortOption = filterOptions.sortOptions.find(
      (option) => option.value === sortByValue
    );
    return sortOption ? sortOption.label : "";
  };

  const productCardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut" as Easing,
      },
    }),
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-800 font-sans antialiased p-4 sm:p-6 lg:p-10">
      <div className="mx-auto max-w-7xl">
        <main className="grid gap-8 lg:grid-cols-[300px_1fr] w-full min-w-[0]">
          {/* Filters Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: isRtl ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="hidden lg:block w-[300px] flex-shrink-0"
          >
            <div className="sticky top-6 rounded-3xl border border-neutral-100 bg-white shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] overflow-hidden">
              <div className="flex items-center justify-between gap-2 px-5 py-4 bg-emerald-500/10">
                <h3 className="flex items-center gap-2 text-base font-extrabold text-neutral-900">
                  <SlidersHorizontal size={18} className="text-emerald-500" />
                  {isRtl ? "تخصيص" : "Customize"}
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="rounded-full bg-violet-500 px-3 py-1 text-xs font-semibold text-white hover:opacity-95"
                  >
                    {isRtl ? "مسح" : "Clear"}
                  </button>
                )}
              </div>

              <div className="px-5 py-5">
                {/* Search inside filters */}
                <div className="mb-4">
                  <div className="relative">
                    <Search
                      size={14}
                      className={`absolute ${
                        isRtl ? "right-3" : "left-3"
                      } top-1/2 -translate-y-1/2 text-neutral-400`}
                    />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={
                        isRtl ? "ابحث داخل الفلاتر..." : "Search in filters..."
                      }
                      className={`h-10 w-full ${
                        isRtl ? "pr-9 pl-3" : "pl-9 pr-3"
                      } rounded-xl border border-neutral-200 bg-neutral-50/70 text-sm outline-none focus:border-emerald-500 focus:bg-white`}
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className={`absolute ${
                          isRtl ? "left-2.5" : "right-2.5"
                        } top-1/2 -translate-y-1/2 rounded-full p-1 text-neutral-400 hover:text-neutral-600`}
                        aria-label={isRtl ? "مسح" : "Clear"}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Active chips */}
                {(filters.features.length > 0 ||
                  searchTerm ||
                  filters.priceRange[0] !== 0 ||
                  filters.priceRange[1] !== Infinity) && (
                  <div className="mb-5 flex flex-wrap gap-2">
                    {searchTerm && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-neutral-200 px-3 py-1 text-xs font-semibold text-neutral-800">
                        {isRtl ? "بحث" : "Search"}: {searchTerm}
                        <button
                          onClick={() => setSearchTerm("")}
                          className="rounded-full p-0.5 hover:bg-white/50"
                          aria-label={isRtl ? "إزالة" : "Remove"}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    )}
                    {(filters.priceRange[0] !== 0 ||
                      filters.priceRange[1] !== Infinity) && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-500 px-3 py-1 text-xs font-semibold text-white">
                        {isRtl ? "السعر" : "Price"}
                        <button
                          onClick={() =>
                            setFilters((p) => ({
                              ...p,
                              priceRange: [0, Infinity],
                            }))
                          }
                          className="rounded-full p-0.5 hover:bg-white/20"
                          aria-label={isRtl ? "إزالة" : "Remove"}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    )}
                    {filters.features.map((f) => {
                      const meta = filterOptions.features.find(
                        (x) => x.id === f
                      );
                      if (!meta) return null;
                      return (
                        <span
                          key={`chip-${f}`}
                          className="inline-flex items-center gap-1 rounded-full bg-violet-500 px-3 py-1 text-xs font-semibold text-white"
                        >
                          {meta.nameKey}
                          <button
                            onClick={() => toggleArrayFilter("features", f)}
                            className="rounded-full p-0.5 hover:bg-white/20"
                            aria-label={isRtl ? "إزالة" : "Remove"}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Tabbed Filters */}
                <div className="mt-4">
                  <div className="mb-4 flex rounded-xl bg-neutral-100 p-1">
                    <button
                      className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        activeFilterTab === "price"
                          ? "bg-white text-neutral-900 shadow"
                          : "text-neutral-600 hover:bg-neutral-200"
                      }`}
                      onClick={() => setActiveFilterTab("price")}
                    >
                      {isRtl ? "السعر" : "Price"}
                    </button>
                    <button
                      className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        activeFilterTab === "features"
                          ? "bg-white text-neutral-900 shadow"
                          : "text-neutral-600 hover:bg-neutral-200"
                      }`}
                      onClick={() => setActiveFilterTab("features")}
                    >
                      {isRtl ? "المميزات" : "Features"}
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {activeFilterTab === "price" && (
                      <motion.div
                        key="price-tab"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="p-4"
                      >
                        <h4 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-neutral-900">
                          <DollarSign size={16} className="text-emerald-500" />
                          {isRtl ? "نطاق السعر" : "Price Range"}
                        </h4>
                        <div className="grid gap-2">
                          {priceRanges.map((option) => {
                            const checked =
                              filters.priceRange[0] === option.range[0] &&
                              filters.priceRange[1] === option.range[1];
                            return (
                              <label
                                key={option.id}
                                className={`flex items-center justify-between rounded-full border px-3 py-2 text-sm transition-colors cursor-pointer ${
                                  checked
                                    ? "border-violet-500 bg-violet-500/5 text-violet-600"
                                    : "border-neutral-200 hover:bg-neutral-100"
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name="priceRange"
                                    checked={checked}
                                    onChange={() =>
                                      handlePriceRangeSelect(
                                        option.range[0],
                                        option.range[1]
                                      )
                                    }
                                    className="h-4 w-4 rounded-full border-neutral-300 text-violet-500 focus:ring-violet-500"
                                  />
                                  <span className="font-medium">
                                    {option.label}
                                  </span>
                                  <RiyalSymbol className="h-3.5 w-3.5" />
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                    {activeFilterTab === "features" && (
                      <motion.div
                        key="features-tab"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="p-4"
                      >
                        <h4 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-neutral-900">
                          <Sparkles size={16} className="text-emerald-500" />
                          {isRtl ? "المميزات" : "Features"}
                        </h4>
                        <div className="grid gap-2">
                          {filterOptions.features.map((feature) => {
                            const active = filters.features.includes(
                              feature.id
                            );
                            return (
                              <label
                                key={feature.id}
                                className={`flex items-center justify-between rounded-full border px-3 py-2 text-sm transition-colors cursor-pointer ${
                                  active
                                    ? "border-violet-500 bg-violet-500/5 text-violet-600"
                                    : "border-neutral-200 hover:bg-neutral-100"
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={active}
                                    onChange={() =>
                                      toggleArrayFilter("features", feature.id)
                                    }
                                    className="h-4 w-4 rounded border-neutral-300 text-violet-500 focus:ring-violet-500"
                                  />
                                  <span className="flex items-center gap-2 font-medium">
                                    {feature.icon} {feature.nameKey}
                                  </span>
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Top bar */}
          <div className="lg:col-span-1 flex-1">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative z-20 mb-6 rounded-3xl border border-neutral-100/30 bg-white/50 p-4 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] backdrop-blur-md"
            >
              <div className="flex flex-row items-center justify-between gap-3 sm:gap-4">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search
                    size={16}
                    className={`pointer-events-none absolute ${
                      isRtl ? "right-4" : "left-4"
                    } top-1/2 -translate-y-1/2 text-neutral-400`}
                  />
                  <input
                    type="text"
                    placeholder={isRtl ? "ابحث عن هدايا..." : "Search gifts..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`h-11 w-full ${
                      isRtl ? "pr-11 pl-4" : "pl-11 pr-4"
                    } rounded-full border border-neutral-200/50 bg-neutral-100/50 text-sm text-neutral-800 placeholder-neutral-400 outline-none transition-colors focus:border-fuchsia-500 focus:bg-white/80`}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className={`absolute ${
                        isRtl ? "left-3" : "right-3"
                      } top-1/2 -translate-y-1/2 rounded-full p-1.5 text-neutral-400 hover:text-neutral-600`}
                      aria-label={isRtl ? "مسح البحث" : "Clear search"}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Filters & Sort Buttons (Mobile & Desktop) */}
                <div className="flex items-center gap-3">
                  {/* Sort Button */}
                  <div className="relative z-30" ref={sortDropdownRef}>
                    <button
                      onClick={() => setShowSortOptions(!showSortOptions)}
                      className="flex items-center gap-1 rounded-full border border-neutral-200/50 bg-white/70 px-2 py-2 text-sm sm:px-4 sm:py-2.5 sm:text-sm font-medium text-neutral-700 backdrop-blur-sm hover:bg-neutral-100/70"
                    >
                      <span className="w-20 sm:w-28 overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-neutral-900">
                        {filters.sortBy
                          ? `${
                              isRtl ? "ترتيب حسب: " : "Sort By: "
                            }${getSortLabel(filters.sortBy)}`
                          : isRtl
                          ? "ترتيب حسب"
                          : "Sort By"}
                      </span>
                      <ChevronDown
                        size={16}
                        className="text-neutral-400 flex-shrink-0"
                      />
                    </button>
                    <AnimatePresence>
                      {showSortOptions && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.16 }}
                          className={`absolute mt-2 w-52 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl ${
                            isRtl ? "left-0" : "right-0"
                          }`}
                        >
                          {filterOptions.sortOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => {
                                updateFilter("sortBy", option.value);
                                setShowSortOptions(false);
                              }}
                              className={`w-full ${
                                isRtl ? "text-right" : "text-left"
                              } px-4 py-2 text-sm transition-colors hover:bg-emerald-500/10 ${
                                filters.sortBy === option.value
                                  ? "bg-emerald-500/10 text-neutral-900"
                                  : "text-neutral-700"
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* View Mode Buttons (Hidden on Mobile) */}
                  <div className="hidden items-center rounded-full bg-neutral-100/50 p-1 backdrop-blur-sm sm:flex">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`rounded-full p-2 ${
                        viewMode === "grid"
                          ? "bg-white text-emerald-500 shadow-sm"
                          : "text-neutral-500 hover:bg-neutral-200"
                      }`}
                      aria-label="Grid"
                    >
                      <Grid size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`rounded-full p-2 ${
                        viewMode === "list"
                          ? "bg-white text-emerald-500 shadow-sm"
                          : "text-neutral-500 hover:bg-neutral-200"
                      }`}
                      aria-label="List"
                    >
                      <List size={16} />
                    </button>
                  </div>

                  {/* Mobile Filters Button */}
                  {isMobile && (
                    <button
                      onClick={() => setShowMobileFilters(true)}
                      className="flex items-center gap-2 rounded-full bg-violet-500/70 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm hover:bg-violet-600/70"
                    >
                      <Filter size={14} />
                      {activeFiltersCount > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-violet-500">
                          {activeFiltersCount}
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Products */}
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center py-20"
                >
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-transparent border-emerald-500" />
                </motion.div>
              ) : filteredProducts.length > 0 ? (
                viewMode === "grid" ? (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative z-10 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full min-w-[0]"
                    style={{ contain: "layout" }}
                  >
                    <AnimatePresence>
                      {filteredProducts.map((product, index) => (
                        <motion.div
                          key={`product-${product.id}`}
                          variants={productCardVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          custom={index}
                          layout
                          className="group flex w-full flex-col overflow-hidden rounded-3xl"
                          style={{ minWidth: 0 }}
                        >
                          <Link
                            to={`/product/${product.id}`}
                            className="block flex-1"
                          >
                            <div className="relative aspect-[4/4.4] sm:aspect-[4/4.7] overflow-hidden rounded-t-3xl rounded-b-3xl">
                              <ProductImage
                                src={product.imageUrl}
                                alt={isRtl ? product.nameAr : product.nameEn}
                                className="h-full w-full object-cover rounded-t-3xl rounded-b-3xl"
                                width={400}
                                height={500}
                                aspectRatio="portrait"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                quality={100}
                                priority={index < 4}
                                showZoom={false}
                                placeholderSize={80}
                                enableBlurUp={true}
                              />
                              <div className="absolute start-2 top-2 flex flex-col gap-1">
                                {product.isBestSeller && (
                                  <span className="inline-flex w-fit items-center gap-1 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-2 py-0.5 text-[10px] font-medium text-white shadow">
                                    <Flame size={10} />
                                    {isRtl ? "الأكثر مبيعاً" : "Best Seller"}
                                  </span>
                                )}
                                {product.isSpecialGift && (
                                  <span className="inline-flex w-fit items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-2 py-0.5 text-[10px] font-medium text-white shadow">
                                    <Sparkles size={10} />
                                    {isRtl ? "مميز" : "Special"}
                                  </span>
                                )}
                              </div>
                            </div>
                          </Link>
                          <div className="p-3 flex flex-col h-full">
                            <Link
                              to={`/product/${product.id}`}
                              className="block mb-1"
                            >
                              <h3 className="line-clamp-2 text-base font-bold text-neutral-900 ">
                                {isRtl ? product.nameAr : product.nameEn}
                              </h3>
                            </Link>
                            <p className="line-clamp-2 text-xs text-neutral-500 mb-3">
                              {isRtl
                                ? product.descriptionAr
                                : product.descriptionEn}
                            </p>
                            <div className="flex items-center justify-between mt-auto">
                              <div
                                className={`flex items-center gap-1 ${
                                  isRtl ? "flex-row-reverse" : ""
                                }`}
                              >
                                <RiyalSymbol className="h-4 w-4 text-emerald-600" />
                                <span className="text-base font-bold text-neutral-900">
                                  {product.price}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FavoriteButton
                                  product={product}
                                  className="shadow-md"
                                />
                                <AddToCartButton
                                  product={product}
                                  className="shadow-md"
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative z-10 space-y-4 w-full min-w-[0]"
                    style={{ contain: "layout" }}
                  >
                    <AnimatePresence>
                      {filteredProducts.map((product, index) => (
                        <motion.div
                          key={`list-product-${product.id}`}
                          variants={productCardVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          custom={index}
                          layout
                          className="flex flex-col items-start gap-4 rounded-3xl p-4 sm:flex-row"
                          style={{ minWidth: 0 }}
                        >
                          <Link
                            to={`/product/${product.id}`}
                            className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-2xl border border-neutral-100 bg-neutral-50"
                          >
                            <ProductImage
                              src={product.imageUrl}
                              alt={isRtl ? product.nameAr : product.nameEn}
                              className="h-full w-full rounded-2xl object-cover"
                              width={200}
                              height={200}
                              aspectRatio="square"
                              sizes="200px"
                              quality={100}
                              priority={index < 2}
                              showZoom={false}
                              placeholderSize={80}
                              enableBlurUp={true}
                            />
                          </Link>
                          <div className="flex w-full flex-1 flex-col justify-between">
                            <div>
                              <div className="mb-2">
                                <Link to={`/product/${product.id}`}>
                                  <h3 className="text-lg font-bold text-neutral-900  transition-colors duration-200 leading-tight">
                                    {isRtl ? product.nameAr : product.nameEn}
                                  </h3>
                                </Link>
                              </div>
                              <div className="mb-3 flex flex-wrap gap-2">
                                {product.isBestSeller && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                                    <Flame size={12} />
                                    {isRtl ? "الأكثر مبيعاً" : "Best Seller"}
                                  </span>
                                )}
                                {product.isSpecialGift && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                                    <Sparkles size={12} />
                                    {isRtl ? "مميز" : "Special"}
                                  </span>
                                )}
                              </div>
                              <p className="line-clamp-2 text-sm text-neutral-600 leading-relaxed mb-3">
                                {isRtl
                                  ? product.descriptionAr
                                  : product.descriptionEn}
                              </p>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                              <div className="flex items-center gap-1">
                                <RiyalSymbol className="h-4 w-4 text-emerald-600" />
                                <span className="text-base font-bold text-neutral-900">
                                  {product.price}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FavoriteButton
                                  product={product}
                                  className="shadow-md"
                                />
                                <AddToCartButton
                                  product={product}
                                  className="shadow-md"
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )
              ) : (
                <motion.div
                  key="no-products"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-3xl border border-neutral-100/60 bg-white/80 p-10 text-center shadow-[0_6px_24px_-8px_rgba(0,0,0,0.08)] w-full min-w-[0]"
                  style={{ contain: "layout" }}
                >
                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-neutral-100">
                    <Gift size={40} className="text-neutral-400" />
                  </div>
                  <h3 className="mb-2 text-2xl font-extrabold text-neutral-900">
                    {isRtl ? "لا توجد هدايا" : "No Gifts Found"}
                  </h3>
                  <p className="mx-auto mb-8 max-w-sm text-sm text-neutral-600">
                    {isRtl
                      ? "لا توجد هدايا تطابق معايير البحث. جرب تعديل الفلاتر."
                      : "No gifts match the criteria. Try adjusting filters."}
                  </p>
                  <button
                    className="mx-auto flex items-center gap-2 rounded-full bg-violet-500 px-6 py-3 text-sm font-bold text-white hover:opacity-95"
                    onClick={clearFilters}
                  >
                    <X size={14} />
                    {isRtl ? "مسح الفلاتر" : "Clear Filters"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile Filters Modal */}
      <AnimatePresence>
        {showMobileFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-end"
            onClick={() => setShowMobileFilters(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="w-full max-h-[80vh] overflow-y-auto bg-white rounded-t-3xl p-5 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                  <Filter size={16} className="text-emerald-500" />
                  {isRtl ? "الفلاتر" : "Filters"}
                </h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1.5 text-neutral-600 hover:text-neutral-800"
                  aria-label={isRtl ? "إغلاق" : "Close"}
                >
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="border-b border-neutral-200 pb-4">
                  <h4 className="mb-2 text-sm font-semibold text-neutral-800 flex items-center gap-1.5">
                    <DollarSign size={14} className="text-emerald-500" />
                    {isRtl ? "نطاق السعر" : "Price Range"}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {priceRanges.map((option) => (
                      <label
                        key={option.id}
                        className={`flex items-center gap-2 p-2 rounded-lg text-sm cursor-pointer transition-colors ${
                          filters.priceRange[0] === option.range[0] &&
                          filters.priceRange[1] === option.range[1]
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-neutral-50 hover:bg-neutral-100"
                        }`}
                      >
                        <input
                          type="radio"
                          name="priceRange"
                          checked={
                            filters.priceRange[0] === option.range[0] &&
                            filters.priceRange[1] === option.range[1]
                          }
                          onChange={() =>
                            handlePriceRangeSelect(
                              option.range[0],
                              option.range[1]
                            )
                          }
                          className="h-4 w-4 text-emerald-500 focus:ring-emerald-400"
                        />
                        <span className="flex items-center gap-1 text-sm">
                          {option.label}
                          <RiyalSymbol className="h-3 w-3" />
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="border-b border-neutral-200 pb-4">
                  <h4 className="mb-2 text-sm font-semibold text-neutral-800 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-emerald-500" />
                    {isRtl ? "المميزات" : "Features"}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {filterOptions.features.map((feature) => (
                      <label
                        key={feature.id}
                        className={`flex items-center gap-2 p-2 rounded-lg text-sm cursor-pointer transition-colors ${
                          filters.features.includes(feature.id)
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-neutral-50 hover:bg-neutral-100"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={filters.features.includes(feature.id)}
                          onChange={() =>
                            toggleArrayFilter("features", feature.id)
                          }
                          className="h-4 w-4 text-emerald-500 focus:ring-emerald-400"
                        />
                        <span className="flex items-center gap-1 text-sm">
                          {feature.icon} {feature.nameKey}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2 mb-40">
                <button
                  onClick={() => {
                    clearFilters();
                    setShowMobileFilters(false);
                  }}
                  className="flex-1 py-2 rounded-full bg-neutral-200 text-sm font-medium text-neutral-800 hover:bg-neutral-300"
                >
                  {isRtl ? "مسح الكل" : "Clear All"}
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 py-2 rounded-full bg-emerald-500 text-sm font-medium text-white hover:bg-emerald-600"
                >
                  {isRtl ? "تطبيق" : "Apply"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SpecialGiftsPage;
