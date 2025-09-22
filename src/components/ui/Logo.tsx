import React from "react";
import { useTranslation } from "react-i18next";
import PigeonIcon from "/photo/Logo.svg"; // ← استيراد SVG كصورة

interface LogoProps {
  small?: boolean;
  className?: string; // السماح بإضافة className
}

const Logo: React.FC<LogoProps> = ({ small = false, className }) => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  return (
    <div className={`flex items-center ${className || ""}`}>
      <div className="text-emerald-500 ">
        <img
          src={PigeonIcon}
          alt="Pigeon Icon"
          width={small ? 28 : 32}
          height={small ? 28 : 32}
        />
      </div>
      <div className={`${small ? "ml-1.5" : "ml-2"} rtl:mr-2 rtl:ml-0`}>
        <h1
          className={`font-bold tracking-tight ${
            small ? "text-lg" : "text-xl"
          } text-emeraldTeal`}
        >
          {isArabic ? "زاجل السعادة" : "Zajil Al-Sa'adah"}
        </h1>
        {!small && (
          <p className="text-xs text-neutral-400 -mt-1 font-medium">
            {isArabic ? "هدايا مميزة" : "Premium Gifts"}
          </p>
        )}
      </div>
    </div>
  );
};

export default Logo;
