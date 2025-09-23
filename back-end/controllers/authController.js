// controllers/authController.js
import User from "../models/User.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
  verifyPassword,
  publicKey,
} from "../config/auth.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { verifyCaptcha } from "../utils/captchaUtils.js";
import redis from "../config/redisClient.js";
import passport from "../config/passport.js"; // استيراد Passport
import { sendOTP, verifyOTP, isTwilioConfigured } from "../config/twilio.js";
import {
  hashVerificationCode,
  verifyVerificationCode,
  generateVerificationCode,
  generateHexVerificationCode,
} from "../utils/authUtils.js";
dotenv.config();

// تهيئة تسجيل الدخول بـ Google
export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"], // نطاق البيانات المطلوبة من Google
});

// رد الاتصال بعد المصادقة مع Google
export const googleAuthCallback = async (req, res) => {
  try {
    // التحقق من وجود المستخدم في req.user
    if (!req.user) {
      console.error("No user found in request after Google authentication");
      return res.redirect(
        `${process.env.FRONTEND_URL}/auth/login?error=authentication_failed`
      );
    }

    const user = req.user;
    console.log("Google OAuth user:", user._id);

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // تخزين refreshToken في Redis مع fallback
    try {
      await redis.set(
        `refreshToken:${user._id}`,
        refreshToken,
        "EX",
        30 * 24 * 60 * 60
      );
      console.log("Refresh token stored in Redis successfully");
    } catch (redisError) {
      console.warn(
        "Redis not available, storing refresh token in user document"
      );
      // Fallback: store in user document
      user.refreshToken = refreshToken;
      await user.save();
    }

    // إعداد الكوكيز
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    console.log("Redirecting to frontend with access token");
    // إعادة التوجيه إلى الواجهة الأمامية مع الـ accessToken
    res.redirect(
      `${process.env.FRONTEND_URL}/auth/google/callback?accessToken=${accessToken}`
    );
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=server_error`);
  }
};

// نقطة نهاية ping للتحقق من حالة الخادم
export const ping = async (req, res) => {
  try {
    res.status(200).json({ message: "Server is awake" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
};

export const signup = async (req, res) => {
  const { name, email, password, captchaToken } = req.body;
  if (!(await verifyCaptcha(captchaToken))) {
    return res.status(400).json({ message: " CAPTCHA verification failed." });
  }
  try {
    const verificationCode = generateHexVerificationCode();
    const user = new User({
      name,
      email,
      password,
      verificationCode: await hashVerificationCode(verificationCode),
    });
    await user.save();
    await sendEmail({
      to: email,
      subject: " Email Confirmation",
      type: "emailConfirmation",
      data: { code: verificationCode },
    });

    res.status(201).json({
      message: "📩 Account created. Please check your email to verify.",
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password, captchaToken } = req.body;
  if (!(await verifyCaptcha(captchaToken))) {
    return res.status(400).json({ message: " CAPTCHA verification failed." });
  }
  try {
    const user = await User.findOne({ email });
    if (!user || !(await verifyPassword(password, user.password))) {
      return res.status(400).json({ message: " Invalid login credentials." });
    }
    if (!user.isVerified) {
      return res.status(403).json({ message: "⚠️ Account not verified." });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // تخزين refreshToken مع fallback
    try {
      await redis.set(
        `refreshToken:${user._id}`,
        refreshToken,
        "EX",
        30 * 24 * 60 * 60
      );
    } catch (redisError) {
      console.warn(
        "Redis not available, storing refresh token in user document"
      );
      user.refreshToken = refreshToken;
      await user.save();
    }

    res.cookie("refreshToken", refreshToken, {
      httpOnly: !0,
      secure: !0,
      sameSite: "None",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ accessToken });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { email, verificationCode } = req.body;
  try {
    const user = await User.findOne({ email });
    if (
      !user ||
      !(await verifyVerificationCode(verificationCode, user.verificationCode))
    ) {
      return res.status(400).json({ message: " Invalid verification code." });
    }
    user.isVerified = !0;
    user.verificationCode = undefined;
    await user.save();
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // تخزين refreshToken مع fallback
    try {
      await redis.set(
        `refreshToken:${user._id}`,
        refreshToken,
        "EX",
        30 * 24 * 60 * 60
      );
    } catch (redisError) {
      console.warn(
        "Redis not available, storing refresh token in user document"
      );
      user.refreshToken = refreshToken;
      await user.save();
    }

    res.cookie("refreshToken", refreshToken, {
      httpOnly: !0,
      secure: !0,
      sameSite: "None",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      message:
        " Email successfully verified. Please add your phone number to complete registration.",
      accessToken,
      requiresPhoneSetup: !user.isPhoneVerified,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
export const requestPasswordReset = async (req, res) => {
  const { email, captchaToken } = req.body;
  try {
    // Verify CAPTCHA if provided
    if (captchaToken && captchaToken !== "dummy-captcha-token") {
      if (!(await verifyCaptcha(captchaToken))) {
        return res
          .status(400)
          .json({ message: " CAPTCHA verification failed." });
      }
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: " User not found." });
    }

    const resetToken = generateAccessToken(user._id);

    // Try to store in Redis with proper error handling
    try {
      await redis.set(`resetPassword:${user._id}`, resetToken, "EX", 10 * 60);
    } catch (redisError) {
      console.warn(
        "Redis not available for password reset:",
        redisError.message
      );
      // If Redis is not available, we can still proceed by storing temporarily in user document
      // or skip Redis storage and rely on token verification only
    }

    const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
    await sendEmail({
      to: email,
      subject: "🔒 Password Reset",
      type: "passwordReset",
      data: { resetLink },
    });

    res.status(200).json({ message: " Reset link sent successfully." });
  } catch (err) {
    console.error("Password reset error:", err);
    res.status(400).json({ message: err.message });
  }
};
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const userId = jwt.decode(token)?.userId;
    const storedToken = await redis.get(`resetPassword:${userId}`);
    if (!storedToken || storedToken !== token) {
      return res
        .status(400)
        .json({ message: " The link is invalid or has expired." });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: " User not found." });
    }
    user.password = await hashPassword(newPassword);
    await user.save();
    await redis.del(`resetPassword:${userId}`);
    res.status(200).json({ message: " Password changed successfully." });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({ message: "⚠️ No Refresh Token found." });
    }
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, publicKey, { algorithms: ["RS256"] });
    } catch (err) {
      return res.status(401).json({ message: " Invalid Refresh Token." });
    }

    // حذف الـ refresh token مع fallback
    try {
      await redis.del(`refreshToken:${decoded.userId}`);
    } catch (redisError) {
      console.warn(
        "Redis not available, clearing refresh token from user document"
      );
      const user = await User.findById(decoded.userId);
      if (user) {
        user.refreshToken = undefined;
        await user.save();
      }
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
    return res.status(200).json({ message: " Logged out successfully!" });
  } catch (err) {
    return res.status(500).json({ message: " Internal server error." });
  }
};

export const resendCode = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }
    const verificationCode = generateVerificationCode();
    user.verificationCode = await hashVerificationCode(verificationCode);
    await user.save();
    await sendEmail({
      to: email,
      subject: "📧 Email Verification",
      type: "emailVerification",
      data: { code: verificationCode },
    });

    res.status(200).json({ message: "Verification code resent." });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    console.log("Refresh Token received:", refreshToken ? "Yes" : "No");
    if (!refreshToken) {
      console.log("No refresh token found in cookies");
      return res.status(400).json({ message: "⚠️ Refresh Token is required." });
    }
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, publicKey, { algorithms: ["RS256"] });
    } catch (err) {
      console.log("Refresh Token verification failed:", err.message);
      return res
        .status(401)
        .json({ message: "Invalid or expired Refresh Token." });
    }

    // التحقق من الـ refresh token مع fallback
    let storedToken = null;
    try {
      storedToken = await redis.get(`refreshToken:${decoded.userId}`);
    } catch (redisError) {
      console.warn("Redis not available, checking user document");
      const user = await User.findById(decoded.userId);
      storedToken = user?.refreshToken;
    }

    if (!storedToken || storedToken !== refreshToken) {
      console.log("Stored token mismatch or not found");
      return res
        .status(401)
        .json({ message: "Invalid or expired Refresh Token." });
    }

    const newAccessToken = generateAccessToken(decoded.userId);
    const newRefreshToken = generateRefreshToken(decoded.userId);

    // تخزين الـ refresh token الجديد مع fallback
    try {
      await redis.set(
        `refreshToken:${decoded.userId}`,
        newRefreshToken,
        "EX",
        30 * 24 * 60 * 60
      );
    } catch (redisError) {
      console.warn(
        "Redis not available, storing refresh token in user document"
      );
      const user = await User.findById(decoded.userId);
      if (user) {
        user.refreshToken = newRefreshToken;
        await user.save();
      }
    }

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    console.log("Refresh Token updated successfully");
    return res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    console.log("Error in refreshAccessToken:", err.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// إرسال رمز التحقق للهاتف أثناء التسجيل
export const sendPhoneVerification = async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    // التحقق من إعدادات Twilio
    if (!isTwilioConfigured()) {
      return res.status(503).json({
        message:
          "Phone verification service is currently unavailable. Please contact support.",
      });
    }

    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // السماح بإعادة التحقق إذا لم يكن الهاتف موثقاً
    // if (user.isPhoneVerified) {
    //   return res
    //     .status(400)
    //     .json({ message: "Phone number already verified." });
    // }

    // التحقق من صحة رقم الهاتف
    try {
      User.isValidPhoneNumber(phoneNumber);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

    // التحقق من عدم ارتباط الرقم بحساب آخر
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser && existingUser._id.toString() !== userId) {
      return res.status(400).json({
        message: "Phone number is already associated with another account.",
      });
    }

    // تطبيق معدل المحاولات
    const attemptDelays = [0, 60, 120, 300, 900]; // بالثواني
    const maxAttempts = attemptDelays.length;
    const now = new Date();

    if (user.lastPhoneVerificationTime) {
      const lastAttemptTime = new Date(user.lastPhoneVerificationTime);
      const attempts = user.phoneVerificationAttempts;
      const delay = attemptDelays[Math.min(attempts, maxAttempts - 1)] * 1000;

      if (now - lastAttemptTime < delay) {
        const remainingTime = Math.ceil(
          (delay - (now - lastAttemptTime)) / 1000
        );
        return res.status(429).json({
          message: `Please wait ${remainingTime} seconds before requesting another code.`,
        });
      }
    }

    // إرسال رمز OTP
    const otpResult = await sendOTP(phoneNumber);

    if (!otpResult.success) {
      return res
        .status(500)
        .json({ message: "Failed to send verification code." });
    }

    // تحديث بيانات المستخدم
    user.tempPhoneNumber = phoneNumber;
    user.phoneVerificationAttempts = Math.min(
      user.phoneVerificationAttempts + 1,
      maxAttempts
    );
    user.lastPhoneVerificationTime = now;
    await user.save();

    res.status(200).json({
      message: "Verification code sent successfully.",
      phoneNumber: phoneNumber.replace(/(\+\d{1,3})\d+(\d{4})/, "$1****$2"), // إخفاء جزء من الرقم
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// التحقق من رمز الهاتف أثناء التسجيل
export const verifyPhoneNumber = async (req, res) => {
  const { code } = req.body;

  try {
    // التحقق من إعدادات Twilio
    if (!isTwilioConfigured()) {
      return res.status(503).json({
        message:
          "Phone verification service is currently unavailable. Please contact support.",
      });
    }

    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.tempPhoneNumber) {
      return res
        .status(400)
        .json({ message: "No phone verification in progress." });
    }

    if (user.isPhoneVerified) {
      return res
        .status(400)
        .json({ message: "Phone number already verified." });
    }

    // التحقق من رمز OTP
    const verificationResult = await verifyOTP(user.tempPhoneNumber, code);

    if (!verificationResult.success) {
      return res.status(400).json({
        message: "Invalid or expired verification code.",
        status: verificationResult.status,
      });
    }

    // تأكيد التحقق وحفظ الرقم نهائياً
    user.phoneNumber = user.tempPhoneNumber;
    user.tempPhoneNumber = undefined;
    user.isPhoneVerified = true;
    user.phoneVerificationAttempts = 0;
    user.lastPhoneVerificationTime = undefined;
    await user.save();

    res.status(200).json({
      message: "Phone number verified successfully.",
      phoneNumber: user.phoneNumber.replace(
        /(\+\d{1,3})\d+(\d{4})/,
        "$1****$2"
      ),
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// تسجيل الدخول برقم الهاتف - إرسال OTP
export const loginWithPhone = async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    // التحقق من إعدادات Twilio
    if (!isTwilioConfigured()) {
      return res.status(503).json({
        message:
          "Phone login service is currently unavailable. Please use email login instead.",
      });
    }

    // التحقق من صحة رقم الهاتف
    try {
      User.isValidPhoneNumber(phoneNumber);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

    // البحث عن المستخدم
    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return res
        .status(404)
        .json({ message: "No account found with this phone number." });
    }

    if (!user.isPhoneVerified) {
      return res.status(400).json({ message: "Phone number is not verified." });
    }

    // إرسال رمز OTP
    const otpResult = await sendOTP(phoneNumber);

    if (!otpResult.success) {
      return res
        .status(500)
        .json({ message: "Failed to send verification code." });
    }

    res.status(200).json({
      message: "Verification code sent successfully.",
      phoneNumber: phoneNumber.replace(/(\+\d{1,3})\d+(\d{4})/, "$1****$2"),
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// تسجيل الدخول برقم الهاتف - التحقق من OTP
export const verifyPhoneLogin = async (req, res) => {
  const { phoneNumber, code } = req.body;

  try {
    // التحقق من إعدادات Twilio
    if (!isTwilioConfigured()) {
      return res.status(503).json({
        message:
          "Phone verification service is currently unavailable. Please contact support.",
      });
    }

    // التحقق من صحة رقم الهاتف
    try {
      User.isValidPhoneNumber(phoneNumber);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

    // البحث عن المستخدم
    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return res
        .status(404)
        .json({ message: "No account found with this phone number." });
    }

    if (!user.isPhoneVerified) {
      return res.status(400).json({ message: "Phone number is not verified." });
    }

    // التحقق من رمز OTP
    const verificationResult = await verifyOTP(phoneNumber, code);

    if (!verificationResult.success) {
      return res.status(400).json({
        message: "Invalid or expired verification code.",
        status: verificationResult.status,
      });
    }

    // إنشاء التوكنز وتسجيل الدخول
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // تخزين refreshToken مع fallback
    try {
      await redis.set(
        `refreshToken:${user._id}`,
        refreshToken,
        "EX",
        30 * 24 * 60 * 60
      );
    } catch (redisError) {
      console.warn(
        "Redis not available, storing refresh token in user document"
      );
      user.refreshToken = refreshToken;
      await user.save();
    }

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful.",
      accessToken,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const checkUsername = async (req, res) => {
  try {
    const { username, userId } = req.query;

    await User.isValidUsername(username);
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      if (existingUser._id.toString() === String(userId)) {
        return res.status(200).json({
          available: true,
          message: " Username is available for you.",
        });
      }
      return res
        .status(200)
        .json({ available: false, message: " Username is already taken." });
    }
    return res
      .status(200)
      .json({ available: true, message: " Username is available." });
  } catch (error) {
    return res.status(error.status || 500).json({
      available: false,
      message: ` ${error.message || "Internal server error."}`,
    });
  }
};
