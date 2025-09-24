import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { EnhancedImage } from "../../features/images";
import { usePreloadCriticalImages } from "../../features/images";
import { usePerformanceMode } from "../../hooks/useMobileDetection";
import heroOccasions from "../../data/heroOccasions.json";
import promotionalSlides from "../../data/promotionalSlides.json";

interface Occasion {
  nameKey: string;
  id: string;
  nameAr: string;
  nameEn: string;
  date: string;
  images: string[];
  celebratoryMessageAr: string;
  celebratoryMessageEn: string;
  priority: number;
  isActive: boolean;
}

interface PromotionalSlide {
  id: string;
  type: "promotion";
  image: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  buttonTextAr: string;
  buttonTextEn: string;
  link: string;
  gradient: string;
  isActive: boolean;
  priority: number;
  startDate: string;
  endDate: string;
}

const HeroSlider: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [currentSlide, setCurrentSlide] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  const [isOccasionActive, setIsOccasionActive] = useState(false);
  const { isMobile, shouldReduceAnimations } = usePerformanceMode();
  const sliderRef = useRef<HTMLDivElement>(null);

  const activeOccasions = useMemo(() => {
    return (heroOccasions as Occasion[])
      .filter((occasion) => occasion.isActive)
      .sort((a, b) => a.priority - b.priority);
  }, []);

  const activePromotions = useMemo(() => {
    const now = new Date().getTime();
    return (promotionalSlides as PromotionalSlide[])
      .filter((slide) => {
        if (!slide.isActive) return false;
        const startDate = new Date(slide.startDate).getTime();
        const endDate = new Date(slide.endDate).getTime();
        return now >= startDate && now <= endDate;
      })
      .sort((a, b) => a.priority - b.priority);
  }, []);

  const nearestOccasion = useMemo(() => {
    return activeOccasions.reduce((nearest, occasion) => {
      const occasionDate = new Date(occasion.date).getTime();
      const now = Date.now();
      const oneDayInMs = 24 * 60 * 60 * 1000;
      if (occasionDate < now - oneDayInMs) return nearest;
      if (!nearest || occasionDate < new Date(nearest.date).getTime()) {
        return occasion;
      }
      return nearest;
    }, null as Occasion | null);
  }, [activeOccasions]);

  const allSlides = useMemo(() => {
    const occasionSlides = nearestOccasion
      ? nearestOccasion.images.map((image, index) => ({
          id: `occasion-${index}`,
          type: "occasion" as const,
          image,
          occasion: nearestOccasion,
        }))
      : [];

    const promoSlides = activePromotions.map((slide) => ({
      id: slide.id,
      type: "promotion" as const,
      image: slide.image,
      promotion: slide,
    }));

    if (occasionSlides.length > 0) {
      return [occasionSlides[0], ...promoSlides, ...occasionSlides.slice(1)];
    }

    return promoSlides;
  }, [nearestOccasion, activePromotions]);

  // Preload hero images for instant display
  const heroImages = React.useMemo(() => {
    return allSlides.slice(0, 3).map((slide) => slide.image);
  }, [allSlides]);
  usePreloadCriticalImages(heroImages);

  const extendedSlides = useMemo(
    () => [...allSlides, allSlides[0]],
    [allSlides]
  );

  const updateCountdown = useCallback(() => {
    if (!nearestOccasion) return;
    const now = new Date();
    const occasionDate = new Date(nearestOccasion.date);
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const occasionDateOnly = new Date(
      occasionDate.getFullYear(),
      occasionDate.getMonth(),
      occasionDate.getDate()
    );
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const diff = occasionDate.getTime() - now.getTime();

    const isToday =
      nowDate.getTime() === occasionDateOnly.getTime() ||
      (nowDate.getTime() > occasionDateOnly.getTime() &&
        nowDate.getTime() <= occasionDateOnly.getTime() + oneDayInMs);
    setIsOccasionActive(isToday);

    if (!isToday) {
      setTimeLeft({
        days: Math.floor(diff / oneDayInMs),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
      });
    }
  }, [nearestOccasion]);

  useEffect(() => {
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [updateCountdown]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTransitionEnabled(true);
      setCurrentSlide((prev) => (prev + 1) % extendedSlides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [extendedSlides.length]);

  useEffect(() => {
    const slider = sliderRef.current;
    const handleTransitionEnd = () => {
      if (currentSlide === allSlides.length) {
        setTransitionEnabled(false);
        setCurrentSlide(0);
      }
    };
    if (slider) {
      slider.addEventListener("transitionend", handleTransitionEnd);
    }
    return () => {
      if (slider) {
        slider.removeEventListener("transitionend", handleTransitionEnd);
      }
    };
  }, [currentSlide, allSlides.length]);

  useEffect(() => {
    if (!transitionEnabled) {
      const timeout = setTimeout(() => setTransitionEnabled(true), 50);
      return () => clearTimeout(timeout);
    }
  }, [transitionEnabled]);

  const currentSlideData = allSlides[currentSlide] || allSlides[0];

  if (allSlides.length === 0) return null;

  return (
    <section className="relative overflow-hidden py-4 sm:py-8">
      {!isMobile &&
        isOccasionActive &&
        currentSlideData?.type === "occasion" && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              recycle={false}
              numberOfPieces={100}
              tweenDuration={4000}
              colors={["#d8b4fe", "#c084fc", "#8b4589", "#6d28d9"]}
            />
          </div>
        )}

      <div className="container-custom px-4 sm:px-16">
        <div className="relative h-[280px] sm:h-[380px] md:h-[480px] lg:h-[580px] xl:h-[620px] overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 backdrop-blur-sm shadow-lg">
          {/* Background Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-transparent to-secondary-900/20 z-10 rounded-2xl sm:rounded-3xl" />

          {/* Slides Container */}
          <motion.div
            ref={sliderRef}
            className="flex h-full w-full will-change-transform"
            animate={{
              x: isArabic
                ? currentSlide * 100 + "%"
                : -currentSlide * 100 + "%",
            }}
            transition={{
              duration: shouldReduceAnimations ? 0.5 : 1.2,
              ease: shouldReduceAnimations ? "easeOut" : [0.16, 1, 0.3, 1],
              type: "tween",
            }}
          >
            {extendedSlides.map((slide, index) => (
              <div
                key={`${slide.id}-${index}`}
                className="w-full h-full flex-none relative"
              >
                <EnhancedImage
                  src={slide.image}
                  alt={
                    slide.type === "occasion"
                      ? t(slide.occasion?.nameKey || "")
                      : (isArabic
                          ? slide.promotion?.titleAr
                          : slide.promotion?.titleEn) || ""
                  }
                  className="w-full h-full object-cover"
                  priority={index === 0}
                  quality={100}
                  sizes="100vw"
                  aspectRatio="auto"
                  showPlaceholder={true}
                  placeholderSize={60}
                  enableBlurUp={true}
                  fallbackSrc="https://images.pexels.com/photos/1974508/pexels-photo-1974508.jpeg?auto=compress&cs=tinysrgb&w=1200"
                />
              </div>
            ))}
          </motion.div>

          {/* Content Overlay */}
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white p-3 sm:p-6 text-center">
            <AnimatePresence mode="wait">
              {currentSlideData?.type === "occasion" &&
              currentSlideData.occasion ? (
                <motion.div
                  key="occasion"
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.95 }}
                  transition={{
                    duration: shouldReduceAnimations ? 0.4 : 1.0,
                    ease: shouldReduceAnimations
                      ? "easeOut"
                      : [0.16, 1, 0.3, 1],
                    staggerChildren: shouldReduceAnimations ? 0.02 : 0.1,
                  }}
                  className="max-w-4xl mx-auto px-2 sm:px-0"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.3,
                      duration: 0.8,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="mb-3 sm:mb-6"
                  >
                    <div className="inline-block bg-white/8 backdrop-blur-sm rounded-full px-3 py-1 sm:px-5 sm:py-2 mb-2 sm:mb-3 border border-white/15">
                      <span className="text-xs sm:text-sm font-medium tracking-wide text-white/90">
                        {isArabic ? "مناسبة خاصة" : "Special Occasion"}
                      </span>
                    </div>
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.4,
                      duration: 1.0,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-3 sm:mb-4 leading-tight text-white drop-shadow-sm"
                  >
                    {isArabic
                      ? currentSlideData.occasion.nameAr
                      : currentSlideData.occasion.nameEn}
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.5,
                      duration: 0.8,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="text-sm sm:text-lg md:text-xl lg:text-2xl mb-4 sm:mb-6 max-w-2xl mx-auto opacity-90 leading-relaxed font-light px-2 sm:px-0 text-white/85"
                  >
                    {isOccasionActive
                      ? isArabic
                        ? currentSlideData.occasion.celebratoryMessageAr
                        : currentSlideData.occasion.celebratoryMessageEn
                      : t("home.hero.expressDelivery")}
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.6,
                      duration: 0.8,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <Link to="/products">
                      <div className="inline-flex items-center bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-all duration-300 border border-white/20 hover:bg-white hover:scale-105">
                        <span>{t("home.hero.giftNow")}</span>
                        <motion.span
                          className={`${
                            isArabic ? "mr-1 sm:mr-1.5" : "ml-1 sm:ml-1.5"
                          } text-sm sm:text-base`}
                          animate={{
                            x: isArabic ? [-2, 0] : [0, 2],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut",
                          }}
                        >
                          {isArabic ? "←" : "→"}
                        </motion.span>
                      </div>
                    </Link>
                  </motion.div>
                </motion.div>
              ) : currentSlideData?.type === "promotion" &&
                currentSlideData.promotion ? (
                <motion.div
                  key="promotion"
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.95 }}
                  transition={{
                    duration: shouldReduceAnimations ? 0.4 : 1.0,
                    ease: shouldReduceAnimations
                      ? "easeOut"
                      : [0.16, 1, 0.3, 1],
                    staggerChildren: shouldReduceAnimations ? 0.02 : 0.1,
                  }}
                  className="max-w-4xl mx-auto px-2 sm:px-0"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 0.2,
                      duration: 0.8,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="bg-white/8 backdrop-blur-sm text-white rounded-full px-3 py-1 sm:px-5 sm:py-2 mb-2 sm:mb-3 inline-block text-xs sm:text-sm font-medium uppercase tracking-wide border border-white/15"
                  >
                    {isArabic ? "عرض خاص" : "Special Offer"}
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.3,
                      duration: 1.0,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-3 sm:mb-4 tracking-tight leading-tight text-white drop-shadow-sm"
                  >
                    {isArabic
                      ? currentSlideData.promotion.titleAr
                      : currentSlideData.promotion.titleEn}
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.4,
                      duration: 0.8,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="text-sm sm:text-lg md:text-xl lg:text-2xl mb-4 sm:mb-6 max-w-2xl mx-auto opacity-90 leading-relaxed font-light px-2 sm:px-0 text-white/85"
                  >
                    {isArabic
                      ? currentSlideData.promotion.subtitleAr
                      : currentSlideData.promotion.subtitleEn}
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.5,
                      duration: 0.8,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <Link to={currentSlideData.promotion.link || "/products"}>
                      <div className="inline-flex items-center bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-all duration-300 border border-white/20 hover:bg-white hover:scale-105">
                        <span>
                          {isArabic
                            ? currentSlideData.promotion.buttonTextAr
                            : currentSlideData.promotion.buttonTextEn}
                        </span>
                        <motion.span
                          className={`${
                            isArabic ? "mr-1 sm:mr-1.5" : "ml-1 sm:ml-1.5"
                          } text-sm sm:text-base`}
                          animate={{
                            x: isArabic ? [-2, 0] : [0, 2],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut",
                          }}
                        >
                          {isArabic ? "←" : "→"}
                        </motion.span>
                      </div>
                    </Link>
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Countdown Timer */}
          {!isOccasionActive &&
            nearestOccasion &&
            currentSlideData?.type === "occasion" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className={`absolute bottom-4 sm:bottom-8 ${
                  isArabic ? "right-4 sm:right-8" : "left-4 sm:left-8"
                } z-30`}
              >
                <div className="bg-white/8 backdrop-blur-sm rounded-lg sm:rounded-xl p-1.5 sm:p-2.5 border border-white/15">
                  <div className="flex items-center gap-1.5 sm:gap-3 text-white">
                    <div className="text-center">
                      <div className="text-[10px] sm:text-lg font-bold">
                        {timeLeft.days}
                      </div>
                      <div className="text-[6px] sm:text-[8px] uppercase opacity-80 font-medium tracking-wide">
                        {t("home.counter.days")}
                      </div>
                    </div>
                    <div className="w-px h-2 sm:h-4 bg-white/30"></div>
                    <div className="text-center">
                      <div className="text-[10px] sm:text-lg font-bold">
                        {timeLeft.hours}
                      </div>
                      <div className="text-[6px] sm:text-[8px] uppercase opacity-80 font-medium tracking-wide">
                        {t("home.counter.hours")}
                      </div>
                    </div>
                    <div className="w-px h-2 sm:h-4 bg-white/30"></div>
                    <div className="text-center">
                      <div className="text-[10px] sm:text-lg font-bold">
                        {timeLeft.minutes}
                      </div>
                      <div className="text-[6px] sm:text-[8px] uppercase opacity-80 font-medium tracking-wide">
                        {t("home.counter.minutes")}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          {/* Navigation Dots */}
          <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-30">
            <div className="flex items-center gap-2 sm:gap-3 bg-white/8 backdrop-blur-sm rounded-full px-3 py-1 sm:px-4 sm:py-2 border border-white/15">
              {allSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`transition-all duration-500 ease-out rounded-full ${
                    currentSlide === index
                      ? "w-6 sm:w-8 h-2 sm:h-3 bg-white"
                      : "w-2 sm:w-3 h-2 sm:h-3 bg-white/40 hover:bg-white/60"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={() =>
              setCurrentSlide(
                currentSlide === 0 ? allSlides.length - 1 : currentSlide - 1
              )
            }
            className={`hidden sm:flex absolute top-1/2 transform -translate-y-1/2 ${
              isArabic ? "right-2 sm:right-4" : "left-2 sm:left-4"
            } z-30 w-6 h-6 sm:w-8 sm:h-8 bg-white/8 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all duration-300 border border-white/15 hover:bg-white/15 hover:scale-105`}
            aria-label={isArabic ? "الشريحة السابقة" : "Previous slide"}
          >
            <span className="text-sm sm:text-base font-light">
              {isArabic ? "→" : "←"}
            </span>
          </button>

          <button
            onClick={() =>
              setCurrentSlide((currentSlide + 1) % allSlides.length)
            }
            className={`hidden sm:flex absolute top-1/2 transform -translate-y-1/2 ${
              isArabic ? "left-2 sm:left-4" : "right-2 sm:right-4"
            } z-30 w-6 h-6 sm:w-8 sm:h-8 bg-white/8 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all duration-300 border border-white/15 hover:bg-white/15 hover:scale-105`}
            aria-label={isArabic ? "الشريحة التالية" : "Next slide"}
          >
            <span className="text-sm sm:text-base font-light">
              {isArabic ? "←" : "→"}
            </span>
          </button>

          {/* Decorative Elements - Hidden on mobile for performance */}
          {!isMobile && (
            <>
              <div className="absolute top-4 sm:top-8 right-4 sm:right-8 w-12 h-12 sm:w-16 sm:h-16 bg-white/5 rounded-full blur-xl animate-pulse" />
              <div
                className="absolute bottom-12 sm:bottom-16 left-4 sm:left-8 w-8 h-8 sm:w-12 sm:h-12 bg-white/5 rounded-full blur-lg animate-pulse"
                style={{ animationDelay: "1.5s" }}
              />
              <div
                className="absolute top-1/3 right-1/4 w-6 h-6 sm:w-10 sm:h-10 bg-white/5 rounded-full blur-md animate-pulse"
                style={{ animationDelay: "3s" }}
              />
            </>
          )}
        </div>
      </div>

      {/* Bottom Accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-200/30 to-transparent" />
    </section>
  );
};

export default React.memo(HeroSlider);
