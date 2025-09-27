// test-admin-cache.js - اختبار لوحة التحكم
import { cacheLayer } from "./services/cache/index.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "./models/Admin.js";

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

// اختبار Admin API - getAllOccasions
const testAdminGetAllOccasions = async () => {
  console.log("\n🧪 Testing Admin API - getAllOccasions...");

  try {
    // استيراد controller
    const { getAllOccasions } = await import(
      "./controllers/heroOccasionsController.js"
    );

    // محاكاة طلب لوحة التحكم
    const mockRequest = {
      query: {
        page: 1,
        limit: 20,
        sortBy: "date",
        sortOrder: "desc",
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
      "Admin API Response Structure",
      hasRequiredFields,
      "API response has required fields"
    );
    logTest(
      "Admin API Success Field",
      responseData?.success === true,
      "API response success field is true"
    );
    logTest(
      "Admin API Data Type",
      Array.isArray(responseData?.data),
      "API response data is array"
    );
    logTest(
      "Admin API Pagination",
      responseData?.pagination && typeof responseData.pagination === "object",
      "API response has pagination"
    );

    return true;
  } catch (error) {
    logTest("Admin API - getAllOccasions", false, error.message);
    return false;
  }
};

// اختبار Admin API - createOccasion
const testAdminCreateOccasion = async () => {
  console.log("\n🧪 Testing Admin API - createOccasion...");

  try {
    // إنشاء Admin تجريبي
    const testAdmin = new Admin({
      name: "Test Admin",
      email: "test@admin.com",
      password: "TestPassword123!",
      role: "admin",
    });
    await testAdmin.save();

    // استيراد controller
    const { createOccasion } = await import(
      "./controllers/heroOccasionsController.js"
    );

    // محاكاة طلب إنشاء مناسبة
    const mockRequest = {
      body: {
        nameAr: "مناسبة تجريبية",
        nameEn: "Test Occasion",
        celebratoryMessageAr: "رسالة تهنئة بالعربية",
        celebratoryMessageEn: "Celebratory message in English",
        date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        isActive: true,
        images: ["https://example.com/test-image.jpg"],
      },
      adminId: testAdmin._id,
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
    await createOccasion(mockRequest, mockResponse);

    // التحقق من النتائج
    const hasRequiredFields =
      responseData &&
      responseData.hasOwnProperty("success") &&
      responseData.hasOwnProperty("message") &&
      responseData.hasOwnProperty("data");

    logTest(
      "Create Occasion API Response Structure",
      hasRequiredFields,
      "API response has required fields"
    );
    logTest(
      "Create Occasion API Success Field",
      responseData?.success === true,
      "API response success field is true"
    );
    logTest(
      "Create Occasion API Message",
      responseData?.message && responseData.message.includes("تم إنشاء"),
      "API response has success message"
    );

    // تنظيف Admin التجريبي
    await Admin.findByIdAndDelete(testAdmin._id);

    return true;
  } catch (error) {
    logTest("Admin API - createOccasion", false, error.message);
    return false;
  }
};

// اختبار Admin API - updateOccasion
const testAdminUpdateOccasion = async () => {
  console.log("\n🧪 Testing Admin API - updateOccasion...");

  try {
    // استيراد controller
    const { updateOccasion } = await import(
      "./controllers/heroOccasionsController.js"
    );

    // محاكاة طلب تحديث مناسبة
    const mockRequest = {
      params: { id: "507f1f77bcf86cd799439011" },
      body: {
        nameAr: "مناسبة محدثة",
        nameEn: "Updated Occasion",
        celebratoryMessageAr: "رسالة تهنئة محدثة",
        celebratoryMessageEn: "Updated celebratory message",
      },
      adminId: new mongoose.Types.ObjectId(),
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
    await updateOccasion(mockRequest, mockResponse);

    // التحقق من النتائج
    const hasRequiredFields =
      responseData &&
      responseData.hasOwnProperty("success") &&
      responseData.hasOwnProperty("message");

    logTest(
      "Update Occasion API Response Structure",
      hasRequiredFields,
      "API response has required fields"
    );
    logTest(
      "Update Occasion API Success Field",
      responseData?.success === false, // يتوقع false لأن المناسبة غير موجودة
      "API response success field is false (expected for non-existent occasion)"
    );

    return true;
  } catch (error) {
    logTest("Admin API - updateOccasion", false, error.message);
    return false;
  }
};

// اختبار Admin API - deleteOccasion
const testAdminDeleteOccasion = async () => {
  console.log("\n🧪 Testing Admin API - deleteOccasion...");

  try {
    // استيراد controller
    const { deleteOccasion } = await import(
      "./controllers/heroOccasionsController.js"
    );

    // محاكاة طلب حذف مناسبة
    const mockRequest = {
      params: { id: "507f1f77bcf86cd799439011" },
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
    await deleteOccasion(mockRequest, mockResponse);

    // التحقق من النتائج
    const hasRequiredFields =
      responseData &&
      responseData.hasOwnProperty("success") &&
      responseData.hasOwnProperty("message");

    logTest(
      "Delete Occasion API Response Structure",
      hasRequiredFields,
      "API response has required fields"
    );
    logTest(
      "Delete Occasion API Success Field",
      responseData?.success === false, // يتوقع false لأن المناسبة غير موجودة
      "API response success field is false (expected for non-existent occasion)"
    );

    return true;
  } catch (error) {
    logTest("Admin API - deleteOccasion", false, error.message);
    return false;
  }
};

// اختبار Admin API - toggleOccasionStatus
const testAdminToggleOccasionStatus = async () => {
  console.log("\n🧪 Testing Admin API - toggleOccasionStatus...");

  try {
    // استيراد controller
    const { toggleOccasionStatus } = await import(
      "./controllers/heroOccasionsController.js"
    );

    // محاكاة طلب تبديل حالة المناسبة
    const mockRequest = {
      params: { id: "507f1f77bcf86cd799439011" },
      adminId: new mongoose.Types.ObjectId(),
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
    await toggleOccasionStatus(mockRequest, mockResponse);

    // التحقق من النتائج
    const hasRequiredFields =
      responseData &&
      responseData.hasOwnProperty("success") &&
      responseData.hasOwnProperty("message");

    logTest(
      "Toggle Status API Response Structure",
      hasRequiredFields,
      "API response has required fields"
    );
    logTest(
      "Toggle Status API Success Field",
      responseData?.success === false, // يتوقع false لأن المناسبة غير موجودة
      "API response success field is false (expected for non-existent occasion)"
    );

    return true;
  } catch (error) {
    logTest("Admin API - toggleOccasionStatus", false, error.message);
    return false;
  }
};

// اختبار Cache Invalidation بعد العمليات
const testCacheInvalidationAfterOperations = async () => {
  console.log("\n🧪 Testing Cache Invalidation After Operations...");

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

    // محاكاة مسح الكاش بعد عملية تحديث
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
      "Cache Invalidation After Update - All",
      allCleared,
      `All occasions cache cleared after update (result: ${
        allResult ? "exists" : "cleared"
      })`
    );
    logTest(
      "Cache Invalidation After Update - Active",
      !activeResult,
      "Active occasions cache cleared after update"
    );
    logTest(
      "Cache Invalidation After Update - Upcoming",
      !upcomingResult,
      "Upcoming occasions cache cleared after update"
    );

    return true;
  } catch (error) {
    logTest("Cache Invalidation After Operations", false, error.message);
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
  console.log("🚀 Starting Admin Panel Cache System Tests...\n");

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
    await testAdminGetAllOccasions();
    await testAdminCreateOccasion();
    await testAdminUpdateOccasion();
    await testAdminDeleteOccasion();
    await testAdminToggleOccasionStatus();
    await testCacheInvalidationAfterOperations();
    await testCachePerformance();

    // عرض النتائج النهائية
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    console.log("\n" + "=".repeat(60));
    console.log("📊 ADMIN PANEL CACHE TEST RESULTS");
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
        "🎉 ALL ADMIN PANEL TESTS PASSED! Cache system is working perfectly!"
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
