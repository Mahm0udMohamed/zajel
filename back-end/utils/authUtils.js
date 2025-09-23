// utils/authUtils.js
import { hashPassword, verifyPassword } from "../config/auth.js";
import crypto from "crypto";

/**
 * تشفير رمز التحقق
 */
export const hashVerificationCode = async (code) => {
  return await hashPassword(code);
};

/**
 * التحقق من رمز التحقق
 */
export const verifyVerificationCode = async (code, hashedCode) => {
  return await verifyPassword(code, hashedCode);
};

/**
 * توليد رمز تحقق عشوائي
 */
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * توليد رمز تحقق hex عشوائي
 */
export const generateHexVerificationCode = () => {
  return crypto.randomBytes(3).toString("hex");
};

export default {
  hashVerificationCode,
  verifyVerificationCode,
  generateVerificationCode,
  generateHexVerificationCode,
};
