import mongoose from "mongoose";
import validator from "validator";
import { hashPassword, verifyPassword } from "../config/auth.js";

const UserSchema = new mongoose.Schema(
  {
    googleId: { type: String, unique: true, sparse: true },
    name: { type: String, required: true, minlength: 2, maxlength: 100 },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, "Invalid email format"],
    },
    password: { type: String, required: true },
    username: { type: String, unique: true, trim: true, maxlength: 30 },
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    profilePicture: { type: String, default: "" },
    newEmail: { type: String, unique: true, sparse: true },
    emailVerificationCode: { type: String },
    refreshToken: { type: String },
    emailRequestAttempts: { type: Number, default: 0 },
    lastEmailRequestTime: { type: Date },
    phoneNumber: { type: String, unique: true, sparse: true },
    tempPhoneNumber: { type: String },
    isPhoneVerified: { type: Boolean, default: false },
    phoneVerificationAttempts: { type: Number, default: 0 },
    lastPhoneVerificationTime: { type: Date },
    refreshToken: { type: String }, // Fallback for when Redis is not available
  },
  { timestamps: true }
);

// ... (rest of the existing UserSchema methods remain unchanged)

UserSchema.statics.isValidUsername = async function (username, userId = null) {
  if (username.length < 6)
    throw new Error("Username must be at least 6 characters long.");
  if (username.length > 30)
    throw new Error("Username must be 30 characters or fewer.");
  if (/\s/.test(username))
    throw new Error("Spaces are not allowed in the username.");
  if (!/^[a-zA-Z0-9._-]+$/.test(username))
    throw new Error(
      "Only English letters, numbers, dots (.), and hyphens (-, _) are allowed."
    );
  if (!/[a-zA-Z]/.test(username))
    throw new Error("Username must contain at least two English letters.");
  if (/[^a-zA-Z0-9._-]/.test(username))
    throw new Error("Only English letters are allowed.");
  const existingUser = await this.findOne({ username });
  if (existingUser && (!userId || existingUser._id.toString() !== userId))
    throw new Error("Username is already taken.");
  return true;
};

const arabicToEnglishMap = {
  أ: "a",
  ب: "b",
  ت: "t",
  ث: "th",
  ج: "j",
  ح: "h",
  خ: "kh",
  د: "d",
  ذ: "dh",
  ر: "r",
  ز: "z",
  س: "s",
  ش: "sh",
  ص: "s",
  ض: "d",
  ط: "t",
  ظ: "z",
  ع: "a",
  غ: "gh",
  ف: "f",
  ق: "q",
  ك: "k",
  ل: "l",
  م: "m",
  ن: "n",
  ه: "h",
  و: "w",
  ي: "y",
  ء: "a",
  ئ: "y",
  ؤ: "w",
  ى: "a",
  ة: "h",
};

const transliterateArabic = (text) =>
  text
    .split("")
    .map((char) => arabicToEnglishMap[char] || char)
    .join("");

UserSchema.pre("save", async function (next) {
  if (this.isModified("password") && !this.password.startsWith("$2b$")) {
    this.password = await hashPassword(this.password);
  }
  if (!this.username) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    let nameForUsername = this.name.replace(/\s+/g, "");
    if (/[\u0600-\u06FF]/.test(nameForUsername))
      nameForUsername = transliterateArabic(nameForUsername);
    nameForUsername = nameForUsername.slice(0, 15);
    let generatedUsername = `${nameForUsername}.${randomNum}`;
    while (
      await mongoose.models.User.findOne({ username: generatedUsername })
    ) {
      generatedUsername = `${nameForUsername}.${Math.floor(
        1000 + Math.random() * 9000
      )}`;
    }
    this.username = generatedUsername;
  }
  next();
});

UserSchema.methods.comparePassword = function (password) {
  return verifyPassword(password, this.password);
};

UserSchema.statics.emailExists = function (email) {
  return this.exists({ email: email.toLowerCase() });
};

UserSchema.statics.usernameExists = function (username) {
  return this.exists({ username });
};

/**
 * التحقق من صحة رقم الهاتف
 */
UserSchema.statics.isValidPhoneNumber = function (phoneNumber) {
  // التحقق من الصيغة السعودية فقط
  const phoneRegex = /^\+966[5][0-9]{8}$/;
  if (!phoneRegex.test(phoneNumber)) {
    throw new Error(
      "Phone number must be a valid Saudi number (e.g., +966501234567)"
    );
  }
  return true;
};

/**
 * التحقق من وجود رقم الهاتف
 */
UserSchema.statics.phoneExists = function (phoneNumber) {
  return this.exists({ phoneNumber });
};

const User = mongoose.model("User", UserSchema);
export default User;
