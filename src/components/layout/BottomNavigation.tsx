import React from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { useFavorites } from "../../context/FavoritesContext";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { Home, Grid, Bell, Heart, Package } from "lucide-react";

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
        labelKey: "bottomNav.home",
      },
      {
        id: "categories",
        path: "/categories",
        icon: Grid,
        labelKey: "bottomNav.categories",
      },
      {
        id: "notifications",
        path: "/notifications",
        icon: Bell,
        labelKey: "bottomNav.notifications",
      },
      {
        id: "favorites",
        path: "/favorites",
        icon: Heart,
        labelKey: "bottomNav.favorites",
        badge: favoritesCount,
      },
      {
        id: "packages",
        path: "/packages",
        icon: Package,
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200/50 md:hidden">
      <div
        className={`flex h-[60px] justify-around ${
          isRtl ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              to={item.path}
              className="relative flex flex-1 flex-col items-center justify-center gap-0.5 pt-1 text-center"
            >
              {active && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute top-0 h-1 w-8 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              <motion.div className="relative" whileTap={{ scale: 0.9 }}>
                <Icon
                  size={20}
                  className={`transition-colors ${
                    active ? "text-emeraldTeal" : "text-neutral-500"
                  }`}
                />

                {item.id === "notifications" && (
                  <span className="absolute -top-1 -right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                )}
                {item.id === "favorites" &&
                  typeof item.badge === "number" &&
                  isAuthenticated &&
                  item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
              </motion.div>

              <span
                className={`text-[10px] font-semibold transition-colors ${
                  active ? "text-emeraldTeal" : "text-neutral-600"
                }`}
              >
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
