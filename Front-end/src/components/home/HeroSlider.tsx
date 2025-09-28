import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { EnhancedImage } from "../../features/images";
import { usePreloadCriticalImages } from "../../features/images";
import { useHeroSliderOccasions } from "../../hooks/useHeroOccasions";
import { useActiveHeroPromotions } from "../../hooks/useHeroPromotions";

// Remove the unused Occasion interface since we're using HeroOccasion from the API service
// Remove the unused PromotionalSlide interface since we're using HeroPromotion from the API service

const HeroSlider: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [currentSlide, setCurrentSlide] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  const [isOccasionActive, setIsOccasionActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Use the custom hook to fetch hero occasions from backend
  const {
    nearestOccasion,
    loading: occasionsLoading,
    error: occasionsError,
  } = useHeroSliderOccasions();

  // Use the custom hook to fetch hero promotions from backend
  const {
    promotions: activePromotions,
    loading: promotionsLoading,
    error: promotionsError,
  } = useActiveHeroPromotions(10);

  // دالة مبسطة لتحويل التدرج
  const convertGradientToCSS = (gradient: string) => {
    const gradientMap: { [key: string]: string } = {
      "from-amber-500/80 to-orange-600/80":
        "linear-gradient(to right, #f59e0b, #ea580c)",
      "from-red-500/80 to-pink-600/80":
        "linear-gradient(to right, #ef4444, #db2777)",
      "from-blue-500/80 to-cyan-600/80":
        "linear-gradient(to right, #3b82f6, #0891b2)",
      "from-green-500/80 to-emerald-600/80":
        "linear-gradient(to right, #22c55e, #059669)",
      "from-purple-500/80 to-violet-600/80":
        "linear-gradient(to right, #a855f7, #7c3aed)",
    };
    return (
      gradientMap[gradient] || "linear-gradient(to right, #f59e0b, #ea580c)"
    );
  };

  const allSlides = useMemo(() => {
    // Show loading state if occasions or promotions are still loading
    if (occasionsLoading || promotionsLoading) {
      return [];
    }

    // Show error state if there's an error
    if (occasionsError) {
      console.error("Error loading hero occasions:", occasionsError);
    }

    if (promotionsError) {
      console.error("Error loading hero promotions:", promotionsError);
    }

    const occasionSlides = nearestOccasion
      ? nearestOccasion.images.map((image, index) => ({
          id: `occasion-${index}`,
          type: "occasion" as const,
          image,
          occasion: nearestOccasion,
        }))
      : [];

    const promoSlides = activePromotions.map((promotion) => ({
      id: promotion._id,
      type: "promotion" as const,
      image: promotion.image,
      promotion: promotion,
    }));

    if (occasionSlides.length > 0) {
      return [occasionSlides[0], ...promoSlides, ...occasionSlides.slice(1)];
    }

    return promoSlides;
  }, [
    nearestOccasion,
    activePromotions,
    occasionsLoading,
    occasionsError,
    promotionsLoading,
    promotionsError,
  ]);

  // Preload hero images for instant display
  const heroImages = React.useMemo(() => {
    return allSlides.slice(0, 3).map((slide) => slide.image);
  }, [allSlides]);
  usePreloadCriticalImages(heroImages);

  // إزالة extendedSlides المعقد - سنستخدم allSlides مباشرة

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

  // دالة لإعادة تعيين العد التنازلي
  const resetAutoSlideTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (allSlides.length <= 1) return;

    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % allSlides.length);
    }, 6000);
  }, [allSlides.length]);

  // التنقل التلقائي السلس - لا نهائي في نفس الاتجاه
  useEffect(() => {
    resetAutoSlideTimer();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [resetAutoSlideTimer]);

  // إزالة منطق transitionEnabled المعقد - لم نعد نحتاجه

  const currentSlideData = allSlides[currentSlide] || allSlides[0];

  // Show loading state
  if (occasionsLoading || promotionsLoading) {
    return (
      <section className="relative overflow-hidden py-4 sm:py-8">
        <div className="container-custom px-4 sm:px-16">
          <div className="relative h-[280px] sm:h-[380px] md:h-[480px] lg:h-[580px] xl:h-[620px] overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 backdrop-blur-sm shadow-lg">
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (allSlides.length === 0) return null;

  return (
    <section className="relative overflow-hidden py-4 sm:py-8">
      <div className="container-custom px-4 sm:px-16">
        <div className="relative h-[280px] sm:h-[380px] md:h-[480px] lg:h-[580px] xl:h-[620px] overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10">
          {/* Background Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-transparent to-secondary-900/20 z-10 rounded-2xl sm:rounded-3xl" />

          {/* Slides Container */}
          <div
            className="flex h-full w-full transition-transform duration-1000 ease-out"
            style={{
              transform: `translateX(${
                isArabic ? currentSlide * 100 : -currentSlide * 100
              }%)`,
            }}
          >
            {allSlides.map((slide, index) => (
              <div
                key={`${slide.id}-${index}`}
                className="w-full h-full flex-none relative"
              >
                <EnhancedImage
                  src={slide.image}
                  alt={
                    slide.type === "occasion"
                      ? (isArabic
                          ? slide.occasion?.nameAr
                          : slide.occasion?.nameEn) || ""
                      : (isArabic
                          ? slide.promotion?.titleAr
                          : slide.promotion?.titleEn) || ""
                  }
                  className="w-full h-full object-cover"
                  priority={index === 0}
                  quality={100}
                  width={1920}
                  height={1080}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                  aspectRatio="landscape"
                  showPlaceholder={true}
                  placeholderSize={60}
                  enableBlurUp={false}
                  fallbackSrc="https://images.pexels.com/photos/1974508/pexels-photo-1974508.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop&crop=center"
                />
              </div>
            ))}
          </div>

          {/* Content Overlay */}
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white p-3 sm:p-6 text-center">
            {currentSlideData?.type === "occasion" &&
            currentSlideData.occasion ? (
              <div className="max-w-4xl mx-auto px-2 sm:px-0">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-3 sm:mb-4 leading-tight text-white">
                  {isArabic
                    ? currentSlideData.occasion.nameAr
                    : currentSlideData.occasion.nameEn}
                </h2>

                <p className="text-sm sm:text-lg md:text-xl lg:text-2xl mb-4 sm:mb-6 max-w-2xl mx-auto opacity-90 leading-relaxed font-light px-2 sm:px-0 text-white/85">
                  {isOccasionActive
                    ? isArabic
                      ? currentSlideData.occasion.celebratoryMessageAr
                      : currentSlideData.occasion.celebratoryMessageEn
                    : t("home.hero.expressDelivery")}
                </p>

                <div>
                  <Link to="/products">
                    <div className="inline-flex items-center bg-white/90 text-gray-700 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-all duration-300 border border-white/20 hover:bg-white">
                      <span>{t("home.hero.giftNow")}</span>
                      <span
                        className={`${
                          isArabic ? "mr-1 sm:mr-1.5" : "ml-1 sm:ml-1.5"
                        } text-sm sm:text-base`}
                      >
                        {isArabic ? "←" : "→"}
                      </span>
                    </div>
                  </Link>
                </div>
              </div>
            ) : currentSlideData?.type === "promotion" &&
              currentSlideData.promotion ? (
              <div className="max-w-4xl mx-auto px-2 sm:px-0">
                <h2
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 tracking-tight"
                  style={{
                    background: convertGradientToCSS(
                      currentSlideData.promotion?.gradient ||
                        "from-amber-500/80 to-orange-600/80"
                    ),
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    fontFamily: "'Crimson Text', 'Georgia', serif",
                    lineHeight: "1.2",
                  }}
                >
                  {isArabic
                    ? currentSlideData.promotion.titleAr
                    : currentSlideData.promotion.titleEn}
                </h2>

                <p
                  className="text-sm sm:text-lg md:text-xl lg:text-2xl mb-4 sm:mb-6 max-w-2xl mx-auto opacity-90 leading-relaxed font-light px-2 sm:px-0"
                  style={{
                    background: convertGradientToCSS(
                      currentSlideData.promotion?.gradient ||
                        "from-amber-500/80 to-orange-600/80"
                    ),
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {isArabic
                    ? currentSlideData.promotion.subtitleAr
                    : currentSlideData.promotion.subtitleEn}
                </p>

                <div>
                  <Link to={currentSlideData.promotion.link || "/products"}>
                    <div
                      className="inline-flex items-center text-white px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-all duration-300 border border-white/20 hover:opacity-90"
                      style={{
                        background: convertGradientToCSS(
                          currentSlideData.promotion?.gradient ||
                            "from-amber-500/80 to-orange-600/80"
                        ),
                      }}
                    >
                      <span>
                        {isArabic
                          ? currentSlideData.promotion.buttonTextAr
                          : currentSlideData.promotion.buttonTextEn}
                      </span>
                      <span
                        className={`${
                          isArabic ? "mr-1 sm:mr-1.5" : "ml-1 sm:ml-1.5"
                        } text-sm sm:text-base`}
                      >
                        {isArabic ? "←" : "→"}
                      </span>
                    </div>
                  </Link>
                </div>
              </div>
            ) : null}
          </div>

          {/* Countdown Timer */}
          {!isOccasionActive &&
            nearestOccasion &&
            currentSlideData?.type === "occasion" && (
              <div
                className={`absolute bottom-4 sm:bottom-8 ${
                  isArabic ? "right-4 sm:right-8" : "left-4 sm:left-8"
                } z-30`}
              >
                <div className="bg-white/8 rounded-lg sm:rounded-xl p-1.5 sm:p-2.5 border border-white/15">
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
              </div>
            )}

          {/* Navigation Dots */}
          <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-30">
            <div className="flex items-center gap-2 sm:gap-3 bg-white/8 rounded-full px-3 py-1 sm:px-4 sm:py-2 border border-white/15">
              {allSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentSlide(index);
                    resetAutoSlideTimer(); // إعادة تعيين العد التنازلي
                  }}
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
            onClick={() => {
              setCurrentSlide((prev) =>
                prev === 0 ? allSlides.length - 1 : prev - 1
              );
              resetAutoSlideTimer(); // إعادة تعيين العد التنازلي
            }}
            className={`hidden sm:flex absolute top-1/2 transform -translate-y-1/2 ${
              isArabic ? "right-2 sm:right-4" : "left-2 sm:left-4"
            } z-30 w-6 h-6 sm:w-8 sm:h-8 bg-white/8 text-white rounded-full flex items-center justify-center transition-all duration-500 ease-out border border-white/15 hover:bg-white/15`}
            aria-label={isArabic ? "الشريحة السابقة" : "Previous slide"}
          >
            <span className="text-sm sm:text-base font-light">
              {isArabic ? "→" : "←"}
            </span>
          </button>

          <button
            onClick={() => {
              setCurrentSlide((prev) => (prev + 1) % allSlides.length);
              resetAutoSlideTimer(); // إعادة تعيين العد التنازلي
            }}
            className={`hidden sm:flex absolute top-1/2 transform -translate-y-1/2 ${
              isArabic ? "left-2 sm:left-4" : "right-2 sm:right-4"
            } z-30 w-6 h-6 sm:w-8 sm:h-8 bg-white/8 text-white rounded-full flex items-center justify-center transition-all duration-500 ease-out border border-white/15 hover:bg-white/15`}
            aria-label={isArabic ? "الشريحة التالية" : "Next slide"}
          >
            <span className="text-sm sm:text-base font-light">
              {isArabic ? "←" : "→"}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default React.memo(HeroSlider);
