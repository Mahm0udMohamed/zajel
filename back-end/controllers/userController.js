import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import TokenBlacklist from "../models/TokenBlacklist.js";
import cloudinary from "../utils/cloudinary.js";
import { verifyPassword, hashPassword } from "../config/auth.js";
import { generateVerificationCode } from "../utils/authUtils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "-password -refreshToken"
    );
    if (!user) return res.status(404).json({ message: "User not found." });
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateUser = async (req, res) => {
  const { name, username, phoneNumber } = req.body;
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (name) user.name = name;
    if (username && username !== user.username) {
      await User.isValidUsername(username);
      user.username = username;
    }
    if (phoneNumber && phoneNumber !== user.phoneNumber) {
      // التحقق من أن الرقم الجديد غير مرتبط بحساب آخر
      try {
        User.isValidPhoneNumber(phoneNumber);
      } catch (error) {
        return res.status(400).json({ message: error.message });
      }
      const existingUser = await User.findOne({ phoneNumber });
      if (existingUser && existingUser._id.toString() !== req.user.userId) {
        return res.status(400).json({
          message: "Phone number is already associated with another account.",
        });
      }
      // إذا كان المستخدم يريد تغيير رقم هاتف موثق، يجب إعادة التحقق
      if (user.isPhoneVerified && user.phoneNumber) {
        user.tempPhoneNumber = phoneNumber;
        user.isPhoneVerified = false;
        user.phoneNumber = undefined;
        await user.save();
        return res.status(200).json({
          message: "Phone number updated. Please verify the new number.",
          requiresVerification: true,
        });
      } else {
        user.tempPhoneNumber = phoneNumber;
      }
    }
    await user.save();
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshToken;
    delete userResponse.tempPhoneNumber;
    res
      .status(200)
      .json({ message: "User updated successfully.", user: userResponse });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const signProfilePictureUpload = async (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder: "profile_pictures" },
      process.env.CLOUDINARY_API_SECRET
    );
    res.status(200).json({ signature, timestamp });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error generating signature", error: err.message });
  }
};

export const uploadProfilePicture = async (req, res) => {
  const { profilePictureUrl } = req.body;

  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.profilePicture && user.profilePicture.startsWith("https://")) {
      const publicId = user.profilePicture.split("/").pop().split(".")[0];
      await cloudinary.uploader
        .destroy(`profile_pictures/${publicId}`)
        .catch((err) => {
          console.error("Error deleting old profile picture:", err);
        });
    } else if (user.profilePicture) {
      const oldImagePath = path.join(__dirname, "../", user.profilePicture);
      if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
    }

    user.profilePicture = profilePictureUrl;
    await user.save();

    res.status(200).json({
      message: "Profile picture uploaded successfully.",
      profilePicture: user.profilePicture,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error uploading profile picture.",
      error: err.message,
    });
  }
};

export const updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found." });
    if (newPassword.length < 6)
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long." });
    const isMatch = await verifyPassword(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "The old password is incorrect." });
    user.password = await hashPassword(newPassword);
    await user.save();
    res.status(200).json({ message: "Password updated successfully." });
  } catch (err) {
    res.status(500).json({
      error: "An unexpected error occurred while updating the password.",
    });
  }
};

export const requestEmailUpdate = async (req, res) => {
  const { newEmail } = req.body;
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (!newEmail || newEmail === user.email)
      return res.status(400).json({ message: "Invalid new email." });
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser)
      return res.status(400).json({ message: "Email is already in use." });
    const attemptDelays = [0, 60, 60, 900, 3600];
    const maxAttempts = attemptDelays.length;
    const now = new Date();
    if (user.lastEmailRequestTime) {
      const lastAttemptTime = new Date(user.lastEmailRequestTime);
      const attempts = user.emailRequestAttempts;
      const delay = attemptDelays[Math.min(attempts, maxAttempts - 1)] * 1000;
      if (now - lastAttemptTime < delay) {
        const remainingTime = Math.ceil(
          (delay - (now - lastAttemptTime)) / 1000
        );
        return res.status(429).json({
          message: `Please wait ${remainingTime} seconds before trying again.`,
        });
      }
    }
    user.emailVerificationCode = generateVerificationCode();
    user.newEmail = newEmail;
    user.emailRequestAttempts = Math.min(
      user.emailRequestAttempts + 1,
      maxAttempts
    );
    user.lastEmailRequestTime = now;
    await user.save();
    await sendEmail({
      to: newEmail,
      subject: "🔄 Email Update",
      type: "emailUpdate",
      data: { code: user.emailVerificationCode },
    });
    res.status(200).json({
      message: "The verification code has been sent to the new email.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const verifyEmailUpdate = async (req, res) => {
  const { verificationCode, password } = req.body;
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (!user.newEmail)
      return res.status(400).json({ message: "No email update requested." });
    if (user.emailVerificationCode !== verificationCode)
      return res.status(400).json({ message: "Invalid verification code." });
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid)
      return res.status(400).json({ message: "Incorrect password." });
    user.email = user.newEmail;
    user.newEmail = undefined;
    user.emailVerificationCode = undefined;
    await user.save();
    res.status(200).json({ message: "Email updated successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { password, confirmation } = req.body;

    if (confirmation !== "DELETE")
      return res
        .status(400)
        .json({ message: "You must type 'DELETE' to confirm." });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ message: "Incorrect password." });

    // Delete profile picture from Cloudinary if exists
    if (user.profilePicture && user.profilePicture.startsWith("https://")) {
      try {
        const publicId = user.profilePicture.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`profile_pictures/${publicId}`);
      } catch (cloudinaryError) {
        console.error(
          "Error deleting profile picture:",
          cloudinaryError.message
        );
      }
    }

    // Delete associated tokens
    await TokenBlacklist.deleteMany({ token: user.refreshToken });

    // Delete the user
    await user.deleteOne();

    // Clear cookies
    Object.keys(req.cookies).forEach((cookieName) => {
      res.clearCookie(cookieName, {
        expires: new Date(0),
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
      });
    });

    res.setHeader("Set-Cookie", [
      "sessionToken=; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
      "refreshToken=; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    ]);

    await sendEmail({
      to: user.email,
      subject: "Account Deletion",
      type: "default",
      data: {
        text: "Your account has been permanently deleted from the system as requested.",
      },
    });

    res.status(200).json({
      message:
        "Account and all associated data have been successfully deleted.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
