// Toast.tsx

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, X, AlertCircle, Info, Heart } from "lucide-react";

// 1. Extend the Toast type to include custom success variants
export type ToastType =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "cart-success"
  | "favorite-success";

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 4000,
  onClose,
  action,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  // 2. Define colors and icons in a more scalable way
  const toastStyles: {
    [key in ToastType]: {
      icon: React.ReactElement;
      colors: string;
      gradient: string;
      iconBg: string;
      progressGradient: string;
    };
  } = {
    success: {
      icon: <CheckCircle size={20} className="text-success-600" />,
      colors: "bg-success-50 border-success-200 text-success-800",
      gradient:
        "linear-gradient(to right, theme('colors.success.50'), theme('colors.success.100'))",
      iconBg: "bg-success-100 text-success-600",
      progressGradient:
        "linear-gradient(to right, theme('colors.success.500'), theme('colors.success.400'))",
    },
    error: {
      icon: <X size={20} className="text-error-600" />,
      colors: "bg-error-50 border-error-200 text-error-800",
      gradient:
        "linear-gradient(to right, theme('colors.error.50'), theme('colors.error.100'))",
      iconBg: "bg-error-100 text-error-600",
      progressGradient:
        "linear-gradient(to right, theme('colors.error.500'), theme('colors.error.400'))",
    },
    warning: {
      icon: <AlertCircle size={20} className="text-warning-600" />,
      colors: "bg-warning-50 border-warning-200 text-warning-800",
      gradient:
        "linear-gradient(to right, theme('colors.warning.50'), theme('colors.warning.100'))",
      iconBg: "bg-warning-100 text-warning-600",
      progressGradient:
        "linear-gradient(to right, theme('colors.warning.500'), theme('colors.warning.400'))",
    },
    info: {
      icon: <Info size={20} className="text-info-600" />,
      colors: "bg-info-50 border-info-200 text-info-800",
      gradient:
        "linear-gradient(to right, theme('colors.info.50'), theme('colors.info.100'))",
      iconBg: "bg-info-100 text-info-600",
      progressGradient:
        "linear-gradient(to right, theme('colors.info.500'), theme('colors.info.400'))",
    },
    "cart-success": {
      icon: <CheckCircle size={20} className="text-primary-600" />,
      colors: "bg-primary-50 border-primary-200 text-primary-800",
      gradient:
        "linear-gradient(to right, theme('colors.primary.50'), theme('colors.primary.100'))",
      iconBg: "bg-primary-100 text-primary-600",
      progressGradient:
        "linear-gradient(to right, theme('colors.primary.500'), theme('colors.primary.400'))",
    },
    "favorite-success": {
      icon: <Heart size={20} className="text-secondary-600" />,
      colors: "bg-secondary-50 border-secondary-200 text-secondary-800",
      gradient:
        "linear-gradient(to right, theme('colors.secondary.50'), theme('colors.secondary.100'))",
      iconBg: "bg-secondary-100 text-secondary-600",
      progressGradient:
        "linear-gradient(to right, theme('colors.secondary.500'), theme('colors.secondary.400'))",
    },
  };

  const currentStyle = toastStyles[type] || toastStyles.success;

  return (
    <motion.div
      initial={{ opacity: 0, y: -30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.95 }}
      className={`relative flex items-start gap-3 p-3 rounded-2xl border shadow-xl backdrop-blur-md ${currentStyle.colors} bg-gradient-to-r`}
      style={{ backgroundImage: currentStyle.gradient }}
    >
      {/* Icon inside circle */}
      <div className="flex-shrink-0 mt-0.5">
        <div
          className={`w-8 h-8 flex items-center justify-center rounded-full shadow-md ${currentStyle.iconBg}`}
        >
          {React.cloneElement(currentStyle.icon, { size: 16 })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm">{title}</h4>
        {message && <p className="text-xs opacity-90 mt-1">{message}</p>}

        {action && (
          <button
            onClick={action.onClick}
            className="mt-2 text-xs font-medium px-2 py-1 rounded-lg bg-black/5 hover:bg-black/10 transition-all"
          >
            {action.label}
          </button>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 p-1.5 rounded-full hover:bg-black/10 transition-colors"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
};

export default Toast;
