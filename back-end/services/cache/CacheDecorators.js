// services/cache/CacheDecorators.js
// ديكوراتورات الكاش المحسنة

import cacheLayer from "./CacheLayer.js";

/**
 * Cache Decorators - ديكوراتورات الكاش المحسنة
 * توفر طرق سهلة ومتقدمة لتطبيق الكاش على الدوال
 */

/**
 * ديكوراتور للكاش التلقائي
 * @param {string} strategyName - اسم استراتيجية الكاش
 * @param {Object} options - خيارات الكاش
 * @returns {Function} - الديكوراتور
 */
export function cacheable(strategyName, options = {}) {
  return function (target, propertyName, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args) {
      const {
        operation = propertyName,
        keyParams = [],
        skipCache = false,
        cacheCondition = null,
        ...cacheOptions
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
        const cached = await cacheLayer.get(
          strategyName,
          operation,
          params,
          cacheOptions
        );

        if (cached !== null) {
          console.log(`✅ Cache HIT: ${strategyName}:${operation}`);
          return cached;
        }

        // Cache MISS - تنفيذ الدالة الأصلية
        console.log(`🔄 Cache MISS: ${strategyName}:${operation}`);
        const result = await originalMethod.apply(this, args);

        // حفظ النتيجة في الكاش
        if (result !== null && result !== undefined) {
          await cacheLayer.set(
            strategyName,
            operation,
            result,
            params,
            cacheOptions
          );
        }

        return result;
      } catch (error) {
        console.error(
          `Cache decorator error for ${strategyName}:${operation}:`,
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
 * @param {string} strategyName - اسم استراتيجية الكاش
 * @param {Object} options - خيارات المسح
 * @returns {Function} - الديكوراتور
 */
export function cacheInvalidate(strategyName, options = {}) {
  return function (target, propertyName, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args) {
      const {
        operation = propertyName,
        keyParams = [],
        afterExecution = true,
        ...cacheOptions
      } = options;

      // إنشاء معاملات المفتاح من args
      const params = {};
      keyParams.forEach((paramName, index) => {
        if (args[index] !== undefined) {
          params[paramName] = args[index];
        }
      });

      // تنفيذ الدالة الأصلية أولاً إذا كان مطلوباً
      let result;
      if (!afterExecution) {
        // مسح الكاش قبل التنفيذ
        await cacheLayer.invalidate(
          strategyName,
          operation,
          params,
          cacheOptions
        );
        result = await originalMethod.apply(this, args);
      } else {
        // تنفيذ الدالة ثم مسح الكاش
        result = await originalMethod.apply(this, args);

        // مسح الكاش بعد التنفيذ
        await cacheLayer.invalidate(
          strategyName,
          operation,
          params,
          cacheOptions
        );
      }

      return result;
    };

    return descriptor;
  };
}

/**
 * ديكوراتور للكاش المشروط
 * @param {string} strategyName - اسم استراتيجية الكاش
 * @param {Function} condition - دالة الشرط
 * @param {Object} options - خيارات الكاش
 * @returns {Function} - الديكوراتور
 */
export function cacheWhen(strategyName, condition, options = {}) {
  return function (target, propertyName, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args) {
      // التحقق من الشرط
      if (!condition(...args)) {
        return await originalMethod.apply(this, args);
      }

      // تطبيق ديكوراتور الكاش العادي
      const cacheDecorator = cacheable(strategyName, options);
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
 * @param {string} strategyName - اسم استراتيجية الكاش
 * @param {Function} ttlFunction - دالة حساب TTL
 * @param {Object} options - خيارات الكاش
 * @returns {Function} - الديكوراتور
 */
export function cacheWithDynamicTTL(strategyName, ttlFunction, options = {}) {
  return function (target, propertyName, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args) {
      const { operation = propertyName, keyParams = [] } = options;

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
        const cached = await cacheLayer.get(strategyName, operation, params);

        if (cached !== null) {
          console.log(
            `✅ Cache HIT: ${strategyName}:${operation} (TTL: ${dynamicTTL})`
          );
          return cached;
        }

        // Cache MISS
        console.log(
          `🔄 Cache MISS: ${strategyName}:${operation} (TTL: ${dynamicTTL})`
        );
        const result = await originalMethod.apply(this, args);

        // حفظ مع TTL ديناميكي
        if (result !== null && result !== undefined) {
          await cacheLayer.set(strategyName, operation, result, params, {
            ...options,
            ttl: dynamicTTL,
          });
        }

        return result;
      } catch (error) {
        console.error(
          `Dynamic TTL cache error for ${strategyName}:${operation}:`,
          error.message
        );
        return await originalMethod.apply(this, args);
      }
    };

    return descriptor;
  };
}

/**
 * ديكوراتور للكاش مع Background Refresh
 * @param {string} strategyName - اسم استراتيجية الكاش
 * @param {Object} options - خيارات الكاش
 * @returns {Function} - الديكوراتور
 */
export function cacheWithBackgroundRefresh(strategyName, options = {}) {
  return function (target, propertyName, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args) {
      const {
        operation = propertyName,
        keyParams = [],
        refreshThreshold = 0.8,
        ...cacheOptions
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
        const cached = await cacheLayer.get(strategyName, operation, params);

        if (cached !== null) {
          // التحقق من TTL
          const config = cacheLayer.getStrategyConfig(strategyName);
          const key = cacheLayer.buildKey(strategyName, operation, params);
          const currentTTL = await cacheLayer.cacheService.ttl(key);

          const shouldRefresh = currentTTL < config.ttl * refreshThreshold;

          if (shouldRefresh) {
            // تحديث في الخلفية
            setImmediate(async () => {
              try {
                console.log(
                  `🔄 Background refresh for ${strategyName}:${operation}`
                );
                const result = await originalMethod.apply(this, args);
                await cacheLayer.set(
                  strategyName,
                  operation,
                  result,
                  params,
                  cacheOptions
                );
              } catch (error) {
                console.error(
                  `Background refresh failed for ${strategyName}:${operation}:`,
                  error.message
                );
              }
            });
          }

          console.log(`✅ Cache HIT: ${strategyName}:${operation}`);
          return cached;
        }

        // Cache MISS
        console.log(`🔄 Cache MISS: ${strategyName}:${operation}`);
        const result = await originalMethod.apply(this, args);

        // حفظ النتيجة
        if (result !== null && result !== undefined) {
          await cacheLayer.set(
            strategyName,
            operation,
            result,
            params,
            cacheOptions
          );
        }

        return result;
      } catch (error) {
        console.error(
          `Background refresh cache error for ${strategyName}:${operation}:`,
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
 * @param {string} strategyName - اسم استراتيجية الكاش
 * @param {Object} options - خيارات الكاش
 * @returns {Function} - الديكوراتور
 */
export function cacheWithRetry(strategyName, options = {}) {
  return function (target, propertyName, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args) {
      const {
        operation = propertyName,
        keyParams = [],
        maxRetries = 3,
        retryDelay = 1000,
        ...cacheOptions
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
          const cached = await cacheLayer.get(strategyName, operation, params);

          if (cached !== null) {
            console.log(
              `✅ Cache HIT (attempt ${attempt}): ${strategyName}:${operation}`
            );
            return cached;
          }

          // Cache MISS - تنفيذ الدالة الأصلية
          console.log(
            `🔄 Cache MISS (attempt ${attempt}): ${strategyName}:${operation}`
          );
          const result = await originalMethod.apply(this, args);

          // حفظ النتيجة
          if (result !== null && result !== undefined) {
            await cacheLayer.set(
              strategyName,
              operation,
              result,
              params,
              cacheOptions
            );
          }

          return result;
        } catch (error) {
          lastError = error;
          console.warn(
            `Cache attempt ${attempt} failed for ${strategyName}:${operation}:`,
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
        `All cache attempts failed for ${strategyName}:${operation}:`,
        lastError.message
      );
      throw lastError;
    };

    return descriptor;
  };
}

/**
 * ديكوراتور للكاش مع Compress
 * @param {string} strategyName - اسم استراتيجية الكاش
 * @param {Object} options - خيارات الكاش
 * @returns {Function} - الديكوراتور
 */
export function cacheWithCompression(strategyName, options = {}) {
  return function (target, propertyName, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args) {
      const {
        operation = propertyName,
        keyParams = [],
        compressionThreshold = 1024,
        ...cacheOptions
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
        const cached = await cacheLayer.get(strategyName, operation, params);

        if (cached !== null) {
          console.log(
            `✅ Cache HIT (compressed): ${strategyName}:${operation}`
          );
          return cached;
        }

        // Cache MISS
        console.log(`🔄 Cache MISS: ${strategyName}:${operation}`);
        const result = await originalMethod.apply(this, args);

        // حفظ مع ضغط
        if (result !== null && result !== undefined) {
          const serialized = JSON.stringify(result);
          const shouldCompress = serialized.length > compressionThreshold;

          await cacheLayer.set(strategyName, operation, result, params, {
            ...cacheOptions,
            compress: shouldCompress,
          });

          if (shouldCompress) {
            console.log(
              `📦 Compressed cache for ${strategyName}:${operation} (${serialized.length} bytes)`
            );
          }
        }

        return result;
      } catch (error) {
        console.error(
          `Compression cache error for ${strategyName}:${operation}:`,
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
  cacheWithBackgroundRefresh,
  cacheWithRetry,
  cacheWithCompression,
};
