// services/cache/CacheLayer.js
// الطبقة الرئيسية للكاش الموحد

import cacheService from "../cacheService.js";
import { getStrategyConfig, CACHE_CONFIG } from "../../config/cacheConfig.js";

/**
 * Cache Layer - الطبقة الرئيسية للكاش الموحد
 * توفر واجهة موحدة لجميع عمليات الكاش في التطبيق
 */
class CacheLayer {
  constructor() {
    this.cacheService = cacheService;
    this.strategies = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      errors: 0,
      totalOperations: 0,
      startTime: Date.now(),
    };
    this.healthStatus = "unknown";

    // تسجيل الاستراتيجيات الافتراضية
    this.registerDefaultStrategies();

    // بدء مراقبة الصحة
    this.startHealthMonitoring();
  }

  /**
   * تسجيل الاستراتيجيات الافتراضية
   */
  registerDefaultStrategies() {
    Object.entries(CACHE_CONFIG.strategies).forEach(([name, config]) => {
      this.strategies.set(name, config);
    });
  }

  /**
   * تسجيل استراتيجية جديدة
   * @param {string} name - اسم الاستراتيجية
   * @param {Object} config - إعدادات الاستراتيجية
   */
  registerStrategy(name, config) {
    this.strategies.set(name, {
      ...CACHE_CONFIG.default,
      ...config,
    });
    console.log(`📝 Registered cache strategy: ${name}`);
  }

  /**
   * الحصول على إعدادات استراتيجية
   * @param {string} strategyName - اسم الاستراتيجية
   * @returns {Object} - إعدادات الاستراتيجية
   */
  getStrategyConfig(strategyName) {
    return this.strategies.get(strategyName) || getStrategyConfig(strategyName);
  }

  /**
   * بناء مفتاح الكاش
   * @param {string} strategyName - اسم الاستراتيجية
   * @param {string} operation - العملية
   * @param {Object} params - المعاملات
   * @returns {string} - المفتاح النهائي
   */
  buildKey(strategyName, operation, params = {}) {
    const config = this.getStrategyConfig(strategyName);
    let keyPattern =
      config.keyPattern || `${strategyName}:{operation}:{params}`;

    // استبدال المعاملات في النمط
    keyPattern = keyPattern.replace("{operation}", operation);

    // استبدال المعاملات المحددة
    Object.entries(params).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      if (keyPattern.includes(placeholder)) {
        keyPattern = keyPattern.replace(placeholder, String(value));
      }
    });

    // استبدال {params} بجميع المعاملات
    if (keyPattern.includes("{params}")) {
      const paramString = Object.keys(params)
        .sort()
        .map((key) => `${key}:${params[key]}`)
        .join(":");
      keyPattern = keyPattern.replace("{params}", paramString || "default");
    }

    return keyPattern;
  }

  /**
   * الحصول على قيمة من الكاش
   * @param {string} strategyName - اسم الاستراتيجية
   * @param {string} operation - العملية
   * @param {Object} params - المعاملات
   * @param {Object} options - خيارات إضافية
   * @returns {Promise<any>} - القيمة المحفوظة
   */
  async get(strategyName, operation, params = {}, options = {}) {
    try {
      this.stats.totalOperations++;

      const config = this.getStrategyConfig(strategyName);
      const key = this.buildKey(strategyName, operation, params);

      const result = await this.cacheService.get(key, {
        ...config,
        ...options,
      });

      if (result !== null && result !== undefined) {
        this.stats.hits++;
        console.log(`✅ Cache HIT: ${strategyName}:${operation}`);
        return result;
      } else {
        this.stats.misses++;
        console.log(`🔄 Cache MISS: ${strategyName}:${operation}`);
        return null;
      }
    } catch (error) {
      this.stats.errors++;
      console.error(
        `Cache GET error for ${strategyName}:${operation}:`,
        error.message
      );
      return null;
    }
  }

  /**
   * حفظ قيمة في الكاش
   * @param {string} strategyName - اسم الاستراتيجية
   * @param {string} operation - العملية
   * @param {any} value - القيمة للحفظ
   * @param {Object} params - المعاملات
   * @param {Object} options - خيارات إضافية
   * @returns {Promise<boolean>} - نجح الحفظ أم لا
   */
  async set(strategyName, operation, value, params = {}, options = {}) {
    try {
      this.stats.totalOperations++;

      const config = this.getStrategyConfig(strategyName);
      const key = this.buildKey(strategyName, operation, params);

      const result = await this.cacheService.set(key, value, {
        ...config,
        ...options,
      });

      if (result) {
        console.log(
          `✅ Cached: ${strategyName}:${operation} (TTL: ${config.ttl}s)`
        );
      }

      return result;
    } catch (error) {
      this.stats.errors++;
      console.error(
        `Cache SET error for ${strategyName}:${operation}:`,
        error.message
      );
      return false;
    }
  }

  /**
   * حذف قيمة من الكاش
   * @param {string} strategyName - اسم الاستراتيجية
   * @param {string} operation - العملية
   * @param {Object} params - المعاملات
   * @param {Object} options - خيارات إضافية
   * @returns {Promise<boolean>} - نجح الحذف أم لا
   */
  async del(strategyName, operation, params = {}, options = {}) {
    try {
      this.stats.totalOperations++;

      const key = this.buildKey(strategyName, operation, params);
      const result = await this.cacheService.del(key, options);

      if (result) {
        console.log(`🗑️ Deleted: ${strategyName}:${operation}`);
      }

      return result;
    } catch (error) {
      this.stats.errors++;
      console.error(
        `Cache DEL error for ${strategyName}:${operation}:`,
        error.message
      );
      return false;
    }
  }

  /**
   * مسح الكاش حسب النمط
   * @param {string} strategyName - اسم الاستراتيجية
   * @param {string} pattern - النمط (اختياري)
   * @param {Object} options - خيارات إضافية
   * @returns {Promise<number>} - عدد المفاتيح المحذوفة
   */
  async clear(strategyName, pattern = "*", options = {}) {
    try {
      const config = this.getStrategyConfig(strategyName);
      const keyPattern = config.keyPattern || `${strategyName}:*`;
      const fullPattern =
        pattern === "*" ? keyPattern : `${strategyName}:${pattern}`;

      // مسح باستخدام النمط
      const result = await this.cacheService.clearPattern(fullPattern);

      // مسح إضافي لجميع المفاتيح التي تحتوي على اسم الاستراتيجية
      if (pattern === "*") {
        const additionalKeys = await this.cacheService.getKeys(
          `*${strategyName}*`
        );
        if (additionalKeys.length > 0) {
          for (const key of additionalKeys) {
            await this.cacheService.del(key);
          }
          console.log(
            `🧹 Cleared ${additionalKeys.length} additional keys for ${strategyName}`
          );
        }
      }

      console.log(`🧹 Cleared ${result} keys for strategy: ${strategyName}`);
      return result;
    } catch (error) {
      this.stats.errors++;
      console.error(`Cache CLEAR error for ${strategyName}:`, error.message);
      return 0;
    }
  }

  /**
   * مسح الكاش حسب المعاملات
   * @param {string} strategyName - اسم الاستراتيجية
   * @param {string} operation - العملية
   * @param {Object} params - المعاملات
   * @param {Object} options - خيارات إضافية
   * @returns {Promise<boolean>} - نجح المسح أم لا
   */
  async invalidate(strategyName, operation, params = {}, options = {}) {
    const config = this.getStrategyConfig(strategyName);

    switch (config.invalidationStrategy) {
      case "immediate":
        return await this.del(strategyName, operation, params, options);

      case "lazy":
        // وضع علامة للتنظيف لاحقاً
        console.log(
          `🕐 Lazy invalidation scheduled for ${strategyName}:${operation}`
        );
        return true;

      case "pattern":
        const pattern = options.pattern || "*";
        return await this.clear(strategyName, pattern, options);

      default:
        return await this.del(strategyName, operation, params, options);
    }
  }

  /**
   * الحصول على إحصائيات الكاش
   * @returns {Object} - إحصائيات مفصلة
   */
  getStats() {
    const uptime = Date.now() - this.stats.startTime;
    const hitRate =
      this.stats.totalOperations > 0
        ? ((this.stats.hits / this.stats.totalOperations) * 100).toFixed(2)
        : 0;

    return {
      ...this.stats,
      uptime,
      hitRate: `${hitRate}%`,
      strategies: Array.from(this.strategies.keys()),
      health: this.healthStatus,
    };
  }

  /**
   * فحص صحة الكاش
   * @returns {Promise<Object>} - حالة الصحة
   */
  async getHealth() {
    try {
      const isReady = this.cacheService.isReady();
      const testResult = await this.cacheService.testConnection(true); // وضع صامت

      this.healthStatus = isReady && testResult ? "healthy" : "unhealthy";

      return {
        status: this.healthStatus,
        redis: {
          ready: isReady,
          connected: testResult,
        },
        stats: this.getStats(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.healthStatus = "error";
      return {
        status: "error",
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * بدء مراقبة الصحة
   */
  startHealthMonitoring() {
    if (!CACHE_CONFIG.monitoring.enableHealthCheck) return;

    setInterval(async () => {
      try {
        // مراقبة صامتة - بدون رسائل console
        const health = await this.getHealth();
        if (health.status === "unhealthy") {
          console.warn("⚠️ Cache health check failed:", health);
        }
      } catch (error) {
        console.error("❌ Health monitoring error:", error.message);
      }
    }, CACHE_CONFIG.monitoring.healthCheckInterval);
  }

  /**
   * إعادة تعيين الإحصائيات
   */
  resetStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      errors: 0,
      totalOperations: 0,
      startTime: Date.now(),
    };
    console.log("📊 Cache stats reset");
  }

  /**
   * تنظيف الكاش القديم
   * @param {Object} options - خيارات التنظيف
   * @returns {Promise<Object>} - نتيجة التنظيف
   */
  async cleanup(options = {}) {
    const {
      maxAge = CACHE_CONFIG.cleanup.maxAge,
      dryRun = CACHE_CONFIG.cleanup.dryRun,
      strategies = Array.from(this.strategies.keys()),
    } = options;

    const results = {
      cleaned: 0,
      errors: 0,
      strategies: {},
    };

    for (const strategyName of strategies) {
      try {
        const result = await this.clear(strategyName, "*", { maxAge, dryRun });
        results.strategies[strategyName] = result;
        results.cleaned += result;
      } catch (error) {
        results.errors++;
        results.strategies[strategyName] = { error: error.message };
      }
    }

    console.log(`🧹 Cache cleanup completed:`, results);
    return results;
  }
}

// إنشاء instance واحد للاستخدام عبر التطبيق
const cacheLayer = new CacheLayer();

export default cacheLayer;
