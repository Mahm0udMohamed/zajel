// Hero Occasion Interface
export interface HeroOccasion {
  id: string;
  nameKey: string;
  nameAr: string;
  nameEn: string;
  date: string; // ISO date string
  images: string[]; // Array of image URLs
  celebratoryMessageAr: string;
  celebratoryMessageEn: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Hero Promotion Interface
export interface HeroPromotion {
  id: string;
  type: "promotion";
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
  createdAt?: string;
  updatedAt?: string;
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
