export interface Category {
  _id: string;
  name: string; // الاسم حسب اللغة المحددة
  nameAr: string; // الاسم بالعربية
  nameEn: string; // الاسم بالإنجليزية
  description?: string; // الوصف حسب اللغة المحددة
  descriptionAr?: string; // الوصف بالعربية
  descriptionEn?: string; // الوصف بالإنجليزية
  imageUrl: string; // رابط الصورة
  isActive: boolean; // حالة النشاط
  sortOrder: number; // ترتيب العرض
  productCount: number; // عدد المنتجات
  showInHomePage: boolean; // عرض في الصفحة الرئيسية
  showInNavigation: boolean; // عرض في التنقل
  metaTitle?: string; // عنوان SEO حسب اللغة
  metaTitleAr?: string; // عنوان SEO بالعربية
  metaTitleEn?: string; // عنوان SEO بالإنجليزية
  metaDescription?: string; // وصف SEO حسب اللغة
  metaDescriptionAr?: string; // وصف SEO بالعربية
  metaDescriptionEn?: string; // وصف SEO بالإنجليزية
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
  createdAt: string; // تاريخ الإنشاء
  updatedAt: string; // تاريخ التحديث
}

export interface CategoryFormData {
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
  showInHomePage?: boolean;
  showInNavigation?: boolean;
  metaTitleAr?: string;
  metaTitleEn?: string;
  metaDescriptionAr?: string;
  metaDescriptionEn?: string;
}

export interface CategoriesTabProps {
  categories: Category[];
  onAdd: (category: CategoryFormData) => void;
  onUpdate: (id: string, category: CategoryFormData) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
  onReorder: (categories: Category[]) => void;
}

export interface CategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  category?: Category | null;
  onSuccess: (category: Category) => void;
  title: string;
}

export interface CategoryPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
  pagination: CategoryPagination;
  message: string;
}
