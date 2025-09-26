import { verifyToken } from "../config/auth.js";
import Admin from "../models/Admin.js";
import TokenBlacklist from "../models/TokenBlacklist.js";

/**
 * middleware للتحقق من صحة توكن المدير
 */
export const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "توكن المصادقة مطلوب",
      });
    }

    const token = authHeader.substring(7); // إزالة "Bearer " من بداية التوكن

    // التحقق من أن التوكن ليس في القائمة السوداء
    const blacklistedToken = await TokenBlacklist.findOne({ token });
    if (blacklistedToken) {
      return res.status(401).json({
        success: false,
        message: "التوكن غير صالح",
      });
    }

    // التحقق من صحة التوكن
    const decoded = verifyToken(token);

    // البحث عن المدير
    const admin = await Admin.findById(decoded.userId);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "المدير غير موجود",
      });
    }

    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: "حساب المدير غير نشط",
      });
    }

    // إضافة معلومات المدير إلى الطلب
    req.adminId = admin._id;
    req.admin = admin;

    next();
  } catch (error) {
    console.error("Admin authentication error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "توكن غير صالح",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "انتهت صلاحية التوكن",
      });
    }

    res.status(500).json({
      success: false,
      message: "حدث خطأ في المصادقة",
    });
  }
};

/**
 * middleware اختياري للتحقق من المدير (لا يوقف الطلب إذا لم يكن هناك توكن)
 */
export const optionalAdminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    const admin = await Admin.findById(decoded.userId);

    if (admin && admin.isActive) {
      req.adminId = admin._id;
      req.admin = admin;
    }

    next();
  } catch (error) {
    // في حالة الخطأ، نستمر بدون مصادقة
    next();
  }
};
