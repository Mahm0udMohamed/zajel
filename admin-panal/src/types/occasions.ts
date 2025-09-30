export interface Occasion {
  _id: string;
  nameAr: string; // الاسم بالعربية
  nameEn: string; // الاسم بالإنجليزية
  name?: string; // الاسم حسب اللغة المحددة
  descriptionAr?: string; // الوصف بالعربية
  descriptionEn?: string; // الوصف بالإنجليزية
  description?: string; // الوصف حسب اللغة المحددة
  imageUrl: string; // رابط الصورة
  isActive: boolean; // حالة النشاط
  sortOrder: number; // ترتيب العرض
  productCount?: number; // عدد المنتجات
  showInHomePage?: boolean; // عرض في الصفحة الرئيسية
  metaTitleAr?: string; // عنوان SEO بالعربية
  metaTitleEn?: string; // عنوان SEO بالإنجليزية
  metaTitle?: string; // عنوان SEO حسب اللغة المحددة
  metaDescriptionAr?: string; // وصف SEO بالعربية
  metaDescriptionEn?: string; // وصف SEO بالإنجليزية
  metaDescription?: string; // وصف SEO حسب اللغة المحددة
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  updatedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt?: string; // تاريخ الإنشاء
  updatedAt?: string; // تاريخ التحديث
}

export type OccasionFormData = Omit<
  Occasion,
  "_id" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy" | "productCount"
>;

export interface OccasionsTabProps {
  occasions: Occasion[];
  onAdd: (occasion: OccasionFormData) => void;
  onUpdate: (id: string, occasion: OccasionFormData) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
  onReorder: (occasions: Occasion[]) => void;
}

export interface OccasionsApiResponse {
  success: boolean;
  data: Occasion[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  message: string;
}

export interface OccasionApiResponse {
  success: boolean;
  data: Occasion;
  message: string;
}
