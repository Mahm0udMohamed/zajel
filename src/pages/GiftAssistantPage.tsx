import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wand2,
  Heart,
  Gift,
  User,
  Calendar,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import { allProducts } from "../data";
import { ProductImage } from "../features/images";
import AddToCartButton from "../components/ui/AddToCartButton";
import FavoriteButton from "../components/ui/FavoriteButton";

interface GiftAssistantForm {
  occasion: string;
  relationship: string;
  budget: string;
  interests: string[];
  age: string;
  gender: string;
}

const GiftAssistantPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recommendations, setRecommendations] = useState<
    Array<{
      id: number;
      nameEn: string;
      nameAr: string;
      price: number;
      imageUrl: string;
      categoryId?: string;
      occasionId?: string;
      isBestSeller?: boolean;
      isSpecialGift?: boolean;
      descriptionEn?: string;
      descriptionAr?: string;
    }>
  >([]);

  const [form, setForm] = useState<GiftAssistantForm>({
    occasion: "",
    relationship: "",
    budget: "",
    interests: [],
    age: "",
    gender: "",
  });

  const occasions = [
    { id: "birthday", label: isRtl ? "عيد ميلاد" : "Birthday", icon: "🎂" },
    {
      id: "anniversary",
      label: isRtl ? "ذكرى سنوية" : "Anniversary",
      icon: "💕",
    },
    { id: "wedding", label: isRtl ? "زفاف" : "Wedding", icon: "💒" },
    { id: "graduation", label: isRtl ? "تخرج" : "Graduation", icon: "🎓" },
    { id: "eid", label: isRtl ? "عيد" : "Eid", icon: "🌙" },
    { id: "thank-you", label: isRtl ? "شكر" : "Thank You", icon: "🙏" },
  ];

  const relationships = [
    { id: "family", label: isRtl ? "عائلة" : "Family", icon: "👨‍👩‍👧‍👦" },
    { id: "friend", label: isRtl ? "صديق" : "Friend", icon: "👫" },
    { id: "colleague", label: isRtl ? "زميل عمل" : "Colleague", icon: "👔" },
    { id: "partner", label: isRtl ? "شريك حياة" : "Partner", icon: "💑" },
    { id: "teacher", label: isRtl ? "معلم" : "Teacher", icon: "👩‍🏫" },
  ];

  const budgetRanges = [
    {
      id: "low",
      label: isRtl ? "أقل من 200 ر.س" : "Under 200 SAR",
      min: 0,
      max: 199,
    },
    {
      id: "medium",
      label: isRtl ? "200 - 500 ر.س" : "200 - 500 SAR",
      min: 200,
      max: 500,
    },
    {
      id: "high",
      label: isRtl ? "500 - 1000 ر.س" : "500 - 1000 SAR",
      min: 500,
      max: 1000,
    },
    {
      id: "luxury",
      label: isRtl ? "أكثر من 1000 ر.س" : "Over 1000 SAR",
      min: 1000,
      max: Infinity,
    },
  ];

  const interests = [
    {
      id: "beauty",
      label: isRtl ? "الجمال والعناية" : "Beauty & Care",
      icon: "💄",
    },
    { id: "flowers", label: isRtl ? "الزهور" : "Flowers", icon: "🌸" },
    { id: "jewelry", label: isRtl ? "المجوهرات" : "Jewelry", icon: "💎" },
    { id: "perfumes", label: isRtl ? "العطور" : "Perfumes", icon: "🌺" },
    { id: "plants", label: isRtl ? "النباتات" : "Plants", icon: "🌱" },
    { id: "sweets", label: isRtl ? "الحلويات" : "Sweets", icon: "🍫" },
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      analyzeAndRecommend();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleInterest = (interestId: string) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter((id) => id !== interestId)
        : [...prev.interests, interestId],
    }));
  };

  const analyzeAndRecommend = async () => {
    setIsAnalyzing(true);

    // Simulate AI analysis
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate recommendations based on form data
    const budget = budgetRanges.find((b) => b.id === form.budget);
    let filteredProducts = allProducts.filter((product) => {
      if (budget) {
        if (product.price < budget.min || product.price > budget.max) {
          return false;
        }
      }

      // Filter by interests
      if (form.interests.length > 0) {
        return form.interests.some((interest) => {
          switch (interest) {
            case "beauty":
              return (
                product.categoryId === "beauty-care" ||
                product.categoryId === "personal-care"
              );
            case "flowers":
              return product.categoryId === "flowers";
            case "jewelry":
              return product.categoryId === "jewelry";
            case "perfumes":
              return product.categoryId === "perfumes";
            case "plants":
              return product.categoryId === "plants";
            case "sweets":
              return product.categoryId === "chocolate-cake";
            default:
              return true;
          }
        });
      }

      return true;
    });

    // Sort by relevance (best sellers first, then special gifts)
    filteredProducts = filteredProducts
      .sort((a, b) => {
        if (a.isBestSeller && !b.isBestSeller) return -1;
        if (!a.isBestSeller && b.isBestSeller) return 1;
        if (a.isSpecialGift && !b.isSpecialGift) return -1;
        if (!a.isSpecialGift && b.isSpecialGift) return 1;
        return 0;
      })
      .slice(0, 6);

    setRecommendations(filteredProducts);
    setIsAnalyzing(false);
    setShowResults(true);
  };

  const resetAssistant = () => {
    setCurrentStep(1);
    setShowResults(false);
    setForm({
      occasion: "",
      relationship: "",
      budget: "",
      interests: [],
      age: "",
      gender: "",
    });
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return form.occasion && form.relationship;
      case 2:
        return form.budget;
      case 3:
        return form.interests.length > 0;
      case 4:
        return form.age && form.gender;
      default:
        return false;
    }
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8 font-serif text-neutral-800">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-purple-800 mb-4">
              {isRtl ? "اقتراحاتنا المثالية لك" : "Our Perfect Recommendations"}
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              {isRtl
                ? "بناءً على اختياراتك، وجدنا هذه الهدايا المثالية التي ستسعد المستقبل"
                : "Based on your choices, we found these perfect gifts that will delight the recipient"}
            </p>
            <button
              onClick={resetAssistant}
              className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              {isRtl ? "بحث جديد" : "New Search"}
            </button>
          </motion.div>

          {recommendations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <ProductImage
                      src={product.imageUrl}
                      alt={isRtl ? product.nameAr : product.nameEn}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      width={300}
                      height={300}
                      aspectRatio="square"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      quality={100}
                      priority={index < 3}
                      showZoom={false}
                    />
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Star size={12} />
                      {isRtl ? "مقترح" : "Recommended"}
                    </div>
                    <div className="absolute top-3 right-3">
                      <FavoriteButton
                        product={product}
                        className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-md"
                        size={16}
                      />
                    </div>
                  </div>
                  <div className="p-6">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="text-lg font-bold text-gray-800 hover:text-purple-600 transition-colors mb-2 line-clamp-2">
                        {isRtl ? product.nameAr : product.nameEn}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xl font-bold text-purple-700">
                        {product.price} {isRtl ? "ر.س" : "SAR"}
                      </p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={`${
                              i < 4
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <AddToCartButton
                      product={product}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-medium hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Gift size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {isRtl
                  ? "لم نجد اقتراحات مناسبة"
                  : "No Suitable Recommendations"}
              </h3>
              <p className="text-gray-600 mb-6">
                {isRtl
                  ? "جرب تعديل معايير البحث للحصول على نتائج أفضل"
                  : "Try adjusting your search criteria for better results"}
              </p>
              <button
                onClick={resetAssistant}
                className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors"
              >
                {isRtl ? "بحث جديد" : "New Search"}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8 font-serif text-neutral-800">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full mb-6">
            <Wand2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-purple-800 mb-4">
            {isRtl
              ? "مساعد اختيار الهدية المثالية"
              : "Perfect Gift Selection Assistant"}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {isRtl
              ? "أجب على بعض الأسئلة البسيطة وسنساعدك في العثور على الهدية المثالية"
              : "Answer a few simple questions and we'll help you find the perfect gift"}
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            {[1, 2, 3, 4].map((step) => (
              <React.Fragment key={step}>
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition-all duration-300 ${
                    currentStep >= step
                      ? "bg-purple-600 text-white shadow-md"
                      : "bg-gray-200 text-gray-500"
                  }`}
                  animate={currentStep === step ? { scale: [1, 1.1, 1] } : {}}
                  transition={{
                    duration: 0.6,
                    repeat: currentStep === step ? Infinity : 0,
                  }}
                >
                  {currentStep > step ? <CheckCircle size={18} /> : step}
                </motion.div>
                {step < 4 && (
                  <div
                    className={`w-8 h-1 rounded-full transition-all duration-300 ${
                      currentStep > step ? "bg-purple-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <motion.div
          className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: isRtl ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRtl ? 30 : -30 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <Calendar className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {isRtl ? "ما هي المناسبة؟" : "What's the occasion?"}
                  </h2>
                  <p className="text-gray-600">
                    {isRtl
                      ? "اختر المناسبة المناسبة"
                      : "Choose the right occasion"}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {occasions.map((occasion) => (
                    <motion.button
                      key={occasion.id}
                      type="button"
                      onClick={() =>
                        setForm({ ...form, occasion: occasion.id })
                      }
                      className={`p-4 rounded-xl border transition-all duration-300 ${
                        form.occasion === occasion.id
                          ? "bg-purple-600 text-white border-purple-600 shadow-lg"
                          : "border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-2xl mb-2">{occasion.icon}</div>
                      <div className="font-medium text-sm">
                        {occasion.label}
                      </div>
                    </motion.button>
                  ))}
                </div>

                <div className="text-center mb-6">
                  <User className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {isRtl
                      ? "ما هي علاقتك بالمستقبل؟"
                      : "What's your relationship?"}
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {relationships.map((relationship) => (
                    <motion.button
                      key={relationship.id}
                      type="button"
                      onClick={() =>
                        setForm({ ...form, relationship: relationship.id })
                      }
                      className={`p-4 rounded-xl border transition-all duration-300 ${
                        form.relationship === relationship.id
                          ? "bg-purple-600 text-white border-purple-600 shadow-lg"
                          : "border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-2xl mb-2">{relationship.icon}</div>
                      <div className="font-medium text-sm">
                        {relationship.label}
                      </div>
                    </motion.button>
                  ))}
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
                <div className="text-center mb-8">
                  <DollarSign className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {isRtl ? "ما هي ميزانيتك؟" : "What's your budget?"}
                  </h2>
                  <p className="text-gray-600">
                    {isRtl
                      ? "اختر النطاق السعري المناسب"
                      : "Choose your price range"}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {budgetRanges.map((budget) => (
                    <motion.button
                      key={budget.id}
                      type="button"
                      onClick={() => setForm({ ...form, budget: budget.id })}
                      className={`p-6 rounded-xl border transition-all duration-300 ${
                        form.budget === budget.id
                          ? "bg-purple-600 text-white border-purple-600 shadow-lg"
                          : "border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="font-bold text-lg mb-1">
                        {budget.label}
                      </div>
                      <div
                        className={`text-sm ${
                          form.budget === budget.id
                            ? "text-white/80"
                            : "text-gray-500"
                        }`}
                      >
                        {budget.id === "luxury"
                          ? isRtl
                            ? "للهدايا الفاخرة"
                            : "For luxury gifts"
                          : isRtl
                          ? "مناسب للمعظم"
                          : "Suitable for most"}
                      </div>
                    </motion.button>
                  ))}
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
                <div className="text-center mb-8">
                  <Heart className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {isRtl ? "ما هي اهتماماته؟" : "What are their interests?"}
                  </h2>
                  <p className="text-gray-600">
                    {isRtl
                      ? "اختر الاهتمامات المناسبة (يمكن اختيار أكثر من واحد)"
                      : "Select relevant interests (multiple choices allowed)"}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {interests.map((interest) => (
                    <motion.button
                      key={interest.id}
                      type="button"
                      onClick={() => toggleInterest(interest.id)}
                      className={`p-4 rounded-xl border transition-all duration-300 ${
                        form.interests.includes(interest.id)
                          ? "bg-purple-600 text-white border-purple-600 shadow-lg"
                          : "border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-2xl mb-2">{interest.icon}</div>
                      <div className="font-medium text-sm">
                        {interest.label}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: isRtl ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRtl ? 30 : -30 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <User className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {isRtl ? "معلومات إضافية" : "Additional Information"}
                  </h2>
                  <p className="text-gray-600">
                    {isRtl
                      ? "لمساعدتنا في تقديم اقتراحات أفضل"
                      : "To help us provide better suggestions"}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      {isRtl ? "الفئة العمرية" : "Age Group"}
                    </label>
                    <div className="space-y-2">
                      {[
                        {
                          id: "child",
                          label: isRtl ? "طفل (أقل من 12)" : "Child (Under 12)",
                        },
                        {
                          id: "teen",
                          label: isRtl ? "مراهق (12-18)" : "Teen (12-18)",
                        },
                        {
                          id: "adult",
                          label: isRtl ? "بالغ (18-60)" : "Adult (18-60)",
                        },
                        {
                          id: "senior",
                          label: isRtl ? "كبير السن (60+)" : "Senior (60+)",
                        },
                      ].map((age) => (
                        <label
                          key={age.id}
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="age"
                            value={age.id}
                            checked={form.age === age.id}
                            onChange={(e) =>
                              setForm({ ...form, age: e.target.value })
                            }
                            className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                          />
                          <span className="text-gray-700">{age.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      {isRtl ? "الجنس" : "Gender"}
                    </label>
                    <div className="space-y-2">
                      {[
                        { id: "male", label: isRtl ? "ذكر" : "Male" },
                        { id: "female", label: isRtl ? "أنثى" : "Female" },
                        {
                          id: "unisex",
                          label: isRtl ? "مناسب للجميع" : "Unisex",
                        },
                      ].map((gender) => (
                        <label
                          key={gender.id}
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="gender"
                            value={gender.id}
                            checked={form.gender === gender.id}
                            onChange={(e) =>
                              setForm({ ...form, gender: e.target.value })
                            }
                            className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                          />
                          <span className="text-gray-700">{gender.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <motion.button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                currentStep === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              whileHover={currentStep > 1 ? { scale: 1.02 } : {}}
              whileTap={currentStep > 1 ? { scale: 0.98 } : {}}
            >
              {isRtl ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
              {isRtl ? "السابق" : "Previous"}
            </motion.button>

            <motion.button
              type="button"
              onClick={handleNext}
              disabled={!isStepValid() || isAnalyzing}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                isStepValid() && !isAnalyzing
                  ? "bg-purple-600 text-white hover:bg-purple-700 shadow-lg"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
              whileHover={isStepValid() && !isAnalyzing ? { scale: 1.02 } : {}}
              whileTap={isStepValid() && !isAnalyzing ? { scale: 0.98 } : {}}
            >
              {isAnalyzing ? (
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
                  <span>{isRtl ? "جاري التحليل..." : "Analyzing..."}</span>
                </>
              ) : (
                <>
                  <span>
                    {currentStep === 4
                      ? isRtl
                        ? "العثور على الهدايا"
                        : "Find Gifts"
                      : isRtl
                      ? "التالي"
                      : "Next"}
                  </span>
                  {isRtl ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GiftAssistantPage;
