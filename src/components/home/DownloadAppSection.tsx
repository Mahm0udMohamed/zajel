import React from "react";
import { useTranslation } from "react-i18next";
import { Apple, Gift, Zap, ShieldCheck } from "lucide-react";

const DownloadAppSection: React.FC = () => {
  const { t } = useTranslation();

  const features = React.useMemo(
    () => [
      {
        icon: <Gift size={22} className="text-purple-600" />,
        text: t("home.downloadApp.features.feature1"),
      },
      {
        icon: <Zap size={22} className="text-purple-600" />,
        text: t("home.downloadApp.features.feature2"),
      },
      {
        icon: <ShieldCheck size={22} className="text-purple-600" />,
        text: t("home.downloadApp.features.feature3"),
      },
    ],
    [t]
  );

  const downloadButtons = React.useMemo(
    () => [
      {
        href: "https://www.apple.com/app-store/",
        icon: <Apple size={24} />,
        label: t("home.downloadApp.downloadOn"),
        storeName: "App Store",
      },
      {
        href: "https://play.google.com/store",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-6 h-6 fill-current"
          >
            <path d="M3.063 3.627A1.947 1.947 0 0 0 3 4.02v15.96c0 .72.405 1.384 1.055 1.723l7.89-9.683-7.882-9.393zm.742 16.028l7.878-9.677 2.47 2.945-10.348 6.732zm10.612-6.918l-2.6-3.102L21.001 4.02c.374.218.666.548.832.941L12.42 12.74zm1.553-1.356l6.53-6.55c.147.366.227.78.227 1.23v15.13c0 .63-.166 1.21-.453 1.71l-6.304-6.55 6.57-6.57-6.57-6.57z" />
          </svg>
        ),
        label: t("home.downloadApp.getItOn"),
        storeName: "Google Play",
      },
    ],
    [t]
  );

  return (
    <section className="py-3 sm:py-12">
      <div className="container-custom px-4 sm:px-16">
        <div className="p-6 sm:p-12 md:p-16">
          <div className="max-w-2xl mx-auto text-center">
            <img
              src="https://res.cloudinary.com/djpl34pm6/image/upload/v1756382841/DownloadAppSection_uwewjn.png"
              alt={t("home.downloadApp.title")}
              className="w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-6 rounded-lg object-cover"
            />
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-purple-900 leading-tight">
              {t("home.downloadApp.title")}
            </h2>
            <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-xl mx-auto">
              {t("home.downloadApp.description")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-10 mb-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-x-3 bg-white/80 backdrop-blur-sm rounded-full py-2 px-4 border border-purple-200 shadow-sm transition-all hover:shadow-md w-full sm:w-auto justify-center"
              >
                <div className="flex-shrink-0">{feature.icon}</div>
                <span className="text-gray-700 text-sm font-medium">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            {downloadButtons.map((button) => (
              <a
                key={button.storeName}
                href={button.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group w-full sm:w-auto flex items-center justify-center sm:justify-start py-2 px-4 sm:py-3 sm:px-5 bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-fuchsia-300/50 transform hover:-translate-y-1"
              >
                <div className="flex-shrink-0 rtl:ml-2 ltr:mr-2 sm:rtl:ml-3 sm:ltr:mr-3 transform transition-transform duration-300 group-hover:scale-110">
                  {button.icon}
                </div>
                <div className="rtl:text-right ltr:text-left">
                  <p className="text-xs opacity-80 font-light tracking-wide">
                    {button.label}
                  </p>
                  <p className="text-base sm:text-lg font-semibold">
                    {button.storeName}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(DownloadAppSection);
