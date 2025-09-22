import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Home, Compass, ArrowRight, ArrowLeft } from "lucide-react";
import { motion, Variants } from "framer-motion";

// Animation Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};

const NotFoundPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 flex items-center justify-center px-4 py-16 font-serif"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-xl mx-auto text-center"
      >
        <motion.div variants={itemVariants} className="mb-6">
          <Compass size={64} className="text-purple-300 mx-auto" />
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-8xl md:text-9xl font-extrabold text-purple-800 mb-4"
        >
          404
        </motion.h1>

        <motion.h2
          variants={itemVariants}
          className="text-3xl md:text-4xl font-bold mb-4 text-neutral-800"
        >
          {isArabic ? "الصفحة غير موجودة" : "Page Not Found"}
        </motion.h2>

        <motion.p
          variants={itemVariants}
          className="text-neutral-600 mb-10 text-lg leading-relaxed max-w-lg mx-auto"
        >
          {isArabic
            ? "عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها. ربما تكون قد كتبت العنوان خطأ أو أن الصفحة لم تعد متاحة."
            : "Sorry, the page you are looking for doesn't exist or has been moved. You may have mistyped the address or the page is no longer available."}
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-3 rounded-full hover:shadow-lg transition-shadow duration-300 font-bold text-lg"
          >
            <Home size={20} />
            <span>{isArabic ? "العودة للرئيسية" : "Back to Home"}</span>
          </Link>

          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-2 bg-white text-purple-700 px-8 py-3 rounded-full hover:bg-purple-50 transition-colors duration-300 font-bold text-lg shadow-md border border-purple-100"
          >
            <span>{isArabic ? "اتصل بالدعم" : "Contact Support"}</span>
            {isArabic ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
