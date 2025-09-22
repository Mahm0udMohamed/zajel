import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  MapPin,
  Truck,
  Clock,
  Package,
  PackageCheck,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { motion, Variants } from "framer-motion";

// Animation Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 80, damping: 12 },
  },
};

const StepCard: React.FC<{
  icon: React.ReactNode;
  step: string;
  title: string;
  description: string;
}> = ({ icon, step, title, description }) => {
  return (
    <motion.div
      variants={itemVariants}
      className="relative flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-lg border border-neutral-100"
    >
      <div className="absolute -top-6 bg-gradient-to-r from-purple-600 to-pink-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shadow-md">
        {step}
      </div>
      <div className="mt-8 mb-4 text-purple-600">{icon}</div>
      <h3 className="text-xl font-bold text-neutral-800 mb-2">{title}</h3>
      <p className="text-neutral-600 leading-relaxed flex-grow">
        {description}
      </p>
    </motion.div>
  );
};

const DeliveryPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const deliverySteps = [
    {
      icon: <ShoppingBag size={40} />,
      title: isRtl ? "تأكيد الطلب" : "Order Confirmation",
      description: isRtl
        ? "بمجرد إتمام طلبك، يصلك تأكيد فوري عبر البريد الإلكتروني."
        : "Once your order is placed, you receive an instant confirmation via email.",
    },
    {
      icon: <Package size={40} />,
      title: isRtl ? "تجهيز الهدية" : "Gift Preparation",
      description: isRtl
        ? "يقوم فريقنا بتجهيز وتغليف هديتك بعناية فائقة واهتمام بالتفاصيل."
        : "Our team carefully prepares and wraps your gift with great attention to detail.",
    },
    {
      icon: <Truck size={40} />,
      title: isRtl ? "الشحن والتوصيل" : "Shipping & Dispatch",
      description: isRtl
        ? "يتم تسليم طلبك إلى شريك الشحن الموثوق لدينا لبدء رحلته إليك."
        : "Your order is handed over to our trusted shipping partner to begin its journey.",
    },
    {
      icon: <PackageCheck size={40} />,
      title: isRtl ? "تم التوصيل" : "Delivery Complete",
      description: isRtl
        ? "تصل هديتك إلى العنوان المحدد، جاهزة لرسم الابتسامة على الوجوه."
        : "Your gift arrives at the specified address, ready to bring a smile to someone's face.",
    },
  ];

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 px-4 sm:px-6 lg:px-8 font-serif text-neutral-800"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto py-12 sm:py-16 lg:py-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Page Header */}
          <motion.div
            variants={itemVariants}
            className="text-center mb-16 md:mb-20"
          >
            <Truck className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-purple-800 mb-4">
              {isRtl ? "معلومات التوصيل" : "Delivery Information"}
            </h1>
            <p className="text-lg sm:text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              {isRtl
                ? "نحن ملتزمون بتوصيل هداياكم الثمينة بسرعة وأمان. إليك كيف تتم العملية."
                : "We are committed to delivering your precious gifts quickly and safely. Here's how our process works."}
            </p>
          </motion.div>

          {/* Delivery Process Timeline */}
          <motion.div
            variants={containerVariants}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-8"
          >
            {deliverySteps.map((step, index) => (
              <StepCard
                key={index}
                step={(index + 1).toString()}
                icon={step.icon}
                title={step.title}
                description={step.description}
              />
            ))}
          </motion.div>

          <hr className="my-16 md:my-20 border-purple-100" />

          {/* Key Information Section */}
          <motion.div
            variants={containerVariants}
            className="grid md:grid-cols-2 gap-8"
          >
            <motion.div
              variants={itemVariants}
              className="bg-white p-8 rounded-2xl shadow-lg border border-neutral-100"
            >
              <div className="flex items-center gap-4 mb-4">
                <MapPin className="w-8 h-8 text-purple-600" />
                <h2 className="text-2xl font-bold">
                  {isRtl ? "مناطق التوصيل" : "Our Delivery Zones"}
                </h2>
              </div>
              <p className="text-neutral-600 mb-4">
                {isRtl
                  ? "نقدم حاليًا خدمات التوصيل في المدن الرئيسية التالية في مصر، مع خطط للتوسع قريبًا:"
                  : "We currently offer delivery services in the following major cities in Egypt, with plans to expand soon:"}
              </p>
              <ul className="space-y-2">
                {["القاهرة", "الجيزة", "الإسكندرية"].map((city, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 text-neutral-700 font-medium"
                  >
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    {city}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="bg-white p-8 rounded-2xl shadow-lg border border-neutral-100"
            >
              <div className="flex items-center gap-4 mb-4">
                <Clock className="w-8 h-8 text-pink-600" />
                <h2 className="text-2xl font-bold">
                  {isRtl ? "أوقات التوصيل" : "Delivery Times"}
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-neutral-800">
                    {isRtl ? "التوصيل العادي" : "Standard Delivery"}
                  </h3>
                  <p className="text-neutral-600">
                    {isRtl
                      ? "يتم التوصيل خلال 24 إلى 48 ساعة من تأكيد الطلب."
                      : "Delivered within 24 to 48 hours of order confirmation."}
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-neutral-800">
                    {isRtl ? "التوصيل في نفس اليوم" : "Same-Day Delivery"}
                  </h3>
                  <p className="text-neutral-600">
                    {isRtl
                      ? "متاح للطلبات المقدمة قبل الساعة 4 مساءً في مناطق محددة."
                      : "Available for orders placed before 4 PM in select areas."}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* CTA Section */}
          <motion.div variants={itemVariants} className="mt-16 text-center">
            <Link
              to="/contact"
              className="inline-flex items-center gap-3 bg-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:bg-purple-700 transition-colors duration-300"
            >
              <span>{isRtl ? "تواصل معنا للمزيد" : "Contact Us For More"}</span>
              {isRtl ? <ArrowLeft size={22} /> : <ArrowRight size={22} />}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default DeliveryPage;
