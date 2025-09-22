import React, { useRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ChevronRight, ChevronLeft } from "lucide-react";
import categories from "../../data/categories.json";
import { ProductImage } from "../../features/images";
import { useImagePreloader } from "../../features/images";
import { motion, useMotionValue, useTransform } from "framer-motion";

interface CardRotateProps {
  children: React.ReactNode;
  onSendToBack: () => void;
  sensitivity: number;
}

function CardRotate({ children, onSendToBack, sensitivity }: CardRotateProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [60, -60]);
  const rotateY = useTransform(x, [-100, 100], [-60, 60]);

  function handleDragEnd(_: never, info: { offset: { x: number; y: number } }) {
    if (
      Math.abs(info.offset.x) > sensitivity ||
      Math.abs(info.offset.y) > sensitivity
    ) {
      onSendToBack();
    } else {
      x.set(0);
      y.set(0);
    }
  }

  return (
    <motion.div
      className="absolute cursor-grab"
      style={{ x, y, rotateX, rotateY }}
      drag
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.6}
      whileTap={{ cursor: "grabbing" }}
      onDragEnd={handleDragEnd}
    >
      {children}
    </motion.div>
  );
}

interface StackProps {
  randomRotation?: boolean;
  sensitivity?: number;
  cardDimensions?: { width: number; height: number };
  sendToBackOnClick?: boolean;
  cardsData: { id: number; img: string; categoryId: string }[];
  animationConfig?: { stiffness: number; damping: number };
}

function Stack({
  randomRotation = false,
  sensitivity = 200,
  cardDimensions = { width: 208, height: 208 },
  cardsData,
  animationConfig = { stiffness: 260, damping: 20 },
  sendToBackOnClick = false,
}: StackProps) {
  const [cards, setCards] = useState(cardsData);

  const sendToBack = (id: number) => {
    setCards((prev) => {
      const newCards = [...prev];
      const index = newCards.findIndex((card) => card.id === id);
      const [card] = newCards.splice(index, 1);
      newCards.unshift(card);
      return newCards;
    });
  };

  return (
    <div
      className="relative"
      style={{
        width: cardDimensions.width,
        height: cardDimensions.height,
        perspective: 600,
      }}
    >
      {cards.map((card, index) => {
        const randomRotate = randomRotation ? Math.random() * 10 - 5 : 0;

        return (
          <CardRotate
            key={card.id}
            onSendToBack={() => sendToBack(card.id)}
            sensitivity={sensitivity}
          >
            <Link to={`/category/${card.categoryId}`}>
              <motion.div
                className="rounded-full overflow-hidden border-3 border-white shadow-lg bg-gradient-to-br from-purple-100 to-pink-50"
                onClick={() => sendToBackOnClick && sendToBack(card.id)}
                animate={{
                  rotateZ: (cards.length - index - 1) * 4 + randomRotate,
                  scale: 1 + index * 0.06 - cards.length * 0.06,
                  transformOrigin: "90% 90%",
                }}
                initial={false}
                transition={{
                  type: "spring",
                  stiffness: animationConfig.stiffness,
                  damping: animationConfig.damping,
                }}
                style={{
                  width: cardDimensions.width,
                  height: cardDimensions.height,
                }}
              >
                <img
                  src={card.img}
                  alt={`card-${card.id}`}
                  className="w-full h-full object-cover pointer-events-none"
                />
              </motion.div>
            </Link>
          </CardRotate>
        );
      })}
    </div>
  );
}

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
      <div className="w-full aspect-square rounded-full overflow-hidden relative z-10 bg-gradient-to-br from-purple-100 to-pink-50 shadow-sm border border-purple-100 hover:shadow-md transition-shadow">
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
      <span className="text-stone-700 text-xs sm:text-sm font-medium mt-2 w-full line-clamp-1 leading-tight text-center">
        {t(category.nameKey)}
      </span>
    </Link>
  );
};

const CategoriesSection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const categoryImages = React.useMemo(
    () => categories.slice(0, 8).map((category) => category.imageUrl),
    []
  );
  useImagePreloader(categoryImages, { priority: true });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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

  const cardsData = categories.map((category) => ({
    id: parseInt(category.id, 10) || Math.random(),
    img: category.imageUrl,
    categoryId: category.id,
  }));

  return (
    <section className="py-6 bg-gray-50">
      <div className="container-custom px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h2
            className={`text-lg sm:text-xl font-bold text-gray-900 ${
              i18n.language === "ar" ? "font-tajawal" : "font-poppins"
            }`}
          >
            {t("home.categories.title")}
          </h2>
          <Link
            to="/categories"
            className="text-orange-500 text-sm font-medium hover:text-orange-600 transition-colors"
          >
            {t("home.categories.viewMore")}
          </Link>
        </div>

        {isMobile ? (
          <div className="flex justify-center">
            <Stack
              randomRotation={true}
              sensitivity={180}
              sendToBackOnClick={true}
              cardDimensions={{ width: 200, height: 200 }}
              cardsData={cardsData}
            />
          </div>
        ) : (
          <div className="relative">
            <div
              ref={scrollRef}
              className="flex items-start overflow-x-auto gap-3 sm:gap-4 md:gap-4 pb-4 snap-x snap-mandatory scrollbar-hidden"
              style={{ scrollSnapStop: "always" }}
            >
              {categories.map((category: Category, index) => (
                <div
                  key={category.id}
                  className="animate-fade-in snap-start"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
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
