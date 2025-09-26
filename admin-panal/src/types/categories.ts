export interface Category {
  id: string;
  nameAr: string; // الاسم بالعربية
  nameEn: string; // الاسم بالإنجليزية
  imageUrl: string; // رابط الصورة
  isActive: boolean; // حالة النشاط
  sortOrder: number; // ترتيب العرض
  createdAt?: string; // تاريخ الإنشاء
  updatedAt?: string; // تاريخ التحديث
}

export type CategoryFormData = Omit<Category, "id" | "createdAt" | "updatedAt">;

export interface CategoriesTabProps {
  categories: Category[];
  onAdd: (category: CategoryFormData) => void;
  onUpdate: (id: string, category: CategoryFormData) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
  onReorder: (categories: Category[]) => void;
}
