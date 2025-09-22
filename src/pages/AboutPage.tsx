import React from "react";
import { useTranslation } from "react-i18next";
import { ProductImage } from "../features/images";
import { motion, Variants } from "framer-motion";
import { Heart, Truck, Award } from "lucide-react";

// Animation Variants (with TypeScript fix)
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};

const AboutPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 px-4 sm:px-6 lg:px-8 font-serif text-neutral-800"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto py-12 sm:py-16">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          // Responsive padding for the main card
          className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 md:p-12 border border-neutral-100"
        >
          {/* Section 1: Hero */}
          <section className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-12 md:mb-16">
            <motion.div variants={itemVariants}>
              {/* Responsive heading size */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-purple-800">
                {isArabic ? "من نحن" : "About Us"}
              </h1>
              <p className="text-base sm:text-lg text-neutral-700 leading-relaxed font-medium mb-4">
                {isArabic
                  ? "زاجل السعادة هو متجر متخصص في تقديم الهدايا الفريدة والمميزة لجميع المناسبات. نحن نؤمن بأن كل هدية تحمل معها لحظة من السعادة والبهجة."
                  : "Zajil Al-Saadah is a specialty store dedicated to providing unique and distinctive gifts for all occasions. We believe that every gift carries with it a moment of joy and happiness."}
              </p>
              <p className="text-neutral-600 leading-relaxed">
                {isArabic
                  ? "منذ تأسيسنا، نسعى لتقديم تجربة استثنائية لعملائنا من خلال منتجات عالية الجودة وخدمة متميزة تلبي توقعاتهم وتفوقها."
                  : "Since our establishment, we strive to provide an exceptional experience for our customers through high-quality products and outstanding service that meets and exceeds their expectations."}
              </p>
            </motion.div>
            {/* Added margin-top for mobile view when stacked */}
            <motion.div
              variants={itemVariants}
              className="relative mt-8 md:mt-0"
            >
              <ProductImage
                src="https://images.pexels.com/photos/1974508/pexels-photo-1974508.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt={isArabic ? "زاجل السعادة" : "Zajil Al-Saadah"}
                className="rounded-2xl shadow-lg w-full transition-transform duration-500 hover:scale-105"
                width={600}
                height={400}
                aspectRatio="landscape"
                sizes="(max-width: 768px) 100vw, 50vw"
                quality={100}
                priority={true}
                showZoom={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 to-transparent rounded-2xl"></div>
            </motion.div>
          </section>

          {/* Responsive margin for the separator */}
          <hr className="my-12 md:my-16 border-neutral-200" />

          {/* Section 2: Values */}
          <section className="mb-12 md:mb-16">
            <motion.div
              variants={itemVariants}
              className="text-center mb-8 md:mb-12"
            >
              {/* Responsive heading size */}
              <h2 className="text-2xl sm:text-3xl font-bold text-purple-800">
                {isArabic ? "قيمنا الأساسية" : "Our Core Values"}
              </h2>
            </motion.div>
            <motion.div
              variants={containerVariants}
              // Responsive gap for the grid
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            >
              <motion.div
                variants={itemVariants}
                className="text-center p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100 shadow-sm"
              >
                <Award size={32} className="mx-auto mb-4 text-amber-700" />
                <h3 className="text-lg font-bold text-amber-800 mb-2">
                  {isArabic ? "الجودة العالية" : "Premium Quality"}
                </h3>
                <p className="text-neutral-600 text-sm">
                  {isArabic
                    ? "نختار منتجاتنا بعناية فائقة لضمان أعلى معايير الجودة."
                    : "We carefully select our products to ensure the highest quality standards."}
                </p>
              </motion.div>
              <motion.div
                variants={itemVariants}
                className="text-center p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100 shadow-sm"
              >
                <Heart size={32} className="mx-auto mb-4 text-emerald-700" />
                <h3 className="text-lg font-bold text-emerald-800 mb-2">
                  {isArabic ? "خدمة عملاء متميزة" : "Outstanding Service"}
                </h3>
                <p className="text-neutral-600 text-sm">
                  {isArabic
                    ? "فريق دعم متخصص متاح على مدار الساعة لخدمتكم."
                    : "Specialized support team available 24/7 to serve you."}
                </p>
              </motion.div>
              <motion.div
                variants={itemVariants}
                className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm"
              >
                <Truck size={32} className="mx-auto mb-4 text-blue-700" />
                <h3 className="text-lg font-bold text-blue-800 mb-2">
                  {isArabic ? "توصيل سريع" : "Fast Delivery"}
                </h3>
                <p className="text-neutral-600 text-sm">
                  {isArabic
                    ? "نضمن وصول هداياكم في الوقت المحدد وبأفضل حالة."
                    : "We guarantee your gifts arrive on time and in perfect condition."}
                </p>
              </motion.div>
            </motion.div>
          </section>

          {/* Responsive margin for the separator */}
          <hr className="my-12 md:my-16 border-neutral-200" />

          {/* Section 3: Vision & Mission */}
          <section className="bg-gradient-to-br from-purple-50 to-rose-50 p-6 sm:p-8 rounded-xl border border-purple-100 shadow-sm mb-12 md:mb-16">
            <motion.div
              variants={itemVariants}
              className="text-center mb-6 md:mb-8"
            >
              {/* Responsive heading size */}
              <h2 className="text-2xl sm:text-3xl font-bold text-purple-800">
                {isArabic ? "رؤيتنا ورسالتنا" : "Our Vision & Mission"}
              </h2>
            </motion.div>
            <motion.div
              variants={containerVariants}
              // Responsive gap for the grid
              className="grid md:grid-cols-2 gap-6 md:gap-8"
            >
              <motion.div
                variants={itemVariants}
                className="bg-white p-6 rounded-xl shadow-sm border border-neutral-100"
              >
                <h3 className="text-xl font-bold text-purple-700 mb-4">
                  {isArabic ? "رؤيتنا" : "Our Vision"}
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  {isArabic
                    ? "أن نكون الوجهة الأولى للهدايا المميزة في المملكة العربية السعودية، ونشر السعادة والبهجة في كل بيت."
                    : "To be the premier destination for distinctive gifts in Saudi Arabia, spreading happiness and joy to every home."}
                </p>
              </motion.div>
              <motion.div
                variants={itemVariants}
                className="bg-white p-6 rounded-xl shadow-sm border border-neutral-100"
              >
                <h3 className="text-xl font-bold text-rose-700 mb-4">
                  {isArabic ? "رسالتنا" : "Our Mission"}
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  {isArabic
                    ? "تقديم هدايا استثنائية تعبر عن المشاعر الصادقة وتخلق ذكريات جميلة تدوم مدى الحياة."
                    : "Providing exceptional gifts that express genuine feelings and create beautiful memories that last a lifetime."}
                </p>
              </motion.div>
            </motion.div>
          </section>

          {/* Section 4: Team Image - REDESIGNED OVERLAY */}
          <section className="text-center">
            <motion.div
              variants={itemVariants}
              className="relative inline-block shadow-lg rounded-2xl overflow-hidden"
            >
              <ProductImage
                src="https://images.pexels.com/photos/6169668/pexels-photo-6169668.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt={isArabic ? "فريق زاجل السعادة" : "Zajil Al-Saadah Team"}
                className="w-full max-w-3xl mx-auto rounded-2xl" // rounded-2xl is still good practice here
                width={800}
                height={400}
                aspectRatio="landscape"
                sizes="(max-width: 768px) 100vw, 800px"
                quality={100}
                showZoom={false}
              />
              {/* This is the new, improved overlay */}
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-black/40 to-transparent">
                <div className="w-full p-4 sm:p-6 text-center text-white">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">
                    {isArabic ? "فريق عملنا المتميز" : "Our Outstanding Team"}
                  </h3>
                  <p className="text-sm sm:text-base opacity-90 max-w-md mx-auto">
                    {isArabic
                      ? "نعمل معاً بشغف وش креатив لإسعادكم"
                      : "Working together with passion to make you happy"}
                  </p>
                </div>
              </div>
            </motion.div>
          </section>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;
