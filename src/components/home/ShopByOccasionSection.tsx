import React, { useRef, useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import occasions from "../../data/occasions.json";
import { ProductImage } from "../../features/images";
import { useImagePreloader } from "../../features/images";

interface Occasion {
  id: string | number;
  nameKey: string;
  imageUrl: string;
}

const OccasionCard: React.FC<{ occasion: Occasion }> = ({ occasion }) => {
  const { t } = useTranslation();

  return (
    <Link
      to={`/occasion/${occasion.id}`}
      className="flex flex-col items-center flex-shrink-0 w-20 sm:w-24 md:w-28 text-center snap-center"
    >
      <div className="w-full aspect-square rounded-full overflow-hidden relative z-10 bg-gradient-to-br from-purple-100 to-pink-50 shadow-sm border border-purple-100">
        <ProductImage
          src={occasion.imageUrl}
          alt={t(occasion.nameKey)}
          className="w-full h-full object-cover"
          width={80}
          height={80}
          aspectRatio="square"
          sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 112px"
          quality={100}
          priority={true}
          showZoom={false}
          placeholderSize={20}
          fallbackSrc="/public/occasions/3.png"
        />
      </div>
      <span className="text-stone-700 text-xs sm:text-sm font-medium mt-2 w-full line-clamp-1 leading-tight text-center">
        {t(occasion.nameKey)}
      </span>
    </Link>
  );
};

const ShopByOccasionSection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showArrows, setShowArrows] = useState(false);

  const occasionImages = useMemo(
    () => occasions.slice(0, 12).map((occasion) => occasion.imageUrl),
    []
  );
  useImagePreloader(occasionImages, { priority: true });

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const cardWidth = window.innerWidth >= 768 ? 112 + 16 : 80 + 12; // card width + gap
      scrollRef.current.scrollBy({
        left: isRtl
          ? direction === "left"
            ? cardWidth * 2
            : -cardWidth * 2
          : direction === "left"
          ? -cardWidth * 2
          : cardWidth * 2,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const checkOverflow = () => {
      if (scrollRef.current) {
        const { scrollWidth, clientWidth } = scrollRef.current;
        setShowArrows(scrollWidth > clientWidth);
      }
    };

    const timeoutId = setTimeout(checkOverflow, 150);
    window.addEventListener("resize", checkOverflow);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", checkOverflow);
    };
  }, []);

  if (occasions.length === 0) return null;

  return (
    <section className="py-6 bg-gray-50">
      <div className="container-custom px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h2
            className={`text-lg sm:text-xl font-bold text-gray-900 ${
              i18n.language === "ar" ? "font-tajawal" : "font-poppins"
            }`}
          >
            {t("home.shopByOccasion.title")}
          </h2>
          <Link
            to="/occasions"
            className="text-orange-500 text-sm font-medium hover:text-orange-600 transition-colors"
          >
            {t("home.occasions.viewMore")}
          </Link>
        </div>

        <div className="relative">
          <div
            ref={scrollRef}
            className="flex items-start overflow-x-auto gap-3 sm:gap-4 md:gap-4 pb-4 snap-x snap-mandatory scrollbar-hidden"
            style={{ scrollSnapStop: "always" }}
          >
            {occasions.map((occasion, index) => (
              <div
                key={occasion.id}
                className="animate-fade-in snap-start"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <OccasionCard occasion={occasion as Occasion} />
              </div>
            ))}
          </div>

          {showArrows && (
            <>
              <button
                onClick={() => scroll("left")}
                className={`hidden md:flex items-center justify-center absolute top-1/2 -translate-y-1/2 bg-white text-gray-600 rounded-full w-8 h-8 shadow-md hover:shadow-lg transition-shadow z-40 ${
                  isRtl ? "-right-4" : "-left-4"
                }`}
                aria-label={t("common.scrollLeft")}
              >
                {isRtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>

              <button
                onClick={() => scroll("right")}
                className={`hidden md:flex items-center justify-center absolute top-1/2 -translate-y-1/2 bg-white text-gray-600 rounded-full w-8 h-8 shadow-md hover:shadow-lg transition-shadow z-40 ${
                  isRtl ? "-left-4" : "-right-4"
                }`}
                aria-label={isRtl ? "التمرير لليمين" : "Scroll right"}
              >
                {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default React.memo(ShopByOccasionSection);
