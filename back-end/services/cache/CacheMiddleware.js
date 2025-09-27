// services/cache/CacheMiddleware.js
// Middleware للكاش التلقائي

import cacheLayer from "./CacheLayer.js";

/**
 * Cache Middleware - Middleware للكاش التلقائي
 * يطبق الكاش تلقائياً على المسارات المحددة
 */
class CacheMiddleware {
  constructor() {
    this.middlewares = new Map();
  }

  /**
   * إنشاء middleware للكاش
   * @param {string} strategyName - اسم استراتيجية الكاش
   * @param {Object} options - خيارات الكاش
   * @returns {Function} - Express middleware
   */
  create(strategyName, options = {}) {
    const config = cacheLayer.getStrategyConfig(strategyName);
    const middlewareOptions = {
      ...config,
      ...options,
    };

    return async (req, res, next) => {
      try {
        // إنشاء معاملات المفتاح من req
        const params = this.extractParams(req, middlewareOptions);

        // تخطي الكاش إذا كان مطلوباً
        if (req.query.skipCache === "true" || req.headers["x-skip-cache"]) {
          req.cacheParams = params;
          req.cacheStrategy = strategyName;
          return next();
        }

        // محاولة الحصول من الكاش
        const cached = await cacheLayer.get(
          strategyName,
          req.method.toLowerCase(),
          params,
          middlewareOptions
        );

        if (cached !== null) {
          // إرجاع البيانات من الكاش
          return res.json({
            success: true,
            ...cached,
            cached: true,
            cacheStrategy: strategyName,
            cacheKey: cacheLayer.buildKey(
              strategyName,
              req.method.toLowerCase(),
              params
            ),
          });
        }

        // Cache MISS - المتابعة للـ controller
        req.cacheParams = params;
        req.cacheStrategy = strategyName;
        req.cacheOptions = middlewareOptions;

        // إضافة دالة لحفظ النتيجة في الكاش
        req.cacheResult = async (data) => {
          try {
            await cacheLayer.set(
              strategyName,
              req.method.toLowerCase(),
              data,
              params,
              middlewareOptions
            );
          } catch (error) {
            console.error("Error caching result:", error.message);
          }
        };

        next();
      } catch (error) {
        console.error("Cache middleware error:", error.message);
        // في حالة الخطأ، المتابعة بدون كاش
        req.cacheParams = {};
        req.cacheStrategy = strategyName;
        next();
      }
    };
  }

  /**
   * استخراج المعاملات من الطلب
   * @param {Object} req - Express request object
   * @param {Object} options - خيارات الكاش
   * @returns {Object} - المعاملات المستخرجة
   */
  extractParams(req, options = {}) {
    const params = {};
    const { keyParams = [] } = options;

    // استخراج من params
    keyParams.forEach((paramName) => {
      if (req.params[paramName]) {
        params[paramName] = req.params[paramName];
      }
    });

    // استخراج من query
    Object.keys(req.query).forEach((key) => {
      if (req.query[key] !== undefined) {
        params[key] = req.query[key];
      }
    });

    // استخراج من body (للمسارات POST/PUT)
    if (["POST", "PUT", "PATCH"].includes(req.method)) {
      const { bodyParams = [] } = options;
      bodyParams.forEach((paramName) => {
        if (req.body[paramName] !== undefined) {
          params[paramName] = req.body[paramName];
        }
      });
    }

    // إضافة معلومات إضافية
    if (req.user) {
      params.userId = req.user.userId || req.user._id;
    }

    return params;
  }

  /**
   * إنشاء middleware للكاش مع معاملات مخصصة
   * @param {string} strategyName - اسم استراتيجية الكاش
   * @param {Array} keyParams - معاملات المفتاح
   * @param {Object} options - خيارات إضافية
   * @returns {Function} - Express middleware
   */
  createWithParams(strategyName, keyParams = [], options = {}) {
    return this.create(strategyName, {
      ...options,
      keyParams,
    });
  }

  /**
   * إنشاء middleware للكاش المشروط
   * @param {string} strategyName - اسم استراتيجية الكاش
   * @param {Function} condition - دالة الشرط
   * @param {Object} options - خيارات الكاش
   * @returns {Function} - Express middleware
   */
  createConditional(strategyName, condition, options = {}) {
    return async (req, res, next) => {
      try {
        // التحقق من الشرط
        if (!condition(req)) {
          req.cacheParams = {};
          req.cacheStrategy = strategyName;
          return next();
        }

        // تطبيق middleware الكاش العادي
        const cacheMiddleware = this.create(strategyName, options);
        return cacheMiddleware(req, res, next);
      } catch (error) {
        console.error("Conditional cache middleware error:", error.message);
        next();
      }
    };
  }

  /**
   * إنشاء middleware للكاش مع TTL ديناميكي
   * @param {string} strategyName - اسم استراتيجية الكاش
   * @param {Function} ttlFunction - دالة حساب TTL
   * @param {Object} options - خيارات الكاش
   * @returns {Function} - Express middleware
   */
  createWithDynamicTTL(strategyName, ttlFunction, options = {}) {
    return async (req, res, next) => {
      try {
        const params = this.extractParams(req, options);
        const dynamicTTL = ttlFunction(req, params);

        const config = cacheLayer.getStrategyConfig(strategyName);
        const middlewareOptions = {
          ...config,
          ...options,
          ttl: dynamicTTL,
        };

        // محاولة الحصول من الكاش
        const cached = await cacheLayer.get(
          strategyName,
          req.method.toLowerCase(),
          params,
          middlewareOptions
        );

        if (cached !== null) {
          return res.json({
            success: true,
            ...cached,
            cached: true,
            cacheStrategy: strategyName,
            ttl: dynamicTTL,
          });
        }

        // Cache MISS
        req.cacheParams = params;
        req.cacheStrategy = strategyName;
        req.cacheOptions = middlewareOptions;

        req.cacheResult = async (data) => {
          try {
            await cacheLayer.set(
              strategyName,
              req.method.toLowerCase(),
              data,
              params,
              middlewareOptions
            );
          } catch (error) {
            console.error("Error caching result:", error.message);
          }
        };

        next();
      } catch (error) {
        console.error("Dynamic TTL cache middleware error:", error.message);
        next();
      }
    };
  }

  /**
   * تسجيل middleware مخصص
   * @param {string} name - اسم الـ middleware
   * @param {Function} middleware - الـ middleware
   */
  register(name, middleware) {
    this.middlewares.set(name, middleware);
  }

  /**
   * الحصول على middleware مسجل
   * @param {string} name - اسم الـ middleware
   * @returns {Function} - الـ middleware
   */
  get(name) {
    return this.middlewares.get(name);
  }

  /**
   * الحصول على جميع الـ middlewares المسجلة
   * @returns {Object} - جميع الـ middlewares
   */
  getAll() {
    return Object.fromEntries(this.middlewares);
  }
}

// إنشاء instance واحد للاستخدام عبر التطبيق
const cacheMiddleware = new CacheMiddleware();

export default cacheMiddleware;
