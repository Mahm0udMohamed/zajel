// config/cacheConfig.js
// إعدادات الكاش الموحدة للتطبيق

/**
 * إعدادات الكاش الموحدة
 * تحدد استراتيجيات الكاش المختلفة حسب نوع البيانات
 */
export const CACHE_CONFIG = {
  // إعدادات عامة
  default: {
    ttl: 3600, // ساعة واحدة
    compression: true,
    invalidationStrategy: "immediate",
    retryAttempts: 3,
    retryDelay: 1000,
  },

  // استراتيجيات محددة حسب نوع البيانات
  strategies: {
    // بيانات المستخدمين
    "user-tokens": {
      ttl: 30 * 24 * 60 * 60, // 30 يوم
      compression: false,
      invalidationStrategy: "immediate",
      keyPattern: "user:token:{userId}",
      description: "توكنات المستخدمين (refresh tokens)",
    },

    "user-data": {
      ttl: 1800, // 30 دقيقة
      compression: true,
      invalidationStrategy: "lazy",
      keyPattern: "user:data:{userId}",
      description: "بيانات المستخدمين (الملف الشخصي، الإعدادات)",
    },

    "user-sessions": {
      ttl: 24 * 60 * 60, // 24 ساعة
      compression: false,
      invalidationStrategy: "immediate",
      keyPattern: "user:session:{sessionId}",
      description: "جلسات المستخدمين",
    },

    // مناسبات الهيرو
    "hero-occasions": {
      ttl: 3600, // ساعة واحدة
      compression: true,
      invalidationStrategy: "immediate",
      keyPattern: "hero-occasions:{operation}:{params}",
      description: "مناسبات الهيرو (قوائم، تفاصيل، بحث)",
    },

    "hero-occasions-active": {
      ttl: 2 * 60 * 60, // ساعتان
      compression: true,
      invalidationStrategy: "immediate",
      keyPattern: "hero-occasions:active:{limit}",
      description: "المناسبات النشطة",
    },

    "hero-occasions-upcoming": {
      ttl: 4 * 60 * 60, // 4 ساعات
      compression: true,
      invalidationStrategy: "immediate",
      keyPattern: "hero-occasions:upcoming:{limit}",
      description: "المناسبات القادمة",
    },

    // بيانات المنتجات (للمستقبل)
    products: {
      ttl: 1800, // 30 دقيقة
      compression: true,
      invalidationStrategy: "lazy",
      keyPattern: "products:{operation}:{params}",
      description: "بيانات المنتجات",
    },

    // بيانات الطلبات (للمستقبل)
    orders: {
      ttl: 900, // 15 دقيقة
      compression: true,
      invalidationStrategy: "immediate",
      keyPattern: "orders:{operation}:{params}",
      description: "بيانات الطلبات",
    },

    // بيانات السلة (للمستقبل)
    cart: {
      ttl: 1800, // 30 دقيقة
      compression: false,
      invalidationStrategy: "immediate",
      keyPattern: "cart:{userId}",
      description: "سلة التسوق",
    },

    // بيانات المفضلة (للمستقبل)
    favorites: {
      ttl: 1800, // 30 دقيقة
      compression: false,
      invalidationStrategy: "immediate",
      keyPattern: "favorites:{userId}",
      description: "قائمة المفضلة",
    },

    // بيانات الإحصائيات
    analytics: {
      ttl: 300, // 5 دقائق
      compression: true,
      invalidationStrategy: "lazy",
      keyPattern: "analytics:{type}:{params}",
      description: "بيانات الإحصائيات",
    },

    // بيانات التكوين
    config: {
      ttl: 24 * 60 * 60, // 24 ساعة
      compression: false,
      invalidationStrategy: "lazy",
      keyPattern: "config:{key}",
      description: "إعدادات التطبيق",
    },
  },

  // إعدادات Redis
  redis: {
    maxRetries: 3,
    retryDelay: 1000,
    commandTimeout: 10000,
    connectionTimeout: 10000,
    enableOfflineQueue: false,
    keepAlive: 30000,
  },

  // إعدادات المراقبة
  monitoring: {
    enableStats: true,
    enableHealthCheck: false, // تعطيل مراقبة الصحة التلقائية
    statsInterval: 300000, // 5 دقائق
    healthCheckInterval: 300000, // 5 دقائق
  },

  // إعدادات التنظيف
  cleanup: {
    enableAutoCleanup: true,
    cleanupInterval: 60 * 60 * 1000, // ساعة واحدة
    maxAge: 24 * 60 * 60, // 24 ساعة
    dryRun: false,
  },
};

/**
 * الحصول على إعدادات استراتيجية محددة
 * @param {string} strategyName - اسم الاستراتيجية
 * @returns {Object} - إعدادات الاستراتيجية
 */
export const getStrategyConfig = (strategyName) => {
  const strategy = CACHE_CONFIG.strategies[strategyName];
  if (!strategy) {
    console.warn(`Cache strategy '${strategyName}' not found, using default`);
    return { ...CACHE_CONFIG.default, keyPattern: `${strategyName}:{params}` };
  }

  return {
    ...CACHE_CONFIG.default,
    ...strategy,
  };
};

/**
 * الحصول على جميع الاستراتيجيات المسجلة
 * @returns {Object} - جميع الاستراتيجيات
 */
export const getAllStrategies = () => {
  return CACHE_CONFIG.strategies;
};

/**
 * التحقق من صحة إعدادات الكاش
 * @returns {Object} - نتيجة التحقق
 */
export const validateCacheConfig = () => {
  const errors = [];
  const warnings = [];

  // التحقق من الاستراتيجيات
  Object.entries(CACHE_CONFIG.strategies).forEach(([name, config]) => {
    if (!config.ttl || config.ttl <= 0) {
      errors.push(`Strategy '${name}' has invalid TTL: ${config.ttl}`);
    }

    if (!config.keyPattern) {
      warnings.push(`Strategy '${name}' missing keyPattern`);
    }

    if (config.ttl > 7 * 24 * 60 * 60) {
      // أكثر من أسبوع
      warnings.push(`Strategy '${name}' has very long TTL: ${config.ttl}s`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};

export default CACHE_CONFIG;
