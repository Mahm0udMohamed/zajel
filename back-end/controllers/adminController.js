import Admin from "../models/Admin.js";
import TokenBlacklist from "../models/TokenBlacklist.js";
import { generateAccessToken, generateRefreshToken } from "../config/auth.js";
import { verifyToken } from "../config/auth.js";

/**
 * تسجيل دخول المدير
 */
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // التحقق من البيانات المطلوبة
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "البريد الإلكتروني وكلمة المرور مطلوبان",
      });
    }

    // البحث عن المدير
    const admin = await Admin.findOne({ email: email.toLowerCase() });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "بيانات الدخول غير صحيحة",
      });
    }

    // التحقق من حالة الحساب
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: "حساب المدير غير نشط",
      });
    }

    // التحقق من قفل الحساب
    if (admin.isLocked) {
      return res.status(423).json({
        success: false,
        message:
          "تم قفل الحساب مؤقتاً بسبب محاولات دخول متعددة. حاول مرة أخرى لاحقاً",
      });
    }

    // التحقق من كلمة المرور
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      // زيادة محاولات الدخول
      await admin.incLoginAttempts();

      return res.status(401).json({
        success: false,
        message: "بيانات الدخول غير صحيحة",
      });
    }

    // إعادة تعيين محاولات الدخول عند النجاح
    await admin.resetLoginAttempts();

    // تحديث آخر دخول وتسجيل معلومات الأمان
    admin.lastLogin = new Date();
    await admin.save();

    // تسجيل نشاط تسجيل الدخول للأمان
    console.log(
      `✅ Admin login successful: ${admin.email} from IP: ${
        req.ip || req.connection.remoteAddress
      }`
    );

    // توليد التوكنات
    const accessToken = generateAccessToken(admin._id);
    const refreshToken = generateRefreshToken(admin._id);

    // إرسال الاستجابة
    res.status(200).json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          lastLogin: admin.lastLogin,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في الخادم",
    });
  }
};

/**
 * تحديث توكن الوصول
 */
export const refreshAdminToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token مطلوب",
      });
    }

    // التحقق من صحة التوكن
    const decoded = verifyToken(refreshToken);

    // البحث عن المدير
    const admin = await Admin.findById(decoded.userId);

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: "توكن غير صالح",
      });
    }

    // توليد توكن جديد
    const newAccessToken = generateAccessToken(admin._id);

    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(401).json({
      success: false,
      message: "توكن غير صالح",
    });
  }
};

/**
 * تسجيل خروج المدير
 */
export const adminLogout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);

      try {
        // فك تشفير التوكن للحصول على تاريخ انتهاء الصلاحية
        const decoded = verifyToken(token);
        const expiresAt = new Date(decoded.exp * 1000);

        // إضافة التوكن إلى القائمة السوداء
        await TokenBlacklist.create({
          token: token,
          expiresAt: expiresAt,
        });
      } catch (tokenError) {
        // إذا كان التوكن غير صالح، لا نحتاج لإضافته للقائمة السوداء
        console.log("Token already invalid, skipping blacklist");
      }
    }

    res.status(200).json({
      success: true,
      message: "تم تسجيل الخروج بنجاح",
    });
  } catch (error) {
    console.error("Admin logout error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في الخادم",
    });
  }
};

/**
 * الحصول على معلومات المدير
 */
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId).select("-password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "المدير غير موجود",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          lastLogin: admin.lastLogin,
          createdAt: admin.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Get admin profile error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في الخادم",
    });
  }
};
