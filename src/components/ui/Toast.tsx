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
      icon: <CheckCircle size={20} className="text-green-600" />,
      colors: "bg-green-50 border-green-200 text-green-800",
      gradient: "linear-gradient(to right, #ecfdf5, #d1fae5)",
      iconBg: "bg-green-100 text-green-600",
      progressGradient: "linear-gradient(to right, #10b981, #34d399)",
    },
    error: {
      icon: <X size={20} className="text-red-600" />,
      colors: "bg-red-50 border-red-200 text-red-800",
      gradient: "linear-gradient(to right, #fef2f2, #fee2e2)",
      iconBg: "bg-red-100 text-red-600",
      progressGradient: "linear-gradient(to right, #ef4444, #f87171)",
    },
    warning: {
      icon: <AlertCircle size={20} className="text-yellow-600" />,
      colors: "bg-yellow-50 border-yellow-200 text-yellow-800",
      gradient: "linear-gradient(to right, #fffbeb, #fef3c7)",
      iconBg: "bg-yellow-100 text-yellow-600",
      progressGradient: "linear-gradient(to right, #f59e0b, #fbbf24)",
    },
    info: {
      icon: <Info size={20} className="text-blue-600" />,
      colors: "bg-blue-50 border-blue-200 text-blue-800",
      gradient: "linear-gradient(to right, #eff6ff, #dbeafe)",
      iconBg: "bg-blue-100 text-blue-600",
      progressGradient: "linear-gradient(to right, #3b82f6, #60a5fa)",
    },
    "cart-success": {
      icon: <CheckCircle size={20} className="text-violet-600" />,
      colors: "bg-violet-50 border-violet-200 text-violet-800",
      gradient: "linear-gradient(to right, #f5f3ff, #ede9fe)",
      iconBg: "bg-violet-100 text-violet-600",
      progressGradient: "linear-gradient(to right, #7c3aed, #8b5cf6)",
    },
    "favorite-success": {
      icon: <Heart size={20} className="text-pink-600" />,
      colors: "bg-pink-50 border-pink-200 text-pink-800",
      gradient: "linear-gradient(to right, #fdf2f8, #fce7f3)",
      iconBg: "bg-pink-100 text-pink-600",
      progressGradient: "linear-gradient(to right, #db2777, #ec4899)",
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
