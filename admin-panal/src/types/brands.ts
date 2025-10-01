export interface Brand {
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

export interface BrandFormData {
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
}

export interface BrandsTabProps {
  brands: Brand[];
  onAdd: (brand: BrandFormData) => void;
  onUpdate: (id: string, brand: BrandFormData) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
  onReorder: (brands: Brand[]) => void;
}

export interface BrandModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  brand?: Brand | null;
  onSuccess: (brand: Brand) => void;
  title: string;
}

export interface BrandPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface BrandsResponse {
  success: boolean;
  data: Brand[];
  pagination: BrandPagination;
  message: string;
}

export interface BrandApiResponse {
  success: boolean;
  data: Brand;
  message: string;
}
