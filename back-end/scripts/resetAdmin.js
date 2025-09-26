import mongoose from "mongoose";
import Admin from "../models/Admin.js";
import connectDB from "../config/db.js";
import dotenv from "dotenv";

dotenv.config();

const resetAdmin = async () => {
  try {
    // الاتصال بقاعدة البيانات
    await connectDB();

    // تحذير أمني - التأكد من الرغبة في الحذف
    console.log("⚠️  تحذير: هذا السكريبت سيحذف جميع المديرين الموجودين!");

    // التحقق من وجود متغير بيئة للتأكيد
    if (process.env.CONFIRM_RESET !== "YES") {
      console.log("❌ لتشغيل هذا السكريبت، أضف CONFIRM_RESET=YES إلى ملف .env");
      console.log("💡 أو استخدم: CONFIRM_RESET=YES node scripts/resetAdmin.js");
      process.exit(1);
    }

    console.log("🗑️  حذف مجموعة المديرين...");
    await Admin.collection.drop();
    console.log("✅ تم حذف مجموعة المديرين بنجاح");

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || "مدير النظام";

    if (!adminEmail || !adminPassword) {
      console.error("❌ يجب تعيين ADMIN_EMAIL و ADMIN_PASSWORD في ملف .env");
      process.exit(1);
    }

    console.log("👤 إنشاء المدير الجديد...");
    // إنشاء المدير الجديد
    const admin = new Admin({
      email: adminEmail,
      password: adminPassword,
      name: adminName,
      isActive: true,
    });

    await admin.save();

    console.log("✅ تم إنشاء المدير بنجاح:");
    console.log("📧 البريد الإلكتروني:", adminEmail);
    console.log("👤 الاسم:", adminName);
    console.log("🔐 كلمة المرور:", adminPassword);
    console.log("\n🚀 يمكنك الآن تسجيل الدخول إلى لوحة التحكم");

    process.exit(0);
  } catch (error) {
    console.error("❌ خطأ في إعادة تعيين المدير:", error.message);
    process.exit(1);
  }
};

resetAdmin();
