import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Gift } from "lucide-react";
import categories from "../data/categories.json";
import { allProducts } from "../data";
import ProductsPageBase from "../components/shared/ProductsPageBase";

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
  categories?: string[];
  sortBy: string;
}

const CategoryPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, Infinity],
    features: [],
    categories: [],
    sortBy: "featured",
  });

  const allProductsData = useMemo(() => allProducts, []);

  useEffect(() => {
    const category = searchParams.get("category");
    if (category) {
      setFilters((prev) => ({ ...prev, categories: [category] }));
    }
  }, [searchParams]);

  // تعيين الفلتر الأولي بناءً على الـ slug
  useEffect(() => {
    if (slug) {
      setFilters((prev) => ({ ...prev, categories: [slug] }));
    }
  }, [slug]);

  const customFiltering = (
    products: Product[],
    filters: FilterState,
    searchTerm: string,
    isRtl: boolean
  ) => {
    let filtered = products;

    if (searchTerm && searchTerm.trim() !== "") {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((product) => {
        const nameEn = product.nameEn?.toLowerCase() || "";
        const nameAr = product.nameAr?.toLowerCase() || "";
        const descEn = product.descriptionEn?.toLowerCase() || "";
        const descAr = product.descriptionAr?.toLowerCase() || "";

        return (
          nameEn.includes(searchLower) ||
          nameAr.includes(searchLower) ||
          descEn.includes(searchLower) ||
          descAr.includes(searchLower)
        );
      });
    }

    const categoriesToFilter = filters.categories || [];

    if (categoriesToFilter.length > 0) {
      filtered = filtered.filter(
        (product) =>
          product.categoryId &&
          product.categoryId.trim() !== "" &&
          categoriesToFilter.includes(product.categoryId)
      );
    }

    if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== Infinity) {
      filtered = filtered.filter(
        (product) =>
          typeof product.price === "number" &&
          !isNaN(product.price) &&
          product.price >= filters.priceRange[0] &&
          product.price <= filters.priceRange[1]
      );
    }

    if (filters.features.length > 0) {
      filtered = filtered.filter((product) =>
        filters.features.every((feature) => {
          switch (feature) {
            case "bestseller":
              return Boolean(product.isBestSeller);
            case "special":
              return Boolean(product.isSpecialGift);
            case "premium":
              return (
                typeof product.price === "number" &&
                !isNaN(product.price) &&
                product.price > 300
              );
            case "affordable":
              return (
                typeof product.price === "number" &&
                !isNaN(product.price) &&
                product.price <= 200
              );
            default:
              return true;
          }
        })
      );
    }

    return filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "price-low": {
          return (a.price || 0) - (b.price || 0);
        }
        case "price-high": {
          return (b.price || 0) - (a.price || 0);
        }
        case "name": {
          const nameA = isRtl ? a.nameAr || "" : a.nameEn || "";
          const nameB = isRtl ? b.nameAr || "" : b.nameEn || "";
          return nameA.localeCompare(nameB);
        }
        default: {
          return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
        }
      }
    });
  };

  const clearFiltersHandler = () => ({
    priceRange: [0, Infinity] as [number, number],
    features: [],
    categories: [], // إزالة جميع التصنيفات بما في ذلك الـ slug
    sortBy: "featured",
  });

  const hasActiveFiltersHandler = (
    filters: FilterState,
    searchTerm: string
  ) => {
    return (
      filters.features.length > 0 ||
      (filters.categories && filters.categories.length > 0) ||
      filters.priceRange[0] !== 0 ||
      filters.priceRange[1] !== Infinity ||
      searchTerm.length > 0
    );
  };

  const activeFiltersCountHandler = (
    filters: FilterState,
    searchTerm: string
  ) => {
    return (
      filters.features.length +
      (filters.categories?.length || 0) +
      (filters.priceRange[0] !== 0 || filters.priceRange[1] !== Infinity
        ? 1
        : 0) +
      (searchTerm.length > 0 ? 1 : 0)
    );
  };

  const customChips = (
    filters: FilterState,
    searchTerm: string,
    isRtl: boolean,
    onRemove: (key: string, value?: string) => void
  ) => {
    const chips: JSX.Element[] = [];

    if (searchTerm) {
      chips.push(
        <span
          key="search-chip"
          className="inline-flex items-center gap-1 rounded-full bg-neutral-200 px-3 py-1 text-xs font-semibold text-neutral-800"
        >
          {isRtl ? "بحث" : "Search"}: {searchTerm}
          <button
            onClick={() => onRemove("search")}
            className="rounded-full p-0.5 hover:bg-white/50"
            aria-label={isRtl ? "إزالة" : "Remove"}
          >
            <span className="text-xs">✕</span>
          </button>
        </span>
      );
    }

    if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== Infinity) {
      chips.push(
        <span
          key="price-chip"
          className="inline-flex items-center gap-1 rounded-full bg-violet-500 px-3 py-1 text-xs font-semibold text-white"
        >
          {isRtl ? "السعر" : "Price"}
          <button
            onClick={() => onRemove("priceRange")}
            className="rounded-full p-0.5 hover:bg-white/20"
            aria-label={isRtl ? "إزالة" : "Remove"}
          >
            <span className="text-xs">✕</span>
          </button>
        </span>
      );
    }

    filters.features.forEach((f) => {
      chips.push(
        <span
          key={`chip-${f}`}
          className="inline-flex items-center gap-1 rounded-full bg-violet-500 px-3 py-1 text-xs font-semibold text-white"
        >
          {f}
          <button
            onClick={() => onRemove("features", f)}
            className="rounded-full p-0.5 hover:bg-white/20"
            aria-label={isRtl ? "إزالة" : "Remove"}
          >
            <span className="text-xs">✕</span>
          </button>
        </span>
      );
    });

    if (filters.categories && filters.categories.length > 0) {
      filters.categories.forEach((c) => {
        const meta = categories.find((x) => x.id === c);
        if (!meta) return;
        chips.push(
          <span
            key={`chip-${c}`}
            className="inline-flex items-center gap-1 rounded-full bg-violet-500 px-3 py-1 text-xs font-semibold text-white"
          >
            {t(meta.nameKey)}
            <button
              onClick={() => onRemove("categories", c)}
              className="rounded-full p-0.5 hover:bg-white/20"
              aria-label={isRtl ? "إزالة" : "Remove"}
            >
              <span className="text-xs">✕</span>
            </button>
          </span>
        );
      });
    }

    return chips;
  };

  const config = {
    placeholder: "ابحث عن هدايا...",
    noResultsTitle: "لا توجد منتجات",
    noResultsMessage: "لا توجد منتجات تطابق معايير البحث. جرب تعديل الفلاتر.",
    primaryColor: "emerald",
    gradientColors: {
      special: "bg-gradient-to-r from-emerald-500 to-teal-500",
      bestseller: "bg-gradient-to-r from-violet-500 to-fuchsia-500",
    },
    filterTabs: {
      price: true,
      features: true,
      categories: true,
      occasions: false,
    },
    customFiltering,
    clearFiltersHandler,
    hasActiveFiltersHandler,
    activeFiltersCountHandler,
    customChips,
  };

  // التحقق من وجود الفئة
  if (slug && !categories.some((category) => category.id === slug)) {
    const notFoundComponent = (
      <div className="min-h-screen flex items-center justify-center bg-background-secondary p-4 sm:p-6 lg:p-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-background-primary rounded-3xl shadow-lg max-w-md mx-4 border border-border-primary"
        >
          <div className="w-24 h-24 bg-background-secondary rounded-full flex items-center justify-center mx-auto mb-6">
            <Gift size={40} className="text-neutral-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary mb-4">
            {isRtl ? "الفئة غير موجودة" : "Category Not Found"}
          </h1>
          <p className="text-text-secondary mb-8 text-sm max-w-sm mx-auto">
            {isRtl
              ? "عذراً، الفئة المطلوبة غير متوفرة. جرب العودة إلى صفحة المنتجات."
              : "Sorry, the requested category is not available. Try returning to the products page."}
          </p>
          <Link
            to="/category/all"
            className="px-6 py-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors text-sm font-bold shadow-md"
          >
            {isRtl ? "العودة إلى الكل" : "Back to All"}
          </Link>
        </motion.div>
      </div>
    );

    return (
      <ProductsPageBase
        products={allProductsData}
        filters={filters}
        setFilters={setFilters}
        categories={categories}
        config={config}
        slug={slug}
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        notFoundComponent={notFoundComponent}
      />
    );
  }

  return (
    <ProductsPageBase
      products={allProductsData}
      filters={filters}
      setFilters={setFilters}
      categories={categories}
      config={config}
      slug={slug}
      searchParams={searchParams}
      setSearchParams={setSearchParams}
    />
  );
};

export default CategoryPage;
