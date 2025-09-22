import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  MessageSquare,
  ShoppingCart,
  Truck,
  CreditCard,
  HelpCircle,
} from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";

// Define a specific type for the FAQ data to avoid using 'any'
interface FaqData {
  questionEn: string;
  questionAr: string;
  answerEn: string;
  answerAr: string;
}

// Animation Variants for smooth open/close
const answerVariants: Variants = {
  hidden: { opacity: 0, height: 0, y: -10 },
  visible: {
    opacity: 1,
    height: "auto",
    y: 0,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 200,
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    y: -10,
    transition: {
      duration: 0.2,
    },
  },
};

const FAQItem: React.FC<{
  faq: FaqData; // Use the specific FaqData type instead of 'any'
  index: number;
  openIndex: number | null;
  setOpenIndex: (index: number | null) => void;
  isArabic: boolean;
}> = ({ faq, index, openIndex, setOpenIndex, isArabic }) => {
  const isOpen = openIndex === index;

  return (
    <div className="border-b border-purple-100 last:border-b-0">
      <button
        className={`w-full px-2 py-6 flex justify-between items-center text-lg font-semibold text-neutral-800 focus:outline-none ${
          isArabic ? "text-right" : "text-left"
        }`}
        onClick={() => setOpenIndex(isOpen ? null : index)}
        aria-expanded={isOpen}
      >
        <span className="flex-1">
          {isArabic ? faq.questionAr : faq.questionEn}
        </span>
        <motion.span
          className="ms-4"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <ChevronDown
            className={`w-6 h-6 text-purple-500 transition-colors ${
              isOpen ? "text-purple-700" : ""
            }`}
          />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={answerVariants}
            className="overflow-hidden"
          >
            <div
              className={`px-2 pb-6 text-neutral-600 leading-relaxed text-base ${
                isArabic ? "text-right" : "text-left"
              }`}
            >
              {isArabic ? faq.answerAr : faq.answerEn}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Apply the FaqData type to the array
  const faqs: FaqData[] = [
    {
      questionEn: "How can I track my order?",
      questionAr: "كيف يمكنني تتبع طلبي؟",
      answerEn:
        "You can track your order by logging into your account and visiting the order tracking section. You will also receive email updates about your order status.",
      answerAr:
        "يمكنك تتبع طلبك عن طريق تسجيل الدخول إلى حسابك وزيارة قسم تتبع الطلب. ستتلقى أيضًا تحديثات عبر البريد الإلكتروني حول حالة طلبك.",
    },
    {
      questionEn: "What are your delivery hours in Egypt?",
      questionAr: "ما هي ساعات التوصيل لديكم في مصر؟",
      answerEn:
        "We deliver from 9 AM to 10 PM every day across Egypt. For special occasions like Eid, we extend our delivery hours.",
      answerAr:
        "نقوم بالتوصيل من 9 صباحًا حتى 10 مساءً كل يوم في جميع أنحاء مصر. في المناسبات الخاصة مثل العيد، نقوم بتمديد ساعات التوصيل.",
    },
    {
      questionEn: "Can I modify or cancel my order?",
      questionAr: "هل يمكنني تعديل أو إلغاء طلبي؟",
      answerEn:
        "You can modify or cancel your order within 1 hour of placing it. Please contact our customer service for assistance.",
      answerAr:
        "يمكنك تعديل أو إلغاء طلبك خلال ساعة من تقديمه. يرجى الاتصال بخدمة العملاء للمساعدة.",
    },
    {
      questionEn: "What payment methods do you accept?",
      questionAr: "ما هي طرق الدفع المقبولة لديكم؟",
      answerEn:
        "We accept credit cards, debit cards, and cash on delivery. All online payments are secure and encrypted.",
      answerAr:
        "نقبل بطاقات الائتمان وبطاقات الخصم والدفع عند الاستلام. جميع المدفوعات عبر الإنترنت آمنة ومشفرة.",
    },
    {
      questionEn: "Do you offer same-day delivery?",
      questionAr: "هل تقدمون خدمة التوصيل في نفس اليوم؟",
      answerEn:
        "Yes, we offer same-day delivery for orders placed before 4 PM. This service is available in selected areas.",
      answerAr:
        "نعم، نقدم خدمة التوصيل في نفس اليوم للطلبات المقدمة قبل الساعة 4 مساءً. هذه الخدمة متوفرة في مناطق مختارة.",
    },
  ];

  const categories = [
    {
      nameEn: "Orders & Tracking",
      nameAr: "الطلبات والتتبع",
      icon: <ShoppingCart size={20} />,
    },
    { nameEn: "Shipping", nameAr: "الشحن", icon: <Truck size={20} /> },
    { nameEn: "Payments", nameAr: "المدفوعات", icon: <CreditCard size={20} /> },
    { nameEn: "General", nameAr: "أسئلة عامة", icon: <HelpCircle size={20} /> },
  ];

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 px-4 sm:px-6 lg:px-8 font-serif text-neutral-800"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-purple-800 mb-4">
            {isArabic ? "مركز المساعدة" : "Help Center"}
          </h1>
          <p className="text-lg sm:text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            {isArabic
              ? "كل ما تحتاج معرفته. هل لم تجد إجابتك؟ تواصل معنا."
              : "Everything you need to know. Can't find an answer? Contact us."}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-6 sticky top-8">
              <h2
                className={`text-2xl font-bold mb-6 ${
                  isArabic ? "text-right" : "text-left"
                }`}
              >
                {isArabic ? "المواضيع" : "Topics"}
              </h2>
              <div className="space-y-3">
                {categories.map((cat, index) => (
                  <a
                    href="#"
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg font-semibold transition-colors duration-200 ${
                      index === 0
                        ? "bg-purple-100 text-purple-800"
                        : "text-neutral-600 hover:bg-purple-50"
                    }`}
                  >
                    {cat.icon}
                    <span>{isArabic ? cat.nameAr : cat.nameEn}</span>
                  </a>
                ))}
              </div>
              <div className="mt-10 bg-purple-50 p-6 rounded-xl text-center">
                <MessageSquare className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">
                  {isArabic
                    ? "هل لديك المزيد من الأسئلة؟"
                    : "Still have questions?"}
                </h3>
                <p className="text-neutral-600 mb-6">
                  {isArabic
                    ? "فريقنا متاح للمساعدة والإجابة على استفساراتك."
                    : "Our team is here to help and answer your inquiries."}
                </p>
                <Link
                  to="/contact"
                  className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-bold shadow-md transition-colors duration-300 hover:bg-purple-700 focus:outline-none"
                >
                  {isArabic ? "اتصل بنا" : "Contact Us"}
                </Link>
              </div>
            </div>
          </aside>

          {/* Right Content: FAQ List */}
          <main className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-6 sm:p-8">
              <h2
                className={`text-3xl font-bold mb-6 ${
                  isArabic ? "text-right" : "text-left"
                }`}
              >
                {isArabic ? "الطلبات والتتبع" : "Orders & Tracking"}
              </h2>
              <div>
                {faqs.map((faq, index) => (
                  <FAQItem
                    key={index}
                    index={index}
                    faq={faq}
                    openIndex={openIndex}
                    setOpenIndex={setOpenIndex}
                    isArabic={isArabic}
                  />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
