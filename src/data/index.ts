// Category imports
import flowersData from "./categories/flowers.json";
import jewelryData from "./categories/jewelry.json";
import plantsData from "./categories/plants.json";
import perfumesData from "./categories/perfumes.json";
import beautyCareData from "./categories/beauty-care.json";
import personalCareData from "./categories/personal-care.json";
import vasesData from "./categories/vases.json";
import balloonsData from "./categories/balloons.json";
import couponsData from "./categories/coupons.json";
import partyFavorsData from "./categories/party-favors.json";
import chocolateCakeData from "./categories/chocolate-cake.json";

// Occasion imports
import eidFitrData from "./occasions/eid-fitr.json";
import eidAdhaData from "./occasions/eid-adha.json";
import birthdaysData from "./occasions/birthdays.json";
import graduationData from "./occasions/graduation.json";
import anniversaryData from "./occasions/anniversary.json";
import weddingData from "./occasions/wedding.json";
import thankYouData from "./occasions/thank-you.json";
import newYearData from "./occasions/new-year.json";
import mothersDayData from "./occasions/mothers-day.json";
import valentinesDayData from "./occasions/valentines-day.json";

// Combine all products
export const allProducts = [
  ...flowersData,
  ...jewelryData,
  ...plantsData,
  ...perfumesData,
  ...beautyCareData,
  ...personalCareData,
  ...vasesData,
  ...balloonsData,
  ...couponsData,
  ...partyFavorsData,
  ...chocolateCakeData,
  ...eidFitrData,
  ...eidAdhaData,
  ...birthdaysData,
  ...graduationData,
  ...anniversaryData,
  ...weddingData,
  ...thankYouData,
  ...newYearData,
  ...mothersDayData,
  ...valentinesDayData,
];

// Category-specific exports
export const categoryProducts = {
  flowers: flowersData,
  jewelry: jewelryData,
  plants: plantsData,
  perfumes: perfumesData,
  "beauty-care": beautyCareData,
  "personal-care": personalCareData,
  vases: vasesData,
  balloons: balloonsData,
  coupons: couponsData,
  "party-favors": partyFavorsData,
  "chocolate-cake": chocolateCakeData,
};

// Occasion-specific exports
export const occasionProducts = {
  "eid-fitr": eidFitrData,
  "eid-adha": eidAdhaData,
  birthdays: birthdaysData,
  graduation: graduationData,
  anniversary: anniversaryData,
  wedding: weddingData,
  "thank-you": thankYouData,
  "new-year": newYearData,
  "mothers-day": mothersDayData,
  "valentines-day": valentinesDayData,
};

// Helper functions
export const getProductsByCategory = (categoryId: string) => {
  // Get products from both category-specific files and all products that match the category
  const categorySpecificProducts =
    categoryProducts[categoryId as keyof typeof categoryProducts] || [];
  const allCategoryProducts = allProducts.filter(
    (product) => product.categoryId === categoryId
  );

  // Combine and deduplicate based on product ID
  const combinedProducts = [
    ...categorySpecificProducts,
    ...allCategoryProducts,
  ];
  const uniqueProducts = combinedProducts.filter(
    (product, index, self) =>
      index === self.findIndex((p) => p.id === product.id)
  );

  return uniqueProducts;
};

export const getProductsByOccasion = (occasionId: string) => {
  // Get products from both occasion-specific files and all products that match the occasion
  const occasionSpecificProducts =
    occasionProducts[occasionId as keyof typeof occasionProducts] || [];
  const allOccasionProducts = allProducts.filter(
    (product) => product.occasionId === occasionId
  );

  // Combine and deduplicate based on product ID
  const combinedProducts = [
    ...occasionSpecificProducts,
    ...allOccasionProducts,
  ];
  const uniqueProducts = combinedProducts.filter(
    (product, index, self) =>
      index === self.findIndex((p) => p.id === product.id)
  );

  return uniqueProducts;
};

export const getBestSellers = () => {
  return allProducts.filter((product) => product.isBestSeller);
};

export const getSpecialGifts = () => {
  return allProducts.filter((product) => product.isSpecialGift);
};

export const getProductById = (id: number) => {
  return allProducts.find((product) => product.id === id);
};

export default allProducts;
