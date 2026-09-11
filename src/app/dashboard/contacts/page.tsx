"use client";

import { Suspense } from "react";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ContactList from "@/features/contacts/components/ContactList";
import { ContactService } from "@/features/contacts/services/ContactService";
import type { Contact } from "@/features/contacts/types/contact.types";

function ContactsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    ContactService.getContacts()
      .then((data) => {
        if (!cancelled) setContacts(data);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const message =
      searchParams.get("created") === "1"
        ? "Contact created successfully"
        : searchParams.get("updated") === "1"
        ? "Contact updated successfully"
        : null;
    if (message) {
      setToast(message);
      router.replace("/dashboard/contacts");
      const timer = window.setTimeout(() => setToast(null), 3000);
      return () => window.clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <>
      <ContactList
        contacts={contacts}
        isLoading={isLoading}
        onContactDeleted={(id) => setContacts((prev) => prev.filter((c) => c.id !== id))}
      />
      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] rounded-md border border-success/30 bg-success-soft px-4 py-3 text-sm font-medium text-success shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
}

export default function ContactsPage() {
  return (
    <Suspense fallback={null}>
      <ContactsPageInner />
    </Suspense>
  );
}
