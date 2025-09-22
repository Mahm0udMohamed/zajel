import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Package,
  Star,
  Gift,
  Crown,
  Sparkles,
  Heart,
  Truck,
  MessageCircle,
  Award,
  CheckCircle,
  Shield,
} from "lucide-react";
import { motion, Variants } from "framer-motion";

// Interface Definitions
interface PackageData {
  id: string;
  icon: React.ReactNode;
  nameKey: string;
  descriptionKey: string;
  price: number; // Represents monthly price
  features: string[];
  color: string;
  popular: boolean;
}

interface FeatureComparisonItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const PackagesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );

  // Data for packages and stats
  const packages: PackageData[] = [
    {
      id: "basic",
      icon: <Package size={28} />,
      nameKey: "packages.basic.name",
      descriptionKey: "packages.basic.description",
      price: 199,
      color: "blue",
      popular: false,
      features: [
        isRtl ? "تنسيق زهور واحد" : "1 flower arrangement",
        isRtl ? "تغليف هدايا أساسي" : "Basic gift wrapping",
        isRtl ? "بطاقة تهنئة" : "Greeting card",
        isRtl ? "توصيل عادي" : "Standard delivery",
      ],
    },
    {
      id: "premium",
      icon: <Star size={28} />,
      nameKey: "packages.premium.name",
      descriptionKey: "packages.premium.description",
      price: 399,
      color: "purple",
      popular: true,
      features: [
        isRtl ? "تنسيقان من الزهور" : "2 flower arrangements",
        isRtl ? "صندوق هدايا مميز" : "Premium gift box",
        isRtl ? "شوكولاتة فاخرة" : "Premium chocolates",
        isRtl ? "بطاقة شخصية" : "Personalized card",
        isRtl ? "توصيل سريع" : "Express delivery",
      ],
    },
    {
      id: "luxury",
      icon: <Crown size={28} />,
      nameKey: "packages.luxury.name",
      descriptionKey: "packages.luxury.description",
      price: 699,
      color: "amber",
      popular: false,
      features: [
        isRtl ? "3 تنسيقات فاخرة" : "3 premium arrangements",
        isRtl ? "تغليف هدايا فاخر" : "Luxury gift packaging",
        isRtl ? "شوكولاتة مستوردة" : "Imported chocolates",
        isRtl ? "رسالة شخصية مخطوطة" : "Handwritten personal message",
        isRtl ? "توصيل في نفس اليوم" : "Same-day delivery",
        isRtl ? "خدمة عملاء مخصصة" : "Dedicated customer service",
      ],
    },
  ];

  const featureComparison: FeatureComparisonItem[] = [
    {
      icon: <Shield size={24} className="text-purple-600" />,
      title: isRtl ? "جودة مضمونة" : "Quality Guaranteed",
      description: isRtl
        ? "منتجات عالية الجودة مع ضمان الرضا."
        : "High-quality products with a satisfaction guarantee.",
    },
    {
      icon: <Truck size={24} className="text-purple-600" />,
      title: isRtl ? "توصيل سريع وموثوق" : "Fast & Reliable Delivery",
      description: isRtl
        ? "توصيل في الوقت المحدد لجميع الباقات."
        : "On-time delivery for all packages.",
    },
    {
      icon: <Heart size={24} className="text-purple-600" />,
      title: isRtl ? "تصميم مخصص" : "Custom Design",
      description: isRtl
        ? "باقات مصممة خصيصاً لتناسب مناسبتك."
        : "Packages designed specifically for your occasion.",
    },
    {
      icon: <Award size={24} className="text-purple-600" />,
      title: isRtl ? "خدمة عملاء متميزة" : "Premium Service",
      description: isRtl
        ? "دعم عملاء متخصص ومتاح دائماً لمساعدتك."
        : "Specialized customer support is always available to assist you.",
    },
  ];

  const getPackageStyle = (pkg: PackageData) => {
    const styles = {
      blue: {
        ring: "ring-blue-200",
        button: "bg-blue-600 hover:bg-blue-700",
        icon: "bg-blue-100 text-blue-600",
      },
      purple: {
        ring: "ring-purple-200",
        button:
          "bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600",
        icon: "bg-purple-100 text-purple-600",
      },
      amber: {
        ring: "ring-amber-200",
        button: "bg-amber-500 hover:bg-amber-600",
        icon: "bg-amber-100 text-amber-500",
      },
    };
    return styles[pkg.color as keyof typeof styles] || styles.purple;
  };

  // Animation Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 font-serif text-neutral-800"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="text-center mb-12"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl mb-6 shadow-lg"
          >
            <Gift className="w-8 h-8 text-white" />
          </motion.div>
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-purple-800 tracking-tight mb-4"
          >
            {isRtl ? "باقات الهدايا لدينا" : "Our Gift Packages"}
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="mt-4 text-lg max-w-3xl mx-auto leading-relaxed text-neutral-600"
          >
            {isRtl
              ? "اختر الباقة المثالية التي تعبر عن مشاعرك. كل باقة مصممة بعناية لتقديم تجربة لا تُنسى."
              : "Choose the perfect package that expresses your feelings. Each package is carefully designed to deliver an unforgettable experience."}
          </motion.p>
        </motion.div>

        {/* Billing Cycle Toggle */}
        <motion.div
          variants={itemVariants}
          className="flex justify-center items-center gap-4 mb-12"
        >
          <span
            className={`font-semibold transition-colors ${
              billingCycle === "monthly"
                ? "text-purple-700"
                : "text-neutral-500"
            }`}
          >
            {isRtl ? "شهرياً" : "Monthly"}
          </span>
          <button
            onClick={() =>
              setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")
            }
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
              billingCycle === "yearly" ? "bg-purple-600" : "bg-neutral-200"
            }`}
            aria-label="Toggle Billing Cycle"
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                isRtl
                  ? billingCycle === "yearly"
                    ? "-translate-x-6"
                    : "-translate-x-1"
                  : billingCycle === "yearly"
                  ? "translate-x-6"
                  : "translate-x-1"
              }`}
            />
          </button>
          <span
            className={`font-semibold transition-colors ${
              billingCycle === "yearly" ? "text-purple-700" : "text-neutral-500"
            }`}
          >
            {isRtl ? "سنوياً" : "Yearly"}
          </span>
          <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-full">
            {isRtl ? "وفر 20%" : "Save 20%"}
          </span>
        </motion.div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center mb-24">
          {packages.map((pkg) => {
            const style = getPackageStyle(pkg);
            const yearlyPrice = Math.round(pkg.price * 12 * 0.8);
            const originalYearlyPrice = pkg.price * 12;
            return (
              <motion.div
                key={pkg.id}
                variants={itemVariants}
                className={`relative bg-white rounded-2xl shadow-lg border border-neutral-100 flex flex-col h-full p-8 ${
                  pkg.popular ? "ring-4 ring-purple-300" : ""
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-lg">
                    <Sparkles size={16} />
                    {isRtl ? "الأكثر شعبية" : "Most Popular"}
                  </div>
                )}

                <div className="flex-grow">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-xl mb-6 ${style.icon}`}
                  >
                    {pkg.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-800 mb-2">
                    {t(pkg.nameKey)}
                  </h3>
                  <p className="text-neutral-500 text-sm mb-6 leading-relaxed h-12">
                    {t(pkg.descriptionKey)}
                  </p>

                  <div className="mb-6 h-20 flex flex-col justify-center">
                    {billingCycle === "monthly" ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-extrabold text-neutral-900">
                          {pkg.price}
                        </span>
                        <span className="text-lg font-medium text-neutral-500">
                          {isRtl ? "ر.س" : "EGP"}
                          <span className="text-sm">
                            /{isRtl ? "شهر" : "month"}
                          </span>
                        </span>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-extrabold text-neutral-900">
                            {yearlyPrice}
                          </span>
                          <span className="text-lg font-medium text-neutral-500">
                            {isRtl ? "ر.س" : "EGP"}
                            <span className="text-sm">
                              /{isRtl ? "سنة" : "year"}
                            </span>
                          </span>
                        </div>
                        <p className="text-sm text-neutral-500 mt-1">
                          {isRtl ? "كان" : "Was"}{" "}
                          <span className="line-through">
                            {originalYearlyPrice}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>

                  <hr className="my-6 border-neutral-200" />

                  <ul className="space-y-4">
                    {pkg.features.map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle
                          size={20}
                          className="text-green-500 flex-shrink-0"
                        />
                        <span className="text-neutral-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  to="/checkout"
                  className={`w-full mt-8 text-white py-3.5 px-4 rounded-lg font-bold text-center transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${style.button}`}
                >
                  {isRtl ? "اختر الباقة" : "Choose Plan"}
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Feature Comparison */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="text-center mb-12">
            <motion.h2
              variants={itemVariants}
              className="text-3xl sm:text-4xl font-bold text-purple-800 mb-4"
            >
              {isRtl ? "قارن الميزات" : "Compare Features"}
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-lg text-neutral-600 max-w-2xl mx-auto"
            >
              {isRtl
                ? "كل باقاتنا تأتي مع هذه المزايا الرائعة لضمان رضاكم."
                : "All our packages come with these great benefits to ensure your satisfaction."}
            </motion.p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {featureComparison.map((feature, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="bg-white rounded-xl border border-neutral-100 p-6 flex items-start gap-4 shadow-sm"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-bold text-neutral-800 text-lg">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Custom Package CTA */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className="mt-24 bg-white p-8 sm:p-12 rounded-2xl shadow-lg border border-neutral-100 text-center"
        >
          <Sparkles className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-3xl sm:text-4xl font-bold text-purple-800 mb-4">
            {isRtl ? "هل تبحث عن شيء فريد؟" : "Looking For Something Unique?"}
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto mb-8">
            {isRtl
              ? "يمكننا تصميم باقة مخصصة بالكامل لتناسب مناسبتك وميزانيتك. تواصل معنا لنبدأ."
              : "We can design a fully custom package to fit your occasion and budget. Get in touch with us to get started."}
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-2 bg-purple-600 text-white px-8 py-3 rounded-full font-bold hover:bg-purple-700 transition-colors shadow-md"
          >
            <MessageCircle size={20} />
            <span>
              {isRtl ? "اطلب باقة مخصصة" : "Request a Custom Package"}
            </span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default PackagesPage;
