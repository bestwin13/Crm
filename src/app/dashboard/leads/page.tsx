"use client";

import { Suspense } from "react";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LeadList from "@/features/leads/components/LeadList";
import { LeadService } from "@/features/leads/services/LeadService";
import type { Lead } from "@/features/leads/types/lead.types";

function LeadsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    LeadService.getLeads()
      .then((data) => {
        if (!cancelled) setLeads(data);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load leads from the server.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    const message =
      searchParams.get("created") === "1"
        ? "Lead created successfully"
        : searchParams.get("updated") === "1"
        ? "Lead updated successfully"
        : searchParams.get("deletedMessage")
        ? decodeURIComponent(searchParams.get("deletedMessage") as string)
        : null;

    if (message) {
      showToast(message);
      router.replace("/dashboard/leads");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <>
      <LeadList
        leads={leads}
        isLoading={isLoading}
        error={error}
        onLeadDeleted={(id, message) => {
          setLeads((prev) => prev.filter((l) => l.id !== id));
          showToast(message);
        }}
      />

      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] rounded-md border border-success/30 bg-success-soft px-4 py-3 text-sm font-medium text-success shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
}

export default function LeadsPage() {
  return (
    <Suspense fallback={null}>
      <LeadsPageInner />
    </Suspense>
  );
}
