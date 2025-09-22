// src/components/ui/AddToCartButton.tsx

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";

interface AddToCartButtonProps {
  product: {
    id: number;
    nameEn: string;
    nameAr: string;
    price: number;
    imageUrl: string;
  };
  className?: string;
  quantity?: number;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  className = "",
  quantity = 1,
}) => {
  const { addToCart } = useCart();
  const { showError } = useToast();
  const { i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  const isRtl = i18n.language === "ar";
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAdding || justAdded) return;

    if (!isAuthenticated) {
      showError(
        isRtl ? "تسجيل الدخول مطلوب" : "Login Required",
        isRtl
          ? "يجب تسجيل الدخول لإضافة المنتجات إلى السلة"
          : "Please login to add products to cart"
      );
      return;
    }

    setIsAdding(true);

    try {
      await addToCart({
        id: product.id,
        nameEn: product.nameEn,
        nameAr: product.nameAr,
        price: product.price,
        imageUrl: product.imageUrl,
        quantity: quantity,
      });

      setJustAdded(true);

      setTimeout(() => {
        setJustAdded(false);
        setIsAdding(false);
      }, 2000); // 2-second duration for the green checkmark
    } catch (error) {
      console.error("خطأ في إضافة المنتج إلى عربة التسوق:", error);
      setIsAdding(false);
    }
  };

  const getButtonContent = () => {
    if (justAdded) {
      return (
        <motion.div
          key="check-icon"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Check size={18} />
        </motion.div>
      );
    }
    if (isAdding) {
      return (
        <motion.div
          key="spinner-icon"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <ShoppingCart size={18} />
        </motion.div>
      );
    }
    return (
      <motion.div
        key="cart-icon"
        initial={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
      >
        <ShoppingCart size={18} />
      </motion.div>
    );
  };

  return (
    <motion.button
      onClick={handleAddToCart}
      disabled={isAdding || justAdded}
      className={`
        flex items-center justify-center h-8 w-8 rounded-full transition-all duration-300
        ${
          justAdded
            ? "bg-emerald-500 hover:bg-emerald-600"
            : "bg-gradient-to-r from-violet-500 to-fuchsia-500"
        }
        text-white shadow-sm
        ${isAdding || justAdded ? "cursor-not-allowed opacity-90" : ""}
        ${className}
      `}
      whileTap={!isAdding && !justAdded ? { scale: 0.9 } : {}}
      aria-label={
        isRtl
          ? `إضافة ${product.nameAr} إلى عربة التسوق`
          : `Add ${product.nameEn} to cart`
      }
    >
      {getButtonContent()}
    </motion.button>
  );
};

export default AddToCartButton;
