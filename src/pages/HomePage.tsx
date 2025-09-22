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
const ShippingDeliverySection = lazy(
  () => import("../components/home/ShippingDeliverySection")
);
const DownloadAppSection = lazy(
  () => import("../components/home/DownloadAppSection")
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
    <div className="bg-white">
      <Suspense fallback={<div>Loading...</div>}>
        <HeroSlider />
        <ShopByOccasionSection />
        <CategoriesSection />
        <BestSellersSection />
        <FeaturedCollectionsSection />
        <ShippingDeliverySection />
        <MagicGiftSection />
        <DownloadAppSection />
      </Suspense>
    </div>
  );
};

export default React.memo(HomePage);
