import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Instagram,
  Twitter,
  Facebook,
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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

const ContactPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
    alert(
      isArabic
        ? "تم إرسال رسالتك بنجاح!"
        : "Your message has been sent successfully!"
    );
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Re-added title for better structure in the new design
  const contactInfo = [
    {
      icon: <MapPin className="w-7 h-7" />,
      title: isArabic ? "العنوان" : "Address",
      value: isArabic ? "القاهرة، مصر" : "Cairo, Egypt",
    },
    {
      icon: <Phone className="w-7 h-7" />,
      title: isArabic ? "الهاتف" : "Phone",
      value: "+20 100 123 4567",
    },
    {
      icon: <Mail className="w-7 h-7" />,
      title: isArabic ? "البريد الإلكتروني" : "Email",
      value: "info@zajilalsaadah.com",
    },
    {
      icon: <Clock className="w-7 h-7" />,
      title: isArabic ? "ساعات العمل" : "Working Hours",
      value: isArabic
        ? "كل يوم: 9 صباحاً - 10 مساءً"
        : "Every day: 9 AM - 10 PM",
    },
  ];

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
        >
          {/* Page Title and Description */}
          <motion.div
            variants={itemVariants}
            className="text-center mb-12 md:mb-16"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-purple-800">
              {isArabic ? "تواصل معنا" : "Get In Touch"}
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              {isArabic
                ? "نحن هنا لمساعدتك. أرسل لنا استفسارك أو تفضل بزيارتنا."
                : "We're here to help. Send us your inquiry or feel free to visit us."}
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl shadow-lg border border-neutral-100 overflow-hidden"
          >
            <div className="grid lg:grid-cols-2">
              {/* Left Column: Contact Form */}
              <div className="p-6 sm:p-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-neutral-800 mb-6 md:mb-8 text-center lg:text-start">
                  {isArabic ? "أرسل لنا رسالة" : "Send Us a Message"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-bold text-neutral-700 mb-2"
                    >
                      {isArabic ? "الاسم الكامل" : "Full Name"}
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
                      placeholder={isArabic ? "اسمك هنا" : "Your Name Here"}
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-bold text-neutral-700 mb-2"
                    >
                      {isArabic ? "البريد الإلكتروني" : "Email Address"}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
                      placeholder={
                        isArabic ? "بريدك الإلكتروني" : "Your Email Address"
                      }
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-bold text-neutral-700 mb-2"
                    >
                      {isArabic ? "الرسالة" : "Your Message"}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 resize-y"
                      placeholder={
                        isArabic
                          ? "اكتب رسالتك هنا..."
                          : "Type your message here..."
                      }
                      required
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 px-6 rounded-lg font-bold text-lg hover:shadow-lg transition-shadow duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    <span>{isArabic ? "إرسال الرسالة" : "Send Message"}</span>
                    <Send size={20} />
                  </button>
                </form>
              </div>

              {/* Right Column: REDESIGNED Contact Info */}
              <div className="bg-purple-800 p-6 sm:p-8 flex flex-col">
                <div className="flex-grow">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8">
                    {isArabic ? "معلومات الاتصال" : "Contact Info"}
                  </h2>

                  {/* New Grid Layout for Contact Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-white">
                    {contactInfo.map((item, index) => (
                      <div
                        key={index}
                        className="bg-white/10 p-4 rounded-lg text-center sm:text-start flex flex-col sm:flex-row items-center gap-4"
                      >
                        <div className="flex-shrink-0 text-purple-200">
                          {item.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{item.title}</h3>
                          <p className="text-purple-100 text-sm leading-relaxed">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/20">
                  <h3 className="text-xl font-bold text-white mb-4 text-center">
                    {isArabic ? "تابعنا" : "Follow Us"}
                  </h3>
                  <div className="flex justify-center space-x-4 rtl:space-x-reverse">
                    {[Facebook, Instagram, Twitter].map((Icon, index) => (
                      <a
                        key={index}
                        href="#"
                        className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl hover:bg-white hover:text-purple-600 transition-colors duration-300"
                        aria-label={Icon.displayName || "Social Media Link"}
                      >
                        <Icon size={22} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPage;
