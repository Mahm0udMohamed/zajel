import React, { useRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ChevronRight, ChevronLeft, Flame } from "lucide-react";
import { getBestSellers } from "../../data";
import { ProductImage } from "../../features/images";
import { useImagePreloader } from "../../features/images";

interface Product {
  id: number;
  nameEn: string;
  nameAr: string;
  price: number;
  imageUrl: string;
  isBestSeller?: boolean;
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

const BestSellersSection: React.FC = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const bestSellers: Product[] = React.useMemo(() => getBestSellers(), []);

  // ترجمة النصوص مباشرة في الملف
  const translations = {
    title: isRtl ? "الأكثر مبيعاً" : "Best Sellers",
    scrollLeft: isRtl ? "التمرير لليسار" : "Scroll Left",
    scrollRight: isRtl ? "التمرير لليمين" : "Scroll Right",
    bestSeller: isRtl ? "الأكثر مبيعاً" : "Best Seller",
  };

  const bestSellerImages = React.useMemo(
    () => bestSellers.slice(0, 8).map((product) => product.imageUrl),
    [bestSellers]
  );
  useImagePreloader(bestSellerImages, { priority: true });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = isMobile ? 160 + 12 : 192 + 8;
    scrollRef.current.scrollBy({
      left: isRtl
        ? direction === "left"
          ? cardWidth
          : -cardWidth
        : direction === "left"
        ? -cardWidth
        : cardWidth,
      behavior: "smooth",
    });
  };

  const prevDirection = isRtl ? "right" : "left";
  const nextDirection = isRtl ? "left" : "right";

  return (
    <section className="py-2 sm:py-6 bg-background-primary">
      <div className="container-custom px-4 sm:px-6">
        <div className="flex items-center justify-between mb-3">
          <h2
            className={`text-lg sm:text-xl font-bold text-text-primary ${
              i18n.language === "ar" ? "font-tajawal" : "font-poppins"
            }`}
          >
            {translations.title}
          </h2>
        </div>

        <div className="relative">
          {!isMobile && (
            <>
              <button
                onClick={() => scroll(prevDirection)}
                className="hidden md:flex items-center justify-center absolute top-[40%] -translate-y-1/2 bg-background-primary/90 text-text-secondary rounded-full w-9 h-9 shadow ring-1 ring-border-primary z-10 -left-8"
                aria-label={translations.scrollLeft}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => scroll(nextDirection)}
                className="hidden md:flex items-center justify-center absolute top-[40%] -translate-y-1/2 bg-background-primary/90 text-text-secondary rounded-full w-9 h-9 shadow ring-1 ring-border-primary z-10 -right-8"
                aria-label={translations.scrollRight}
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-x-3 pb-2 snap-x snap-mandatory scroll-smooth"
            style={{
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: isMobile ? "none" : "thin",
              scrollbarColor: isMobile ? "transparent" : "#0ea5e9 transparent",
            }}
          >
            {bestSellers.map((product, index) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="group flex flex-shrink-0 w-44 sm:w-52 flex-col overflow-hidden rounded-3xl"
              >
                <div className="block">
                  <div className="relative aspect-[4/4.4] sm:aspect-[4/4.7] overflow-hidden rounded-3xl">
                    <ProductImage
                      src={product.imageUrl}
                      alt={
                        i18n.language === "ar" ? product.nameAr : product.nameEn
                      }
                      className="h-full w-full object-cover"
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
                        <span className="inline-flex w-fit items-center gap-1 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 px-2 py-0.5 text-[10px] font-medium text-white shadow">
                          <Flame size={10} />
                          {translations.bestSeller}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-3 flex flex-col h-full bg-background-primary rounded-b-3xl">
                  <div className="block">
                    <h3 className="line-clamp-2 text-base font-bold text-text-primary transition-colors duration-200 leading-tight mb-0">
                      {isRtl ? product.nameAr : product.nameEn}
                    </h3>
                  </div>
                  <div className="flex items-center">
                    <div
                      className={`flex items-center gap-1 ${
                        isRtl ? "flex-row-reverse" : ""
                      }`}
                    >
                      <RiyalSymbol className="h-4 w-4 text-primary-600" />
                      <span className="text-base font-bold text-text-primary">
                        {product.price}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(BestSellersSection);
