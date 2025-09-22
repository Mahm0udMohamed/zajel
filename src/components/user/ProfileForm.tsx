import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Camera,
  Save,
  Edit3,
  Check,
  X,
  UserCheck,
} from "lucide-react";
import { useUser } from "../../context/UserContext";
import { useAuth } from "../../context/AuthContext";

const ProfileForm: React.FC = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const { profile, updateProfile, uploadProfilePicture, isLoading } = useUser();
  const { sendPhoneVerification } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: profile?.name || "",
    username: profile?.username || "",
    phoneNumber: profile?.phoneNumber || "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Profile update error:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(
        isRtl
          ? "حجم الملف كبير جداً (الحد الأقصى 5 ميجابايت)"
          : "File size too large (max 5MB)"
      );
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert(
        isRtl ? "يرجى اختيار ملف صورة صالح" : "Please select a valid image file"
      );
      return;
    }

    setUploadingImage(true);
    try {
      await uploadProfilePicture(file);
    } catch (error) {
      console.error("Image upload error:", error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePhoneVerification = async () => {
    if (!formData.phoneNumber) return;

    try {
      await sendPhoneVerification(formData.phoneNumber);
    } catch (error) {
      console.error("Phone verification error:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          {isRtl ? "الملف الشخصي" : "Profile Information"}
        </h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            isEditing
              ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
              : "bg-purple-500 text-white hover:bg-purple-600"
          }`}
        >
          {isEditing ? <X size={18} /> : <Edit3 size={18} />}
          <span>
            {isEditing
              ? isRtl
                ? "إلغاء"
                : "Cancel"
              : isRtl
              ? "تعديل"
              : "Edit"}
          </span>
        </button>
      </div>

      {/* Profile Picture */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 p-1">
            <div className="w-full h-full rounded-full overflow-hidden bg-white">
              {profile?.profilePicture ? (
                <img
                  src={profile.profilePicture}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <User size={48} className="text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="absolute bottom-0 right-0 w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center hover:bg-purple-600 transition-all shadow-lg"
            >
              {uploadingImage ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera size={18} />
              )}
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        <h3 className="text-xl font-bold text-gray-800 mt-4">
          {profile?.name}
        </h3>
        <p className="text-gray-600">@{profile?.username}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User size={16} className="inline mr-2 rtl:ml-2 rtl:mr-0" />
            {isRtl ? "الاسم الكامل" : "Full Name"}
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={!isEditing}
            className={`w-full px-4 py-3 border rounded-xl transition-all ${
              isEditing
                ? "border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                : "border-gray-200 bg-gray-50 cursor-not-allowed"
            }`}
            placeholder={isRtl ? "أدخل اسمك الكامل" : "Enter your full name"}
          />
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <UserCheck size={16} className="inline mr-2 rtl:ml-2 rtl:mr-0" />
            {isRtl ? "اسم المستخدم" : "Username"}
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            disabled={!isEditing}
            className={`w-full px-4 py-3 border rounded-xl transition-all ${
              isEditing
                ? "border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                : "border-gray-200 bg-gray-50 cursor-not-allowed"
            }`}
            placeholder={isRtl ? "أدخل اسم المستخدم" : "Enter your username"}
          />
        </div>

        {/* Email (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail size={16} className="inline mr-2 rtl:ml-2 rtl:mr-0" />
            {isRtl ? "البريد الإلكتروني" : "Email Address"}
          </label>
          <div className="relative">
            <input
              type="email"
              value={profile?.email || ""}
              disabled
              className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl cursor-not-allowed"
            />
            <span className="absolute right-3 rtl:left-3 rtl:right-auto top-1/2 transform -translate-y-1/2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {isRtl ? "محمي" : "Protected"}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {isRtl
              ? 'لتغيير البريد الإلكتروني، استخدم قسم "تحديث البريد الإلكتروني"'
              : 'To change email, use the "Update Email" section'}
          </p>
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone size={16} className="inline mr-2 rtl:ml-2 rtl:mr-0" />
            {isRtl ? "رقم الهاتف" : "Phone Number"}
          </label>
          <div className="flex gap-2">
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              disabled={!isEditing}
              className={`flex-1 px-4 py-3 border rounded-xl transition-all ${
                isEditing
                  ? "border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  : "border-gray-200 bg-gray-50 cursor-not-allowed"
              }`}
              placeholder={isRtl ? "+966501234567" : "+966501234567"}
            />
            {profile?.isPhoneVerified ? (
              <div className="flex items-center px-3 py-2 bg-green-100 text-green-800 rounded-xl">
                <Check size={16} className="mr-1 rtl:ml-1 rtl:mr-0" />
                <span className="text-sm font-medium">
                  {isRtl ? "موثق" : "Verified"}
                </span>
              </div>
            ) : formData.phoneNumber && isEditing ? (
              <button
                type="button"
                onClick={handlePhoneVerification}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all text-sm font-medium"
              >
                {isRtl ? "تحقق" : "Verify"}
              </button>
            ) : null}
          </div>
        </div>

        {isEditing && (
          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save size={18} />
                <span>{isRtl ? "حفظ التغييرات" : "Save Changes"}</span>
              </>
            )}
          </motion.button>
        )}
      </form>
    </motion.div>
  );
};

export default ProfileForm;
