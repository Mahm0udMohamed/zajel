import type { ProductFormData } from "../types/products";

export const validateProductData = (data: ProductFormData) => {
  const errors: string[] = [];

  if (!data.nameAr?.trim()) {
    errors.push("الاسم العربي مطلوب");
  }
  if (!data.nameEn?.trim()) {
    errors.push("الاسم الإنجليزي مطلوب");
  }
  if (!data.mainImage?.trim()) {
    errors.push("الصورة الأساسية مطلوبة");
  }
  if (
    !data.price?.trim() ||
    isNaN(Number(data.price)) ||
    Number(data.price) <= 0
  ) {
    errors.push("السعر يجب أن يكون رقماً صحيحاً أكبر من صفر");
  }
  if (!data.category) {
    errors.push("الفئة مطلوبة");
  }
  if (!data.occasion) {
    errors.push("المناسبة مطلوبة");
  }
  if (!data.brand) {
    errors.push("العلامة التجارية مطلوبة");
  }
  if (!data.productStatus) {
    errors.push("حالة المنتج مطلوبة");
  }
  if (!data.targetAudience) {
    errors.push("الجمهور المستهدف مطلوب");
  }

  return errors;
};
