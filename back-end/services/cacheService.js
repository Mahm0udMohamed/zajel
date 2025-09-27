// services/cacheService.js
import redis from "../config/redisClient.js";

/**
 * Cache Service - خدمة الكاش الموحدة
 * يوفر واجهة موحدة لإدارة الكاش عبر التطبيق
 */
class CacheService {
  constructor() {
    this.redis = redis;
    this.defaultTTL = 3600; // ساعة واحدة افتراضياً
    this.compressionEnabled = true;
    this.stats = {
      hits: 0,
      misses: 0,
      errors: 0,
      totalOperations: 0,
    };
  }

  /**
   * التحقق من حالة Redis
   */
  isReady() {
    return this.redis.isReady();
  }

  /**
   * الحصول على قيمة من الكاش
   * @param {string} key - مفتاح الكاش
   * @param {Object} options - خيارات إضافية
   * @returns {Promise<any>} - القيمة المحفوظة أو null
   */
  async get(key, options = {}) {
    const {
      parse = true,
      defaultValue = null,
      namespace = null,
      silent = false,
    } = options;

    try {
      this.stats.totalOperations++;

      if (!this.isReady()) {
        if (!silent) console.warn(`Redis not ready for key: ${key}`);
        return defaultValue;
      }

      const fullKey = namespace ? `${namespace}:${key}` : key;
      const value = await this.redis.get(fullKey);

      if (value === null) {
        this.stats.misses++;
        if (!silent) console.log(`🔄 Cache MISS: ${fullKey}`);
        return defaultValue;
      }

      this.stats.hits++;
      if (!silent) console.log(`✅ Cache HIT: ${fullKey}`);

      if (!parse) return value;

      try {
        return JSON.parse(value);
      } catch (parseError) {
        if (!silent)
          console.warn(`Failed to parse cached value for key: ${fullKey}`);
        return defaultValue;
      }
    } catch (error) {
      this.stats.errors++;
      if (!silent)
        console.error(`Cache GET error for key ${key}:`, error.message);
      return defaultValue;
    }
  }

  /**
   * حفظ قيمة في الكاش
   * @param {string} key - مفتاح الكاش
   * @param {any} value - القيمة للحفظ
   * @param {Object} options - خيارات إضافية
   * @returns {Promise<boolean>} - نجح الحفظ أم لا
   */
  async set(key, value, options = {}) {
    const {
      ttl = this.defaultTTL,
      namespace = null,
      compress = this.compressionEnabled,
      onlyIfNotExists = false,
      onlyIfExists = false,
      silent = false,
    } = options;

    try {
      this.stats.totalOperations++;

      if (!this.isReady()) {
        if (!silent) console.warn(`Redis not ready for key: ${key}`);
        return false;
      }

      const fullKey = namespace ? `${namespace}:${key}` : key;
      let serializedValue;

      if (typeof value === "string") {
        serializedValue = value;
      } else {
        serializedValue = JSON.stringify(value);
      }

      // تطبيق الضغط إذا كان مفعلاً
      if (compress && serializedValue.length > 1024) {
        // يمكن إضافة ضغط هنا لاحقاً
        if (!silent)
          console.log(
            `📦 Large value detected for key: ${fullKey} (${serializedValue.length} bytes)`
          );
      }

      let result;
      if (onlyIfNotExists) {
        result = await this.redis.setnx(fullKey, serializedValue);
        if (result && ttl > 0) {
          await this.redis.expire(fullKey, ttl);
        }
      } else if (onlyIfExists) {
        result = await this.redis.set(
          fullKey,
          serializedValue,
          "XX",
          "EX",
          ttl
        );
      } else {
        result = await this.redis.setex(fullKey, ttl, serializedValue);
      }

      if (result === "OK" || result === 1) {
        if (!silent) console.log(`✅ Cached: ${fullKey} (TTL: ${ttl}s)`);
        return true;
      }

      return false;
    } catch (error) {
      this.stats.errors++;
      if (!silent)
        console.error(`Cache SET error for key ${key}:`, error.message);
      return false;
    }
  }

  /**
   * حذف مفتاح من الكاش
   * @param {string} key - مفتاح الكاش
   * @param {Object} options - خيارات إضافية
   * @returns {Promise<boolean>} - نجح الحذف أم لا
   */
  async del(key, options = {}) {
    const { namespace = null, pattern = false, silent = false } = options;

    try {
      this.stats.totalOperations++;

      if (!this.isReady()) {
        if (!silent) console.warn(`Redis not ready for key: ${key}`);
        return false;
      }

      if (pattern) {
        const fullPattern = namespace ? `${namespace}:${key}` : key;
        const keys = await this.redis.keys(fullPattern);

        if (keys.length === 0) {
          if (!silent)
            console.log(`🔍 No keys found for pattern: ${fullPattern}`);
          return true;
        }

        const result = await this.redis.del(...keys);
        if (!silent)
          console.log(
            `🗑️ Deleted ${result} keys matching pattern: ${fullPattern}`
          );
        return result > 0;
      } else {
        const fullKey = namespace ? `${namespace}:${key}` : key;
        const result = await this.redis.del(fullKey);
        if (!silent) console.log(`🗑️ Deleted key: ${fullKey}`);
        return result > 0;
      }
    } catch (error) {
      this.stats.errors++;
      if (!silent)
        console.error(`Cache DEL error for key ${key}:`, error.message);
      return false;
    }
  }

  /**
   * التحقق من وجود مفتاح
   * @param {string} key - مفتاح الكاش
   * @param {Object} options - خيارات إضافية
   * @returns {Promise<boolean>} - موجود أم لا
   */
  async exists(key, options = {}) {
    const { namespace = null } = options;

    try {
      if (!this.isReady()) {
        return false;
      }

      const fullKey = namespace ? `${namespace}:${key}` : key;
      const result = await this.redis.exists(fullKey);
      return result === 1;
    } catch (error) {
      console.error(`Cache EXISTS error for key ${key}:`, error.message);
      return false;
    }
  }

  /**
   * الحصول على TTL لمفتاح
   * @param {string} key - مفتاح الكاش
   * @param {Object} options - خيارات إضافية
   * @returns {Promise<number>} - TTL بالثواني
   */
  async ttl(key, options = {}) {
    const { namespace = null } = options;

    try {
      if (!this.isReady()) {
        return -1;
      }

      const fullKey = namespace ? `${namespace}:${key}` : key;
      return await this.redis.ttl(fullKey);
    } catch (error) {
      console.error(`Cache TTL error for key ${key}:`, error.message);
      return -1;
    }
  }

  /**
   * تحديث TTL لمفتاح
   * @param {string} key - مفتاح الكاش
   * @param {number} ttl - TTL جديد بالثواني
   * @param {Object} options - خيارات إضافية
   * @returns {Promise<boolean>} - نجح التحديث أم لا
   */
  async expire(key, ttl, options = {}) {
    const { namespace = null } = options;

    try {
      if (!this.isReady()) {
        return false;
      }

      const fullKey = namespace ? `${namespace}:${key}` : key;
      const result = await this.redis.expire(fullKey, ttl);
      console.log(`⏰ Updated TTL for ${fullKey}: ${ttl}s`);
      return result === 1;
    } catch (error) {
      console.error(`Cache EXPIRE error for key ${key}:`, error.message);
      return false;
    }
  }

  /**
   * مسح جميع المفاتيح بنمط معين
   * @param {string} pattern - النمط للمسح
   * @param {Object} options - خيارات إضافية
   * @returns {Promise<number>} - عدد المفاتيح المحذوفة
   */
  async clearPattern(pattern, options = {}) {
    const { namespace = null } = options;

    try {
      if (!this.isReady()) {
        console.warn(`Redis not ready for pattern: ${pattern}`);
        return 0;
      }

      const fullPattern = namespace ? `${namespace}:${pattern}` : pattern;
      const keys = await this.redis.keys(fullPattern);

      if (keys.length === 0) {
        console.log(`🔍 No keys found for pattern: ${fullPattern}`);
        return 0;
      }

      const result = await this.redis.del(...keys);
      console.log(`🗑️ Cleared ${result} keys matching pattern: ${fullPattern}`);
      return result;
    } catch (error) {
      console.error(
        `Cache CLEAR PATTERN error for pattern ${pattern}:`,
        error.message
      );
      return 0;
    }
  }

  /**
   * الحصول على جميع المفاتيح بنمط معين
   * @param {string} pattern - النمط للبحث
   * @param {Object} options - خيارات إضافية
   * @returns {Promise<string[]>} - قائمة المفاتيح
   */
  async getKeys(pattern, options = {}) {
    const { namespace = null } = options;

    try {
      if (!this.isReady()) {
        return [];
      }

      const fullPattern = namespace ? `${namespace}:${pattern}` : pattern;
      return await this.redis.keys(fullPattern);
    } catch (error) {
      console.error(
        `Cache GET KEYS error for pattern ${pattern}:`,
        error.message
      );
      return [];
    }
  }

  /**
   * الحصول على إحصائيات الكاش
   * @returns {Object} - إحصائيات مفصلة
   */
  getStats() {
    const hitRate =
      this.stats.totalOperations > 0
        ? ((this.stats.hits / this.stats.totalOperations) * 100).toFixed(2)
        : 0;

    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      errorRate:
        this.stats.totalOperations > 0
          ? ((this.stats.errors / this.stats.totalOperations) * 100).toFixed(2)
          : 0,
      redisConnected: this.isReady(),
      redisStatus: this.redis.status,
    };
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
    };
    console.log("📊 Cache stats reset");
  }

  /**
   * اختبار الاتصال
   * @param {boolean} silent - وضع صامت بدون رسائل console
   * @returns {Promise<Object>} - نتيجة الاختبار
   */
  async testConnection(silent = false) {
    try {
      const testKey = `test:connection:${Date.now()}`;
      const testValue = {
        message: "Connection test",
        timestamp: new Date().toISOString(),
      };

      // اختبار SET
      const setResult = await this.set(testKey, testValue, { ttl: 60, silent });
      if (!setResult) {
        throw new Error("Failed to set test value");
      }

      // اختبار GET
      const getValue = await this.get(testKey, { silent });
      if (!getValue || getValue.message !== testValue.message) {
        throw new Error("Failed to get test value");
      }

      // اختبار DEL
      const delResult = await this.del(testKey, { silent });
      if (!delResult) {
        throw new Error("Failed to delete test value");
      }

      return {
        success: true,
        message: "Cache connection test successful",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: `Cache connection test failed: ${error.message}`,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

// إنشاء instance واحد للاستخدام عبر التطبيق
const cacheService = new CacheService();

export default cacheService;
