import React from "react";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminHeader } from "../components/AdminHeader";
import { Toaster } from "../components/ui/toaster";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="lg:pr-64">
        <AdminHeader />
        <main className="p-6">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
