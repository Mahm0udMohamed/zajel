import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Send,
  Mail,
  Phone,
  MessageCircle,
  Gift,
  Sparkles,
  Heart,
  Star,
  Zap,
  CheckCircle,
  Clock,
  User,
  Calendar,
  Wand2,
  PartyPopper,
  Smile,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductImage } from "../features/images";

interface NotificationForm {
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  message: string;
  occasion: string;
  sendMethod: "email" | "sms" | "both";
}

interface FloatingElement {
  id: number;
  x: number;
  y: number;
  icon: React.ReactNode;
  color: string;
  delay: number;
}

const NotificationsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const containerRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<NotificationForm>({
    recipientName: "",
    recipientEmail: "",
    recipientPhone: "",
    message: "",
    occasion: "",
    sendMethod: "email",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [floatingElements, setFloatingElements] = useState<FloatingElement[]>(
    []
  );

  useEffect(() => {
    const elements: FloatingElement[] = [];
    const icons = [
      <Heart size={16} />,
      <Star size={16} />,
      <Sparkles size={16} />,
      <Gift size={16} />,
      <PartyPopper size={16} />,
      <Smile size={16} />,
    ];
    const colors = [
      "text-purple-400",
      "text-pink-400",
      "text-rose-400",
      "text-fuchsia-400",
      "text-violet-400",
      "text-indigo-400",
    ];

    for (let i = 0; i < 10; i++) {
      elements.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        icon: icons[Math.floor(Math.random() * icons.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 3,
      });
    }
    setFloatingElements(elements);
  }, []);

  const occasions = [
    {
      value: "birthday",
      labelKey: "notifications.occasions.birthday",
      icon: <PartyPopper size={20} />,
      color: "from-purple-600 to-fuchsia-600",
    },
    {
      value: "anniversary",
      labelKey: "notifications.occasions.anniversary",
      icon: <Heart size={20} />,
      color: "from-rose-600 to-pink-600",
    },
    {
      value: "wedding",
      labelKey: "notifications.occasions.wedding",
      icon: <Sparkles size={20} />,
      color: "from-violet-600 to-purple-600",
    },
    {
      value: "graduation",
      labelKey: "notifications.occasions.graduation",
      icon: <Star size={20} />,
      color: "from-indigo-600 to-blue-600",
    },
    {
      value: "eid",
      labelKey: "notifications.occasions.eid",
      icon: <Gift size={20} />,
      color: "from-emerald-600 to-teal-600",
    },
    {
      value: "thank-you",
      labelKey: "notifications.occasions.thankYou",
      icon: <Smile size={20} />,
      color: "from-amber-600 to-orange-600",
    },
    {
      value: "congratulations",
      labelKey: "notifications.occasions.congratulations",
      icon: <Zap size={20} />,
      color: "from-fuchsia-600 to-purple-600",
    },
  ];

  const sendMethods = [
    {
      value: "email",
      icon: <Mail size={20} />,
      label: t("notifications.email"),
      description: isRtl ? "إرسال فوري وموثوق" : "Instant & Reliable",
      color: "from-blue-600 to-cyan-600",
    },
    {
      value: "sms",
      icon: <MessageCircle size={20} />,
      label: t("notifications.sms"),
      description: isRtl ? "وصول مباشر" : "Direct Reach",
      color: "from-emerald-600 to-teal-600",
    },
    {
      value: "both",
      icon: <Zap size={20} />,
      label: t("notifications.both"),
      description: isRtl ? "تأثير مضاعف" : "Double Impact",
      color: "from-purple-600 to-fuchsia-600",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setForm({
        recipientName: "",
        recipientEmail: "",
        recipientPhone: "",
        message: "",
        occasion: "",
        sendMethod: "email",
      });
      setCurrentStep(1);
    }, 3000);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return form.recipientName && form.occasion;
      case 2:
        return (
          form.sendMethod &&
          (form.sendMethod === "email" || form.sendMethod === "both"
            ? form.recipientEmail
            : true) &&
          (form.sendMethod === "sms" || form.sendMethod === "both"
            ? form.recipientPhone
            : true)
        );
      case 3:
        return form.message;
      default:
        return false;
    }
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 relative overflow-hidden font-serif text-neutral-800"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingElements.map((element) => (
          <motion.div
            key={element.id}
            className={`absolute ${element.color} opacity-30`}
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
            }}
            animate={{
              y: [0, -15, 0],
              rotate: [0, 180, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3 + Math.random(),
              repeat: Infinity,
              delay: element.delay,
              ease: "easeInOut",
            }}
          >
            {element.icon}
          </motion.div>
        ))}
      </div>

      <div className="container-custom py-12 sm:py-18 px-4 sm:px-6 relative z-10">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/90 rounded-full shadow-md mb-6">
              <Wand2 size={28} className="text-purple-800" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-medium text-purple-800 leading-tight">
              {t("notifications.title")}
            </h1>
            <p className="mt-2.5 text-sm sm:text-base max-w-xs sm:max-w-md md:max-w-lg mx-auto leading-relaxed text-gray-600">
              {t("notifications.description")}
            </p>
          </motion.div>

          <motion.div
            className="flex justify-center mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              {[1, 2, 3].map((step) => (
                <React.Fragment key={step}>
                  <motion.div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition-all duration-300 ${
                      currentStep >= step
                        ? "bg-purple-600 text-white shadow-md"
                        : "bg-neutral-100 text-neutral-500 border border-neutral-200"
                    }`}
                    whileHover={{ scale: 1.1 }}
                    animate={
                      currentStep === step ? { scale: [1, 1.05, 1] } : {}
                    }
                    transition={{
                      duration: 0.6,
                      repeat: currentStep === step ? Infinity : 0,
                    }}
                  >
                    {currentStep > step ? <CheckCircle size={18} /> : step}
                  </motion.div>
                  {step < 3 && (
                    <div
                      className={`w-6 h-1 rounded-full transition-all duration-300 ${
                        currentStep > step ? "bg-purple-600" : "bg-neutral-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-6 sm:p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: isRtl ? -30 : 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isRtl ? 30 : -30 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <h3 className="font-serif text-xl sm:text-2xl font-medium text-purple-800 leading-tight">
                        {isRtl ? "من المستقبل؟" : "Who's the recipient?"}
                      </h3>
                      <p className="mt-2 text-sm text-gray-600">
                        {isRtl
                          ? "أخبرنا عن الشخص المميز"
                          : "Tell us about the special person"}
                      </p>
                    </div>

                    <div className="relative">
                      <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-2">
                        <User size={16} className="text-purple-600" />
                        {t("notifications.recipientName")}
                      </label>
                      <input
                        type="text"
                        name="recipientName"
                        value={form.recipientName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-purple-400 bg-neutral-50 text-sm transition-all duration-300"
                        placeholder={
                          isRtl ? "اسم الشخص المميز" : "Special person's name"
                        }
                        required
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-4">
                        <Calendar size={16} className="text-purple-600" />
                        {t("notifications.occasion")}
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {occasions.map((occasion) => (
                          <motion.button
                            key={occasion.value}
                            type="button"
                            onClick={() =>
                              setForm({ ...form, occasion: occasion.value })
                            }
                            className={`p-3 rounded-lg border transition-all duration-300 ${
                              form.occasion === occasion.value
                                ? `bg-gradient-to-r ${occasion.color} text-white border-transparent shadow-md`
                                : "border-neutral-200 bg-white hover:border-purple-300"
                            }`}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                          >
                            <div className="flex flex-col items-center gap-2">
                              {occasion.icon}
                              <span className="text-xs font-medium">
                                {t(occasion.labelKey)}
                              </span>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: isRtl ? -30 : 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isRtl ? 30 : -30 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <h3 className="font-serif text-xl sm:text-2xl font-medium text-purple-800 leading-tight">
                        {isRtl ? "كيف تريد الإرسال؟" : "How to send?"}
                      </h3>
                      <p className="mt-2 text-sm text-gray-600">
                        {isRtl
                          ? "اختر الطريقة المناسبة"
                          : "Choose the perfect method"}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {sendMethods.map((method) => (
                        <motion.button
                          key={method.value}
                          type="button"
                          onClick={() =>
                            setForm({
                              ...form,
                              sendMethod: method.value as
                                | "email"
                                | "sms"
                                | "both",
                            })
                          }
                          className={`p-3 rounded-lg border transition-all duration-300 ${
                            form.sendMethod === method.value
                              ? `bg-gradient-to-r ${method.color} text-white border-transparent shadow-md`
                              : "border-neutral-200 bg-white hover:border-purple-300"
                          }`}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            {method.icon}
                            <div className="text-left rtl:text-right">
                              <div className="text-sm font-medium">
                                {method.label}
                              </div>
                              <div className="text-xs opacity-80">
                                {method.description}
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>

                    <div className="space-y-4">
                      {(form.sendMethod === "email" ||
                        form.sendMethod === "both") && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="relative"
                        >
                          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-2">
                            <Mail size={16} className="text-purple-600" />
                            {t("notifications.recipientEmail")}
                          </label>
                          <input
                            type="email"
                            name="recipientEmail"
                            value={form.recipientEmail}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-purple-400 bg-neutral-50 text-sm transition-all duration-300"
                            placeholder="example@email.com"
                            required
                          />
                        </motion.div>
                      )}

                      {(form.sendMethod === "sms" ||
                        form.sendMethod === "both") && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="relative"
                        >
                          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-2">
                            <Phone size={16} className="text-purple-600" />
                            {t("notifications.recipientPhone")}
                          </label>
                          <input
                            type="tel"
                            name="recipientPhone"
                            value={form.recipientPhone}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-purple-400 bg-neutral-50 text-sm transition-all duration-300"
                            placeholder="+966 50 123 4567"
                            required
                          />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: isRtl ? -30 : 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isRtl ? 30 : -30 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <h3 className="font-serif text-xl sm:text-2xl font-medium text-purple-800 leading-tight">
                        {isRtl ? "رسالتك المميزة" : "Your special message"}
                      </h3>
                      <p className="mt-2 text-sm text-gray-600">
                        {isRtl
                          ? "اكتب كلمات من القلب"
                          : "Write words from the heart"}
                      </p>
                    </div>

                    <div className="relative">
                      <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-2">
                        <MessageCircle size={16} className="text-purple-600" />
                        {t("notifications.message")}
                      </label>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        rows={5}
                        className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-purple-400 bg-neutral-50 text-sm transition-all duration-300 resize-none"
                        placeholder={t("notifications.messagePlaceholder")}
                        required
                      />
                      <div className="absolute bottom-3 right-3 rtl:left-3 rtl:right-auto text-xs text-neutral-400">
                        {form.message.length}/500
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between items-center mt-8 pt-6 border-t border-neutral-200">
                <motion.button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                    currentStep === 1
                      ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                      : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
                  }`}
                  whileHover={currentStep > 1 ? { scale: 1.03 } : {}}
                  whileTap={currentStep > 1 ? { scale: 0.97 } : {}}
                >
                  {isRtl ? "السابق" : "Previous"}
                </motion.button>

                {currentStep < 3 ? (
                  <motion.button
                    type="button"
                    onClick={nextStep}
                    disabled={!isStepValid()}
                    className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                      isStepValid()
                        ? "bg-purple-600 text-white hover:bg-purple-700 shadow-md"
                        : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                    }`}
                    whileHover={isStepValid() ? { scale: 1.03 } : {}}
                    whileTap={isStepValid() ? { scale: 0.97 } : {}}
                  >
                    {isRtl ? "التالي" : "Next"}
                  </motion.button>
                ) : (
                  <motion.button
                    type="submit"
                    disabled={!isStepValid() || isSubmitting}
                    className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-2 rtl:space-x-reverse ${
                      isStepValid() && !isSubmitting
                        ? "bg-purple-600 text-white hover:bg-purple-700 shadow-md"
                        : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                    }`}
                    whileHover={
                      isStepValid() && !isSubmitting ? { scale: 1.03 } : {}
                    }
                    whileTap={
                      isStepValid() && !isSubmitting ? { scale: 0.97 } : {}
                    }
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                        <span>{isRtl ? "جاري الإرسال..." : "Sending..."}</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>{t("notifications.sendGreeting")}</span>
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </form>
          </motion.div>

          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-purple-800 leading-tight text-center mb-8">
              {t("notifications.recentNotifications")}
            </h2>
            <div className="space-y-4">
              {[
                {
                  name: isRtl ? "أحمد محمد" : "Ahmed Mohamed",
                  time: isRtl ? "منذ ساعتين" : "2 hours ago",
                  message: t("notifications.sampleMessage1"),
                  occasion: "birthday",
                  color: "from-purple-600 to-fuchsia-600",
                  image:
                    "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100",
                },
                {
                  name: isRtl ? "فاطمة علي" : "Fatima Ali",
                  time: isRtl ? "أمس" : "Yesterday",
                  message: t("notifications.sampleMessage2"),
                  occasion: "graduation",
                  color: "from-indigo-600 to-blue-600",
                  image:
                    "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100",
                },
              ].map((notification, index) => (
                <motion.div
                  key={index}
                  className="bg-white rounded-xl shadow-md border border-neutral-100 p-4"
                  initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.2 }}
                  whileHover={{ scale: 1.01, y: -2 }}
                >
                  <div className="flex items-start space-x-3 rtl:space-x-reverse">
                    <ProductImage
                      src={notification.image}
                      alt={notification.name}
                      className="w-12 h-12 rounded-full object-cover border border-neutral-100"
                      width={48}
                      height={48}
                      aspectRatio="square"
                      sizes="48px"
                      quality={100}
                      showZoom={false}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-neutral-800 text-sm">
                          {notification.name}
                        </span>
                        <span className="text-xs text-neutral-500 flex items-center gap-1">
                          <Clock size={12} />
                          {notification.time}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600 line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full text-center shadow-lg border border-neutral-100"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} className="text-white" />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-medium text-purple-800 mb-4">
                {isRtl ? "تم الإرسال بنجاح!" : "Successfully Sent!"}
              </h3>
              <p className="text-sm text-neutral-600 mb-6">
                {t("notifications.successMessage")}
              </p>
              <motion.button
                onClick={() => setShowSuccess(false)}
                className="px-6 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isRtl ? "إغلاق" : "Close"}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(NotificationsPage);
