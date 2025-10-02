import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { Button } from "./button";
import { cn } from "../../lib/utils";

export interface ReusableModalProps {
  // Basic modal props
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;

  // Content props
  title: string;
  description?: string;
  children: React.ReactNode;

  // Footer props
  footer?: React.ReactNode;
  showDefaultFooter?: boolean;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  primaryButtonDisabled?: boolean;
  primaryButtonLoading?: boolean;

  // Styling props
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  footerClassName?: string;

  // Size variants
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";

  // Behavior props
  preventCloseOnOutsideClick?: boolean;
  preventCloseOnEscape?: boolean;
  onPointerDownOutside?: (e: Event) => void;
  onEscapeKeyDown?: (e: KeyboardEvent) => void;

  // Icon props
  icon?: React.ReactNode;
  iconClassName?: string;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  full: "max-w-full w-full h-full max-h-full",
};

export function ReusableModal({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footer,
  showDefaultFooter = true,
  primaryButtonText = "حفظ",
  secondaryButtonText = "إلغاء",
  onPrimaryClick,
  onSecondaryClick,
  primaryButtonDisabled = false,
  primaryButtonLoading = false,
  className,
  contentClassName,
  headerClassName,
  footerClassName,
  size = "2xl",
  preventCloseOnOutsideClick = false,
  preventCloseOnEscape = false,
  onPointerDownOutside,
  onEscapeKeyDown,
  icon,
  iconClassName,
}: ReusableModalProps) {
  const handlePointerDownOutside = (e: Event) => {
    if (preventCloseOnOutsideClick) {
      e.preventDefault();
    }
    onPointerDownOutside?.(e);
  };

  const handleEscapeKeyDown = (e: KeyboardEvent) => {
    if (preventCloseOnEscape) {
      e.preventDefault();
    }
    onEscapeKeyDown?.(e);
  };

  const handleSecondaryClick = () => {
    onSecondaryClick?.();
    if (!onSecondaryClick) {
      onOpenChange?.(false);
    }
  };

  const modalContent = (
    <DialogContent
      className={cn(
        size === "full"
          ? "max-h-[100vh] flex flex-col"
          : "max-h-[85vh] flex flex-col",
        sizeClasses[size],
        contentClassName
      )}
      onPointerDownOutside={handlePointerDownOutside}
      onEscapeKeyDown={handleEscapeKeyDown}
    >
      <DialogHeader className={cn("space-y-3", headerClassName)}>
        <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
          {icon && (
            <div className={cn("flex-shrink-0", iconClassName)}>{icon}</div>
          )}
          {title}
        </DialogTitle>
        {description && (
          <DialogDescription className="text-gray-400">
            {description}
          </DialogDescription>
        )}
      </DialogHeader>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className={cn("py-6", className)}>{children}</div>
      </div>

      {(showDefaultFooter || footer) && (
        <DialogFooter
          className={cn(
            "flex justify-start gap-3 bg-black/20 border-t border-gray-800/50 p-4 -mx-6 -mb-6",
            footerClassName
          )}
        >
          {footer || (
            <>
              <Button
                variant="outline"
                onClick={handleSecondaryClick}
                className="bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:border-gray-500 shadow-gray-500/20"
              >
                {secondaryButtonText}
              </Button>
              <Button
                onClick={onPrimaryClick}
                disabled={primaryButtonDisabled || primaryButtonLoading}
                className="bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/30 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {primaryButtonLoading ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    جاري الحفظ...
                  </>
                ) : (
                  primaryButtonText
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      )}
    </DialogContent>
  );

  if (trigger) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        {modalContent}
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {modalContent}
    </Dialog>
  );
}

// Specialized modal variants for common use cases
export function FormModal({
  title,
  description,
  children,
  onSubmit,
  onCancel,
  submitText = "حفظ",
  cancelText = "إلغاء",
  isSubmitting = false,
  isValid = true,
  ...props
}: Omit<
  ReusableModalProps,
  | "onPrimaryClick"
  | "onSecondaryClick"
  | "primaryButtonText"
  | "secondaryButtonText"
> & {
  onSubmit?: () => void;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  isSubmitting?: boolean;
  isValid?: boolean;
}) {
  return (
    <ReusableModal
      title={title}
      description={description}
      children={children}
      onPrimaryClick={onSubmit}
      onSecondaryClick={onCancel}
      primaryButtonText={submitText}
      secondaryButtonText={cancelText}
      primaryButtonDisabled={!isValid}
      primaryButtonLoading={isSubmitting}
      preventCloseOnOutsideClick={true}
      preventCloseOnEscape={true}
      {...props}
    />
  );
}

export function ConfirmModal({
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = "تأكيد",
  cancelText = "إلغاء",
  variant = "default",
  ...props
}: Omit<
  ReusableModalProps,
  | "children"
  | "onPrimaryClick"
  | "onSecondaryClick"
  | "primaryButtonText"
  | "secondaryButtonText"
> & {
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}) {
  const isDestructive = variant === "destructive";

  return (
    <ReusableModal
      title={title}
      description={description}
      children={null}
      onPrimaryClick={onConfirm}
      onSecondaryClick={onCancel}
      primaryButtonText={confirmText}
      secondaryButtonText={cancelText}
      className={isDestructive ? "bg-red-600 hover:bg-red-700" : undefined}
      {...props}
    />
  );
}

export function InfoModal({
  title,
  description,
  children,
  onClose,
  closeText = "إغلاق",
  ...props
}: Omit<
  ReusableModalProps,
  | "onPrimaryClick"
  | "onSecondaryClick"
  | "primaryButtonText"
  | "secondaryButtonText"
  | "showDefaultFooter"
> & {
  onClose?: () => void;
  closeText?: string;
}) {
  return (
    <ReusableModal
      title={title}
      description={description}
      children={children}
      onSecondaryClick={onClose}
      secondaryButtonText={closeText}
      showDefaultFooter={true}
      {...props}
    />
  );
}
