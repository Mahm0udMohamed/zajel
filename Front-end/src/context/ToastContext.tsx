// ToastContext.tsx

import { createContext, useContext, useState, ReactNode } from "react";
import { AnimatePresence } from "framer-motion";
import Toast, { ToastProps } from "../components/ui/Toast";

interface ToastContextType {
  showToast: (toast: Omit<ToastProps, "id" | "onClose">) => void;
  showSuccess: (
    title: string,
    message?: string,
    action?: ToastProps["action"],
    // 1. Add optional 'type' parameter to customize the success toast
    type?: "success" | "cart-success" | "favorite-success"
  ) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const showToast = (toast: Omit<ToastProps, "id" | "onClose">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastProps = {
      ...toast,
      id,
      onClose: removeToast,
    };

    setToasts((prev) => [...prev, newToast]);
  };

  const showSuccess = (
    title: string,
    message?: string,
    action?: ToastProps["action"],
    // 2. Use the provided type, or default to "success"
    type: "success" | "cart-success" | "favorite-success" = "success"
  ) => {
    showToast({ type, title, message, action });
  };

  const showError = (title: string, message?: string) => {
    showToast({ type: "error", title, message });
  };

  const showWarning = (title: string, message?: string) => {
    showToast({ type: "warning", title, message });
  };

  const showInfo = (title: string, message?: string) => {
    showToast({ type: "info", title, message });
  };

  return (
    <ToastContext.Provider
      value={{ showToast, showSuccess, showError, showWarning, showInfo }}
    >
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 rtl:left-4 rtl:right-auto z-50 space-y-2 max-w-sm">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast key={toast.id} {...toast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
