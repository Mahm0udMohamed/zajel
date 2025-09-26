import React, { useState, useMemo } from "react";
import { getSpecialGifts } from "../data";
import ProductsPageBase from "../components/shared/ProductsPageBase";

interface FilterState {
  priceRange: [number, number];
  features: string[];
  sortBy: string;
}

const SpecialGiftsPage: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, Infinity],
    features: [],
    sortBy: "featured",
  });

  const specialGiftsData = useMemo(() => getSpecialGifts(), []);

  const config = {
    placeholder: "ابحث عن الهدايا المميزة...",
    noResultsTitle: "لا توجد هدايا مميزة",
    noResultsMessage:
      "لا توجد هدايا مميزة تطابق معايير البحث. جرب تعديل الفلاتر.",
    filterTabs: {
      price: true,
      features: true,
      categories: false,
      occasions: false,
    },
  };

  return (
    <ProductsPageBase
      products={specialGiftsData}
      filters={filters}
      setFilters={setFilters}
      config={config}
    />
  );
};

export default SpecialGiftsPage;
