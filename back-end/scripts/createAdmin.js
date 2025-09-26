import mongoose from "mongoose";
import Admin from "../models/Admin.js";
import connectDB from "../config/db.js";
import dotenv from "dotenv";

dotenv.config();

const createAdmin = async () => {
  try {
    // الاتصال بقاعدة البيانات
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || "مدير النظام";

    if (!adminEmail || !adminPassword) {
      console.error("❌ يجب تعيين ADMIN_EMAIL و ADMIN_PASSWORD في ملف .env");
      process.exit(1);
    }

    // التحقق من وجود المدير
    const existingAdmin = await Admin.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("⚠️  المدير موجود بالفعل:", adminEmail);
      console.log(
        "💡 إذا كنت تريد إعادة تعيين المدير، استخدم: npm run reset-admin"
      );
      process.exit(0);
    }

    // عرض المعلومات قبل الإنشاء
    console.log("📝 سيتم إنشاء مدير بالبيانات التالية:");
    console.log("📧 البريد الإلكتروني:", adminEmail);
    console.log("👤 الاسم:", adminName);
    console.log("🔐 كلمة المرور:", "*".repeat(adminPassword.length));

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
    console.error("❌ خطأ في إنشاء المدير:", error.message);
    process.exit(1);
  }
};

createAdmin();
