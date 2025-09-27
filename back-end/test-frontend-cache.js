// test-frontend-cache.js - اختبار مبسط للواجهة الأمامية
import { cacheLayer } from "./services/cache/index.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

// تحميل متغيرات البيئة
dotenv.config();

// إعدادات الاختبار
const TEST_CONFIG = {
  MONGODB_URI:
    process.env.MONGODB_URI || "mongodb://localhost:27017/zajel_test",
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

// اختبار Frontend API - getAllOccasions
const testFrontendGetAllOccasions = async () => {
  console.log("\n🧪 Testing Frontend API - getAllOccasions...");

  try {
    // استيراد controller
    const { getAllOccasions } = await import(
      "./controllers/heroOccasionsController.js"
    );

    // محاكاة طلب الواجهة الأمامية
    const mockRequest = {
      query: {
        page: 1,
        limit: 10,
        isActive: true,
        language: "ar",
        sortBy: "date",
        sortOrder: "asc",
      },
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

    // اختبار API
    await getAllOccasions(mockRequest, mockResponse);

    // التحقق من النتائج
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
    logTest(
      "Frontend API Pagination",
      responseData?.pagination && typeof responseData.pagination === "object",
      "API response has pagination"
    );

    return true;
  } catch (error) {
    logTest("Frontend API - getAllOccasions", false, error.message);
    return false;
  }
};

// اختبار Frontend API - getActiveOccasions
const testFrontendGetActiveOccasions = async () => {
  console.log("\n🧪 Testing Frontend API - getActiveOccasions...");

  try {
    // استيراد controller
    const { getActiveOccasions } = await import(
      "./controllers/heroOccasionsController.js"
    );

    // محاكاة طلب الواجهة الأمامية
    const mockRequest = {
      query: { limit: 5 },
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

    // اختبار API
    await getActiveOccasions(mockRequest, mockResponse);

    // التحقق من النتائج
    const hasRequiredFields =
      responseData &&
      responseData.hasOwnProperty("success") &&
      responseData.hasOwnProperty("data");

    logTest(
      "Active Occasions API Response Structure",
      hasRequiredFields,
      "API response has required fields"
    );
    logTest(
      "Active Occasions API Success Field",
      responseData?.success === true,
      "API response success field is true"
    );
    logTest(
      "Active Occasions API Data Type",
      Array.isArray(responseData?.data),
      "API response data is array"
    );

    return true;
  } catch (error) {
    logTest("Frontend API - getActiveOccasions", false, error.message);
    return false;
  }
};

// اختبار Frontend API - getUpcomingOccasions
const testFrontendGetUpcomingOccasions = async () => {
  console.log("\n🧪 Testing Frontend API - getUpcomingOccasions...");

  try {
    // استيراد controller
    const { getUpcomingOccasions } = await import(
      "./controllers/heroOccasionsController.js"
    );

    // محاكاة طلب الواجهة الأمامية
    const mockRequest = {
      query: { limit: 3 },
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

    // اختبار API
    await getUpcomingOccasions(mockRequest, mockResponse);

    // التحقق من النتائج
    const hasRequiredFields =
      responseData &&
      responseData.hasOwnProperty("success") &&
      responseData.hasOwnProperty("data");

    logTest(
      "Upcoming Occasions API Response Structure",
      hasRequiredFields,
      "API response has required fields"
    );
    logTest(
      "Upcoming Occasions API Success Field",
      responseData?.success === true,
      "API response success field is true"
    );
    logTest(
      "Upcoming Occasions API Data Type",
      Array.isArray(responseData?.data),
      "API response data is array"
    );

    return true;
  } catch (error) {
    logTest("Frontend API - getUpcomingOccasions", false, error.message);
    return false;
  }
};

// اختبار Frontend API - searchOccasions
const testFrontendSearchOccasions = async () => {
  console.log("\n🧪 Testing Frontend API - searchOccasions...");

  try {
    // استيراد controller
    const { searchOccasions } = await import(
      "./controllers/heroOccasionsController.js"
    );

    // محاكاة طلب الواجهة الأمامية
    const mockRequest = {
      query: {
        q: "test",
        language: "ar",
        limit: 5,
      },
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

    // اختبار API
    await searchOccasions(mockRequest, mockResponse);

    // التحقق من النتائج
    const hasRequiredFields =
      responseData &&
      responseData.hasOwnProperty("success") &&
      responseData.hasOwnProperty("data");

    logTest(
      "Search Occasions API Response Structure",
      hasRequiredFields,
      "API response has required fields"
    );
    logTest(
      "Search Occasions API Success Field",
      responseData?.success === true,
      "API response success field is true"
    );
    logTest(
      "Search Occasions API Data Type",
      Array.isArray(responseData?.data),
      "API response data is array"
    );

    return true;
  } catch (error) {
    logTest("Frontend API - searchOccasions", false, error.message);
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
    const iterations = 5;

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
      setTime < 2000,
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
      getTime < 1000,
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

// تشغيل جميع الاختبارات
const runAllTests = async () => {
  console.log("🚀 Starting Frontend Cache System Tests...\n");

  const startTime = Date.now();

  try {
    // اختبار الاتصال
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      console.log("❌ Cannot proceed without database connection");
      return;
    }

    // انتظار Redis للاتصال
    await sleep(2000);

    // تشغيل الاختبارات
    await testFrontendGetAllOccasions();
    await testFrontendGetActiveOccasions();
    await testFrontendGetUpcomingOccasions();
    await testFrontendSearchOccasions();
    await testCacheInvalidation();
    await testCachePerformance();

    // عرض النتائج النهائية
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    console.log("\n" + "=".repeat(60));
    console.log("📊 FRONTEND CACHE TEST RESULTS");
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
      console.log(
        "🎉 ALL FRONTEND TESTS PASSED! Cache system is working perfectly!"
      );
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
