export interface Occasion {
  id: string;
  nameAr: string; // الاسم بالعربية
  nameEn: string; // الاسم بالإنجليزية
  imageUrl: string; // رابط الصورة
  isActive: boolean; // حالة النشاط
  sortOrder: number; // ترتيب العرض
  createdAt?: string; // تاريخ الإنشاء
  updatedAt?: string; // تاريخ التحديث
}

export type OccasionFormData = Omit<Occasion, "id" | "createdAt" | "updatedAt">;

export interface OccasionsTabProps {
  occasions: Occasion[];
  onAdd: (occasion: OccasionFormData) => void;
  onUpdate: (id: string, occasion: OccasionFormData) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
  onReorder: (occasions: Occasion[]) => void;
}
