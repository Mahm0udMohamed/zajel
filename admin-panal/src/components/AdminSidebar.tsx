import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Gift,
  BarChart3,
  ImageIcon,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "./ui/button";

const navigation = [
  { name: "لوحة التحكم", href: "/dashboard", icon: LayoutDashboard },
  { name: "إدارة المنتجات", href: "/dashboard/products", icon: Package },
  { name: "إدارة الطلبات", href: "/dashboard/orders", icon: ShoppingCart },
  { name: "نظام الهدايا", href: "/dashboard/gifts", icon: Gift },
  { name: "إدارة المحتوى", href: "/dashboard/content", icon: ImageIcon },
  {
    name: "التحليلات والتقارير",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
];

export function AdminSidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-card border-border"
        >
          {isMobileMenuOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-40 w-64 bg-sidebar border-l border-sidebar-border transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          isMobileMenuOpen
            ? "translate-x-0"
            : "translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-sidebar-border">
            <h2 className="text-xl font-bold text-sidebar-foreground">
              لوحة التحكم
            </h2>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-sidebar-border">
            <Link
              to="/"
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              تسجيل الخروج
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
