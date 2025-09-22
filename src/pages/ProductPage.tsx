import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Minus,
  Shield,
  Truck,
  RotateCcw,
  CheckCircle,
  Clock,
  Gift,
  Sparkles,
  X,
  MessageCircle,
  Flame,
  GaugeCircle,
  HeartPulse,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { allProducts, getProductById } from "../data";
import {
  ProductImage,
  usePreloadCriticalImages,
  useImagePreloader,
} from "../features/images";
import FavoriteButton from "../components/ui/FavoriteButton";
import AddToCartButton from "../components/ui/AddToCartButton";

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

interface Product {
  id: number;
  nameEn: string;
  nameAr: string;
  price: number;
  imageUrl: string;
  images?: string[];
  isBestSeller: boolean;
  isSpecialGift: boolean;
  categoryId: string;
  occasionId: string;
  descriptionEn: string;
  descriptionAr: string;
  careTipsEn: string;
  careTipsAr: string;
  dimensionsEn: string;
  dimensionsAr: string;
  arrangementContentsEn: string;
  arrangementContentsAr: string;
}

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  // Default to "description"
  const [activeTab, setActiveTab] = useState("description");
  const [showImageZoomModal, setShowImageZoomModal] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);

  const product = getProductById(parseInt(id || "0")) as Product | undefined;

  const productImages = useMemo(
    () =>
      product && product.images && product.images.length > 0
        ? product.images
        : [product?.imageUrl || ""].filter(Boolean),
    [product]
  );

  usePreloadCriticalImages(productImages);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter(
        (p) =>
          p.id !== product.id &&
          (p.categoryId === product.categoryId ||
            p.occasionId === product.occasionId)
      )
      .slice(0, 8);
  }, [product]);

  const relatedImages = useMemo(
    () => relatedProducts.slice(0, 6).map((p) => p.imageUrl),
    [relatedProducts]
  );
  useImagePreloader(relatedImages, { priority: false });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setSelectedImageIndex(0);
    // Set the active tab to "description" whenever the product ID changes
    setActiveTab("description");
  }, [id]);

  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth < 1024;
      const header = document.querySelector("header");
      if (header) {
        header.style.display = isMobileView ? "none" : "block";
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      const header = document.querySelector("header");
      if (header) {
        header.style.display = "block";
      }
    };
  }, []);

  const handleDragStart = (e: React.TouchEvent) => {
    setDragStart(e.touches[0].clientX);
  };

  const handleDragEnd = (e: React.TouchEvent) => {
    if (dragStart === null) return;
    const dragEnd = e.changedTouches[0].clientX;
    const dragDistance = dragEnd - dragStart;
    const swipeThreshold = 50;

    if (dragDistance > swipeThreshold) {
      setSelectedImageIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : productImages.length - 1
      );
    } else if (dragDistance < -swipeThreshold) {
      setSelectedImageIndex((prevIndex) =>
        prevIndex < productImages.length - 1 ? prevIndex + 1 : 0
      );
    }
    setDragStart(null);
  };

  const tabs = useMemo(() => {
    const allTabs = [
      {
        id: "description",
        label: isRtl ? "الوصف" : "Description",
        icon: <MessageCircle size={16} />,
        content: isRtl ? product?.descriptionAr : product?.descriptionEn,
      },
      {
        id: "shipping",
        label: isRtl ? "الشحن" : "Shipping",
        icon: <Truck size={16} />,
        // This tab is always available, so its content is considered non-empty
        content: "shipping",
      },
      {
        id: "care",
        label: isRtl ? "نصائح العناية" : "Care Tips",
        icon: <HeartPulse size={16} />,
        content: isRtl ? product?.careTipsAr : product?.careTipsEn,
      },
      {
        id: "dimensions",
        label: isRtl ? "الأبعاد" : "Dimensions",
        icon: <GaugeCircle size={16} />,
        content: isRtl ? product?.dimensionsAr : product?.dimensionsEn,
      },
      {
        id: "contents",
        label: isRtl ? "محتويات التنسيق" : "Arrangement Contents",
        icon: <Sparkles size={16} />,
        content: isRtl
          ? product?.arrangementContentsAr
          : product?.arrangementContentsEn,
      },
    ];

    return allTabs.filter((tab) => tab.content);
  }, [product, isRtl]);

  const productCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
      },
    }),
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-neutral-50 text-neutral-800 font-sans antialiased p-4 sm:p-6 lg:p-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center p-8 bg-white rounded-3xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] max-w-md mx-auto border border-neutral-100"
        >
          <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Gift size={32} className="text-neutral-400" />
          </div>
          <h1 className="text-2xl font-bold mb-4 text-neutral-800">
            {isRtl ? "لا يوجد منتج" : "Product Not Found"}
          </h1>
          <p className="text-neutral-600 mb-6 text-sm font-medium">
            {isRtl
              ? "عذراً، المنتج المطلوب غير متوفر."
              : "Sorry, the requested product is not available."}
          </p>
          <Link
            to="/"
            className="px-5 py-2.5 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors flex items-center gap-2 mx-auto text-sm font-bold shadow-md"
          >
            {isRtl ? "العودة للرئيسية" : "Back to Home"}
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-800 font-sans antialiased p-0 sm:p-6 lg:p-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto max-w-7xl"
      >
        <main className="grid gap-8 lg:grid-cols-2">
          {/* Product Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: isRtl ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative"
          >
            <div className="sticky top-0 lg:top-6 flex flex-col-reverse md:flex-row-reverse gap-4">
              {/* Thumbnails */}
              {productImages.length > 1 && (
                <div className="hidden md:flex flex-col gap-2 flex-shrink-0">
                  {productImages.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index
                          ? "border-pink-500 shadow-md"
                          : "border-neutral-200 hover:border-neutral-300"
                      }`}
                      aria-label={`Select image ${index + 1}`}
                    >
                      <ProductImage
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        width={80}
                        height={80}
                        aspectRatio="square"
                        sizes="80px"
                        quality={100}
                        priority={false}
                        showZoom={false}
                        disableHoverOpacity={true}
                      />
                    </button>
                  ))}
                </div>
              )}
              {/* Main Image Carousel */}
              <div
                className="flex-1 bg-white lg:rounded-3xl shadow-none lg:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] border-none lg:border border-neutral-100 overflow-hidden relative"
                onTouchStart={handleDragStart}
                onTouchEnd={handleDragEnd}
              >
                <div className="relative w-full h-full aspect-square overflow-hidden">
                  {productImages.map((image: string, index: number) => (
                    <div
                      key={index}
                      className="absolute inset-0 transition-transform duration-500 ease-in-out"
                      style={{
                        transform: `translateX(${
                          (index - selectedImageIndex) * 100
                        }%)`,
                        zIndex:
                          index === selectedImageIndex
                            ? 10
                            : index > selectedImageIndex
                            ? 5 - (index - selectedImageIndex)
                            : 5 - (selectedImageIndex - index),
                      }}
                    >
                      <ProductImage
                        src={image}
                        alt={isRtl ? product.nameAr : product.nameEn}
                        className="w-full h-full object-cover rounded-none lg:rounded-3xl"
                        width={800}
                        height={800}
                        aspectRatio="square"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        quality={100}
                        priority={index === selectedImageIndex}
                        showZoom={false}
                        disableHoverOpacity={true}
                      />
                    </div>
                  ))}
                </div>
                <div className="absolute start-4 top-4 flex flex-col gap-2 z-20">
                  {product.isBestSeller && (
                    <span className="inline-flex w-fit items-center gap-1 rounded-full bg-gradient-to-r from-rose-500 to-fuchsia-500 px-2 py-0.5 text-xs font-medium text-white shadow">
                      <Flame size={12} />
                      {isRtl ? "الأكثر مبيعاً" : "Best Seller"}
                    </span>
                  )}
                  {product.isSpecialGift && (
                    <span className="inline-flex w-fit items-center gap-1 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-2 py-0.5 text-xs font-medium text-white shadow">
                      <Sparkles size={12} />
                      {isRtl ? "مميز" : "Special"}
                    </span>
                  )}
                </div>
                <div className="absolute end-4 top-4 flex flex-col gap-2 z-20">
                  <FavoriteButton
                    product={product}
                    className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-rose-500 border border-neutral-100 transition-colors duration-300 hover:bg-neutral-50"
                    size={18}
                  />
                </div>
                {productImages.length > 1 && (
                  <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                    {productImages.map((_: string, index: number) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          selectedImageIndex === index
                            ? "bg-rose-500 w-5"
                            : "bg-neutral-300"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, x: isRtl ? -40 : 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="space-y-6 p-4 sm:p-0"
          >
            {/* Top Info Section */}
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] p-6 border border-neutral-100">
              <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
                <Link to="/" className="hover:text-rose-500 transition-colors">
                  {isRtl ? "الرئيسية" : "Home"}
                </Link>
                <span>/</span>
                <Link
                  to="/special-gifts"
                  className="hover:text-rose-500 transition-colors"
                >
                  {isRtl ? "هدايا مميزة" : "Special Gifts"}
                </Link>
                <span>/</span>
                <span className="text-neutral-800 font-medium truncate">
                  {isRtl ? product.nameAr : product.nameEn}
                </span>
              </nav>
              <h1 className="text-3xl font-extrabold text-neutral-900 mb-2 leading-snug">
                {isRtl ? product.nameAr : product.nameEn}
              </h1>
              <p className="text-neutral-600 text-sm mb-4">
                {isRtl ? product.descriptionAr : product.descriptionEn}
              </p>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-1.5 font-bold">
                  <RiyalSymbol className="w-5 h-5 text-fuchsia-600" />
                  <span className="text-2xl text-neutral-900">
                    {product.price}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-neutral-100 rounded-full border border-neutral-200">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-full hover:bg-neutral-200 flex items-center justify-center transition-colors"
                      aria-label={isRtl ? "تقليل الكمية" : "Decrease quantity"}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center font-bold text-lg text-neutral-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-full hover:bg-neutral-200 flex items-center justify-center transition-colors"
                      aria-label={isRtl ? "زيادة الكمية" : "Increase quantity"}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <AddToCartButton
                    product={product}
                    quantity={quantity}
                    className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-full shadow-md text-sm font-bold hover:bg-rose-600 transition-colors"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </main>
        {/* Tabs Sections */}
        {tabs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, ease: "easeOut" }}
            className="mt-12 p-4 sm:p-0"
          >
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] border border-neutral-100 overflow-hidden">
              <div className="flex border-b border-neutral-200 bg-neutral-50/70">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex-1 py-4 px-3 font-bold transition-all flex items-center justify-center gap-2 text-sm lg:text-base ${
                      activeTab === tab.id
                        ? "text-neutral-900 bg-white shadow-inner-top"
                        : "text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100/70"
                    }`}
                  >
                    {React.cloneElement(tab.icon, {
                      className:
                        activeTab === tab.id
                          ? "text-pink-600"
                          : "text-neutral-500 group-hover:text-neutral-800",
                    })}
                    <span className="hidden sm:inline">{tab.label}</span>
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500 rounded-t-lg"
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === "description" && product.descriptionEn && (
                    <motion.div
                      key="description"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <div className="p-6 bg-white rounded-3xl border border-neutral-100 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)]">
                        <div className="flex items-start gap-4 mb-4">
                          <MessageCircle
                            size={24}
                            className="text-pink-600 flex-shrink-0 mt-0.5"
                          />
                          <h3 className="text-xl font-bold text-neutral-800">
                            {isRtl ? "تفاصيل المنتج" : "Product Details"}
                          </h3>
                        </div>
                        <p className="text-neutral-600 leading-relaxed text-sm mb-6">
                          {isRtl
                            ? product.descriptionAr
                            : product.descriptionEn}
                        </p>
                        <h4 className="font-bold text-neutral-800 mb-2 text-sm">
                          {isRtl ? "الميزات الرئيسية" : "Key Features"}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {[
                            isRtl
                              ? "جودة عالية مضمونة"
                              : "Premium quality guaranteed",
                            isRtl
                              ? "تصميم أنيق وعصري"
                              : "Elegant and modern design",
                            isRtl
                              ? "مناسب لجميع المناسبات"
                              : "Perfect for all occasions",
                            isRtl
                              ? "تغليف فاخر مجاني"
                              : "Free luxury packaging",
                          ].map((feature, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1.5 rounded-full bg-fuchsia-100 px-3 py-1 text-xs font-medium text-fuchsia-800"
                            >
                              <CheckCircle
                                size={12}
                                className="text-fuchsia-600"
                              />
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {activeTab === "shipping" && (
                    <motion.div
                      key="shipping"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-5"
                    >
                      <h3 className="text-xl font-bold text-neutral-800 mb-3">
                        {isRtl
                          ? "معلومات الشحن والتوصيل"
                          : "Shipping & Delivery"}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3 p-4 bg-rose-50/20 rounded-2xl border border-rose-100">
                          <Truck size={24} className="text-rose-600 mt-0.5" />
                          <div>
                            <h4 className="font-bold text-neutral-800 mb-1 text-sm">
                              {isRtl ? "التوصيل السريع" : "Express Delivery"}
                            </h4>
                            <p className="text-xs text-neutral-600">
                              {isRtl
                                ? "توصيل في نفس اليوم للطلبات قبل الساعة 2 ظهراً"
                                : "Same-day delivery for orders before 2 PM"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-rose-50/20 rounded-2xl border border-rose-100">
                          <Shield size={24} className="text-rose-600 mt-0.5" />
                          <div>
                            <h4 className="font-bold text-neutral-800 mb-1 text-sm">
                              {isRtl ? "التغليف الآمن" : "Secure Packaging"}
                            </h4>
                            <p className="text-xs text-neutral-600">
                              {isRtl
                                ? "نضمن وصول منتجاتك بحالة مثالية"
                                : "We guarantee your products arrive in perfect condition"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-rose-50/20 rounded-2xl border border-rose-100">
                          <Clock size={24} className="text-rose-600 mt-0.5" />
                          <div>
                            <h4 className="font-bold text-neutral-800 mb-1 text-sm">
                              {isRtl ? "أوقات التوصيل" : "Delivery Times"}
                            </h4>
                            <p className="text-xs text-neutral-600">
                              {isRtl
                                ? "الرياض وجدة: 24 ساعة، المدن الأخرى: 2-3 أيام"
                                : "Riyadh & Jeddah: 24 hours, Other cities: 2-3 days"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-rose-50/20 rounded-2xl border border-rose-100">
                          <RotateCcw
                            size={24}
                            className="text-rose-600 mt-0.5"
                          />
                          <div>
                            <h4 className="font-bold text-neutral-800 mb-1 text-sm">
                              {isRtl ? "سياسة الإرجاع" : "Return Policy"}
                            </h4>
                            <p className="text-xs text-neutral-600">
                              {isRtl
                                ? "إمكانية الإرجاع خلال 7 أيام"
                                : "Returns accepted within 7 days"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {activeTab === "care" && product.careTipsEn && (
                    <motion.div
                      key="care"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.2 }}
                      className="p-6 bg-white rounded-3xl border border-neutral-100 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] space-y-4"
                    >
                      <h3 className="text-xl font-bold text-neutral-800 mb-4 flex items-center gap-2">
                        <HeartPulse size={20} className="text-rose-600" />
                        {isRtl ? "نصائح العناية" : "Care Tips"}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {isRtl
                          ? product.careTipsAr
                              .split(". ")
                              .filter(Boolean)
                              .map((tip, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-3 p-4 bg-rose-50/20 rounded-2xl border border-rose-100 transition-all duration-300"
                                >
                                  <HeartPulse
                                    size={20}
                                    className="text-rose-600 flex-shrink-0"
                                  />
                                  <p className="text-sm text-neutral-700 font-medium">
                                    {tip}
                                  </p>
                                </div>
                              ))
                          : product.careTipsEn
                              .split(". ")
                              .filter(Boolean)
                              .map((tip, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-3 p-4 bg-rose-50/20 rounded-2xl border border-rose-100 transition-all duration-300"
                                >
                                  <HeartPulse
                                    size={20}
                                    className="text-rose-600 flex-shrink-0"
                                  />
                                  <p className="text-sm text-neutral-700 font-medium">
                                    {tip}
                                  </p>
                                </div>
                              ))}
                      </div>
                    </motion.div>
                  )}
                  {activeTab === "dimensions" && product.dimensionsEn && (
                    <motion.div
                      key="dimensions"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.2 }}
                      className="p-6 bg-white rounded-3xl border border-neutral-100 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] space-y-4 text-center"
                    >
                      <h3 className="text-xl font-bold text-neutral-800 mb-4 flex items-center justify-center gap-2">
                        <GaugeCircle size={20} className="text-teal-600" />
                        {isRtl ? "الأبعاد" : "Dimensions"}
                      </h3>
                      <div className="inline-flex flex-col items-center justify-center p-6 bg-teal-50/20 rounded-3xl border border-teal-100 transition-all duration-300">
                        <GaugeCircle size={48} className="text-teal-600 mb-2" />
                        <p className="text-neutral-700 text-base font-medium">
                          {isRtl ? product.dimensionsAr : product.dimensionsEn}
                        </p>
                      </div>
                    </motion.div>
                  )}
                  {activeTab === "contents" &&
                    product.arrangementContentsEn && (
                      <motion.div
                        key="contents"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.2 }}
                        className="p-6 bg-white rounded-3xl border border-neutral-100 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] space-y-4"
                      >
                        <h3 className="text-xl font-bold text-neutral-800 mb-4 flex items-center gap-2">
                          <Sparkles size={20} className="text-fuchsia-600" />
                          {isRtl ? "محتويات التنسيق" : "Arrangement Contents"}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 p-4 bg-fuchsia-50/20 rounded-2xl border border-fuchsia-100">
                          {isRtl
                            ? product.arrangementContentsAr
                                .split(".")
                                .filter(Boolean)
                                .map((item, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-2 px-4 py-2 bg-fuchsia-100 rounded-full text-sm font-medium text-fuchsia-800 transition-all duration-300"
                                  >
                                    <Sparkles
                                      size={14}
                                      className="text-fuchsia-600 flex-shrink-0"
                                    />
                                    <span>{item.trim()}</span>
                                  </div>
                                ))
                            : product.arrangementContentsEn
                                .split(".")
                                .filter(Boolean)
                                .map((item, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-2 px-4 py-2 bg-fuchsia-100 rounded-full text-sm font-medium text-fuchsia-800 transition-all duration-300"
                                  >
                                    <Sparkles
                                      size={14}
                                      className="text-fuchsia-600 flex-shrink-0"
                                    />
                                    <span>{item.trim()}</span>
                                  </div>
                                ))}
                        </div>
                      </motion.div>
                    )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, ease: "easeOut" }}
            className="mt-12 p-4 sm:p-0"
          >
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-extrabold text-neutral-900 mb-2">
                  {isRtl ? "منتجات ذات صلة" : "Related Products"}
                </h2>
                <p className="text-neutral-600 text-sm">
                  {isRtl
                    ? "منتجات أخرى قد تعجبك"
                    : "Other products you might like"}
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence>
                  {relatedProducts.slice(0, 8).map((relatedProduct, index) => (
                    <motion.div
                      key={relatedProduct.id}
                      variants={productCardVariants}
                      initial="hidden"
                      animate="visible"
                      custom={index}
                      className="group flex w-full flex-col overflow-hidden"
                    >
                      <Link
                        to={`/product/${relatedProduct.id}`}
                        className="block flex-1"
                      >
                        <div className="relative aspect-[4/4.4] sm:aspect-[4/4.7] overflow-hidden rounded-t-3xl rounded-b-3xl">
                          <ProductImage
                            src={relatedProduct.imageUrl}
                            alt={
                              isRtl
                                ? relatedProduct.nameAr
                                : relatedProduct.nameEn
                            }
                            className="h-full w-full object-cover rounded-t-3xl rounded-b-3xl"
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
                          <div className="absolute start-2 top-2 flex flex-col gap-1 z-20">
                            {relatedProduct.isBestSeller && (
                              <span className="inline-flex w-fit items-center gap-1 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-2 py-0.5 text-[10px] font-medium text-white shadow">
                                <Flame size={10} />
                                {isRtl ? "الأكثر مبيعاً" : "Best Seller"}
                              </span>
                            )}
                            {relatedProduct.isSpecialGift && (
                              <span className="inline-flex w-fit items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-2 py-0.5 text-[10px] font-medium text-white shadow">
                                <Sparkles size={10} />
                                {isRtl ? "مميز" : "Special"}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                      <div className="p-3 flex flex-col h-full">
                        <Link
                          to={`/product/${relatedProduct.id}`}
                          className="block mb-1"
                        >
                          <h3 className="line-clamp-2 text-base font-bold text-neutral-900">
                            {isRtl
                              ? relatedProduct.nameAr
                              : relatedProduct.nameEn}
                          </h3>
                        </Link>
                        <p className="line-clamp-2 text-xs text-neutral-500 mb-3">
                          {isRtl
                            ? relatedProduct.descriptionAr
                            : relatedProduct.descriptionEn}
                        </p>
                        <div className="flex items-center justify-between mt-auto">
                          <div
                            className={`flex items-center gap-1 ${
                              isRtl ? "flex-row-reverse" : ""
                            }`}
                          >
                            <RiyalSymbol className="h-4 w-4 text-emerald-600" />
                            <span className="text-base font-bold text-neutral-900">
                              {relatedProduct.price}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 ">
                            <FavoriteButton
                              product={relatedProduct}
                              className="shadow-md"
                            />
                            <AddToCartButton
                              product={relatedProduct}
                              className="shadow-md"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Image Zoom Modal */}
      <AnimatePresence>
        {showImageZoomModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4"
            onClick={() => setShowImageZoomModal(false)}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative max-w-5xl max-h-full w-full h-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowImageZoomModal(false)}
                className="absolute top-4 right-4 bg-white rounded-full p-2.5 text-neutral-800 hover:bg-neutral-100 transition-colors z-10 shadow-lg"
                aria-label={isRtl ? "إغلاق" : "Close"}
              >
                <X size={20} />
              </button>
              <ProductImage
                src={productImages[selectedImageIndex]}
                alt={isRtl ? product.nameAr : product.nameEn}
                className="max-w-full max-h-[85vh] object-contain rounded-3xl shadow-2xl mx-auto"
                width={1600}
                height={1600}
                aspectRatio="auto"
                sizes="100vw"
                quality={100}
                priority={true}
                showZoom={false}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductPage;
