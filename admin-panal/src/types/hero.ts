// Hero Occasion Interface
export interface HeroOccasion {
  _id: string;
  nameAr: string;
  nameEn: string;
  date: string; // ISO date string
  images: string[]; // Array of image URLs
  celebratoryMessageAr: string;
  celebratoryMessageEn: string;
  isActive: boolean;
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
  createdAt: string;
  updatedAt: string;
}

// Hero Promotion Interface
export interface HeroPromotion {
  _id: string;
  image: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  buttonTextAr: string;
  buttonTextEn: string;
  link: string;
  gradient: string; // CSS gradient class
  isActive: boolean;
  priority: number;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
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
  createdAt: string;
  updatedAt: string;
}

// Form data interfaces
export interface HeroOccasionFormData {
  nameAr: string;
  nameEn: string;
  date: string;
  images: string[];
  celebratoryMessageAr: string;
  celebratoryMessageEn: string;
  isActive: boolean;
}

export interface HeroPromotionFormData {
  image: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  buttonTextAr: string;
  buttonTextEn: string;
  link: string;
  gradient: string;
  isActive: boolean;
  priority: number;
  startDate: string;
  endDate: string;
}
