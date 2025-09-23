import { verifyToken } from "../config/auth.js";
import TokenBlacklist from "../models/TokenBlacklist.js";
import rateLimit from "express-rate-limit";

// 🛡️ إعداد معدل الحد من الطلبات لكل IP لمنع هجمات DDoS
const requestLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // ⏳ 10 دقائق
  max: 2000, // الحد الأقصى 2000 طلب لكل IP
  message: "🚫 تم تجاوز الحد الأقصى للطلبات، يرجى المحاولة لاحقًا.",
});

// 🛡️ قائمة `User-Agent` المشبوهة
const blockedUserAgents = [
  "sqlmap",
  "python-requests",
  "curl",
  "wget",
  "nikto",
  "nmap",
  "masscan",
];

// 🔍 التحقق من الأنشطة المشبوهة عبر `User-Agent` و `IP`
const detectSuspiciousActivity = (req) => {
  const userAgent = req.get("User-Agent") || "Unknown";
  const clientIP = req.ip || req.connection.remoteAddress;

  if (
    blockedUserAgents.some((agent) => userAgent.toLowerCase().includes(agent))
  ) {
    return true;
  }

  return false;
};

// 🛡️ Middleware المصادقة
const authMiddleware = async (req, res, next) => {
  try {
    let token =
      req.headers.authorization?.split(" ")[1] || req.cookies?.accessToken;

    console.log("Request Cookies:", req.cookies);
    console.log("Authorization Header:", req.headers.authorization);
    console.log(
      "Extracted Token:",
      token ? token.slice(0, 10) + "..." : "None"
    );

    if (!token) {
      console.log("No token provided in headers or cookies");
      return res
        .status(401)
        .json({ message: "No token provided, access denied." });
    }

    if (detectSuspiciousActivity(req)) {
      console.log("Suspicious activity detected");
      return res
        .status(403)
        .json({ message: "🚫 Suspicious activity detected, access blocked." });
    }

    const isBlacklisted = await TokenBlacklist.exists({ token });
    if (isBlacklisted) {
      console.log("Token is blacklisted");
      return res
        .status(401)
        .json({ message: "Token is invalid (blacklisted)." });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      console.log("Token verification failed");
      return res.status(401).json({ message: "Token is invalid or expired." });
    }

    console.log("Token verified successfully for user:", decoded.userId);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("Error in authMiddleware:", err.message);
    return res.status(401).json({ message: "Token is invalid or expired." });
  }
};

export default authMiddleware;
export { requestLimiter };
