import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ChevronRight, ChevronLeft } from "lucide-react";
import categories from "../../data/categories.json";
import { ProductImage } from "../../features/images";
import { useImagePreloader } from "../../features/images";
import { useMobileDetection } from "../../hooks/useMobileDetection";

interface Category {
  id: string;
  nameKey: string;
  imageUrl: string;
}

const CategoryCard: React.FC<{ category: Category; index: number }> = ({
  category,
  index,
}) => {
  const { t } = useTranslation();

  return (
    <Link
      to={`/category/${category.id}`}
      className="flex flex-col items-center flex-shrink-0 w-20 sm:w-24 md:w-28 text-center snap-center"
    >
      <div className="w-full aspect-square rounded-full overflow-hidden relative z-10 bg-gradient-to-br from-primary-100 to-secondary-50 shadow-sm border border-primary-100 hover:shadow-md transition-shadow">
        <ProductImage
          src={category.imageUrl}
          alt={t(category.nameKey)}
          className="w-full h-full object-cover"
          width={80}
          height={80}
          aspectRatio="square"
          sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 112px"
          quality={100}
          priority={index < 4}
          showZoom={false}
          placeholderSize={20}
          fallbackSrc="https://images.pexels.com/photos/1058775/pexels-photo-1058775.jpeg?auto=compress&cs=tinysrgb&w=400"
        />
      </div>
      <span className="text-text-primary text-xs sm:text-sm font-medium mt-2 w-full line-clamp-1 leading-tight text-center">
        {t(category.nameKey)}
      </span>
    </Link>
  );
};

const CategoriesSection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useMobileDetection();

  const categoryImages = React.useMemo(
    () => categories.slice(0, 8).map((category) => category.imageUrl),
    []
  );
  useImagePreloader(categoryImages, { priority: true });

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const cardWidth = window.innerWidth >= 768 ? 112 + 16 : 80 + 12;
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

  return (
    <section className="py-2 sm:py-6 bg-background-secondary">
      <div className="container-custom px-4 sm:px-6">
        <div className="flex items-center justify-between mb-3">
          <h2
            className={`text-lg sm:text-xl font-bold text-text-primary ${
              i18n.language === "ar" ? "font-tajawal" : "font-poppins"
            }`}
          >
            {t("home.categories.title")}
          </h2>
          <Link
            to="/categories"
            className="text-primary-500 text-sm font-medium hover:text-primary-600 transition-colors"
          >
            {t("home.categories.viewMore")}
          </Link>
        </div>

        {isMobile ? (
          <div className="flex items-start overflow-x-auto gap-3 pb-2 snap-x snap-mandatory scrollbar-hidden">
            {categories.map((category: Category, index) => (
              <div key={category.id} className="snap-start">
                <CategoryCard category={category} index={index} />
              </div>
            ))}
          </div>
        ) : (
          <div className="relative">
            <div
              ref={scrollRef}
              className="flex items-start overflow-x-auto gap-3 sm:gap-4 md:gap-4 pb-2 snap-x snap-mandatory scrollbar-hidden"
              style={{ scrollSnapStop: "always" }}
            >
              {categories.map((category: Category, index) => (
                <div key={category.id} className="snap-start">
                  <CategoryCard category={category} index={index} />
                </div>
              ))}
            </div>

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
              aria-label={t("common.scrollRight")}
            >
              {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default React.memo(CategoriesSection);
