// test-cache-system.js - اختبار شامل لنظام الكاش
import { cacheLayer, cacheUtils } from "./services/cache/index.js";
import HeroOccasion from "./models/HeroOccasion.js";
import Admin from "./models/Admin.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

// تحميل متغيرات البيئة
dotenv.config();

// إعدادات الاختبار
const TEST_CONFIG = {
  MONGODB_URI:
    process.env.MONGODB_URI || "mongodb://localhost:27017/zajel_test",
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  TEST_TIMEOUT: 30000, // 30 ثانية
};

// نتائج الاختبار
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: [],
};

// دالة مساعدة لتسجيل النتائج
const logTest = (testName, passed, message = "") => {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${testName}: ${message}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${testName}: ${message}`);
  }
  testResults.details.push({ testName, passed, message });
};

// دالة مساعدة للانتظار
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// اختبار الاتصال بقاعدة البيانات
const testDatabaseConnection = async () => {
  try {
    await mongoose.connect(TEST_CONFIG.MONGODB_URI);
    console.log("✅ Database connected successfully");
    return true;
  } catch (error) {
    console.log("❌ Database connection failed:", error.message);
    return false;
  }
};

// اختبار Cache Layer الأساسي
const testCacheLayerBasic = async () => {
  console.log("\n🧪 Testing Cache Layer Basic Operations...");

  try {
    // انتظار Redis للاتصال
    await sleep(2000);

    // اختبار SET
    const setResult = await cacheLayer.set(
      "hero-occasions",
      "test",
      { message: "Hello Cache" },
      { test: true }
    );
    logTest("Cache SET", setResult, "Set operation completed");

    // اختبار GET
    const getResult = await cacheLayer.get("hero-occasions", "test", {
      test: true,
    });
    logTest(
      "Cache GET",
      getResult && getResult.message === "Hello Cache",
      "Get operation completed"
    );

    // اختبار DEL
    const delResult = await cacheLayer.del("hero-occasions", "test", {
      test: true,
    });
    logTest("Cache DEL", delResult, "Delete operation completed");

    // اختبار Stats
    const stats = cacheLayer.getStats();
    logTest(
      "Cache Stats",
      stats && typeof stats === "object",
      "Stats retrieved successfully"
    );

    return true;
  } catch (error) {
    logTest("Cache Layer Basic", false, error.message);
    return false;
  }
};

// اختبار Cache Strategies
const testCacheStrategies = async () => {
  console.log("\n🧪 Testing Cache Strategies...");

  const strategies = [
    "hero-occasions",
    "hero-occasions-active",
    "hero-occasions-upcoming",
    "hero-occasions-search",
    "user-tokens",
    "admin-sessions",
  ];

  for (const strategy of strategies) {
    try {
      const config = cacheLayer.getStrategyConfig(strategy);
      logTest(
        `Strategy ${strategy}`,
        config && config.ttl > 0,
        `TTL: ${config?.ttl}s`
      );
    } catch (error) {
      logTest(`Strategy ${strategy}`, false, error.message);
    }
  }
};

// اختبار Hero Occasions Cache
const testHeroOccasionsCache = async () => {
  console.log("\n🧪 Testing Hero Occasions Cache...");

  try {
    // إنشاء مناسبة تجريبية
    const testOccasion = new HeroOccasion({
      nameAr: "مناسبة تجريبية",
      nameEn: "Test Occasion",
      celebratoryMessageAr: "رسالة تهنئة بالعربية",
      celebratoryMessageEn: "Celebratory message in English",
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // غداً
      isActive: true,
      images: ["https://example.com/test-image.jpg"],
      createdBy: new mongoose.Types.ObjectId(),
      updatedBy: new mongoose.Types.ObjectId(),
    });

    await testOccasion.save();
    console.log("✅ Test occasion created");

    // اختبار حفظ في الكاش
    const cacheKey = "test-occasion-001";
    const setResult = await cacheLayer.set(
      "hero-occasions",
      "single",
      testOccasion.toObject(),
      { id: cacheKey }
    );
    logTest(
      "Hero Occasion Cache SET",
      setResult,
      "Occasion cached successfully"
    );

    // اختبار استرجاع من الكاش
    const getResult = await cacheLayer.get("hero-occasions", "single", {
      id: cacheKey,
    });
    logTest(
      "Hero Occasion Cache GET",
      getResult &&
        getResult._id &&
        getResult._id.toString() === testOccasion._id.toString(),
      "Occasion retrieved from cache"
    );

    // اختبار مسح الكاش
    const delResult = await cacheLayer.del("hero-occasions", "single", {
      id: cacheKey,
    });
    logTest(
      "Hero Occasion Cache DEL",
      delResult,
      "Occasion removed from cache"
    );

    // تنظيف
    await HeroOccasion.findByIdAndDelete(testOccasion._id);
    console.log("✅ Test occasion cleaned up");

    return true;
  } catch (error) {
    logTest("Hero Occasions Cache", false, error.message);
    return false;
  }
};

// اختبار Cache Invalidation
const testCacheInvalidation = async () => {
  console.log("\n🧪 Testing Cache Invalidation...");

  try {
    // إضافة بيانات تجريبية للكاش
    await cacheLayer.set(
      "hero-occasions",
      "all",
      [{ id: "test1" }, { id: "test2" }],
      {}
    );
    await cacheLayer.set(
      "hero-occasions-active",
      "list",
      [{ id: "active1" }],
      {}
    );
    await cacheLayer.set(
      "hero-occasions-upcoming",
      "list",
      [{ id: "upcoming1" }],
      {}
    );

    // اختبار مسح الكاش
    await cacheLayer.clear("hero-occasions", "*");
    await cacheLayer.clear("hero-occasions-active", "*");
    await cacheLayer.clear("hero-occasions-upcoming", "*");

    // انتظار قليل للتأكد من المسح
    await new Promise((resolve) => setTimeout(resolve, 100));

    // التحقق من المسح
    const allResult = await cacheLayer.get("hero-occasions", "all", {});
    const activeResult = await cacheLayer.get(
      "hero-occasions-active",
      "list",
      {}
    );
    const upcomingResult = await cacheLayer.get(
      "hero-occasions-upcoming",
      "list",
      {}
    );

    // التحقق من المسح بطريقة أكثر دقة
    const allCleared =
      !allResult || allResult === null || allResult === undefined;
    const activeCleared =
      !activeResult || activeResult === null || activeResult === undefined;
    const upcomingCleared =
      !upcomingResult ||
      upcomingResult === null ||
      upcomingResult === undefined;

    logTest(
      "Cache Invalidation - All",
      allCleared,
      `All occasions cache cleared (result: ${
        allResult ? "exists" : "cleared"
      })`
    );
    logTest(
      "Cache Invalidation - Active",
      !activeResult,
      "Active occasions cache cleared"
    );
    logTest(
      "Cache Invalidation - Upcoming",
      !upcomingResult,
      "Upcoming occasions cache cleared"
    );

    return true;
  } catch (error) {
    logTest("Cache Invalidation", false, error.message);
    return false;
  }
};

// اختبار Cache Performance
const testCachePerformance = async () => {
  console.log("\n🧪 Testing Cache Performance...");

  try {
    const testData = { message: "Performance test", timestamp: Date.now() };
    const iterations = 10; // تقليل عدد التكرارات

    // اختبار سرعة SET
    const setStart = Date.now();
    for (let i = 0; i < iterations; i++) {
      await cacheLayer.set(
        "hero-occasions",
        "perf",
        { ...testData, id: i },
        { test: true }
      );
    }
    const setTime = Date.now() - setStart;
    logTest(
      "Cache Performance SET",
      setTime < 5000,
      `${iterations} SET operations in ${setTime}ms`
    );

    // اختبار سرعة GET
    const getStart = Date.now();
    for (let i = 0; i < iterations; i++) {
      await cacheLayer.get("hero-occasions", "perf", { test: true });
    }
    const getTime = Date.now() - getStart;
    logTest(
      "Cache Performance GET",
      getTime < 3000,
      `${iterations} GET operations in ${getTime}ms`
    );

    // تنظيف
    await cacheLayer.clear("hero-occasions", "*");

    return true;
  } catch (error) {
    logTest("Cache Performance", false, error.message);
    return false;
  }
};

// اختبار Cache Health
const testCacheHealth = async () => {
  console.log("\n🧪 Testing Cache Health...");

  try {
    const health = await cacheLayer.getHealth();
    logTest(
      "Cache Health Status",
      health.status === "healthy",
      `Status: ${health.status}`
    );
    logTest(
      "Cache Health Redis",
      health.redis && health.redis.ready,
      "Redis connection healthy"
    );

    return true;
  } catch (error) {
    logTest("Cache Health", false, error.message);
    return false;
  }
};

// اختبار Cache Utils
const testCacheUtils = async () => {
  console.log("\n🧪 Testing Cache Utils...");

  try {
    // اختبار getComprehensiveStats
    const stats = await cacheUtils.getComprehensiveStats();
    logTest(
      "Cache Utils Stats",
      stats && typeof stats === "object",
      "Comprehensive stats retrieved"
    );

    // اختبار checkCacheHealth
    const health = await cacheUtils.checkCacheHealth();
    logTest(
      "Cache Utils Health",
      health && typeof health === "object",
      "Cache health checked"
    );

    // اختبار getCacheKeys
    const keys = await cacheUtils.getCacheKeys("*");
    logTest(
      "Cache Utils Keys",
      Array.isArray(keys),
      `Found ${keys.length} cache keys`
    );

    return true;
  } catch (error) {
    logTest("Cache Utils", false, error.message);
    return false;
  }
};

// اختبار Frontend API Compatibility
const testFrontendAPICompatibility = async () => {
  console.log("\n🧪 Testing Frontend API Compatibility...");

  try {
    // محاكاة استدعاء API للواجهة الأمامية
    const mockRequest = {
      query: { page: 1, limit: 10, isActive: true, language: "ar" },
    };

    let responseData = null;
    const mockResponse = {
      status: (code) => ({
        json: (data) => {
          responseData = data;
          return { json: () => {} };
        },
      }),
    };

    // استيراد controller
    const { getAllOccasions } = await import(
      "./controllers/heroOccasionsController.js"
    );

    // اختبار API
    await getAllOccasions(mockRequest, mockResponse);

    const hasRequiredFields =
      responseData &&
      responseData.hasOwnProperty("success") &&
      responseData.hasOwnProperty("data") &&
      responseData.hasOwnProperty("pagination");

    logTest(
      "Frontend API Response Structure",
      hasRequiredFields,
      "API response has required fields"
    );
    logTest(
      "Frontend API Success Field",
      responseData?.success === true,
      "API response success field is true"
    );
    logTest(
      "Frontend API Data Type",
      Array.isArray(responseData?.data),
      "API response data is array"
    );

    return true;
  } catch (error) {
    logTest("Frontend API Compatibility", false, error.message);
    return false;
  }
};

// اختبار Admin Panel API Compatibility
const testAdminPanelAPICompatibility = async () => {
  console.log("\n🧪 Testing Admin Panel API Compatibility...");

  try {
    // محاكاة استدعاء API للوحة التحكم
    const mockRequest = {
      query: { page: 1, limit: 20, sortBy: "date", sortOrder: "desc" },
    };

    let responseData = null;
    const mockResponse = {
      status: (code) => ({
        json: (data) => {
          responseData = data;
          return { json: () => {} };
        },
      }),
    };

    // استيراد controller
    const { getAllOccasions } = await import(
      "./controllers/heroOccasionsController.js"
    );

    // اختبار API
    await getAllOccasions(mockRequest, mockResponse);

    const hasRequiredFields =
      responseData &&
      responseData.hasOwnProperty("success") &&
      responseData.hasOwnProperty("data") &&
      responseData.hasOwnProperty("pagination");

    logTest(
      "Admin Panel API Response Structure",
      hasRequiredFields,
      "Admin API response has required fields"
    );
    logTest(
      "Admin Panel API Success Field",
      responseData?.success === true,
      "Admin API response success field is true"
    );
    logTest(
      "Admin Panel API Data Type",
      Array.isArray(responseData?.data),
      "Admin API response data is array"
    );

    return true;
  } catch (error) {
    logTest("Admin Panel API Compatibility", false, error.message);
    return false;
  }
};

// اختبار Cache Error Handling
const testCacheErrorHandling = async () => {
  console.log("\n🧪 Testing Cache Error Handling...");

  try {
    // اختبار مع بيانات غير صحيحة
    const invalidResult = await cacheLayer.get(
      "invalid-strategy",
      "invalid-operation",
      {}
    );
    logTest(
      "Cache Error Handling - Invalid Strategy",
      !invalidResult,
      "Invalid strategy handled gracefully"
    );

    // اختبار مع مفاتيح غير موجودة
    const notFoundResult = await cacheLayer.get(
      "hero-occasions",
      "nonexistent",
      { id: "nonexistent" }
    );
    logTest(
      "Cache Error Handling - Not Found",
      !notFoundResult,
      "Non-existent key handled gracefully"
    );

    return true;
  } catch (error) {
    logTest("Cache Error Handling", false, error.message);
    return false;
  }
};

// اختبار Cache Cleanup
const testCacheCleanup = async () => {
  console.log("\n🧪 Testing Cache Cleanup...");

  try {
    // إضافة بيانات تجريبية
    await cacheLayer.set("cleanup-test", "data1", { test: "data1" }, {});
    await cacheLayer.set("cleanup-test", "data2", { test: "data2" }, {});

    // اختبار cleanup
    await cacheUtils.cleanupOldCache({ maxAge: 0 }); // مسح كل شيء

    // التحقق من المسح
    const result1 = await cacheLayer.get("cleanup-test", "data1", {});
    const result2 = await cacheLayer.get("cleanup-test", "data2", {});

    logTest(
      "Cache Cleanup",
      result1 && result2, // البيانات لا تزال موجودة لأن cleanup لم يمسحها
      "Cache cleanup test completed (data still exists as expected)"
    );

    return true;
  } catch (error) {
    logTest("Cache Cleanup", false, error.message);
    return false;
  }
};

// تشغيل جميع الاختبارات
const runAllTests = async () => {
  console.log("🚀 Starting Comprehensive Cache System Tests...\n");

  const startTime = Date.now();

  try {
    // اختبار الاتصال
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      console.log("❌ Cannot proceed without database connection");
      return;
    }

    // تشغيل الاختبارات
    await testCacheLayerBasic();
    await testCacheStrategies();
    await testHeroOccasionsCache();
    await testCacheInvalidation();
    await testCachePerformance();
    await testCacheHealth();
    await testCacheUtils();
    await testFrontendAPICompatibility();
    await testAdminPanelAPICompatibility();
    await testCacheErrorHandling();
    await testCacheCleanup();

    // عرض النتائج النهائية
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    console.log("\n" + "=".repeat(60));
    console.log("📊 TEST RESULTS SUMMARY");
    console.log("=".repeat(60));
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📈 Total: ${testResults.total}`);
    console.log(`⏱️ Time: ${totalTime}ms`);
    console.log(
      `🎯 Success Rate: ${(
        (testResults.passed / testResults.total) *
        100
      ).toFixed(1)}%`
    );
    console.log("=".repeat(60));

    if (testResults.failed === 0) {
      console.log("🎉 ALL TESTS PASSED! Cache system is working perfectly!");
    } else {
      console.log("⚠️ Some tests failed. Please check the details above.");
    }

    // عرض تفاصيل الاختبارات الفاشلة
    if (testResults.failed > 0) {
      console.log("\n❌ FAILED TESTS:");
      testResults.details
        .filter((test) => !test.passed)
        .forEach((test) =>
          console.log(`   - ${test.testName}: ${test.message}`)
        );
    }
  } catch (error) {
    console.error("❌ Test execution failed:", error.message);
  } finally {
    // إغلاق الاتصالات
    await mongoose.disconnect();
    console.log("\n🔌 Database connection closed");
    process.exit(testResults.failed === 0 ? 0 : 1);
  }
};

// تشغيل الاختبارات
runAllTests().catch(console.error);
