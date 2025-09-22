import React, { Suspense, lazy } from "react";
import { useTranslation } from "react-i18next";

const HeroSlider = lazy(() => import("../components/home/HeroSlider"));
const ShopByOccasionSection = lazy(
  () => import("../components/home/ShopByOccasionSection")
);
const CategoriesSection = lazy(
  () => import("../components/home/CategoriesSection")
);
const BestSellersSection = lazy(
  () => import("../components/home/BestSellersSection")
);
const FeaturedCollectionsSection = lazy(
  () => import("../components/home/FeaturedCollectionsSection")
);
const LuxuryGiftsSection = lazy(
  () => import("../components/home/LuxuryGiftsSection")
);
const SpecialOccasionsSection = lazy(
  () => import("../components/home/SpecialOccasionsSection")
);
const MagicGiftSection = lazy(
  () => import("../components/home/MagicGiftSection")
);

const HomePage: React.FC = () => {
  const { t } = useTranslation();

  React.useEffect(() => {
    document.title = t("meta.title");
  }, [t]);

  return (
    <div className="bg-background-primary">
      <Suspense fallback={<div>Loading...</div>}>
        <HeroSlider />
        <ShopByOccasionSection />
        <CategoriesSection />
        <BestSellersSection />
        <FeaturedCollectionsSection />
        <LuxuryGiftsSection />
        <SpecialOccasionsSection />
        <MagicGiftSection />
      </Suspense>
    </div>
  );
};

export default React.memo(HomePage);
