"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, MoreVertical } from "lucide-react";
import { ContactService } from "@/features/contacts/services/ContactService";
import type { Contact } from "@/features/contacts/types/contact.types";

interface ContactDetailProps {
  contact: Contact;
}

export default function ContactDetail({ contact }: ContactDetailProps) {
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  async function handleDelete() {
    setIsMenuOpen(false);
    if (!window.confirm(`Delete ${contact.name}?`)) return;
    await ContactService.deleteContact(contact.id);
    router.push("/dashboard/contacts");
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/dashboard/contacts" className="text-sm text-slate hover:text-fg">
        ← Back to Contacts
      </Link>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-light text-lg font-semibold text-slate">
            {(contact.name || contact.email || "?").slice(0, 1).toUpperCase()}
          </div>
          <div>
            <h1 className="font-serif text-2xl text-fg">
              {contact.name}
              {contact.account_name && (
                <span className="ml-2 text-lg text-ink-soft">- {contact.account_name}</span>
              )}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/contacts/${contact.id}?edit=1`}
            className="rounded-md border border-line px-4 py-2 text-sm font-medium text-fg hover:bg-paper"
          >
            Edit
          </Link>
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen((v) => !v)}
              className="rounded-md border border-line p-2 text-ink-soft hover:bg-paper"
            >
              <MoreVertical size={16} />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-md border border-line bg-surface py-1 shadow-lg">
                <button
                  onClick={handleDelete}
                  className="block w-full px-3 py-1.5 text-left text-sm text-danger hover:bg-danger-soft"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-line bg-surface p-6">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Overview
        </h2>
        <div className="grid grid-cols-1 gap-y-3 sm:grid-cols-2">
          <Row label="Contact Owner" value={contact.contact_owner_name} />
          <Row label="Email" value={contact.email} />
          <Row label="Phone" value={contact.phone} />
          <Row label="Mobile" value={contact.mobile} />
        </div>
      </div>

      <button
        onClick={() => setShowDetails((v) => !v)}
        className="mt-4 flex items-center gap-1 text-sm font-medium text-slate hover:text-fg"
      >
        {showDetails ? "Hide Details" : "Show Details"}
        <ChevronDown size={14} className={`transition ${showDetails ? "rotate-180" : ""}`} />
      </button>

      {showDetails && (
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-line bg-surface p-6">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 gap-y-3 sm:grid-cols-2">
              <Row label="Contact Owner" value={contact.contact_owner_name} />
              <Row label="Account Name" value={contact.account_name} />
              <Row label="Name" value={contact.name} />
              <Row label="Title" value={contact.title} />
              <Row label="Email" value={contact.email} />
              <Row label="Secondary Email" value={contact.secondary_email} />
              <Row label="Phone" value={contact.phone} />
              <Row label="Mobile" value={contact.mobile} />
              <Row label="Home Phone" value={contact.home_phone} />
              <Row label="Other Phone" value={contact.other_phone} />
              <Row label="Department" value={contact.department} />
              <Row label="Lead Source" value={contact.lead_source} />
              <Row label="Vendor Name" value={contact.vendor_name} />
              <Row label="Date of Birth" value={contact.date_of_birth} />
              <Row label="Assistant" value={contact.assistant} />
              <Row label="Assistant Phone" value={contact.assistant_phone} />
              <Row label="Reporting To" value={contact.reporting_to_name} />
              <Row label="Email Opt Out" value={contact.email_opt_out ? "Yes" : "No"} />
            </div>
          </div>

          <div className="rounded-lg border border-line bg-surface p-6">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Address Information
            </h3>
            <div className="grid grid-cols-1 gap-y-3 sm:grid-cols-2">
              <Row label="Mailing Address" value={contact.mailing_address} />
              <Row label="Mailing City" value={contact.mailing_city} />
              <Row label="Mailing State" value={contact.mailing_state} />
              <Row label="Mailing Country" value={contact.mailing_country} />
              <Row label="Mailing Postal Code" value={contact.mailing_postal_code} />
              <Row label="Other Address" value={contact.other_address} />
            </div>
          </div>

          <div className="rounded-lg border border-line bg-surface p-6">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Description Information
            </h3>
            <div className="grid grid-cols-1 gap-y-3 sm:grid-cols-2">
              <Row label="Description" value={contact.description} fullWidth />
            </div>
          </div>

          <div className="rounded-lg border border-line bg-surface p-6">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-soft">
              System Information
            </h3>
            <div className="grid grid-cols-1 gap-y-3 sm:grid-cols-2">
              <Row label="Created At" value={formatDate(contact.created_at)} />
              <Row label="Updated At" value={formatDate(contact.updated_at)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function Row({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value?: string | null;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? "sm:col-span-2" : ""}>
      <p className="text-xs text-ink-soft">{label}</p>
      <p className="text-sm text-fg">{value?.trim() ? value : "—"}</p>
    </div>
  );
}
