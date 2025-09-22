import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Package,
  CreditCard,
  Truck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { ProductImage } from "../features/images";

const CartPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const { isAuthenticated } = useAuth();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartTotal,
    isLoading,
  } = useCart();

  const [isClearing, setIsClearing] = useState(false);

  const handleClearCart = async () => {
    setIsClearing(true);
    setTimeout(() => {
      clearCart();
      setIsClearing(false);
    }, 500);
  };

  // المجموع الفرعي (cartTotal) هو الآن شامل للضريبة
  const shippingCost = cartTotal > 200 ? 0 : 25;
  // المجموع النهائي هو المجموع الفرعي (شامل الضريبة) + الشحن
  const finalTotal = cartTotal + shippingCost;

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 flex items-center justify-center p-4 font-serif text-neutral-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <ShoppingCart className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-purple-800 mb-4">
            {isRtl ? "تسجيل الدخول مطلوب" : "Login Required"}
          </h1>
          <p className="text-gray-600 mb-8">
            {isRtl
              ? "يجب تسجيل الدخول لعرض وإدارة سلة التسوق الخاصة بك"
              : "Please login to view and manage your shopping cart"}
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/auth/login"
              className="bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 px-6 rounded-xl font-medium hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg"
            >
              {isRtl ? "تسجيل الدخول" : "Login"}
            </Link>
            <Link
              to="/auth/signup"
              className="bg-white text-purple-600 border border-purple-200 py-3 px-6 rounded-xl font-medium hover:bg-purple-50 transition-all"
            >
              {isRtl ? "إنشاء حساب جديد" : "Create Account"}
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            {isRtl ? "جاري تحميل السلة..." : "Loading cart..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-purple-800 mb-2">
            {t("cart.title")}
          </h1>
          <p className="text-gray-600">
            {cartCount > 0
              ? `${cartCount} ${isRtl ? "منتج في السلة" : "items in cart"}`
              : isRtl
              ? "سلة التسوق فارغة"
              : "Your cart is empty"}
          </p>
        </div>

        {cart.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100"
          >
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <ShoppingCart size={40} className="text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {t("cart.empty")}
            </h3>
            <p className="text-gray-600 mb-8 text-center max-w-md px-4">
              {isRtl
                ? "لم تقم بإضافة أي منتجات إلى السلة بعد. ابدأ التسوق واكتشف هداياً رائعة!"
                : "You haven't added any products to your cart yet. Start shopping and discover amazing gifts!"}
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 transition-all shadow-lg"
            >
              <Package size={18} />
              {t("cart.continueShopping")}
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">
                    {isRtl ? "المنتجات" : "Items"}
                  </h2>
                  <button
                    onClick={handleClearCart}
                    disabled={isClearing}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
                  >
                    {isClearing ? (
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                    <span className="text-sm font-medium">
                      {t("cart.clearCart")}
                    </span>
                  </button>
                </div>

                <AnimatePresence>
                  {cart.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-gray-100 rounded-xl mb-4 last:mb-0 hover:shadow-md transition-all"
                    >
                      {/* Left Side: Image & Details */}
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <Link
                          to={`/product/${item.id}`}
                          className="flex-shrink-0"
                        >
                          <ProductImage
                            src={item.imageUrl}
                            alt={isRtl ? item.nameAr : item.nameEn}
                            className="w-20 h-20 rounded-lg object-cover"
                            width={80}
                            height={80}
                            aspectRatio="square"
                            sizes="80px"
                            quality={100}
                            showZoom={false}
                          />
                        </Link>
                        <div className="flex-grow sm:flex-grow-0">
                          <Link to={`/product/${item.id}`}>
                            <h3 className="font-medium text-gray-800 hover:text-purple-600 transition-colors mb-1 line-clamp-2">
                              {isRtl ? item.nameAr : item.nameEn}
                            </h3>
                          </Link>
                          <p className="text-purple-600 font-bold text-sm sm:text-base">
                            {item.price} {isRtl ? "ر.س" : "SAR"}
                          </p>
                        </div>
                      </div>

                      {/* Right Side: Controls & Total */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                        {/* Quantity Controls */}
                        <div className="flex items-center bg-gray-100 rounded-lg">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="w-8 h-8 rounded-l-lg hover:bg-gray-200 flex items-center justify-center transition-colors"
                            disabled={isLoading}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-10 text-center font-medium bg-white h-8 flex items-center justify-center border-x border-gray-200">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="w-8 h-8 rounded-r-lg hover:bg-gray-200 flex items-center justify-center transition-colors"
                            disabled={isLoading}
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        {/* Item Total */}
                        <div className="hidden min-w-[80px] text-right rtl:text-left sm:block">
                          <p className="font-bold text-gray-800">
                            {(item.price * item.quantity).toFixed(2)}{" "}
                            {isRtl ? "ر.س" : "SAR"}
                          </p>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-8 h-8 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 flex items-center justify-center transition-colors"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <div className="w-3 h-3 border border-red-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Order Summary */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <CreditCard size={20} className="text-purple-600" />
                  {t("cart.summary")}
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      {isRtl
                        ? "المجموع الفرعي (شامل الضريبة)"
                        : "Subtotal (VAT included)"}
                    </span>
                    <span className="font-medium">
                      {cartTotal.toFixed(2)} {isRtl ? "ر.س" : "SAR"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Truck size={16} className="text-gray-500" />
                      <span className="text-gray-600">
                        {t("cart.shipping")}
                      </span>
                    </div>
                    <div className="text-right rtl:text-left">
                      {shippingCost === 0 ? (
                        <div>
                          <span className="font-medium text-green-600">
                            {isRtl ? "مجاني" : "Free"}
                          </span>
                          <div className="text-xs text-gray-500">
                            {isRtl ? "للطلبات +200 ر.س" : "Orders 200+ SAR"}
                          </div>
                        </div>
                      ) : (
                        <span className="font-medium">
                          {shippingCost} {isRtl ? "ر.س" : "SAR"}
                        </span>
                      )}
                    </div>
                  </div>

                  {cartTotal > 200 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-green-700">
                        <Truck size={16} />
                        <span className="text-sm font-medium">
                          {isRtl ? "🎉 توصيل مجاني!" : "🎉 Free shipping!"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">
                      {t("cart.total")}
                    </span>
                    <span className="text-xl font-bold text-purple-600">
                      {finalTotal.toFixed(2)} {isRtl ? "ر.س" : "SAR"}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 px-4 rounded-xl font-medium hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                    <CreditCard size={18} />
                    <span>{t("cart.checkout")}</span>
                    {isRtl ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                  </button>

                  <Link
                    to="/"
                    className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                  >
                    <Package size={18} />
                    <span>{t("cart.continueShopping")}</span>
                  </Link>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                      <Truck size={16} />
                      {isRtl ? "معلومات التوصيل" : "Delivery Information"}
                    </h4>
                    <ul className="text-blue-700 text-sm space-y-1 list-inside">
                      <li>
                        •{" "}
                        {isRtl
                          ? "توصيل مجاني للطلبات +200 ر.س"
                          : "Free delivery for orders 200+ SAR"}
                      </li>
                      <li>
                        •{" "}
                        {isRtl
                          ? "توصيل في نفس اليوم متاح"
                          : "Same-day delivery available"}
                      </li>
                      <li>
                        • {isRtl ? "تغليف هدايا مجاني" : "Free gift wrapping"}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
