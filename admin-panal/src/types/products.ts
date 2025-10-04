export interface Product {
  _id: string;
  nameAr: string;
  nameEn: string;
  mainImage: string;
  additionalImages: string[];
  price: number;
  category: {
    _id: string;
    nameAr: string;
    nameEn: string;
  };
  occasion: {
    _id: string;
    nameAr: string;
    nameEn: string;
  };
  brand: {
    _id: string;
    nameAr: string;
    nameEn: string;
  };
  descriptionAr?: string;
  descriptionEn?: string;
  careInstructionsAr?: string;
  careInstructionsEn?: string;
  arrangementContentsAr?: string;
  arrangementContentsEn?: string;
  dimensions?: {
    height?: number;
    width?: number;
    unit?: string;
  };
  weight?: {
    value?: number;
    unit?: string;
  };
  fullDimensions?: string;
  fullDimensionsEn?: string;
  fullWeight?: string;
  fullWeightEn?: string;
  metaTitle?: string; // عنوان SEO حسب اللغة
  metaTitleAr?: string; // عنوان SEO بالعربية
  metaTitleEn?: string; // عنوان SEO بالإنجليزية
  metaDescription?: string; // وصف SEO حسب اللغة
  metaDescriptionAr?: string; // وصف SEO بالعربية
  metaDescriptionEn?: string; // وصف SEO بالإنجليزية
  productStatus: string[];
  targetAudience: string;
  isActive: boolean;
  showInHomePage: boolean;
  viewCount?: number;
  purchaseCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  nameAr: string;
  nameEn: string;
  mainImage: string;
  additionalImages: string[];
  price: string;
  category: string;
  occasion: string;
  brand: string;
  descriptionAr: string;
  descriptionEn: string;
  careInstructionsAr: string;
  careInstructionsEn: string;
  arrangementContentsAr: string;
  arrangementContentsEn: string;
  dimensions: {
    height: string;
    width: string;
    unit: string;
  };
  weight: {
    value: string;
    unit: string;
  };
  metaTitleAr: string;
  metaTitleEn: string;
  metaDescriptionAr: string;
  metaDescriptionEn: string;
  productStatus: string[];
  targetAudience: string;
  isActive: boolean;
  showInHomePage: boolean;
}
