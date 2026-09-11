"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authStorage } from "@/features/auth/services/authStorage";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const hasSession = Boolean(authStorage.getAccessToken());
    router.replace(hasSession ? "/dashboard" : "/login");
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-paper">
      <p className="text-sm text-ink-soft">Loading LeadPulse CRM…</p>
    </div>
  );
}
