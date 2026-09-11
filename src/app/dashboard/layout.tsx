"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/features/dashboard/components/Sidebar";
import DashboardHeader from "@/features/dashboard/components/DashboardHeader";
import { authService } from "@/features/auth/services/authService";
import type { AuthUser } from "@/features/auth/types/auth.types";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.replace("/login");
      return;
    }
    setUser(authService.getSessionUser());
  }, [router]);

  async function handleLogout() {
    await authService.logout();
    router.replace("/login");
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-paper">
        <p className="text-sm text-ink-soft">Checking your session…</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-paper">
      <Sidebar
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader
          user={user}
          onLogout={handleLogout}
          onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
        />
        <main className="flex-1 overflow-y-auto px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
