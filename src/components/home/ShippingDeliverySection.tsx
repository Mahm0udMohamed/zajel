import React from "react";
import { useTranslation } from "react-i18next";
import { Clock, MapPin, Shield, CheckCircle, Link } from "lucide-react";
import { ProductImage } from "../../features/images";
import { motion } from "framer-motion";

const ShippingDeliverySection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const features = React.useMemo(
    () => [
      {
        icon: <Clock size={24} className="text-purple-600" />,
        titleKey: "home.shipping.features.sameDay.title",
        descriptionKey: "home.shipping.features.sameDay.description",
      },
      {
        icon: <MapPin size={24} className="text-purple-600" />,
        titleKey: "home.shipping.features.nationwide.title",
        descriptionKey: "home.shipping.features.nationwide.description",
      },
      {
        icon: <Shield size={24} className="text-purple-600" />,
        titleKey: "home.shipping.features.secure.title",
        descriptionKey: "home.shipping.features.secure.description",
      },
      {
        icon: <CheckCircle size={24} className="text-purple-600" />,
        titleKey: "home.shipping.features.tracking.title",
        descriptionKey: "home.shipping.features.tracking.description",
      },
    ],
    []
  );

  return (
    <section className="py-6 bg-white text-gray-900">
      <div className="container-custom px-4 sm:px-6 mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2
            className={`text-lg sm:text-xl font-bold text-gray-900 ${
              i18n.language === "ar" ? "font-tajawal" : "font-poppins"
            }`}
          >
            {t("home.shipping.title")}
          </h2>
          <Link
            to="/shipping-policy"
            className="text-orange-500 text-sm font-medium hover:text-orange-600 transition-colors"
          >
            {isRtl ? "عرض المزيد" : "View More"}
          </Link>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Content */}
          <div className={`${isRtl ? "lg:order-2" : "lg:order-1"} w-full`}>
            <p className="mt-2.5 text-sm sm:text-base max-w-xs sm:max-w-md md:max-w-lg mx-auto lg:mx-0 leading-relaxed text-gray-600 hidden lg:block">
              {t("home.shipping.description")}
            </p>

            {/* Desktop Features */}
            <div className="relative h-auto md:h-[520px] hidden md:block">
              <svg
                viewBox="0 0 200 520"
                className="absolute left-1/2 transform -translate-x-1/2 w-40 h-full z-0"
                fill="none"
                aria-hidden="true"
              >
                <motion.path
                  d="M100 0 C 40 80, 160 120, 100 180 C 40 240, 160 280, 100 340 C 40 400, 160 460, 100 520"
                  stroke="#C084FC"
                  strokeWidth="2"
                  strokeDasharray="5 5"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 2 }}
                />
              </svg>

              {features.map((feature, index) => {
                const isReversed = index % 2 === 0;
                return (
                  <div
                    key={index}
                    className={`flex items-center mb-12 md:mb-16 relative ${
                      isReversed ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div className="flex-shrink-0 z-10 absolute left-1/2 transform -translate-x-1/2">
                      <div className="p-2 bg-white rounded-full border-4 border-purple-100 shadow-md">
                        {feature.icon}
                      </div>
                    </div>
                    <div
                      className={`w-5/12 ${
                        isReversed ? "text-left mr-auto" : "text-right ml-auto"
                      }`}
                    >
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-lg p-4 transition-all duration-300">
                        <h3 className="font-medium text-gray-900 text-sm mb-1">
                          {t(feature.titleKey)}
                        </h3>
                        <p className="text-gray-600 text-xs leading-relaxed">
                          {t(feature.descriptionKey)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden mt-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-3"
                >
                  <div className="flex items-center mb-2">
                    <div className="p-1 bg-purple-100 rounded-full mr-2">
                      {feature.icon}
                    </div>
                    <h3 className="font-medium text-gray-900 text-sm">
                      {t(feature.titleKey)}
                    </h3>
                  </div>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    {t(feature.descriptionKey)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div
            className={`${isRtl ? "lg:order-1" : "lg:order-2"} relative w-full`}
          >
            <div className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden scale-90 md:scale-75 lg:scale-75 transform transition-all duration-300 ">
              <div className="absolute inset-0 shadow-lg z-10"></div>
              <ProductImage
                src="https://res.cloudinary.com/djpl34pm6/image/upload/v1756382833/Delivery_rwexlr.png"
                alt={t("home.shipping.imageAlt")}
                className="w-full h-auto object-contain rounded-t-2xl md:rounded-t-3xl relative z-0"
                width={1260}
                height={750}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 50vw"
                quality={100}
                priority={false}
                showZoom={false}
                placeholderSize={50}
                fallbackSrc="https://images.pexels.com/photos/1058775/pexels-photo-1058775.jpeg?auto=compress&cs=tinysrgb&w=800"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(ShippingDeliverySection);
