// utils/cacheUtils.js
// أدوات مساعدة للكاش

import cacheLayer from "../services/cache/CacheLayer.js";

/**
 * أدوات مساعدة للكاش
 * توفر وظائف مساعدة لإدارة الكاش
 */

/**
 * مسح الكاش لجميع الاستراتيجيات
 * @param {Object} options - خيارات المسح
 * @returns {Promise<Object>} - نتيجة المسح
 */
export const clearAllCache = async (options = {}) => {
  const strategies = Array.from(cacheLayer.strategies.keys());
  const results = {};

  for (const strategy of strategies) {
    try {
      const result = await cacheLayer.clear(strategy, "*", options);
      results[strategy] = result;
    } catch (error) {
      results[strategy] = { error: error.message };
    }
  }

  return results;
};

/**
 * مسح الكاش لاستراتيجية محددة
 * @param {string} strategyName - اسم الاستراتيجية
 * @param {string} pattern - النمط (اختياري)
 * @param {Object} options - خيارات المسح
 * @returns {Promise<number>} - عدد المفاتيح المحذوفة
 */
export const clearStrategyCache = async (
  strategyName,
  pattern = "*",
  options = {}
) => {
  try {
    return await cacheLayer.clear(strategyName, pattern, options);
  } catch (error) {
    console.error(
      `Error clearing cache for strategy ${strategyName}:`,
      error.message
    );
    return 0;
  }
};

/**
 * مسح الكاش حسب المعاملات
 * @param {string} strategyName - اسم الاستراتيجية
 * @param {string} operation - العملية
 * @param {Object} params - المعاملات
 * @param {Object} options - خيارات المسح
 * @returns {Promise<boolean>} - نجح المسح أم لا
 */
export const clearCacheByParams = async (
  strategyName,
  operation,
  params = {},
  options = {}
) => {
  try {
    return await cacheLayer.invalidate(
      strategyName,
      operation,
      params,
      options
    );
  } catch (error) {
    console.error(`Error clearing cache by params:`, error.message);
    return false;
  }
};

/**
 * الحصول على إحصائيات شاملة للكاش
 * @returns {Promise<Object>} - إحصائيات مفصلة
 */
export const getComprehensiveStats = async () => {
  try {
    const stats = cacheLayer.getStats();
    const health = await cacheLayer.getHealth();

    return {
      stats,
      health,
      recommendations: generateCacheRecommendations(stats),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error getting comprehensive stats:", error.message);
    return {
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * توليد توصيات للكاش
 * @param {Object} stats - إحصائيات الكاش
 * @returns {Array} - قائمة التوصيات
 */
export const generateCacheRecommendations = (stats) => {
  const recommendations = [];

  // تحليل hit rate
  const hitRate = parseFloat(stats.hitRate);

  if (hitRate < 70) {
    recommendations.push({
      type: "warning",
      message: `Hit rate منخفض (${hitRate}%). يوصى بزيادة TTL أو تحسين cache keys.`,
      action: "زيادة TTL أو تحسين استراتيجيات الكاش",
    });
  }

  if (hitRate > 95) {
    recommendations.push({
      type: "success",
      message: `Hit rate ممتاز (${hitRate}%). الكاش يعمل بكفاءة عالية.`,
      action: "لا حاجة لإجراءات",
    });
  }

  // تحليل معدل الأخطاء
  const errorRate =
    stats.totalOperations > 0
      ? ((stats.errors / stats.totalOperations) * 100).toFixed(2)
      : 0;

  if (errorRate > 5) {
    recommendations.push({
      type: "error",
      message: `معدل الأخطاء عالي (${errorRate}%). يوصى بفحص اتصال Redis.`,
      action: "فحص إعدادات Redis وإعادة الاتصال",
    });
  }

  // تحليل وقت التشغيل
  const uptimeHours = stats.uptime / (1000 * 60 * 60);
  if (uptimeHours > 24) {
    recommendations.push({
      type: "info",
      message: `الكاش يعمل منذ ${uptimeHours.toFixed(
        1
      )} ساعة. يوصى بإعادة تشغيل دورية.`,
      action: "إعادة تشغيل الخدمة دورياً",
    });
  }

  return recommendations;
};

/**
 * فحص صحة الكاش
 * @returns {Promise<Object>} - حالة الصحة
 */
export const checkCacheHealth = async () => {
  try {
    const health = await cacheLayer.getHealth();

    return {
      ...health,
      recommendations: generateHealthRecommendations(health),
    };
  } catch (error) {
    return {
      status: "error",
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * توليد توصيات الصحة
 * @param {Object} health - حالة الصحة
 * @returns {Array} - قائمة التوصيات
 */
export const generateHealthRecommendations = (health) => {
  const recommendations = [];

  if (health.status === "unhealthy") {
    recommendations.push({
      type: "error",
      message: "الكاش غير صحي. يوصى بفحص اتصال Redis.",
      action: "فحص إعدادات Redis وإعادة الاتصال",
    });
  }

  if (health.redis && !health.redis.ready) {
    recommendations.push({
      type: "warning",
      message: "Redis غير جاهز. قد يؤثر على الأداء.",
      action: "فحص حالة Redis",
    });
  }

  if (health.redis && !health.redis.connected) {
    recommendations.push({
      type: "error",
      message: "فشل الاتصال بـ Redis. الكاش غير متاح.",
      action: "إعادة تشغيل Redis أو فحص الإعدادات",
    });
  }

  return recommendations;
};

/**
 * تنظيف الكاش القديم
 * @param {Object} options - خيارات التنظيف
 * @returns {Promise<Object>} - نتيجة التنظيف
 */
export const cleanupOldCache = async (options = {}) => {
  try {
    const result = await cacheLayer.cleanup(options);

    return {
      success: true,
      message: `تم تنظيف ${result.cleaned} مفتاح من الكاش`,
      details: result,
    };
  } catch (error) {
    return {
      success: false,
      message: "فشل في تنظيف الكاش",
      error: error.message,
    };
  }
};

/**
 * إعادة تعيين إحصائيات الكاش
 * @returns {Object} - نتيجة الإعادة تعيين
 */
export const resetCacheStats = () => {
  try {
    cacheLayer.resetStats();

    return {
      success: true,
      message: "تم إعادة تعيين إحصائيات الكاش",
    };
  } catch (error) {
    return {
      success: false,
      message: "فشل في إعادة تعيين الإحصائيات",
      error: error.message,
    };
  }
};

/**
 * الحصول على مفاتيح الكاش
 * @param {string} pattern - النمط
 * @returns {Promise<Array>} - قائمة المفاتيح
 */
export const getCacheKeys = async (pattern = "*") => {
  try {
    return await cacheLayer.cacheService.getKeys(pattern);
  } catch (error) {
    console.error("Error getting cache keys:", error.message);
    return [];
  }
};

/**
 * الحصول على TTL لمفتاح
 * @param {string} key - المفتاح
 * @returns {Promise<number>} - TTL بالثواني
 */
export const getKeyTTL = async (key) => {
  try {
    return await cacheLayer.cacheService.ttl(key);
  } catch (error) {
    console.error("Error getting key TTL:", error.message);
    return -1;
  }
};

/**
 * فحص وجود مفتاح في الكاش
 * @param {string} key - المفتاح
 * @returns {Promise<boolean>} - موجود أم لا
 */
export const keyExists = async (key) => {
  try {
    const ttl = await cacheLayer.cacheService.ttl(key);
    return ttl > 0;
  } catch (error) {
    console.error("Error checking key existence:", error.message);
    return false;
  }
};

/**
 * الحصول على حجم الكاش
 * @returns {Promise<Object>} - معلومات الحجم
 */
export const getCacheSize = async () => {
  try {
    const keys = await getCacheKeys();
    let totalSize = 0;

    for (const key of keys) {
      try {
        const value = await cacheLayer.cacheService.get(key);
        if (value) {
          totalSize += JSON.stringify(value).length;
        }
      } catch (error) {
        // تجاهل الأخطاء في حساب الحجم
      }
    }

    return {
      keyCount: keys.length,
      totalSize,
      averageSize: keys.length > 0 ? totalSize / keys.length : 0,
    };
  } catch (error) {
    console.error("Error getting cache size:", error.message);
    return {
      keyCount: 0,
      totalSize: 0,
      averageSize: 0,
    };
  }
};

export default {
  clearAllCache,
  clearStrategyCache,
  clearCacheByParams,
  getComprehensiveStats,
  generateCacheRecommendations,
  checkCacheHealth,
  generateHealthRecommendations,
  cleanupOldCache,
  resetCacheStats,
  getCacheKeys,
  getKeyTTL,
  keyExists,
  getCacheSize,
};
