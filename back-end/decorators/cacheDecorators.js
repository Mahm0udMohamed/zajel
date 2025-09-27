// decorators/cacheDecorators.js
import cacheManager from "../services/cacheManager.js";

/**
 * Cache Decorators - ديكوراتورات الكاش للاستخدام السهل
 * توفر طرق سهلة لتطبيق الكاش على الدوال
 */

/**
 * ديكوراتور للكاش التلقائي
 * @param {Object} options - خيارات الكاش
 * @returns {Function} - الديكوراتور
 */
export function cacheable(options = {}) {
  return function (target, propertyName, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args) {
      const {
        namespace = "default",
        operation = propertyName,
        ttl = 3600,
        keyParams = [],
        skipCache = false,
        cacheCondition = null,
      } = options;

      // إنشاء معاملات المفتاح من args
      const params = {};
      keyParams.forEach((paramName, index) => {
        if (args[index] !== undefined) {
          params[paramName] = args[index];
        }
      });

      // التحقق من شرط الكاش
      if (cacheCondition && !cacheCondition(...args)) {
        return await originalMethod.apply(this, args);
      }

      // تخطي الكاش إذا كان مطلوباً
      if (skipCache) {
        return await originalMethod.apply(this, args);
      }

      try {
        // محاولة الحصول من الكاش
        const cached = await cacheManager.get(namespace, operation, params, {
          defaultValue: null,
        });

        if (cached !== null) {
          console.log(`✅ Cache HIT: ${namespace}:${operation}`);
          return cached;
        }

        // Cache MISS - تنفيذ الدالة الأصلية
        console.log(`🔄 Cache MISS: ${namespace}:${operation}`);
        const result = await originalMethod.apply(this, args);

        // حفظ النتيجة في الكاش
        if (result !== null && result !== undefined) {
          await cacheManager.set(namespace, operation, result, params, { ttl });
        }

        return result;
      } catch (error) {
        console.error(
          `Cache decorator error for ${namespace}:${operation}:`,
          error.message
        );
        // في حالة الخطأ، تنفيذ الدالة الأصلية
        return await originalMethod.apply(this, args);
      }
    };

    return descriptor;
  };
}

/**
 * ديكوراتور لمسح الكاش عند التحديث
 * @param {Object} options - خيارات المسح
 * @returns {Function} - الديكوراتور
 */
export function cacheInvalidate(options = {}) {
  return function (target, propertyName, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args) {
      const {
        namespace = "default",
        strategy = "immediate",
        operations = [],
        pattern = "*",
        afterExecution = true,
      } = options;

      // تنفيذ الدالة الأصلية أولاً إذا كان مطلوباً
      let result;
      if (!afterExecution) {
        // مسح الكاش قبل التنفيذ
        await cacheManager.invalidate(namespace, strategy, {
          operations,
          pattern,
        });
        result = await originalMethod.apply(this, args);
      } else {
        // تنفيذ الدالة ثم مسح الكاش
        result = await originalMethod.apply(this, args);

        // مسح الكاش بعد التنفيذ
        await cacheManager.invalidate(namespace, strategy, {
          operations,
          pattern,
        });
      }

      return result;
    };

    return descriptor;
  };
}

/**
 * ديكوراتور للكاش المشروط
 * @param {Function} condition - دالة الشرط
 * @param {Object} options - خيارات الكاش
 * @returns {Function} - الديكوراتور
 */
export function cacheWhen(condition, options = {}) {
  return function (target, propertyName, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args) {
      // التحقق من الشرط
      if (!condition(...args)) {
        return await originalMethod.apply(this, args);
      }

      // تطبيق ديكوراتور الكاش العادي
      const cacheDecorator = cacheable(options);
      const decoratedDescriptor = cacheDecorator(
        target,
        propertyName,
        descriptor
      );

      return await decoratedDescriptor.value.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * ديكوراتور للكاش مع TTL ديناميكي
 * @param {Function} ttlFunction - دالة حساب TTL
 * @param {Object} options - خيارات الكاش
 * @returns {Function} - الديكوراتور
 */
export function cacheWithDynamicTTL(ttlFunction, options = {}) {
  return function (target, propertyName, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args) {
      const {
        namespace = "default",
        operation = propertyName,
        keyParams = [],
      } = options;

      // حساب TTL ديناميكياً
      const dynamicTTL = ttlFunction(...args);

      // إنشاء معاملات المفتاح
      const params = {};
      keyParams.forEach((paramName, index) => {
        if (args[index] !== undefined) {
          params[paramName] = args[index];
        }
      });

      try {
        // محاولة الحصول من الكاش
        const cached = await cacheManager.get(namespace, operation, params);

        if (cached !== null) {
          console.log(
            `✅ Cache HIT: ${namespace}:${operation} (TTL: ${dynamicTTL})`
          );
          return cached;
        }

        // Cache MISS
        console.log(
          `🔄 Cache MISS: ${namespace}:${operation} (TTL: ${dynamicTTL})`
        );
        const result = await originalMethod.apply(this, args);

        // حفظ مع TTL ديناميكي
        if (result !== null && result !== undefined) {
          await cacheManager.set(namespace, operation, result, params, {
            ttl: dynamicTTL,
          });
        }

        return result;
      } catch (error) {
        console.error(
          `Dynamic TTL cache error for ${namespace}:${operation}:`,
          error.message
        );
        return await originalMethod.apply(this, args);
      }
    };

    return descriptor;
  };
}

/**
 * ديكوراتور للكاش مع Compress
 * @param {Object} options - خيارات الكاش
 * @returns {Function} - الديكوراتور
 */
export function cacheWithCompression(options = {}) {
  return function (target, propertyName, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args) {
      const {
        namespace = "default",
        operation = propertyName,
        ttl = 3600,
        keyParams = [],
        compressionThreshold = 1024,
      } = options;

      // إنشاء معاملات المفتاح
      const params = {};
      keyParams.forEach((paramName, index) => {
        if (args[index] !== undefined) {
          params[paramName] = args[index];
        }
      });

      try {
        // محاولة الحصول من الكاش
        const cached = await cacheManager.get(namespace, operation, params);

        if (cached !== null) {
          console.log(`✅ Cache HIT (compressed): ${namespace}:${operation}`);
          return cached;
        }

        // Cache MISS
        console.log(`🔄 Cache MISS: ${namespace}:${operation}`);
        const result = await originalMethod.apply(this, args);

        // حفظ مع ضغط
        if (result !== null && result !== undefined) {
          const serialized = JSON.stringify(result);
          const shouldCompress = serialized.length > compressionThreshold;

          await cacheManager.set(namespace, operation, result, params, {
            ttl,
            compress: shouldCompress,
          });

          if (shouldCompress) {
            console.log(
              `📦 Compressed cache for ${namespace}:${operation} (${serialized.length} bytes)`
            );
          }
        }

        return result;
      } catch (error) {
        console.error(
          `Compression cache error for ${namespace}:${operation}:`,
          error.message
        );
        return await originalMethod.apply(this, args);
      }
    };

    return descriptor;
  };
}

/**
 * ديكوراتور للكاش مع Retry
 * @param {Object} options - خيارات الكاش
 * @returns {Function} - الديكوراتور
 */
export function cacheWithRetry(options = {}) {
  return function (target, propertyName, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args) {
      const {
        namespace = "default",
        operation = propertyName,
        ttl = 3600,
        keyParams = [],
        maxRetries = 3,
        retryDelay = 1000,
      } = options;

      // إنشاء معاملات المفتاح
      const params = {};
      keyParams.forEach((paramName, index) => {
        if (args[index] !== undefined) {
          params[paramName] = args[index];
        }
      });

      let lastError;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          // محاولة الحصول من الكاش
          const cached = await cacheManager.get(namespace, operation, params);

          if (cached !== null) {
            console.log(
              `✅ Cache HIT (attempt ${attempt}): ${namespace}:${operation}`
            );
            return cached;
          }

          // Cache MISS - تنفيذ الدالة الأصلية
          console.log(
            `🔄 Cache MISS (attempt ${attempt}): ${namespace}:${operation}`
          );
          const result = await originalMethod.apply(this, args);

          // حفظ النتيجة
          if (result !== null && result !== undefined) {
            await cacheManager.set(namespace, operation, result, params, {
              ttl,
            });
          }

          return result;
        } catch (error) {
          lastError = error;
          console.warn(
            `Cache attempt ${attempt} failed for ${namespace}:${operation}:`,
            error.message
          );

          if (attempt < maxRetries) {
            await new Promise((resolve) =>
              setTimeout(resolve, retryDelay * attempt)
            );
          }
        }
      }

      // فشلت جميع المحاولات
      console.error(
        `All cache attempts failed for ${namespace}:${operation}:`,
        lastError.message
      );
      throw lastError;
    };

    return descriptor;
  };
}

/**
 * ديكوراتور للكاش مع Background Refresh
 * @param {Object} options - خيارات الكاش
 * @returns {Function} - الديكوراتور
 */
export function cacheWithBackgroundRefresh(options = {}) {
  return function (target, propertyName, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args) {
      const {
        namespace = "default",
        operation = propertyName,
        ttl = 3600,
        refreshThreshold = 0.8, // تحديث عند 80% من TTL
        keyParams = [],
      } = options;

      // إنشاء معاملات المفتاح
      const params = {};
      keyParams.forEach((paramName, index) => {
        if (args[index] !== undefined) {
          params[paramName] = args[index];
        }
      });

      try {
        // محاولة الحصول من الكاش
        const cached = await cacheManager.get(namespace, operation, params);

        if (cached !== null) {
          // التحقق من TTL
          const currentTTL = await cacheManager.cacheService.ttl(
            cacheManager.buildKey(namespace, operation, params)
          );

          const shouldRefresh = currentTTL < ttl * refreshThreshold;

          if (shouldRefresh) {
            // تحديث في الخلفية
            setImmediate(async () => {
              try {
                console.log(
                  `🔄 Background refresh for ${namespace}:${operation}`
                );
                const result = await originalMethod.apply(this, args);
                await cacheManager.set(namespace, operation, result, params, {
                  ttl,
                });
              } catch (error) {
                console.error(
                  `Background refresh failed for ${namespace}:${operation}:`,
                  error.message
                );
              }
            });
          }

          console.log(`✅ Cache HIT: ${namespace}:${operation}`);
          return cached;
        }

        // Cache MISS
        console.log(`🔄 Cache MISS: ${namespace}:${operation}`);
        const result = await originalMethod.apply(this, args);

        // حفظ النتيجة
        if (result !== null && result !== undefined) {
          await cacheManager.set(namespace, operation, result, params, { ttl });
        }

        return result;
      } catch (error) {
        console.error(
          `Background refresh cache error for ${namespace}:${operation}:`,
          error.message
        );
        return await originalMethod.apply(this, args);
      }
    };

    return descriptor;
  };
}

export default {
  cacheable,
  cacheInvalidate,
  cacheWhen,
  cacheWithDynamicTTL,
  cacheWithCompression,
  cacheWithRetry,
  cacheWithBackgroundRefresh,
};
