import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import https from "https";
import fs from "fs";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import favoritesRoutes from "./routes/favoritesRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import passport from "./config/passport.js";
import { printServiceStatus } from "./utils/serviceChecker.js";
import Admin from "./models/Admin.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

// ⚙️ Middleware خاص بالبوتات
app.use((req, res, next) => {
  const userAgent = req.headers["user-agent"] || "";
  if (userAgent.includes("Lighthouse") || userAgent.includes("Googlebot")) {
    return next();
  }
  next();
});

app.set("trust proxy", 1);
connectDB();

// 🔧 إنشاء الأدمن تلقائياً عند بدء السيرفر
const createAdminIfNotExists = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || "مدير النظام";

    if (!adminEmail || !adminPassword) {
      console.warn(
        "⚠️  تحذير: لم يتم تعيين ADMIN_EMAIL أو ADMIN_PASSWORD في ملف .env"
      );
      console.warn(
        "💡 لن يتم إنشاء مدير تلقائياً. يرجى تعيين هذه المتغيرات في ملف .env"
      );
      return;
    }

    // التحقق من وجود المدير
    const existingAdmin = await Admin.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("✅ المدير موجود بالفعل:", adminEmail);
      return;
    }

    // إنشاء المدير الجديد
    const admin = new Admin({
      email: adminEmail,
      password: adminPassword,
      name: adminName,
      isActive: true,
    });

    await admin.save();

    console.log("🎉 تم إنشاء المدير تلقائياً:");
    console.log("📧 البريد الإلكتروني:", adminEmail);
    console.log("👤 الاسم:", adminName);
    console.log("🔐 كلمة المرور:", "*".repeat(adminPassword.length));
    console.log("🚀 يمكنك الآن تسجيل الدخول إلى لوحة التحكم");
  } catch (error) {
    console.error("❌ خطأ في إنشاء المدير تلقائياً:", error.message);
  }
};

// تشغيل إنشاء الأدمن بعد الاتصال بقاعدة البيانات
setTimeout(createAdminIfNotExists, 2000); // انتظار 2 ثانية للتأكد من الاتصال بقاعدة البيانات

app.use(cookieParser());

const allowedOrigins = [
  "https://medrxhelper.netlify.app",
  "http://localhost:3001",
  "http://localhost:3000",
  "https://localhost:3002",
  "http://localhost:5173",
  "https://localhost:3002",
  "https://localhost:5173",
  "https://appzajel1.netlify.app",
  "https://localhost:5174",
  "https://localhost:5173",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("🚫 Access from this source is not allowed"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// إعداد Helmet للأمان
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req) => (req.user ? 10000 : 1000),
  message: "🚨 The maximum request limit has been exceeded, try again later.",
});
app.use(limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// إعداد session middleware لـ Passport (مطلوب لـ Google OAuth)
import session from "express-session";

app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // true للإنتاج، false للتطوير المحلي
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// 🧭 Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/admin", adminRoutes);

// ✅ إنشاء السيرفر باستخدام HTTPS للتطوير المحلي
const PORT = process.env.PORT || 3002;

// قراءة شهادات SSL
const sslOptions = {
  key: fs.readFileSync("./ssl/localhost-key.pem"),
  cert: fs.readFileSync("./ssl/localhost-cert.pem"),
};

// إنشاء HTTPS server
const server = https.createServer(sslOptions, app);

// 🚀 تشغيل السيرفر
server.listen(PORT, () => {
  console.log(`🚀 HTTPS Server running on https://localhost:${PORT}`);
  printServiceStatus();
});
