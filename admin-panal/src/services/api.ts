const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://localhost:3002/api";

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

interface AdminLoginRequest {
  email: string;
  password: string;
}

interface AdminLoginResponse {
  admin: {
    id: string;
    name: string;
    email: string;
    lastLogin: string;
  };
  accessToken: string;
  refreshToken: string;
}

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  lastLogin: string;
  createdAt: string;
}

class ApiService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // تحميل التوكنات من localStorage عند التهيئة
    this.loadTokensFromStorage();
  }

  private loadTokensFromStorage() {
    this.accessToken = localStorage.getItem("admin_access_token");
    this.refreshToken = localStorage.getItem("admin_refresh_token");
  }

  private saveTokensToStorage(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;

    try {
      // تشفير التوكنات قبل التخزين (اختياري للأمان الإضافي)
      localStorage.setItem("admin_access_token", accessToken);
      localStorage.setItem("admin_refresh_token", refreshToken);
    } catch (error) {
      console.error("Error saving tokens:", error);
      // في حالة فشل التخزين، نحتفظ بالتوكنات في الذاكرة فقط
    }
  }

  private clearTokensFromStorage() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem("admin_access_token");
    localStorage.removeItem("admin_refresh_token");
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.accessToken) {
      defaultHeaders.Authorization = `Bearer ${this.accessToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      // التحقق من نوع المحتوى
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("استجابة غير صحيحة من الخادم");
      }

      const data = await response.json();

      if (!response.ok) {
        // إذا كان هناك تفاصيل أخطاء validation، اعرضها
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors
            .map((err: { msg?: string; message?: string } | string) =>
              typeof err === "string"
                ? err
                : err.msg || err.message || "Unknown error"
            )
            .join("، ");
          throw new Error(errorMessages || data.message || "حدث خطأ في الخادم");
        }
        throw new Error(data.message || "حدث خطأ في الخادم");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }

    try {
      const response = await this.makeRequest<{ accessToken: string }>(
        "/admin/refresh-token",
        {
          method: "POST",
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        }
      );

      if (response.success && response.data) {
        this.accessToken = response.data.accessToken;
        localStorage.setItem("admin_access_token", this.accessToken);
        return true;
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
    }

    return false;
  }

  private async makeAuthenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      return await this.makeRequest<T>(endpoint, options);
    } catch (error) {
      // إذا فشل الطلب بسبب انتهاء صلاحية التوكن، حاول تحديثه
      if (
        error instanceof Error &&
        error.message.includes("انتهت صلاحية التوكن")
      ) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          return await this.makeRequest<T>(endpoint, options);
        } else {
          // إذا فشل تحديث التوكن، امسح التوكنات وأعد توجيه للدخول
          this.clearTokensFromStorage();
          window.location.href = "/";
          throw new Error("انتهت جلستك، يرجى تسجيل الدخول مرة أخرى");
        }
      }
      throw error;
    }
  }

  // تسجيل الدخول
  async login(credentials: AdminLoginRequest): Promise<AdminLoginResponse> {
    const response = await this.makeRequest<AdminLoginResponse>(
      "/admin/login",
      {
        method: "POST",
        body: JSON.stringify(credentials),
      }
    );

    if (response.success && response.data) {
      this.saveTokensToStorage(
        response.data.accessToken,
        response.data.refreshToken
      );
      return response.data;
    }

    throw new Error(response.message || "فشل تسجيل الدخول");
  }

  // تسجيل الخروج
  async logout(): Promise<void> {
    try {
      await this.makeAuthenticatedRequest("/admin/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      this.clearTokensFromStorage();
    }
  }

  // الحصول على معلومات المدير
  async getAdminProfile(): Promise<AdminProfile> {
    const response = await this.makeAuthenticatedRequest<{
      admin: AdminProfile;
    }>("/admin/profile");

    if (response.success && response.data) {
      return response.data.admin;
    }

    throw new Error(response.message || "فشل في الحصول على معلومات المدير");
  }

  // التحقق من حالة المصادقة
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // الحصول على التوكن الحالي
  getAccessToken(): string | null {
    return this.accessToken;
  }

  // Hero Occasions API
  async getHeroOccasions(): Promise<unknown[]> {
    const response = await this.makeRequest<{ data: unknown[] }>(
      "/hero-occasions"
    );
    return Array.isArray(response.data) ? response.data : [];
  }

  async getHeroOccasionById(id: string): Promise<unknown> {
    const response = await this.makeRequest<{ data: unknown }>(
      `/hero-occasions/${id}`
    );
    return response.data;
  }

  async createHeroOccasion(occasionData: unknown): Promise<unknown> {
    const response = await this.makeAuthenticatedRequest<{ data: unknown }>(
      "/hero-occasions",
      {
        method: "POST",
        body: JSON.stringify(occasionData),
      }
    );
    return response.data;
  }

  async updateHeroOccasion(
    id: string,
    occasionData: unknown
  ): Promise<unknown> {
    const response = await this.makeAuthenticatedRequest<{ data: unknown }>(
      `/hero-occasions/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(occasionData),
      }
    );
    return response.data;
  }

  async deleteHeroOccasion(id: string): Promise<void> {
    await this.makeAuthenticatedRequest(`/hero-occasions/${id}`, {
      method: "DELETE",
    });
  }

  async toggleHeroOccasionStatus(id: string): Promise<unknown> {
    const response = await this.makeAuthenticatedRequest<{ data: unknown }>(
      `/hero-occasions/${id}/toggle`,
      {
        method: "PATCH",
      }
    );
    return response.data;
  }

  async importHeroOccasions(occasions: unknown[]): Promise<unknown> {
    const response = await this.makeAuthenticatedRequest<{ data: unknown[] }>(
      "/hero-occasions/import",
      {
        method: "POST",
        body: JSON.stringify({ occasions }),
      }
    );
    return response.data;
  }

  // Hero Promotions API
  async getHeroPromotions(): Promise<unknown[]> {
    const response = await this.makeRequest<{ data: unknown[] }>(
      "/hero-promotions"
    );
    return Array.isArray(response.data) ? response.data : [];
  }

  async getHeroPromotionById(id: string): Promise<unknown> {
    const response = await this.makeRequest<{ data: unknown }>(
      `/hero-promotions/${id}`
    );
    return response.data;
  }

  async createHeroPromotion(promotionData: unknown): Promise<unknown> {
    const response = await this.makeAuthenticatedRequest<{ data: unknown }>(
      "/hero-promotions",
      {
        method: "POST",
        body: JSON.stringify(promotionData),
      }
    );
    return response.data;
  }

  async updateHeroPromotion(
    id: string,
    promotionData: unknown
  ): Promise<unknown> {
    const response = await this.makeAuthenticatedRequest<{ data: unknown }>(
      `/hero-promotions/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(promotionData),
      }
    );
    return response.data;
  }

  async deleteHeroPromotion(id: string): Promise<void> {
    await this.makeAuthenticatedRequest(`/hero-promotions/${id}`, {
      method: "DELETE",
    });
  }

  async toggleHeroPromotionStatus(id: string): Promise<unknown> {
    const response = await this.makeAuthenticatedRequest<{ data: unknown }>(
      `/hero-promotions/${id}/toggle`,
      {
        method: "PATCH",
      }
    );
    return response.data;
  }

  async importHeroPromotions(promotions: unknown[]): Promise<unknown> {
    const response = await this.makeAuthenticatedRequest<{ data: unknown[] }>(
      "/hero-promotions/import",
      {
        method: "POST",
        body: JSON.stringify({ promotions }),
      }
    );
    return response.data;
  }

  async uploadHeroPromotionImage(file: File): Promise<{ secure_url: string }> {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`${API_BASE_URL}/hero-promotions/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.getAccessToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "فشل في رفع الصورة");
    }

    return await response.json();
  }

  // تحديث العروض المنتهية
  async updateExpiredPromotions(): Promise<{
    success: boolean;
    data: { updated: number };
  }> {
    const response = await this.makeAuthenticatedRequest<{
      success: boolean;
      data: { updated: number };
    }>("/hero-promotions/update-expired", {
      method: "POST",
    });
    return response.data || { success: false, data: { updated: 0 } };
  }

  // الحصول على إحصائيات العروض
  async getHeroPromotionsStats(): Promise<{
    success: boolean;
    data: { total: number; active: number; expired: number; upcoming: number };
  }> {
    const response = await this.makeAuthenticatedRequest<{
      success: boolean;
      data: {
        total: number;
        active: number;
        expired: number;
        upcoming: number;
      };
    }>("/hero-promotions/stats");
    return (
      response.data || {
        success: false,
        data: { total: 0, active: 0, expired: 0, upcoming: 0 },
      }
    );
  }

  // Categories API
  async getCategories(params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
    language?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    showInHomePage?: boolean;
    showInNavigation?: boolean;
  }): Promise<{
    success: boolean;
    data: unknown[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    message: string;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.isActive !== undefined)
      queryParams.append("isActive", params.isActive.toString());
    if (params?.language) queryParams.append("language", params.language);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);
    if (params?.showInHomePage !== undefined)
      queryParams.append("showInHomePage", params.showInHomePage.toString());
    if (params?.showInNavigation !== undefined)
      queryParams.append(
        "showInNavigation",
        params.showInNavigation.toString()
      );

    const endpoint = `/categories${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await this.makeRequest<{
      success: boolean;
      data: unknown[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
      message: string;
    }>(endpoint);
    const responseData = response as unknown as {
      success: boolean;
      data: unknown[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
      message: string;
    };
    return {
      success: responseData.success,
      data: responseData.data || [],
      pagination: responseData.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 50,
        hasNextPage: false,
        hasPrevPage: false,
      },
      message: responseData.message,
    };
  }

  async getCategoryById(
    id: string,
    language = "ar"
  ): Promise<{
    success: boolean;
    data: unknown;
    message: string;
  }> {
    const response = await this.makeRequest<{
      success: boolean;
      data: unknown;
      message: string;
    }>(`/categories/${id}?language=${language}`);
    return {
      success: response.success,
      data: response.data,
      message: response.message,
    };
  }

  async getActiveCategories(language = "ar"): Promise<unknown[]> {
    const response = await this.makeRequest<{ data: unknown[] }>(
      `/categories/active?language=${language}`
    );
    return Array.isArray(response.data) ? response.data : [];
  }

  async createCategory(categoryData: unknown): Promise<unknown> {
    const response = await this.makeAuthenticatedRequest<{ data: unknown }>(
      "/categories",
      {
        method: "POST",
        body: JSON.stringify(categoryData),
      }
    );
    return response.data;
  }

  async updateCategory(id: string, categoryData: unknown): Promise<unknown> {
    const response = await this.makeAuthenticatedRequest<{ data: unknown }>(
      `/categories/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(categoryData),
      }
    );
    return response.data;
  }

  async deleteCategory(id: string): Promise<void> {
    await this.makeAuthenticatedRequest(`/categories/${id}`, {
      method: "DELETE",
    });
  }

  async toggleCategoryStatus(id: string): Promise<unknown> {
    const response = await this.makeAuthenticatedRequest<{ data: unknown }>(
      `/categories/${id}/toggle`,
      {
        method: "PATCH",
      }
    );
    return response.data;
  }

  async reorderCategories(
    categoryOrders: Array<{ categoryId: string; sortOrder: number }>
  ): Promise<void> {
    await this.makeAuthenticatedRequest("/categories/reorder", {
      method: "PATCH",
      body: JSON.stringify({ categoryOrders }),
    });
  }

  async searchCategories(
    query: string,
    language = "ar",
    limit = 10,
    page = 1
  ): Promise<unknown[]> {
    const response = await this.makeRequest<{ data: unknown[] }>(
      `/categories/search?q=${encodeURIComponent(
        query
      )}&language=${language}&limit=${limit}&page=${page}`
    );
    return Array.isArray(response.data) ? response.data : [];
  }

  async uploadCategoryImage(
    file: File
  ): Promise<{ imageUrl: string; publicId: string }> {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`${API_BASE_URL}/categories/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.getAccessToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "فشل في رفع الصورة");
    }

    const result = await response.json();
    return {
      imageUrl: result.data.imageUrl,
      publicId: result.data.publicId,
    };
  }

  async createCategoryWithImage(
    categoryData: unknown,
    file: File
  ): Promise<unknown> {
    const formData = new FormData();
    formData.append("image", file);

    // إضافة بيانات الفئة كـ JSON string
    Object.entries(categoryData as Record<string, unknown>).forEach(
      ([key, value]) => {
        formData.append(key, String(value));
      }
    );

    const response = await fetch(
      `${API_BASE_URL}/categories/create-with-image`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.getAccessToken()}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "فشل في إنشاء الفئة");
    }

    const result = await response.json();
    return result.data;
  }
}

export const apiService = new ApiService();
export type { AdminLoginRequest, AdminLoginResponse, AdminProfile };
