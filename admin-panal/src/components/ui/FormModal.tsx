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
  mode?: "add" | "edit";
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
  mode = "add",
  onPointerDownOutside,
  onEscapeKeyDown,
  ...props
}: FormModalProps) {
  // زر الحفظ يكون معطل إذا لم تكن هناك تغييرات (في وضع التعديل) أو إذا كان النموذج غير صالح
  // في وضع الإضافة: يجب أن تكون البيانات صحيحة فقط
  // في وضع التعديل: يجب أن تكون البيانات صحيحة وأن تكون هناك تغييرات
  const isSubmitDisabled =
    !isValid || (mode === "edit" && !hasChanges) || isSubmitting;

  const handlePointerDownOutside = (e: Event) => {
    // في وضع التعديل: منع الإغلاق فقط إذا كانت هناك تغييرات
    // في وضع الإضافة: منع الإغلاق إذا كانت هناك بيانات
    const shouldPreventClose = mode === "edit" ? hasChanges : hasData;
    if (shouldPreventClose) {
      e.preventDefault();
    }
    onPointerDownOutside?.(e);
  };

  const handleEscapeKeyDown = (e: KeyboardEvent) => {
    // في وضع التعديل: منع الإغلاق فقط إذا كانت هناك تغييرات
    // في وضع الإضافة: منع الإغلاق إذا كانت هناك بيانات
    const shouldPreventClose = mode === "edit" ? hasChanges : hasData;
    if (shouldPreventClose) {
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
      primaryButtonDisabled={isSubmitDisabled}
      primaryButtonLoading={isSubmitting}
      onPointerDownOutside={handlePointerDownOutside}
      onEscapeKeyDown={handleEscapeKeyDown}
      {...props}
    />
  );
}
