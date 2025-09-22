import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search,
  ShoppingBasket,
  User,
  Menu,
  X,
  Globe,
  Package,
  Star,
  ShieldCheck,
  Truck,
  Gift,
  Phone,
  Heart,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useFavorites } from "../../context/FavoritesContext";
import { useAuth } from "../../context/AuthContext";
import i18n from "i18next";
import { motion, AnimatePresence } from "framer-motion";

import Logo from "../ui/Logo";

const Header = () => {
  const { t } = useTranslation();
  const { cartCount, syncCart } = useCart();
  const { favoritesCount } = useFavorites();
  const { user, isAuthenticated, logout } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const location = useLocation();
  const isRtl = i18n.language === "ar";

  useEffect(() => {
    if (isAuthenticated) {
      syncCart();
    }
  }, [isAuthenticated, syncCart]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
      if (
        langMenuRef.current &&
        !langMenuRef.current.contains(event.target as Node)
      ) {
        setShowLangMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="w-full bg-white sticky top-0 z-50 border-b border-neutral-200/50">
      {/* Top announcement bar */}
      <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white py-2.5">
        <div
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center ${
            isRtl ? "justify-end flex-row-reverse" : "justify-start flex-row"
          } gap-4`}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Truck size={14} className="text-white" />
              <span className="text-xs font-semibold">
                {isRtl ? "توصيل في نفس اليوم" : "Same-Day Delivery"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Gift size={14} className="text-white" />
              <span className="text-xs font-semibold">
                {isRtl ? "هدايا مصممة بعناية" : "Thoughtfully Curated Gifts"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-all"
            onClick={toggleMenu}
            aria-label={isRtl ? "القائمة" : "Menu"}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <Logo className="h-8 w-auto" />
            </Link>
          </div>

          {/* Search bar */}
          <div className="hidden md:flex flex-grow max-w-md mx-4 relative z-10">
            <div className="relative w-full">
              <Search
                size={16}
                className={`absolute ${
                  isRtl ? "right-3" : "left-3"
                } top-1/2 -translate-y-1/2 text-neutral-400`}
              />
              <input
                type="text"
                placeholder={t("header.search")}
                className={`w-full h-10 ${
                  isRtl ? "pr-10 pl-3" : "pl-10 pr-3"
                } rounded-full border border-neutral-200/50 bg-white text-sm text-neutral-800 placeholder-neutral-400 outline-none focus:border-emerald-500 focus:bg-neutral-50 transition-all`}
              />
            </div>
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language switcher */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1 rounded-full bg-white px-2 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-all"
              >
                <Globe size={16} className="text-emerald-500" />
                <span className="hidden sm:inline">
                  {isRtl ? "العربية" : "EN"}
                </span>
              </button>
              <AnimatePresence>
                {showLangMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute mt-2 w-32 rounded-lg border border-neutral-200 bg-white shadow-md z-50 ${
                      isRtl ? "left-0" : "right-0"
                    }`}
                  >
                    <button
                      onClick={() => {
                        i18n.changeLanguage("ar");
                        setShowLangMenu(false);
                      }}
                      className={`w-full ${
                        isRtl ? "text-right" : "text-left"
                      } px-3 py-2 text-sm hover:bg-emerald-50 ${
                        i18n.language === "ar"
                          ? "text-emerald-600 font-medium"
                          : "text-neutral-600"
                      }`}
                    >
                      العربية
                    </button>
                    <button
                      onClick={() => {
                        i18n.changeLanguage("en");
                        setShowLangMenu(false);
                      }}
                      className={`w-full ${
                        isRtl ? "text-right" : "text-left"
                      } px-3 py-2 text-sm hover:bg-emerald-50 ${
                        i18n.language === "en"
                          ? "text-emerald-600 font-medium"
                          : "text-neutral-600"
                      }`}
                    >
                      English
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Favorites (Desktop only) */}
            <Link
              to="/favorites"
              className="hidden md:flex relative items-center text-neutral-600 hover:text-rose-500 transition-all"
            >
              <div className="p-1.5 rounded-full bg-neutral-100 hover:bg-rose-100">
                <Heart size={18} />
              </div>
              {isAuthenticated && favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
                  {favoritesCount > 99 ? "99+" : favoritesCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative flex items-center text-neutral-600 hover:text-emerald-500 transition-all"
            >
              <div className="p-1.5 rounded-full bg-neutral-100 hover:bg-emerald-100">
                <ShoppingBasket size={18} />
              </div>
              {isAuthenticated && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* User / Login */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1.5 rounded-full bg-white px-2 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-all"
                >
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-neutral-200"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:inline">{user?.name}</span>
                  {user && !user.isPhoneVerified && (
                    <ShieldCheck size={14} className="text-yellow-500" />
                  )}
                </button>
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className={`absolute mt-2 w-48 rounded-lg border border-neutral-200 bg-white shadow-md z-50 ${
                        isRtl ? "left-0" : "right-0"
                      }`}
                    >
                      {user && !user.isPhoneVerified && (
                        <Link
                          to="/auth/phone-setup"
                          className="flex items-center px-3 py-2 text-sm text-yellow-600 bg-yellow-50 hover:bg-yellow-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <ShieldCheck size={14} className="mr-2 rtl:ml-2" />
                          {isRtl ? "التحقق من الهاتف" : "Verify Phone"}
                        </Link>
                      )}
                      <Link
                        to="/profile"
                        className="flex items-center px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User size={14} className="mr-2 rtl:ml-2" />
                        {t("header.profile")}
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Package size={14} className="mr-2 rtl:ml-2" />
                        {t("header.orders")}
                      </Link>
                      <hr className="my-1 border-neutral-200" />
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="flex items-center w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="mr-2 rtl:ml-2"
                        >
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                          <polyline points="16 17 21 12 16 7"></polyline>
                          <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        {t("header.logout")}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/auth/login"
                className="flex items-center gap-1.5 rounded-full bg-white px-2 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-all"
              >
                <User size={18} />
                <span className="hidden sm:inline">{t("header.login")}</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile search */}
        <div className="mt-3 md:hidden">
          <div className="relative w-full z-10">
            <Search
              size={16}
              className={`absolute ${
                isRtl ? "right-3" : "left-3"
              } top-1/2 -translate-y-1/2 text-neutral-400`}
            />
            <input
              type="text"
              placeholder={t("header.search")}
              className={`w-full h-10 ${
                isRtl ? "pr-10 pl-3" : "pl-10 pr-3"
              } rounded-full border border-neutral-200/50 bg-white text-sm text-neutral-800 placeholder-neutral-400 outline-none focus:border-emerald-500 focus:bg-neutral-50 transition-all`}
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-emerald-50/50 border-t border-neutral-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="hidden md:flex items-center gap-6 py-3 text-neutral-700">
            <li>
              <Link
                to="/categories"
                className={`text-sm font-semibold transition-colors ${
                  location.pathname === "/categories"
                    ? "text-emerald-600"
                    : "hover:text-emerald-600"
                }`}
              >
                {t("navigation.categories")}
              </Link>
            </li>
            <li>
              <Link
                to="/occasions"
                className={`text-sm font-semibold transition-colors ${
                  location.pathname === "/occasions"
                    ? "text-emerald-600"
                    : "hover:text-emerald-600"
                }`}
              >
                {t("navigation.occasions")}
              </Link>
            </li>
            <li>
              <Link
                to="/brands"
                className={`text-sm font-semibold transition-colors ${
                  location.pathname === "/brands"
                    ? "text-emerald-600"
                    : "hover:text-emerald-600"
                }`}
              >
                {t("navigation.brands")}
              </Link>
            </li>
            <li>
              <Link
                to="/special-gifts"
                className={`flex items-center gap-1 text-sm font-semibold transition-colors ${
                  location.pathname === "/special-gifts"
                    ? "text-emerald-600"
                    : "hover:text-emerald-600"
                }`}
              >
                <Star size={14} className="text-emerald-600" />
                {t("navigation.specialGifts")}
              </Link>
            </li>
            <li>
              <Link
                to="/products"
                className={`text-sm font-semibold transition-colors ${
                  location.pathname === "/products"
                    ? "text-emerald-600"
                    : "hover:text-emerald-600"
                }`}
              >
                {isRtl ? "جميع المنتجات" : "All Products"}
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/20"
            onClick={toggleMenu}
          >
            <motion.div
              initial={{ x: isRtl ? "100%" : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? "100%" : "-100%" }}
              transition={{ duration: 0.3 }}
              className={`fixed inset-y-0 ${
                isRtl ? "right-0" : "left-0"
              } w-64 bg-white shadow-xl`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
                <Logo className="h-7 w-auto" />
                <button
                  onClick={toggleMenu}
                  className="p-2 rounded-full hover:bg-neutral-100 transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="p-4">
                <ul className="space-y-2">
                  <li>
                    <Link
                      to="/categories"
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                        location.pathname === "/categories"
                          ? "bg-emerald-50 text-emerald-600"
                          : "text-neutral-600 hover:bg-emerald-50 hover:text-emerald-600"
                      }`}
                      onClick={toggleMenu}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                      </svg>
                      {t("navigation.categories")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/occasions"
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                        location.pathname === "/occasions"
                          ? "bg-emerald-50 text-emerald-600"
                          : "text-neutral-600 hover:bg-emerald-50 hover:text-emerald-600"
                      }`}
                      onClick={toggleMenu}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                        <line x1="9" y1="9" x2="9.01" y2="9"></line>
                        <line x1="15" y1="9" x2="15.01" y2="9"></line>
                      </svg>
                      {t("navigation.occasions")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/brands"
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                        location.pathname === "/brands"
                          ? "bg-emerald-50 text-emerald-600"
                          : "text-neutral-600 hover:bg-emerald-50 hover:text-emerald-600"
                      }`}
                      onClick={toggleMenu}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                      </svg>
                      {t("navigation.brands")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/special-gifts"
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                        location.pathname === "/special-gifts"
                          ? "bg-emerald-50 text-emerald-600"
                          : "text-neutral-600 hover:bg-emerald-50 hover:text-emerald-600"
                      }`}
                      onClick={toggleMenu}
                    >
                      <Star size={18} className="text-emerald-600" />
                      {t("navigation.specialGifts")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/products"
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                        location.pathname === "/products"
                          ? "bg-emerald-50 text-emerald-600"
                          : "text-neutral-600 hover:bg-emerald-50 hover:text-emerald-600"
                      }`}
                      onClick={toggleMenu}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                      </svg>
                      {isRtl ? "جميع المنتجات" : "All Products"}
                    </Link>
                  </li>
                  <li className="pt-3 border-t border-neutral-200">
                    <Link
                      to="/orders"
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                        location.pathname === "/orders"
                          ? "bg-emerald-50 text-emerald-600"
                          : "text-neutral-600 hover:bg-emerald-50 hover:text-emerald-600"
                      }`}
                      onClick={toggleMenu}
                    >
                      <Package size={18} />
                      {t("header.orders")}
                    </Link>
                  </li>
                  {!isAuthenticated ? (
                    <li className="pt-3 border-t border-neutral-200">
                      <Link
                        to="/auth/login"
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                          location.pathname === "/auth/login"
                            ? "bg-emerald-50 text-emerald-600"
                            : "text-neutral-600 hover:bg-emerald-50 hover:text-emerald-600"
                        }`}
                        onClick={toggleMenu}
                      >
                        <User size={18} />
                        {t("header.login")}
                      </Link>
                    </li>
                  ) : (
                    <>
                      <li className="pt-3 border-t border-neutral-200">
                        <Link
                          to="/profile"
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                            location.pathname === "/profile"
                              ? "bg-emerald-50 text-emerald-600"
                              : "text-neutral-600 hover:bg-emerald-50 hover:text-emerald-600"
                          }`}
                          onClick={toggleMenu}
                        >
                          <User size={18} />
                          {user?.name || t("header.profile")}
                        </Link>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            logout();
                            setIsMenuOpen(false);
                          }}
                          className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-50 transition-all"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                          </svg>
                          {t("header.logout")}
                        </button>
                      </li>
                      <li className="pt-3 border-t border-neutral-200">
                        <Link
                          to="/contact"
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                            location.pathname === "/contact"
                              ? "bg-emerald-50 text-emerald-600"
                              : "text-neutral-600 hover:bg-emerald-50 hover:text-emerald-600"
                          }`}
                          onClick={toggleMenu}
                        >
                          <Phone size={18} />
                          {isRtl ? "اتصل بنا" : "Contact Us"}
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
