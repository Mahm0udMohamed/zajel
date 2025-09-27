// examples/cacheUsageExamples.js
// أمثلة شاملة لاستخدام Cache Service الموحد في controllers مختلفة

import cacheManager from "../services/cacheManager.js";
import {
  cacheable,
  cacheInvalidate,
  cacheWhen,
  cacheWithDynamicTTL,
  cacheWithCompression,
} from "../decorators/cacheDecorators.js";

// ===== مثال 1: User Controller مع Cache =====

// تسجيل namespace للمستخدمين
cacheManager.registerNamespace("users", {
  ttl: 1800, // 30 دقيقة
  compression: true,
  invalidationStrategy: "immediate",
  keyPrefix: "users",
});

// تسجيل controller
cacheManager.registerController("userController", {
  namespace: "users",
  ttl: 1800,
  compression: true,
  invalidationStrategy: "immediate",
  keyPatterns: {
    profile: "profile:{userId}",
    list: "list:{page}:{limit}:{search}",
    stats: "stats:{userId}",
    favorites: "favorites:{userId}",
  },
});

class UserController {
  // مثال 1: كاش بسيط
  async getUserProfile(userId) {
    // محاولة الحصول من الكاش
    const cached = await cacheManager.get("users", "profile", { userId });

    if (cached) {
      console.log(`✅ Cache HIT: user profile ${userId}`);
      return cached;
    }

    // Cache MISS - الحصول من قاعدة البيانات
    console.log(`🔄 Cache MISS: user profile ${userId}`);
    const user = await this.fetchUserFromDB(userId);

    // حفظ في الكاش
    if (user) {
      await cacheManager.set(
        "users",
        "profile",
        user,
        { userId },
        {
          ttl: 1800, // 30 دقيقة
        }
      );
    }

    return user;
  }

  // مثال 2: كاش مع معاملات متعددة
  async getUsersList(page = 1, limit = 10, search = "") {
    const cacheKey = `list:${page}:${limit}:${search}`;

    // محاولة الحصول من الكاش
    const cached = await cacheManager.get("users", "list", {
      page,
      limit,
      search,
    });

    if (cached) {
      return cached;
    }

    // Cache MISS
    const users = await this.fetchUsersFromDB(page, limit, search);
    const total = await this.countUsersFromDB(search);

    const result = {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    // حفظ في الكاش
    await cacheManager.set(
      "users",
      "list",
      result,
      { page, limit, search },
      {
        ttl: 900, // 15 دقيقة
      }
    );

    return result;
  }

  // مثال 3: كاش مع TTL ديناميكي
  async getUserStats(userId) {
    const user = await this.getUserProfile(userId);

    // TTL يعتمد على نوع المستخدم
    const ttl = user.isPremium ? 3600 : 1800; // Premium users: 1 hour, Regular: 30 min

    const cached = await cacheManager.get("users", "stats", { userId });

    if (cached) {
      return cached;
    }

    const stats = await this.calculateUserStats(userId);

    await cacheManager.set("users", "stats", stats, { userId }, { ttl });

    return stats;
  }

  // مثال 4: مسح الكاش عند التحديث
  async updateUserProfile(userId, updateData) {
    // تحديث في قاعدة البيانات
    const updatedUser = await this.updateUserInDB(userId, updateData);

    // مسح الكاش المتعلق بهذا المستخدم
    await cacheManager.invalidate("users", "selective", {
      operations: ["profile", "stats"],
      params: { userId },
    });

    // مسح قائمة المستخدمين أيضاً
    await cacheManager.clearNamespace("users", "list:*");

    return updatedUser;
  }

  // مثال 5: مسح الكاش عند الحذف
  async deleteUser(userId) {
    // حذف من قاعدة البيانات
    await this.deleteUserFromDB(userId);

    // مسح جميع الكاش المتعلق بهذا المستخدم
    await cacheManager.invalidate("users", "pattern", {
      pattern: `*:${userId}`,
    });

    return { success: true };
  }

  // Helper methods (مثال)
  async fetchUserFromDB(userId) {
    // محاكاة استعلام قاعدة البيانات
    return { id: userId, name: "User Name", email: "user@example.com" };
  }

  async fetchUsersFromDB(page, limit, search) {
    // محاكاة استعلام قاعدة البيانات
    return [];
  }

  async countUsersFromDB(search) {
    // محاكاة عد المستخدمين
    return 0;
  }

  async calculateUserStats(userId) {
    // محاكاة حساب الإحصائيات
    return { totalOrders: 10, totalSpent: 1000 };
  }

  async updateUserInDB(userId, updateData) {
    // محاكاة تحديث المستخدم
    return { id: userId, ...updateData };
  }

  async deleteUserFromDB(userId) {
    // محاكاة حذف المستخدم
    return true;
  }
}

// ===== مثال 2: Product Controller مع Decorators =====

// تسجيل namespace للمنتجات
cacheManager.registerNamespace("products", {
  ttl: 3600, // ساعة واحدة
  compression: true,
  invalidationStrategy: "immediate",
  keyPrefix: "products",
});

class ProductController {
  // استخدام decorator للكاش التلقائي
  @cacheable({
    namespace: "products",
    operation: "single",
    ttl: 3600,
    keyParams: ["productId"],
  })
  async getProduct(productId) {
    // هذه الدالة ستطبق الكاش تلقائياً
    return await this.fetchProductFromDB(productId);
  }

  // استخدام decorator للكاش المشروط
  @cacheWhen((productId) => productId && productId.length > 0, {
    namespace: "products",
    operation: "details",
    ttl: 1800,
    keyParams: ["productId"],
  })
  async getProductDetails(productId) {
    return await this.fetchProductDetailsFromDB(productId);
  }

  // استخدام decorator مع TTL ديناميكي
  @cacheWithDynamicTTL(
    (productId, categoryId) => {
      // TTL يعتمد على فئة المنتج
      const categoryTTL = {
        electronics: 7200, // 2 hours
        clothing: 3600, // 1 hour
        books: 1800, // 30 minutes
      };
      return categoryTTL[categoryId] || 3600;
    },
    {
      namespace: "products",
      operation: "byCategory",
      keyParams: ["productId", "categoryId"],
    }
  )
  async getProductByCategory(productId, categoryId) {
    return await this.fetchProductByCategoryFromDB(productId, categoryId);
  }

  // استخدام decorator مع الضغط
  @cacheWithCompression({
    namespace: "products",
    operation: "list",
    ttl: 1800,
    keyParams: ["page", "limit", "category"],
    compressionThreshold: 2048,
  })
  async getProductsList(page, limit, category) {
    return await this.fetchProductsListFromDB(page, limit, category);
  }

  // استخدام decorator لمسح الكاش
  @cacheInvalidate({
    namespace: "products",
    strategy: "immediate",
  })
  async createProduct(productData) {
    const newProduct = await this.createProductInDB(productData);

    // سيتم مسح الكاش تلقائياً بعد التنفيذ
    return newProduct;
  }

  // استخدام decorator لمسح الكاش مع نمط محدد
  @cacheInvalidate({
    namespace: "products",
    strategy: "pattern",
    pattern: "list:*",
  })
  async updateProduct(productId, updateData) {
    const updatedProduct = await this.updateProductInDB(productId, updateData);

    // سيتم مسح كاش القوائم فقط
    return updatedProduct;
  }

  // Helper methods
  async fetchProductFromDB(productId) {
    return { id: productId, name: "Product Name", price: 100 };
  }

  async fetchProductDetailsFromDB(productId) {
    return { id: productId, details: "Product Details" };
  }

  async fetchProductByCategoryFromDB(productId, categoryId) {
    return { id: productId, categoryId, name: "Product Name" };
  }

  async fetchProductsListFromDB(page, limit, category) {
    return { products: [], pagination: { page, limit, total: 0 } };
  }

  async createProductInDB(productData) {
    return { id: "new-product-id", ...productData };
  }

  async updateProductInDB(productId, updateData) {
    return { id: productId, ...updateData };
  }
}

// ===== مثال 3: Order Controller مع Cache متقدم =====

// تسجيل namespace للطلبات
cacheManager.registerNamespace("orders", {
  ttl: 900, // 15 دقيقة
  compression: true,
  invalidationStrategy: "immediate",
  keyPrefix: "orders",
});

class OrderController {
  // كاش مع invalidation ذكي
  async getOrderHistory(userId, page = 1, limit = 10) {
    const cacheKey = `history:${userId}:${page}:${limit}`;

    const cached = await cacheManager.get("orders", "history", {
      userId,
      page,
      limit,
    });

    if (cached) {
      return cached;
    }

    const orders = await this.fetchOrderHistoryFromDB(userId, page, limit);

    await cacheManager.set(
      "orders",
      "history",
      orders,
      { userId, page, limit },
      {
        ttl: 1800, // 30 دقيقة
      }
    );

    return orders;
  }

  // كاش مع background refresh
  async getOrderStats(userId) {
    const cached = await cacheManager.get("orders", "stats", { userId });

    if (cached) {
      // التحقق من TTL وإجراء background refresh إذا لزم الأمر
      const ttl = await cacheManager.cacheService.ttl(
        cacheManager.buildKey("orders", "stats", { userId })
      );

      if (ttl < 300) {
        // أقل من 5 دقائق
        // Background refresh
        setImmediate(async () => {
          try {
            const freshStats = await this.calculateOrderStats(userId);
            await cacheManager.set(
              "orders",
              "stats",
              freshStats,
              { userId },
              { ttl: 3600 }
            );
          } catch (error) {
            console.error("Background refresh failed:", error);
          }
        });
      }

      return cached;
    }

    const stats = await this.calculateOrderStats(userId);

    await cacheManager.set("orders", "stats", stats, { userId }, { ttl: 3600 });

    return stats;
  }

  // مسح الكاش عند إنشاء طلب جديد
  async createOrder(userId, orderData) {
    const newOrder = await this.createOrderInDB(userId, orderData);

    // مسح الكاش المتعلق بهذا المستخدم
    await cacheManager.invalidate("orders", "selective", {
      operations: ["history", "stats"],
      params: { userId },
    });

    return newOrder;
  }

  // Helper methods
  async fetchOrderHistoryFromDB(userId, page, limit) {
    return [];
  }

  async calculateOrderStats(userId) {
    return { totalOrders: 5, totalAmount: 500 };
  }

  async createOrderInDB(userId, orderData) {
    return { id: "new-order-id", userId, ...orderData };
  }
}

// ===== مثال 4: Cache Management Utilities =====

class CacheManagementController {
  // الحصول على إحصائيات شاملة
  async getComprehensiveStats() {
    const stats = await cacheManager.getAllStats();

    return {
      success: true,
      data: {
        ...stats,
        recommendations: this.generateCacheRecommendations(stats),
      },
    };
  }

  // تنظيف الكاش القديم
  async cleanupOldCache() {
    const result = await cacheManager.cleanup({
      maxAge: 24 * 60 * 60, // 24 ساعة
      dryRun: false,
      namespaces: ["users", "products", "orders"],
    });

    return {
      success: true,
      message: `تم تنظيف ${result.cleaned} مفتاح من الكاش`,
      details: result,
    };
  }

  // مسح كاش namespace محدد
  async clearNamespaceCache(namespace) {
    const result = await cacheManager.clearNamespace(namespace);

    return {
      success: true,
      message: `تم مسح ${result} مفتاح من namespace: ${namespace}`,
      deletedKeys: result,
    };
  }

  // إعادة تعيين الإحصائيات
  async resetCacheStats() {
    cacheManager.resetAllStats();

    return {
      success: true,
      message: "تم إعادة تعيين إحصائيات الكاش",
    };
  }

  // توليد توصيات للكاش
  generateCacheRecommendations(stats) {
    const recommendations = [];

    // تحليل hit rate
    const globalHitRate = parseFloat(stats.global.hitRate);

    if (globalHitRate < 70) {
      recommendations.push({
        type: "warning",
        message: `Hit rate منخفض (${globalHitRate}%). يوصى بزيادة TTL أو تحسين cache keys.`,
      });
    }

    if (globalHitRate > 95) {
      recommendations.push({
        type: "info",
        message: `Hit rate ممتاز (${globalHitRate}%). الكاش يعمل بكفاءة عالية.`,
      });
    }

    // تحليل عدد المفاتيح
    Object.entries(stats.namespaces).forEach(([namespace, nsStats]) => {
      if (nsStats.keyCount > 1000) {
        recommendations.push({
          type: "warning",
          message: `Namespace ${namespace} يحتوي على ${nsStats.keyCount} مفتاح. يوصى بتنظيف دوري.`,
        });
      }
    });

    return recommendations;
  }
}

// ===== مثال 5: Cache Middleware =====

export const cacheMiddleware = (options = {}) => {
  const {
    namespace = "default",
    operation = "default",
    ttl = 3600,
    keyParams = [],
    skipCache = false,
  } = options;

  return async (req, res, next) => {
    // إنشاء معاملات المفتاح من req
    const params = {};
    keyParams.forEach((paramName) => {
      if (req.params[paramName]) {
        params[paramName] = req.params[paramName];
      } else if (req.query[paramName]) {
        params[paramName] = req.query[paramName];
      }
    });

    if (skipCache) {
      return next();
    }

    try {
      // محاولة الحصول من الكاش
      const cached = await cacheManager.get(namespace, operation, params);

      if (cached) {
        console.log(`✅ Cache HIT: ${namespace}:${operation}`);
        return res.json({
          success: true,
          ...cached,
          cached: true,
        });
      }

      // Cache MISS - المتابعة للـ controller
      req.cacheParams = params;
      req.cacheNamespace = namespace;
      req.cacheOperation = operation;
      req.cacheTTL = ttl;

      next();
    } catch (error) {
      console.error("Cache middleware error:", error);
      next();
    }
  };
};

// ===== تصدير الأمثلة =====
export {
  UserController,
  ProductController,
  OrderController,
  CacheManagementController,
  cacheMiddleware,
};
