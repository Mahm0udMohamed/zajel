import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  ChevronRight,
  Mail,
  Phone,
  CreditCard,
  ShieldCheck,
  Truck,
  Headphones,
} from "lucide-react";
import { SiVisa, SiMastercard, SiPaypal, SiApplepay } from "react-icons/si";
import { motion } from "framer-motion";
import Logo from "../ui/Logo";

const Footer: React.FC = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  return (
    <footer
      className="bg-neutral-50 text-neutral-700"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Top announcement bar */}
      <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white py-2.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: ShieldCheck,
                text: i18n.language === "ar" ? "دفع آمن" : "Secure Payment",
              },
              {
                icon: Truck,
                text: i18n.language === "ar" ? "توصيل سريع" : "Fast Delivery",
              },
              {
                icon: Headphones,
                text: i18n.language === "ar" ? "دعم 24/7" : "24/7 Support",
              },
              {
                icon: CreditCard,
                text: i18n.language === "ar" ? "إرجاع سهل" : "Easy Returns",
              },
            ].map(({ icon: Icon, text }, index) => (
              <motion.div
                key={index}
                className={`flex items-center ${
                  isRtl
                    ? "justify-end flex-row-reverse"
                    : "justify-start flex-row"
                } gap-2 p-2`}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Icon size={18} className="text-white" />
                <p className="text-xs font-semibold">{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Logo className="text-emerald-500 h-8 w-auto" />
            <p className="mt-4 text-neutral-500 text-sm leading-relaxed">
              {i18n.language === "ar"
                ? "نحن نقدم تجربة تسوق فريدة ومجموعة واسعة من المنتجات عالية الجودة لتلبية جميع احتياجاتك."
                : "We provide a unique shopping experience and a wide range of high-quality products to meet all your needs."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {[
                { icon: Facebook, href: "#", name: "Facebook" },
                { icon: Instagram, href: "#", name: "Instagram" },
                { icon: Twitter, href: "#", name: "Twitter" },
                { icon: Youtube, href: "#", name: "YouTube" },
              ].map(({ icon: Icon, href, name }) => (
                <motion.a
                  key={name}
                  href={href}
                  className="p-2 rounded-full text-neutral-500 hover:text-emerald-500 hover:bg-emerald-100 transition-colors duration-300"
                  aria-label={name}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3
              className={`text-sm font-semibold uppercase tracking-wider text-emerald-600 mb-4 relative pb-2 ${
                isRtl ? "after:right-0" : "after:left-0"
              } after:absolute after:bottom-0 after:h-0.5 after:w-8 after:bg-emerald-500`}
            >
              {i18n.language === "ar" ? "روابط سريعة" : "Quick Links"}
            </h3>
            <ul className="space-y-3">
              {[
                {
                  to: "/about",
                  text: i18n.language === "ar" ? "من نحن" : "About Us",
                },
                {
                  to: "/contact",
                  text: i18n.language === "ar" ? "اتصل بنا" : "Contact Us",
                },
                {
                  to: "/faq",
                  text: i18n.language === "ar" ? "الأسئلة الشائعة" : "FAQ",
                },
                {
                  to: "/delivery",
                  text: i18n.language === "ar" ? "الشحن والتوصيل" : "Delivery",
                },
                {
                  to: "/returns",
                  text:
                    i18n.language === "ar" ? "الإرجاع والاستبدال" : "Returns",
                },
              ].map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.to}
                    className="text-neutral-600 hover:text-emerald-500 transition-colors duration-300 text-sm font-medium flex items-center gap-2 group"
                  >
                    <ChevronRight
                      size={14}
                      className={`text-neutral-500 transition-transform duration-300 ${
                        isRtl ? "rotate-180" : ""
                      } ${
                        isRtl
                          ? "group-hover:-translate-x-1"
                          : "group-hover:translate-x-1"
                      }`}
                    />
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3
              className={`text-sm font-semibold uppercase tracking-wider text-emerald-600 mb-4 relative pb-2 ${
                isRtl ? "after:right-0" : "after:left-0"
              } after:absolute after:bottom-0 after:h-0.5 after:w-8 after:bg-emerald-500`}
            >
              {i18n.language === "ar" ? "الشروط والأحكام" : "Legal"}
            </h3>
            <ul className="space-y-3">
              {[
                {
                  to: "/terms",
                  text:
                    i18n.language === "ar" ? "شروط الاستخدام" : "Terms of Use",
                },
                {
                  to: "/privacy",
                  text:
                    i18n.language === "ar"
                      ? "سياسة الخصوصية"
                      : "Privacy Policy",
                },
              ].map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.to}
                    className="text-neutral-600 hover:text-emerald-500 transition-colors duration-300 text-sm font-medium flex items-center gap-2 group"
                  >
                    <ChevronRight
                      size={14}
                      className={`text-neutral-500 transition-transform duration-300 ${
                        isRtl ? "rotate-180" : ""
                      } ${
                        isRtl
                          ? "group-hover:-translate-x-1"
                          : "group-hover:translate-x-1"
                      }`}
                    />
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3
              className={`text-sm font-semibold uppercase tracking-wider text-emerald-600 mb-4 relative pb-2 ${
                isRtl ? "after:right-0" : "after:left-0"
              } after:absolute after:bottom-0 after:h-0.5 after:w-8 after:bg-emerald-500`}
            >
              {i18n.language === "ar" ? "تواصل معنا" : "Contact Us"}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-emerald-500 flex-shrink-0" />
                <span className="text-neutral-600 text-sm">
                  +966 12 345 6789
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-emerald-500 flex-shrink-0" />
                <span className="text-neutral-600 text-sm">
                  info@company.com
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="border-t border-neutral-200/50 bg-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div
            className={`flex flex-col md:flex-row items-center justify-between gap-4 ${
              isRtl ? "md:flex-row-reverse" : ""
            }`}
          >
            <p className="text-neutral-600 text-sm font-medium">
              {i18n.language === "ar"
                ? "© 2025 اسم الشركة. جميع الحقوق محفوظة."
                : "© 2025 Company Name. All rights reserved."}
            </p>

            <div
              className={`flex items-center gap-4 ${
                isRtl ? "flex-row-reverse" : ""
              }`}
            >
              <span className="text-neutral-600 text-sm font-medium whitespace-nowrap">
                {i18n.language === "ar"
                  ? "طرق الدفع المقبولة:"
                  : "Accepted Payments:"}
              </span>

              <div className="flex gap-2">
                {[
                  { icon: SiVisa, name: "Visa" },
                  { icon: SiMastercard, name: "Mastercard" },
                  { icon: SiPaypal, name: "PayPal" },
                  { icon: SiApplepay, name: "ApplePay" },
                ].map(({ icon: Icon, name }) => (
                  <motion.div
                    key={name}
                    className="p-2 rounded-lg bg-neutral-200 text-neutral-600 hover:bg-emerald-100 hover:text-emerald-500 transition-colors duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon size={18} />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default React.memo(Footer);
