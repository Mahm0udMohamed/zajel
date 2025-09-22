import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ProductImage } from "../features/images";

const brands = [
  {
    id: "brand1",
    nameEn: "Luxury Gifts",
    nameAr: "هدايا فاخرة",
    imageUrl:
      "https://images.pexels.com/photos/3987023/pexels-photo-3987023.jpeg?auto=compress&cs=tinysrgb&w=600",
    descriptionEn: "Premium luxury gifts for special occasions",
    descriptionAr: "هدايا فاخرة مميزة للمناسبات الخاصة",
  },
  {
    id: "brand2",
    nameEn: "Bloom Boutique",
    nameAr: "بلوم بوتيك",
    imageUrl:
      "https://images.pexels.com/photos/144429/pexels-photo-144429.jpeg?auto=compress&cs=tinysrgb&w=600",
    descriptionEn: "Beautiful floral arrangements and botanical gifts",
    descriptionAr: "ترتيبات زهور جميلة وهدايا نباتية",
  },
  {
    id: "brand3",
    nameEn: "Sweet Elegance",
    nameAr: "أناقة حلوة",
    imageUrl:
      "https://images.pexels.com/photos/1123262/pexels-photo-1123262.jpeg?auto=compress&cs=tinysrgb&w=600",
    descriptionEn: "Elegant sweets and confectionery delights",
    descriptionAr: "حلويات أنيقة ومتعة الحلويات",
  },
  {
    id: "brand4",
    nameEn: "Golden Moments",
    nameAr: "لحظات ذهبية",
    imageUrl:
      "https://images.pexels.com/photos/278932/pexels-photo-278932.jpeg?auto=compress&cs=tinysrgb&w=600",
    descriptionEn: "Timeless jewelry and precious accessories",
    descriptionAr: "مجوهرات خالدة وإكسسوارات ثمينة",
  },
];

const BrandsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 px-4 sm:px-6 lg:px-8 font-serif text-neutral-800">
      <div className="max-w-7xl mx-auto py-12">
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-purple-800 mb-4"
          >
            {t("navigation.brands")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-neutral-600 max-w-2xl mx-auto"
          >
            {isRtl
              ? "اكتشف مجموعتنا المختارة من أفضل العلامات التجارية والماركات المميزة"
              : "Discover our curated collection of the finest brands and distinctive labels"}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {brands.map((brand, index) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                to={`/brand/${brand.id}`}
                className="group block bg-white rounded-2xl shadow-lg border border-neutral-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="relative aspect-square overflow-hidden">
                  <ProductImage
                    src={brand.imageUrl}
                    alt={isRtl ? brand.nameAr : brand.nameEn}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    width={300}
                    height={300}
                    aspectRatio="square"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 300px"
                    quality={100}
                    priority={index < 4}
                    showZoom={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <h3 className="text-white font-bold text-lg mb-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      {isRtl ? brand.nameAr : brand.nameEn}
                    </h3>
                    <p className="text-white/90 text-sm opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                      {isRtl ? brand.descriptionAr : brand.descriptionEn}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-purple-50 to-rose-50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-600">
                      {isRtl ? "استكشف المجموعة" : "Explore Collection"}
                    </span>
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center group-hover:bg-purple-700 transition-colors duration-300">
                      <svg
                        className="w-3 h-3 text-white transform group-hover:translate-x-0.5 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={isRtl ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 bg-white rounded-2xl shadow-lg p-8 border border-neutral-100 text-center"
        >
          <h2 className="text-2xl font-bold text-purple-800 mb-4">
            {isRtl ? "شراكات مميزة" : "Premium Partnerships"}
          </h2>
          <p className="text-neutral-600 mb-6 max-w-3xl mx-auto leading-relaxed">
            {isRtl
              ? "نتعاون مع أفضل العلامات التجارية المحلية والعالمية لنقدم لكم تشكيلة متنوعة من المنتجات عالية الجودة التي تلبي جميع أذواقكم واحتياجاتكم."
              : "We collaborate with the finest local and international brands to offer you a diverse range of high-quality products that meet all your tastes and needs."}
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-neutral-500">
            <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-medium">
              {isRtl ? "جودة مضمونة" : "Quality Guaranteed"}
            </span>
            <span className="bg-rose-50 text-rose-700 px-3 py-1 rounded-full font-medium">
              {isRtl ? "تشكيلة متنوعة" : "Diverse Selection"}
            </span>
            <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-medium">
              {isRtl ? "أسعار تنافسية" : "Competitive Prices"}
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BrandsPage;
