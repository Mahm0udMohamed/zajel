// API service for communicating with the backend
const API_BASE_URL = "https://localhost:3002/api";

// Generic API request function
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
    },
    // Note: In a real production app, you would handle SSL certificates properly
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Hero Promotions API
export const heroPromotionsApi = {
  // Get all hero promotions with optional filters
  getAll: async (params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
    language?: "ar" | "en";
    sortBy?:
      | "priority"
      | "titleAr"
      | "titleEn"
      | "startDate"
      | "endDate"
      | "createdAt";
    sortOrder?: "asc" | "desc";
  }) => {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/hero-promotions${queryString ? `?${queryString}` : ""}`;

    return apiRequest<{
      success: boolean;
      data: HeroPromotion[];
      pagination?: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
      };
    }>(endpoint);
  },

  // Get active hero promotions only
  getActive: async (limit?: number) => {
    const searchParams = new URLSearchParams();
    if (limit) {
      searchParams.append("limit", limit.toString());
    }

    const queryString = searchParams.toString();
    const endpoint = `/hero-promotions/active${
      queryString ? `?${queryString}` : ""
    }`;

    return apiRequest<{
      success: boolean;
      data: HeroPromotion[];
    }>(endpoint);
  },

  // Get upcoming hero promotions
  getUpcoming: async (limit?: number) => {
    const searchParams = new URLSearchParams();
    if (limit) {
      searchParams.append("limit", limit.toString());
    }

    const queryString = searchParams.toString();
    const endpoint = `/hero-promotions/upcoming${
      queryString ? `?${queryString}` : ""
    }`;

    return apiRequest<{
      success: boolean;
      data: HeroPromotion[];
    }>(endpoint);
  },

  // Get a single hero promotion by ID
  getById: async (id: string) => {
    return apiRequest<{
      success: boolean;
      data: HeroPromotion;
    }>(`/hero-promotions/${id}`);
  },

  // Search hero promotions
  search: async (
    query: string,
    language: "ar" | "en" = "ar",
    limit?: number
  ) => {
    const searchParams = new URLSearchParams({
      q: query,
      language,
    });

    if (limit) {
      searchParams.append("limit", limit.toString());
    }

    const endpoint = `/hero-promotions/search?${searchParams.toString()}`;

    return apiRequest<{
      success: boolean;
      data: HeroPromotion[];
    }>(endpoint);
  },
};

// Hero Occasions API
export const heroOccasionsApi = {
  // Get all hero occasions with optional filters
  getAll: async (params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
    language?: "ar" | "en";
    sortBy?: "date" | "nameAr" | "nameEn" | "createdAt";
    sortOrder?: "asc" | "desc";
  }) => {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/hero-occasions${queryString ? `?${queryString}` : ""}`;

    return apiRequest<{
      success: boolean;
      data: HeroOccasion[];
      pagination?: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
      };
    }>(endpoint);
  },

  // Get active hero occasions only
  getActive: async (limit?: number) => {
    const searchParams = new URLSearchParams();
    if (limit) {
      searchParams.append("limit", limit.toString());
    }

    const queryString = searchParams.toString();
    const endpoint = `/hero-occasions/active${
      queryString ? `?${queryString}` : ""
    }`;

    return apiRequest<{
      success: boolean;
      data: HeroOccasion[];
    }>(endpoint);
  },

  // Get upcoming hero occasions
  getUpcoming: async (limit?: number) => {
    const searchParams = new URLSearchParams();
    if (limit) {
      searchParams.append("limit", limit.toString());
    }

    const queryString = searchParams.toString();
    const endpoint = `/hero-occasions/upcoming${
      queryString ? `?${queryString}` : ""
    }`;

    return apiRequest<{
      success: boolean;
      data: HeroOccasion[];
    }>(endpoint);
  },

  // Get a single hero occasion by ID
  getById: async (id: string) => {
    return apiRequest<{
      success: boolean;
      data: HeroOccasion;
    }>(`/hero-occasions/${id}`);
  },

  // Search hero occasions
  search: async (
    query: string,
    language: "ar" | "en" = "ar",
    limit?: number
  ) => {
    const searchParams = new URLSearchParams({
      q: query,
      language,
    });

    if (limit) {
      searchParams.append("limit", limit.toString());
    }

    const endpoint = `/hero-occasions/search?${searchParams.toString()}`;

    return apiRequest<{
      success: boolean;
      data: HeroOccasion[];
    }>(endpoint);
  },
};

// Types
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
  gradient: string;
  isActive: boolean;
  priority: number;
  startDate: string;
  endDate: string;
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

export interface HeroOccasion {
  _id: string;
  nameAr: string;
  nameEn: string;
  date: string;
  images: string[];
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

// Error handling utility
export class ApiError extends Error {
  constructor(message: string, public status?: number, public data?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}

// Export the main API object
export default {
  heroPromotions: heroPromotionsApi,
  heroOccasions: heroOccasionsApi,
};
