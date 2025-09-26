import mongoose from "mongoose";
import validator from "validator";
import { hashPassword, verifyPassword } from "../config/auth.js";

const AdminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, "Invalid email format"],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      validate: {
        validator: function (password) {
          // التحقق من قوة كلمة المرور إذا لم تكن مشفرة بعد
          if (!password.startsWith("$2b$")) {
            const strongPassword =
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            return strongPassword.test(password);
          }
          return true;
        },
        message:
          "كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل، حرف كبير، حرف صغير، رقم، ورمز خاص",
      },
    },
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// إضافة virtual للتحقق من الحساب المقفل
AdminSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// تشفير كلمة المرور قبل الحفظ
AdminSchema.pre("save", async function (next) {
  if (this.isModified("password") && !this.password.startsWith("$2b$")) {
    this.password = await hashPassword(this.password);
  }
  next();
});

// مقارنة كلمة المرور
AdminSchema.methods.comparePassword = function (password) {
  return verifyPassword(password, this.password);
};

// إعادة تعيين محاولات الدخول
AdminSchema.methods.resetLoginAttempts = function () {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  return this.save();
};

// زيادة محاولات الدخول
AdminSchema.methods.incLoginAttempts = function () {
  // إذا كان لدينا محاولة سابقة ولم تنته صلاحيتها
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // قفل الحساب بعد 5 محاولات لمدة 30 دقيقة
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 30 * 60 * 1000 }; // 30 minutes
  }

  return this.updateOne(updates);
};

const Admin = mongoose.model("Admin", AdminSchema);
export default Admin;
