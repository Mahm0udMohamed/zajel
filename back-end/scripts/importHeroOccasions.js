import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import HeroOccasion from "../models/HeroOccasion.js";
import Admin from "../models/Admin.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// الاتصال بقاعدة البيانات
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      autoIndex: false,
      family: 4,
      tls: true,
      retryWrites: true,
      w: "majority",
    });
    console.log("✅ تم الاتصال بقاعدة البيانات بنجاح");
  } catch (error) {
    console.error("❌ خطأ في الاتصال بقاعدة البيانات:", error.message);
    process.exit(1);
  }
};

// استيراد البيانات
const importHeroOccasions = async () => {
  try {
    // قراءة ملف JSON
    const jsonPath = path.join(
      __dirname,
      "../../Front-end/src/data/heroOccasions.json"
    );
    const jsonData = fs.readFileSync(jsonPath, "utf8");
    const occasions = JSON.parse(jsonData);

    console.log(`📄 تم قراءة ${occasions.length} مناسبة من الملف`);

    // الحصول على أول أدمن (أو إنشاء واحد افتراضي)
    let admin = await Admin.findOne();
    if (!admin) {
      console.log("⚠️  لم يتم العثور على أدمن، سيتم إنشاء واحد افتراضي");
      admin = new Admin({
        email: "admin@example.com",
        password: "admin123",
        name: "مدير النظام",
        isActive: true,
      });
      await admin.save();
      console.log("✅ تم إنشاء أدمن افتراضي");
    }

    console.log(`👤 سيتم استخدام الأدمن: ${admin.name} (${admin.email})`);

    // حذف البيانات الموجودة (اختياري)
    const existingCount = await HeroOccasion.countDocuments();
    if (existingCount > 0) {
      console.log(`🗑️  تم العثور على ${existingCount} مناسبة موجودة`);
      const { confirm } = await import("readline").then((rl) => {
        const readline = rl.createInterface({
          input: process.stdin,
          output: process.stdout,
        });
        return new Promise((resolve) => {
          readline.question(
            "هل تريد حذف البيانات الموجودة؟ (y/N): ",
            (answer) => {
              readline.close();
              resolve({
                confirm:
                  answer.toLowerCase() === "y" ||
                  answer.toLowerCase() === "yes",
              });
            }
          );
        });
      });

      if (confirm) {
        await HeroOccasion.deleteMany({});
        console.log("✅ تم حذف البيانات الموجودة");
      } else {
        console.log("ℹ️  سيتم إضافة البيانات الجديدة مع الحفاظ على الموجودة");
      }
    }

    // استيراد البيانات
    let importedCount = 0;
    let skippedCount = 0;
    const errors = [];

    for (const occasionData of occasions) {
      try {
        // التحقق من وجود المناسبة
        const existingOccasion = await HeroOccasion.findOne({
          id: occasionData.id,
        });
        if (existingOccasion) {
          console.log(
            `⏭️  تم تخطي المناسبة ${occasionData.id} (موجودة بالفعل)`
          );
          skippedCount++;
          continue;
        }

        // إنشاء المناسبة الجديدة
        const newOccasion = new HeroOccasion({
          ...occasionData,
          date: new Date(occasionData.date),
          createdBy: admin._id,
          updatedBy: admin._id,
        });

        await newOccasion.save();
        console.log(
          `✅ تم استيراد المناسبة: ${occasionData.nameAr} (${occasionData.id})`
        );
        importedCount++;
      } catch (error) {
        console.error(
          `❌ خطأ في استيراد المناسبة ${occasionData.id}:`,
          error.message
        );
        errors.push({
          id: occasionData.id,
          name: occasionData.nameAr,
          error: error.message,
        });
      }
    }

    // عرض النتائج
    console.log("\n📊 ملخص الاستيراد:");
    console.log(`✅ تم استيراد: ${importedCount} مناسبة`);
    console.log(`⏭️  تم تخطي: ${skippedCount} مناسبة`);
    console.log(`❌ أخطاء: ${errors.length} مناسبة`);

    if (errors.length > 0) {
      console.log("\n❌ تفاصيل الأخطاء:");
      errors.forEach((error) => {
        console.log(`  - ${error.name} (${error.id}): ${error.error}`);
      });
    }

    // عرض إحصائيات إضافية
    const totalCount = await HeroOccasion.countDocuments();
    const activeCount = await HeroOccasion.countDocuments({ isActive: true });
    const upcomingCount = await HeroOccasion.countDocuments({
      isActive: true,
      date: { $gte: new Date() },
    });

    console.log("\n📈 إحصائيات قاعدة البيانات:");
    console.log(`📊 إجمالي المناسبات: ${totalCount}`);
    console.log(`🟢 المناسبات النشطة: ${activeCount}`);
    console.log(`📅 المناسبات القادمة: ${upcomingCount}`);

    console.log("\n🎉 تم الانتهاء من الاستيراد بنجاح!");
    console.log("💡 يمكنك الآن استخدام API لإدارة المناسبات");
  } catch (error) {
    console.error("❌ خطأ في استيراد البيانات:", error);
  } finally {
    // إغلاق الاتصال بقاعدة البيانات
    await mongoose.connection.close();
    console.log("🔌 تم إغلاق الاتصال بقاعدة البيانات");
    process.exit(0);
  }
};

// تشغيل الاستيراد
const main = async () => {
  console.log("🚀 بدء عملية استيراد مناسبات الهيرو...");
  await connectDB();
  await importHeroOccasions();
};

main().catch(console.error);
