import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { allProducts } from "../data";
import categories from "../data/categories.json";
import occasions from "../data/occasions.json";
import ProductsPageBase from "../components/shared/ProductsPageBase";

interface FilterState {
  priceRange: [number, number];
  features: string[];
  categories?: string[];
  occasions?: string[];
  sortBy: string;
}

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, Infinity],
    features: [],
    categories: [],
    occasions: [],
    sortBy: "featured",
  });

  const productsData = useMemo(() => allProducts, []);

  useEffect(() => {
    const category = searchParams.get("category");
    if (category) {
      setFilters((prev) => ({ ...prev, categories: [category] }));
    }
  }, [searchParams]);

  const config = {
    placeholder: "ابحث عن المنتجات...",
    noResultsTitle: "لا توجد منتجات",
    noResultsMessage: "لا توجد منتجات تطابق معايير البحث. جرب تعديل الفلاتر.",
    filterTabs: {
      price: true,
      features: true,
      categories: true,
      occasions: true,
    },
  };

  return (
    <ProductsPageBase
      products={productsData}
      filters={filters}
      setFilters={setFilters}
      categories={categories}
      occasions={occasions}
      config={config}
      searchParams={searchParams}
      setSearchParams={setSearchParams}
    />
  );
};

export default ProductsPage;
