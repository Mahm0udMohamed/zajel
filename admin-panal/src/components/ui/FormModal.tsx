import { ReusableModal, type ReusableModalProps } from "./ReusableModal";

export interface FormModalProps
  extends Omit<
    ReusableModalProps,
    | "onPrimaryClick"
    | "onSecondaryClick"
    | "primaryButtonText"
    | "secondaryButtonText"
  > {
  onSubmit?: () => void;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  isSubmitting?: boolean;
  isValid?: boolean;
  hasChanges?: boolean;
  hasData?: boolean;
}

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
  hasChanges = false,
  hasData = false,
  onPointerDownOutside,
  onEscapeKeyDown,
  ...props
}: FormModalProps) {
  const handlePointerDownOutside = (e: Event) => {
    if (hasChanges || hasData) {
      e.preventDefault();
    }
    onPointerDownOutside?.(e);
  };

  const handleEscapeKeyDown = (e: KeyboardEvent) => {
    if (hasChanges || hasData) {
      e.preventDefault();
    }
    onEscapeKeyDown?.(e);
  };

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
      onPointerDownOutside={handlePointerDownOutside}
      onEscapeKeyDown={handleEscapeKeyDown}
      {...props}
    />
  );
}
