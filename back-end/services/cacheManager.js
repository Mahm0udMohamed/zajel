// services/cacheManager.js
import cacheService from "./cacheService.js";

/**
 * Cache Manager - مدير الكاش المتقدم
 * يوفر طبقة إضافية لإدارة الكاش بطريقة منظمة ومتقدمة
 */
class CacheManager {
  constructor() {
    this.cacheService = cacheService;
    this.namespaces = new Map();
    this.defaultConfigs = new Map();
  }

  /**
   * تسجيل namespace جديد
   * @param {string} name - اسم الـ namespace
   * @param {Object} config - إعدادات الـ namespace
   */
  registerNamespace(name, config = {}) {
    const defaultConfig = {
      ttl: 3600, // ساعة واحدة
      compression: true,
      invalidationStrategy: "immediate", // immediate, lazy, scheduled
      keyPrefix: name,
      ...config,
    };

    this.namespaces.set(name, defaultConfig);
    console.log(`📝 Registered namespace: ${name}`, defaultConfig);
  }

  /**
   * تسجيل إعدادات افتراضية لـ controller
   * @param {string} controllerName - اسم الـ controller
   * @param {Object} config - الإعدادات
   */
  registerController(controllerName, config = {}) {
    const defaultConfig = {
      namespace: controllerName,
      ttl: 1800, // 30 دقيقة
      compression: true,
      invalidationStrategy: "immediate",
      keyPatterns: {},
      ...config,
    };

    this.defaultConfigs.set(controllerName, defaultConfig);
    console.log(`🎛️ Registered controller: ${controllerName}`, defaultConfig);
  }

  /**
   * إنشاء مفتاح كاش منظم
   * @param {string} namespace - الـ namespace
   * @param {string} operation - العملية
   * @param {Object} params - المعاملات
   * @returns {string} - المفتاح النهائي
   */
  buildKey(namespace, operation, params = {}) {
    const config = this.namespaces.get(namespace);
    const prefix = config?.keyPrefix || namespace;

    // تحويل المعاملات إلى string منظم
    const paramString = Object.keys(params)
      .sort()
      .map((key) => `${key}:${params[key]}`)
      .join(":");

    return paramString
      ? `${prefix}:${operation}:${paramString}`
      : `${prefix}:${operation}`;
  }

  /**
   * الحصول على إعدادات namespace
   * @param {string} namespace - اسم الـ namespace
   * @returns {Object} - الإعدادات
   */
  getNamespaceConfig(namespace) {
    return this.namespaces.get(namespace) || {};
  }

  /**
   * الحصول على إعدادات controller
   * @param {string} controllerName - اسم الـ controller
   * @returns {Object} - الإعدادات
   */
  getControllerConfig(controllerName) {
    return this.defaultConfigs.get(controllerName) || {};
  }

  /**
   * Cache Get مع إعدادات namespace
   * @param {string} namespace - الـ namespace
   * @param {string} operation - العملية
   * @param {Object} params - المعاملات
   * @param {Object} options - خيارات إضافية
   * @returns {Promise<any>} - القيمة المحفوظة
   */
  async get(namespace, operation, params = {}, options = {}) {
    const key = this.buildKey(namespace, operation, params);
    const config = this.getNamespaceConfig(namespace);

    return await this.cacheService.get(key, {
      namespace: null, // المفتاح يحتوي على namespace بالفعل
      ...config,
      ...options,
    });
  }

  /**
   * Cache Set مع إعدادات namespace
   * @param {string} namespace - الـ namespace
   * @param {string} operation - العملية
   * @param {any} value - القيمة للحفظ
   * @param {Object} params - المعاملات
   * @param {Object} options - خيارات إضافية
   * @returns {Promise<boolean>} - نجح الحفظ أم لا
   */
  async set(namespace, operation, value, params = {}, options = {}) {
    const key = this.buildKey(namespace, operation, params);
    const config = this.getNamespaceConfig(namespace);

    return await this.cacheService.set(key, value, {
      namespace: null, // المفتاح يحتوي على namespace بالفعل
      ...config,
      ...options,
    });
  }

  /**
   * Cache Delete مع إعدادات namespace
   * @param {string} namespace - الـ namespace
   * @param {string} operation - العملية
   * @param {Object} params - المعاملات
   * @param {Object} options - خيارات إضافية
   * @returns {Promise<boolean>} - نجح الحذف أم لا
   */
  async del(namespace, operation, params = {}, options = {}) {
    const key = this.buildKey(namespace, operation, params);
    const config = this.getNamespaceConfig(namespace);

    return await this.cacheService.del(key, {
      namespace: null, // المفتاح يحتوي على namespace بالفعل
      ...config,
      ...options,
    });
  }

  /**
   * مسح جميع مفاتيح namespace
   * @param {string} namespace - الـ namespace
   * @param {string} pattern - النمط (اختياري)
   * @returns {Promise<number>} - عدد المفاتيح المحذوفة
   */
  async clearNamespace(namespace, pattern = "*") {
    const config = this.getNamespaceConfig(namespace);
    const prefix = config?.keyPrefix || namespace;
    const fullPattern = `${prefix}:${pattern}`;

    return await this.cacheService.clearPattern(fullPattern);
  }

  /**
   * مسح مفاتيح controller
   * @param {string} controllerName - اسم الـ controller
   * @param {string} pattern - النمط (اختياري)
   * @returns {Promise<number>} - عدد المفاتيح المحذوفة
   */
  async clearController(controllerName, pattern = "*") {
    const config = this.getControllerConfig(controllerName);
    const namespace = config.namespace || controllerName;

    return await this.clearNamespace(namespace, pattern);
  }

  /**
   * Cache Invalidation ذكي
   * @param {string} namespace - الـ namespace
   * @param {string} strategy - استراتيجية المسح
   * @param {Object} options - خيارات إضافية
   * @returns {Promise<number>} - عدد المفاتيح المحذوفة
   */
  async invalidate(namespace, strategy = "immediate", options = {}) {
    const config = this.getNamespaceConfig(namespace);
    const invalidationStrategy =
      options.strategy || config.invalidationStrategy || strategy;

    switch (invalidationStrategy) {
      case "immediate":
        return await this.clearNamespace(namespace);

      case "pattern":
        const pattern = options.pattern || "*";
        return await this.clearNamespace(namespace, pattern);

      case "selective":
        const operations = options.operations || [];
        let deletedCount = 0;

        for (const operation of operations) {
          const result = await this.del(
            namespace,
            operation,
            options.params || {}
          );
          if (result) deletedCount++;
        }

        return deletedCount;

      case "lazy":
        // وضع علامة للتنظيف لاحقاً
        console.log(
          `🕐 Lazy invalidation scheduled for namespace: ${namespace}`
        );
        return 0;

      default:
        return await this.clearNamespace(namespace);
    }
  }

  /**
   * الحصول على إحصائيات namespace
   * @param {string} namespace - الـ namespace
   * @returns {Promise<Object>} - إحصائيات مفصلة
   */
  async getNamespaceStats(namespace) {
    const config = this.getNamespaceConfig(namespace);
    const prefix = config?.keyPrefix || namespace;
    const keys = await this.cacheService.getKeys(`${prefix}:*`);

    const stats = this.cacheService.getStats();

    return {
      namespace,
      keyCount: keys.length,
      keys: keys.slice(0, 10), // أول 10 مفاتيح فقط
      totalKeys: keys.length,
      ...stats,
    };
  }

  /**
   * الحصول على إحصائيات جميع namespaces
   * @returns {Promise<Object>} - إحصائيات شاملة
   */
  async getAllStats() {
    const allStats = {};
    const globalStats = this.cacheService.getStats();

    for (const [namespace] of this.namespaces) {
      allStats[namespace] = await this.getNamespaceStats(namespace);
    }

    return {
      global: globalStats,
      namespaces: allStats,
      totalNamespaces: this.namespaces.size,
      totalControllers: this.defaultConfigs.size,
    };
  }

  /**
   * تنظيف الكاش القديم
   * @param {Object} options - خيارات التنظيف
   * @returns {Promise<Object>} - نتيجة التنظيف
   */
  async cleanup(options = {}) {
    const {
      maxAge = 24 * 60 * 60, // 24 ساعة
      dryRun = false,
      namespaces = Array.from(this.namespaces.keys()),
    } = options;

    const results = {
      cleaned: 0,
      errors: 0,
      namespaces: {},
    };

    for (const namespace of namespaces) {
      try {
        const config = this.getNamespaceConfig(namespace);
        const prefix = config?.keyPrefix || namespace;
        const keys = await this.cacheService.getKeys(`${prefix}:*`);

        let namespaceCleaned = 0;

        for (const key of keys) {
          const ttl = await this.cacheService.ttl(key);

          // إذا كان TTL أقل من maxAge، احذفه
          if (ttl > 0 && ttl < maxAge) {
            if (!dryRun) {
              await this.cacheService.del(key);
            }
            namespaceCleaned++;
          }
        }

        results.namespaces[namespace] = {
          keys: keys.length,
          cleaned: namespaceCleaned,
        };
        results.cleaned += namespaceCleaned;
      } catch (error) {
        results.errors++;
        results.namespaces[namespace] = {
          error: error.message,
        };
      }
    }

    console.log(`🧹 Cache cleanup completed:`, results);
    return results;
  }

  /**
   * إعادة تعيين جميع الإحصائيات
   */
  resetAllStats() {
    this.cacheService.resetStats();
    console.log("📊 All cache stats reset");
  }
}

// إنشاء instance واحد للاستخدام عبر التطبيق
const cacheManager = new CacheManager();

export default cacheManager;
