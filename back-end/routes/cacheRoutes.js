// routes/cacheRoutes.js
// مسارات إدارة الكاش الموحد

import express from "express";
import { cacheLayer, cacheUtils } from "../services/cache/index.js";
import { authenticateAdmin } from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

// تطبيق middleware المصادقة على جميع المسارات
router.use(authenticateAdmin);

// ===== إحصائيات الكاش =====

// الحصول على إحصائيات شاملة للكاش
router.get("/stats", async (req, res) => {
  try {
    const stats = await cacheUtils.getComprehensiveStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error getting cache stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get cache statistics",
      error: error.message,
    });
  }
});

// الحصول على إحصائيات بسيطة
router.get("/stats/simple", async (req, res) => {
  try {
    const stats = cacheLayer.getStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error getting simple cache stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get simple cache statistics",
      error: error.message,
    });
  }
});

// ===== صحة الكاش =====

// فحص صحة الكاش
router.get("/health", async (req, res) => {
  try {
    const health = await cacheUtils.checkCacheHealth();

    res.status(200).json({
      success: true,
      data: health,
    });
  } catch (error) {
    console.error("Error checking cache health:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check cache health",
      error: error.message,
    });
  }
});

// اختبار الاتصال
router.get("/test", async (req, res) => {
  try {
    const testResult = await cacheLayer.cacheService.testConnection();

    res.status(200).json({
      success: true,
      data: testResult,
    });
  } catch (error) {
    console.error("Error testing cache connection:", error);
    res.status(500).json({
      success: false,
      message: "Failed to test cache connection",
      error: error.message,
    });
  }
});

// ===== إدارة الكاش =====

// مسح الكاش لاستراتيجية محددة
router.delete("/clear/:strategy", async (req, res) => {
  try {
    const { strategy } = req.params;
    const { pattern = "*" } = req.query;

    const result = await cacheLayer.clear(strategy, pattern);

    res.status(200).json({
      success: true,
      message: `تم مسح ${result} مفتاح من استراتيجية ${strategy}`,
      deletedKeys: result,
    });
  } catch (error) {
    console.error("Error clearing cache strategy:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear cache strategy",
      error: error.message,
    });
  }
});

// مسح جميع الكاش
router.delete("/clear", async (req, res) => {
  try {
    const result = await cacheUtils.clearAllCache();

    res.status(200).json({
      success: true,
      message: "تم مسح جميع الكاش",
      data: result,
    });
  } catch (error) {
    console.error("Error clearing all cache:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear all cache",
      error: error.message,
    });
  }
});

// مسح الكاش حسب المعاملات
router.delete("/invalidate/:strategy/:operation", async (req, res) => {
  try {
    const { strategy, operation } = req.params;
    const params = req.query;

    const result = await cacheUtils.clearCacheByParams(
      strategy,
      operation,
      params
    );

    res.status(200).json({
      success: true,
      message: `تم مسح الكاش لـ ${strategy}:${operation}`,
      result,
    });
  } catch (error) {
    console.error("Error invalidating cache:", error);
    res.status(500).json({
      success: false,
      message: "Failed to invalidate cache",
      error: error.message,
    });
  }
});

// ===== معلومات الكاش =====

// الحصول على مفاتيح الكاش
router.get("/keys", async (req, res) => {
  try {
    const { pattern = "*" } = req.query;
    const keys = await cacheUtils.getCacheKeys(pattern);

    res.status(200).json({
      success: true,
      data: {
        keys,
        count: keys.length,
        pattern,
      },
    });
  } catch (error) {
    console.error("Error getting cache keys:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get cache keys",
      error: error.message,
    });
  }
});

// الحصول على حجم الكاش
router.get("/size", async (req, res) => {
  try {
    const size = await cacheUtils.getCacheSize();

    res.status(200).json({
      success: true,
      data: size,
    });
  } catch (error) {
    console.error("Error getting cache size:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get cache size",
      error: error.message,
    });
  }
});

// فحص وجود مفتاح
router.get("/exists/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const exists = await cacheUtils.keyExists(key);

    res.status(200).json({
      success: true,
      data: {
        key,
        exists,
      },
    });
  } catch (error) {
    console.error("Error checking key existence:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check key existence",
      error: error.message,
    });
  }
});

// الحصول على TTL لمفتاح
router.get("/ttl/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const ttl = await cacheUtils.getKeyTTL(key);

    res.status(200).json({
      success: true,
      data: {
        key,
        ttl,
      },
    });
  } catch (error) {
    console.error("Error getting key TTL:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get key TTL",
      error: error.message,
    });
  }
});

// ===== إدارة الكاش المتقدمة =====

// تنظيف الكاش القديم
router.post("/cleanup", async (req, res) => {
  try {
    const { maxAge, dryRun = false, strategies } = req.body;

    const result = await cacheUtils.cleanupOldCache({
      maxAge,
      dryRun,
      strategies,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error cleaning up cache:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cleanup cache",
      error: error.message,
    });
  }
});

// إعادة تعيين إحصائيات الكاش
router.post("/reset-stats", async (req, res) => {
  try {
    const result = cacheUtils.resetCacheStats();

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error resetting cache stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset cache stats",
      error: error.message,
    });
  }
});

// ===== إدارة الاستراتيجيات =====

// الحصول على جميع الاستراتيجيات
router.get("/strategies", async (req, res) => {
  try {
    const strategies = cacheLayer.strategies;
    const strategiesList = Array.from(strategies.entries()).map(
      ([name, config]) => ({
        name,
        ...config,
      })
    );

    res.status(200).json({
      success: true,
      data: {
        strategies: strategiesList,
        count: strategiesList.length,
      },
    });
  } catch (error) {
    console.error("Error getting strategies:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get strategies",
      error: error.message,
    });
  }
});

// تسجيل استراتيجية جديدة
router.post("/strategies", async (req, res) => {
  try {
    const { name, config } = req.body;

    if (!name || !config) {
      return res.status(400).json({
        success: false,
        message: "Name and config are required",
      });
    }

    cacheLayer.registerStrategy(name, config);

    res.status(201).json({
      success: true,
      message: `تم تسجيل استراتيجية ${name} بنجاح`,
      data: {
        name,
        config,
      },
    });
  } catch (error) {
    console.error("Error registering strategy:", error);
    res.status(500).json({
      success: false,
      message: "Failed to register strategy",
      error: error.message,
    });
  }
});

export default router;
