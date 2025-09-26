import React, { createContext, useContext, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Toast from "./Toast";

interface Toast {
  id: string;
  type:
    | "success"
    | "error"
    | "warning"
    | "info"
    | "cart-success"
    | "favorite-success";
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  showSuccess: (
    title: string,
    message?: string,
    action?: { label: string; onClick: () => void },
    type?: "success" | "cart-success" | "favorite-success"
  ) => void;
  showError: (
    title: string,
    message?: string,
    action?: { label: string; onClick: () => void }
  ) => void;
  showWarning: (
    title: string,
    message?: string,
    action?: { label: string; onClick: () => void }
  ) => void;
  showInfo: (
    title: string,
    message?: string,
    action?: { label: string; onClick: () => void }
  ) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (
    type:
      | "success"
      | "error"
      | "warning"
      | "info"
      | "cart-success"
      | "favorite-success",
    title: string,
    message?: string,
    action?: { label: string; onClick: () => void },
    duration: number = 4000
  ) => {
    const id = uuidv4();
    setToasts((prev) => [
      ...prev,
      { id, type, title, message, duration, action },
    ]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const showSuccess = (
    title: string,
    message?: string,
    action?: { label: string; onClick: () => void },
    type: "success" | "cart-success" | "favorite-success" = "success"
  ) => {
    addToast(type, title, message, action);
  };

  const showError = (
    title: string,
    message?: string,
    action?: { label: string; onClick: () => void }
  ) => {
    addToast("error", title, message, action);
  };

  const showWarning = (
    title: string,
    message?: string,
    action?: { label: string; onClick: () => void }
  ) => {
    addToast("warning", title, message, action);
  };

  const showInfo = (
    title: string,
    message?: string,
    action?: { label: string; onClick: () => void }
  ) => {
    addToast("info", title, message, action);
  };

  return (
    <ToastContext.Provider
      value={{ showSuccess, showError, showWarning, showInfo }}
    >
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={removeToast} />
        ))}
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
