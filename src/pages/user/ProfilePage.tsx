import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Shield,
  Mail,
  Trash2,
  CheckCircle,
  AlertCircle,
  Calendar,
  Settings,
  Camera,
  Award,
  Heart,
  Package,
} from "lucide-react";
import { useUser } from "../../context/UserContext";
import { useAuth } from "../../context/AuthContext";
import { useFavorites } from "../../context/FavoritesContext";
import { useCart } from "../../context/CartContext";
import ProfileForm from "../../components/user/ProfileForm";
import PasswordUpdateForm from "../../components/user/PasswordUpdateForm";
import EmailUpdateForm from "../../components/user/EmailUpdateForm";
import DeleteAccountForm from "../../components/user/DeleteAccountForm";

const ProfilePage: React.FC = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const { profile } = useUser();
  const { user } = useAuth();
  const { favoritesCount } = useFavorites();
  const { cartCount } = useCart();
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    {
      id: "profile",
      label: isRtl ? "الملف الشخصي" : "Profile",
      icon: <User size={20} />,
      color: "from-purple-500 to-pink-500",
      description: isRtl ? "معلوماتك الشخصية" : "Your personal information",
    },
    {
      id: "password",
      label: isRtl ? "كلمة المرور" : "Password",
      icon: <Shield size={20} />,
      color: "from-orange-500 to-red-500",
      description: isRtl ? "تأمين حسابك" : "Secure your account",
    },
    {
      id: "email",
      label: isRtl ? "البريد الإلكتروني" : "Email",
      icon: <Mail size={20} />,
      color: "from-blue-500 to-cyan-500",
      description: isRtl ? "تحديث بريدك الإلكتروني" : "Update your email",
    },
    {
      id: "delete",
      label: isRtl ? "حذف الحساب" : "Delete Account",
      icon: <Trash2 size={20} />,
      color: "from-red-500 to-pink-500",
      description: isRtl ? "حذف حسابك نهائياً" : "Permanently delete account",
    },
  ];

  const stats = [
    {
      icon: <Package size={24} className="text-purple-600" />,
      label: isRtl ? "إجمالي الطلبات" : "Total Orders",
      value: "12",
      color: "from-purple-50 to-purple-100",
    },
    {
      icon: <Heart size={24} className="text-pink-600" />,
      label: isRtl ? "المفضلة" : "Favorites",
      value: favoritesCount.toString(),
      color: "from-pink-50 to-pink-100",
    },
    {
      icon: <Award size={24} className="text-amber-600" />,
      label: isRtl ? "نقاط الولاء" : "Loyalty Points",
      value: "1,250",
      color: "from-amber-50 to-amber-100",
    },
    {
      icon: <Package size={24} className="text-blue-600" />,
      label: isRtl ? "السلة" : "Cart Items",
      value: cartCount.toString(),
      color: "from-blue-50 to-blue-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8 font-serif text-neutral-800">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="relative inline-block mb-6">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 p-1 shadow-xl">
              <div className="w-full h-full rounded-full overflow-hidden bg-white">
                {profile?.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    <User size={48} className="text-purple-600" />
                  </div>
                )}
              </div>
            </div>
            <div className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
              <Camera size={16} className="text-purple-600" />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-purple-800 mb-2">
            {isRtl ? "مرحباً" : "Welcome"}, {profile?.name || user?.name}
          </h1>
          <p className="text-gray-600 mb-2">@{profile?.username}</p>

          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <CheckCircle size={16} className="text-green-500" />
              <span className="text-gray-600">
                {isRtl ? "بريد موثق" : "Email Verified"}
              </span>
            </div>
            {profile?.isPhoneVerified ? (
              <div className="flex items-center gap-1">
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-gray-600">
                  {isRtl ? "هاتف موثق" : "Phone Verified"}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <AlertCircle size={16} className="text-yellow-500" />
                <span className="text-gray-600">
                  {isRtl ? "هاتف غير موثق" : "Phone Not Verified"}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar size={16} className="text-gray-500" />
              <span className="text-gray-600">
                {isRtl ? "عضو منذ" : "Member since"}{" "}
                {profile?.createdAt
                  ? new Date(profile.createdAt).getFullYear()
                  : "2025"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stat.value}
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center">
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="xl:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 text-lg">
                  {isRtl ? "إعدادات الحساب" : "Account Settings"}
                </h3>
              </div>

              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full group relative overflow-hidden rounded-xl transition-all duration-300 ${
                      activeTab === tab.id ? "shadow-lg" : "hover:shadow-md"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${
                        tab.color
                      } ${
                        activeTab === tab.id ? "opacity-100" : "opacity-0"
                      } transition-opacity duration-300`}
                    />
                    <div
                      className={`relative flex items-center gap-3 px-4 py-4 ${
                        activeTab === tab.id
                          ? "text-white"
                          : "text-gray-700 hover:text-purple-600"
                      } transition-colors duration-300`}
                    >
                      <div className="flex-shrink-0">{tab.icon}</div>
                      <div className="flex-1 text-left rtl:text-right">
                        <div className="font-semibold">{tab.label}</div>
                        <div
                          className={`text-xs ${
                            activeTab === tab.id
                              ? "text-white/80"
                              : "text-gray-500"
                          }`}
                        >
                          {tab.description}
                        </div>
                      </div>
                      {activeTab === tab.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 bg-white rounded-full"
                        />
                      )}
                    </div>
                  </motion.button>
                ))}
              </nav>

              {/* Quick Actions */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h4 className="font-semibold text-gray-800 mb-4 text-sm">
                  {isRtl ? "إجراءات سريعة" : "Quick Actions"}
                </h4>
                <div className="space-y-2">
                  <Link
                    to="/orders"
                    className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all text-sm"
                  >
                    <Package size={16} />
                    <span>{isRtl ? "طلباتي" : "My Orders"}</span>
                  </Link>
                  <Link
                    to="/favorites"
                    className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-all text-sm"
                  >
                    <Heart size={16} />
                    <div className="flex items-center justify-between flex-1">
                      <span>{isRtl ? "المفضلة" : "Favorites"}</span>
                      {favoritesCount > 0 && (
                        <span className="bg-pink-100 text-pink-600 text-xs px-2 py-1 rounded-full font-medium">
                          {favoritesCount}
                        </span>
                      )}
                    </div>
                  </Link>
                  <Link
                    to="/cart"
                    className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all text-sm"
                  >
                    <Package size={16} />
                    <div className="flex items-center justify-between flex-1">
                      <span>{isRtl ? "عربة التسوق" : "Shopping Cart"}</span>
                      {cartCount > 0 && (
                        <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full font-medium">
                          {cartCount}
                        </span>
                      )}
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Content Area */}
          <motion.div
            initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="xl:col-span-3"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === "profile" && (
                  <div className="space-y-6">
                    {/* Profile Header Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                      <div className="flex items-center gap-6 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <User className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-800">
                            {isRtl
                              ? "المعلومات الشخصية"
                              : "Personal Information"}
                          </h2>
                          <p className="text-gray-600">
                            {isRtl
                              ? "إدارة وتحديث بياناتك الشخصية"
                              : "Manage and update your personal data"}
                          </p>
                        </div>
                      </div>

                      {/* Account Status */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-6 h-6 text-green-500" />
                            <div>
                              <p className="font-semibold text-green-800 text-sm">
                                {isRtl ? "البريد الإلكتروني" : "Email"}
                              </p>
                              <p className="text-green-600 text-xs">
                                {isRtl ? "موثق ✓" : "Verified ✓"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`rounded-xl p-4 border ${
                            profile?.isPhoneVerified
                              ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-100"
                              : "bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-100"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {profile?.isPhoneVerified ? (
                              <CheckCircle className="w-6 h-6 text-green-500" />
                            ) : (
                              <AlertCircle className="w-6 h-6 text-yellow-500" />
                            )}
                            <div>
                              <p
                                className={`font-semibold text-sm ${
                                  profile?.isPhoneVerified
                                    ? "text-green-800"
                                    : "text-yellow-800"
                                }`}
                              >
                                {isRtl ? "رقم الهاتف" : "Phone Number"}
                              </p>
                              <p
                                className={`text-xs ${
                                  profile?.isPhoneVerified
                                    ? "text-green-600"
                                    : "text-yellow-600"
                                }`}
                              >
                                {profile?.isPhoneVerified
                                  ? isRtl
                                    ? "موثق ✓"
                                    : "Verified ✓"
                                  : isRtl
                                  ? "يحتاج توثيق"
                                  : "Needs Verification"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-6 h-6 text-blue-500" />
                            <div>
                              <p className="font-semibold text-blue-800 text-sm">
                                {isRtl ? "عضو منذ" : "Member Since"}
                              </p>
                              <p className="text-blue-600 text-xs">
                                {profile?.createdAt
                                  ? new Date(
                                      profile.createdAt
                                    ).toLocaleDateString(
                                      isRtl ? "ar-EG" : "en-US",
                                      { year: "numeric", month: "long" }
                                    )
                                  : "2025"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <ProfileForm />
                  </div>
                )}

                {activeTab === "password" && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                      <div className="flex items-center gap-6 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                          <Shield className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-800">
                            {isRtl ? "أمان الحساب" : "Account Security"}
                          </h2>
                          <p className="text-gray-600">
                            {isRtl
                              ? "حافظ على أمان حسابك بكلمة مرور قوية"
                              : "Keep your account secure with a strong password"}
                          </p>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 mb-8">
                        <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                          <Shield size={18} />
                          {isRtl ? "نصائح الأمان" : "Security Tips"}
                        </h4>
                        <ul className="space-y-2 text-blue-700 text-sm">
                          <li className="flex items-center gap-2">
                            <CheckCircle size={14} />
                            {isRtl
                              ? "استخدم كلمة مرور قوية (8 أحرف على الأقل)"
                              : "Use a strong password (at least 8 characters)"}
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle size={14} />
                            {isRtl
                              ? "اجمع بين الأحرف والأرقام والرموز"
                              : "Combine letters, numbers, and symbols"}
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle size={14} />
                            {isRtl
                              ? "لا تشارك كلمة المرور مع أحد"
                              : "Never share your password with anyone"}
                          </li>
                        </ul>
                      </div>
                    </div>

                    <PasswordUpdateForm />
                  </div>
                )}

                {activeTab === "email" && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                      <div className="flex items-center gap-6 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                          <Mail className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-800">
                            {isRtl
                              ? "إدارة البريد الإلكتروني"
                              : "Email Management"}
                          </h2>
                          <p className="text-gray-600">
                            {isRtl
                              ? "تحديث عنوان بريدك الإلكتروني بأمان"
                              : "Securely update your email address"}
                          </p>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100 mb-8">
                        <div className="flex items-center gap-3 mb-3">
                          <CheckCircle className="w-6 h-6 text-green-500" />
                          <h4 className="font-semibold text-green-800">
                            {isRtl ? "البريد الحالي" : "Current Email"}
                          </h4>
                        </div>
                        <p className="text-green-700 font-medium">
                          {profile?.email}
                        </p>
                        <p className="text-green-600 text-sm mt-1">
                          {isRtl
                            ? "هذا البريد موثق ونشط"
                            : "This email is verified and active"}
                        </p>
                      </div>
                    </div>

                    <EmailUpdateForm />
                  </div>
                )}

                {activeTab === "delete" && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-lg p-8 border border-red-200">
                      <div className="flex items-center gap-6 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                          <Trash2 className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-red-800">
                            {isRtl ? "حذف الحساب" : "Delete Account"}
                          </h2>
                          <p className="text-red-600">
                            {isRtl
                              ? "هذا الإجراء لا يمكن التراجع عنه"
                              : "This action cannot be undone"}
                          </p>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border border-red-100 mb-8">
                        <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                          <AlertCircle size={18} />
                          {isRtl ? "تحذير مهم" : "Important Warning"}
                        </h4>
                        <p className="text-red-700 text-sm leading-relaxed">
                          {isRtl
                            ? "حذف الحساب سيؤدي إلى فقدان جميع بياناتك نهائياً، بما في ذلك الطلبات والمفضلة وجميع المعلومات المرتبطة بحسابك. هذا الإجراء لا يمكن التراجع عنه."
                            : "Deleting your account will permanently remove all your data, including orders, favorites, and all information associated with your account. This action cannot be undone."}
                        </p>
                      </div>
                    </div>

                    <DeleteAccountForm />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-sm">
            <p className="text-gray-600 text-sm">
              {isRtl
                ? "نحن نحترم خصوصيتك ونحافظ على أمان بياناتك. جميع المعلومات محمية ومشفرة."
                : "We respect your privacy and keep your data secure. All information is protected and encrypted."}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
