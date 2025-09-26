import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Trash2, AlertTriangle, Lock, Type, Shield } from "lucide-react";
import { useUser } from "../../context/UserContext";

const DeleteAccountForm: React.FC = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const { deleteAccount, isLoading } = useUser();

  const [formData, setFormData] = useState({
    password: "",
    confirmation: "",
  });
  const [showWarning, setShowWarning] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.confirmation !== "DELETE") {
      return;
    }

    try {
      await deleteAccount(formData.password, formData.confirmation);
    } catch (error) {
      console.error("Account deletion error:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-8 border border-red-200"
    >
      <div className="flex items-center mb-8">
        <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mr-4 rtl:ml-4 rtl:mr-0">
          <Trash2 className="w-6 h-6 text-white" />
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

      {!showWarning ? (
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            {isRtl ? "هل أنت متأكد؟" : "Are you sure?"}
          </h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            {isRtl
              ? "سيتم حذف حسابك وجميع بياناتك نهائياً. لن تتمكن من استرداد هذه البيانات أو الوصول إلى حسابك مرة أخرى."
              : "Your account and all your data will be permanently deleted. You will not be able to recover this data or access your account again."}
          </p>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <h4 className="font-medium text-red-800 mb-2">
              {isRtl ? "ما سيتم حذفه:" : "What will be deleted:"}
            </h4>
            <ul className="text-red-700 text-sm space-y-1">
              <li>
                •{" "}
                {isRtl ? "جميع بيانات الملف الشخصي" : "All profile information"}
              </li>
              <li>
                •{" "}
                {isRtl
                  ? "سجل الطلبات والمشتريات"
                  : "Order and purchase history"}
              </li>
              <li>
                •{" "}
                {isRtl ? "المفضلة وعربة التسوق" : "Favorites and shopping cart"}
              </li>
              <li>• {isRtl ? "الصورة الشخصية" : "Profile picture"}</li>
              <li>
                •{" "}
                {isRtl
                  ? "جميع البيانات المرتبطة بالحساب"
                  : "All account-related data"}
              </li>
            </ul>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setShowWarning(false)}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-all"
            >
              {isRtl ? "إلغاء" : "Cancel"}
            </button>
            <button
              onClick={() => setShowWarning(true)}
              className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 px-4 rounded-xl font-medium hover:from-red-600 hover:to-pink-600 transition-all shadow-lg"
            >
              {isRtl ? "متابعة الحذف" : "Proceed to Delete"}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <div className="flex items-center mb-4">
              <Shield className="w-6 h-6 text-red-600 mr-2 rtl:ml-2 rtl:mr-0" />
              <h3 className="text-lg font-bold text-red-800">
                {isRtl ? "تأكيد الحذف" : "Confirm Deletion"}
              </h3>
            </div>
            <p className="text-red-700 text-sm mb-4">
              {isRtl
                ? 'لتأكيد حذف حسابك، يرجى إدخال كلمة المرور وكتابة "DELETE" في الحقل أدناه.'
                : 'To confirm account deletion, please enter your password and type "DELETE" in the field below.'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock size={16} className="inline mr-2 rtl:ml-2 rtl:mr-0" />
              {isRtl ? "كلمة المرور الحالية" : "Current Password"}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              placeholder={
                isRtl ? "أدخل كلمة المرور للتأكيد" : "Enter password to confirm"
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Type size={16} className="inline mr-2 rtl:ml-2 rtl:mr-0" />
              {isRtl ? 'اكتب "DELETE" للتأكيد' : 'Type "DELETE" to confirm'}
            </label>
            <input
              type="text"
              name="confirmation"
              value={formData.confirmation}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all font-mono"
              placeholder="DELETE"
              required
            />
            {formData.confirmation && formData.confirmation !== "DELETE" && (
              <p className="text-red-500 text-xs mt-1">
                {isRtl
                  ? 'يجب كتابة "DELETE" بالضبط'
                  : 'Must type "DELETE" exactly'}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowWarning(false)}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-all"
            >
              {isRtl ? "العودة" : "Back"}
            </button>
            <motion.button
              type="submit"
              disabled={
                isLoading ||
                !formData.password ||
                formData.confirmation !== "DELETE"
              }
              className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 px-4 rounded-xl font-medium hover:from-red-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Trash2 size={18} />
                  <span>
                    {isRtl
                      ? "حذف الحساب نهائياً"
                      : "Delete Account Permanently"}
                  </span>
                </>
              )}
            </motion.button>
          </div>
        </form>
      )}
    </motion.div>
  );
};

export default DeleteAccountForm;
