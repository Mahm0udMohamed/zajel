import React from "react";
import { useTranslation } from "react-i18next";

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLanguage = i18n.language === "ar" ? "en" : "ar";
    i18n.changeLanguage(newLanguage);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center text-gray-700 hover:text-primary transition-colors"
    >
      <span className="text-sm font-medium">
        {i18n.language === "ar" ? "English" : "العربية"}
      </span>
    </button>
  );
};

export default LanguageSwitcher;
