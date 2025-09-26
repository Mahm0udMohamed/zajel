import { Bell, Search, User, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAdminAuth } from "../hooks/useAdminAuth";

export function AdminHeader() {
  const { admin, logout } = useAdminAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="البحث في النظام..."
            className="pr-10 bg-input border-border"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -left-1 w-3 h-3 bg-destructive rounded-full text-xs flex items-center justify-center text-white">
            3
          </span>
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            مرحباً، {admin?.name || "مدير"}
          </span>
          <Button variant="ghost" size="icon">
            <User className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="تسجيل الخروج"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
