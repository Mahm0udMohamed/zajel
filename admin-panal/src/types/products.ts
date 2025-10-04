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
  careInstructions?: string;
  arrangementContents?: string;
  productStatus: string[];
  targetAudience: string;
  isActive: boolean;
  isFeatured: boolean;
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
  careInstructions: string;
  arrangementContents: string;
  productStatus: string[];
  targetAudience: string;
  isActive: boolean;
  isFeatured: boolean;
  showInHomePage: boolean;
}
