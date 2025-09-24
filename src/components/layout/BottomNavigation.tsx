import React from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { useFavorites } from "../../context/FavoritesContext";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import {
  Home,
  Bell,
  Heart,
  ShoppingBag,
  Sparkles,
  Gift,
  Zap,
  Crown,
  Flame,
  Layers,
} from "lucide-react";

const BottomNavigation: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { favoritesCount } = useFavorites();
  const { isAuthenticated } = useAuth();
  const isRtl = t("i18n.language") === "ar";

  const navItems = React.useMemo(
    () => [
      {
        id: "home",
        path: "/",
        icon: Home,
        activeIcon: Sparkles,
        labelKey: "bottomNav.home",
      },
      {
        id: "categories",
        path: "/categories",
        icon: Layers,
        activeIcon: Crown,
        labelKey: "bottomNav.categories",
      },
      {
        id: "notifications",
        path: "/notifications",
        icon: Bell,
        activeIcon: Zap,
        labelKey: "bottomNav.notifications",
      },
      {
        id: "favorites",
        path: "/favorites",
        icon: Heart,
        activeIcon: Gift,
        labelKey: "bottomNav.favorites",
        badge: favoritesCount,
      },
      {
        id: "packages",
        path: "/packages",
        icon: ShoppingBag,
        activeIcon: Flame,
        labelKey: "bottomNav.packages",
      },
    ],
    [favoritesCount]
  );

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background-primary border-t border-border-primary md:hidden">
      <div
        className={`flex h-[56px] justify-around ${
          isRtl ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          const ActiveIcon = item.activeIcon;

          return (
            <Link
              key={item.id}
              to={item.path}
              className="relative flex flex-1 flex-col items-center justify-center gap-0.5 pt-1 text-center group"
            >
              {active && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute top-0 h-0.5 w-8 rounded-full bg-primary-500"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              <motion.div
                className="relative p-1.5 rounded-full transition-all duration-300 group-hover:bg-primary-50/50"
                whileTap={{ scale: 0.85 }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  className="relative"
                  animate={active ? { rotate: [0, -5, 5, -5, 0] } : {}}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                >
                  {active ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.4, ease: "backOut" }}
                    >
                      <ActiveIcon
                        size={20}
                        className="text-primary-500"
                        fill="currentColor"
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0, rotate: 180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.4, ease: "backOut" }}
                    >
                      <Icon
                        size={20}
                        className="text-neutral-500 group-hover:text-primary-400 transition-colors duration-300"
                        strokeWidth={1.5}
                      />
                    </motion.div>
                  )}
                </motion.div>

                {item.id === "notifications" && (
                  <motion.span
                    className="absolute -top-0.5 -right-0.5 block h-2 w-2 rounded-full bg-error-500 ring-2 ring-background-primary"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
                {item.id === "favorites" &&
                  typeof item.badge === "number" &&
                  isAuthenticated &&
                  item.badge > 0 && (
                    <motion.span
                      className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-error-500 px-1 text-[10px] font-medium text-white ring-2 ring-background-primary"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      {item.badge > 9 ? "9+" : item.badge}
                    </motion.span>
                  )}
              </motion.div>

              <motion.span
                className={`text-[10px] font-medium transition-all duration-300 ${
                  active
                    ? "text-primary-500 scale-105"
                    : "text-neutral-600 group-hover:text-primary-400"
                }`}
                animate={active ? { y: [0, -1, 0] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {t(item.labelKey)}
              </motion.span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
