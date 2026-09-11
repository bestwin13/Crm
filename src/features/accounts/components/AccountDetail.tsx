"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, MoreVertical } from "lucide-react";
import { AccountService } from "@/features/accounts/services/AccountService";
import type { Account } from "@/features/accounts/types/account.types";

interface AccountDetailProps {
  account: Account;
}

export default function AccountDetail({ account }: AccountDetailProps) {
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  async function handleDelete() {
    setIsMenuOpen(false);
    if (!window.confirm(`Delete ${account.account_name}?`)) return;
    await AccountService.deleteAccount(account.id);
    router.push("/dashboard/accounts");
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/dashboard/accounts" className="text-sm text-slate hover:text-fg">
        ← Back to Accounts
      </Link>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-light text-lg font-semibold text-slate">
            {account.account_name?.trim()?.charAt(0).toUpperCase() || "?"}
          </div>
          <h1 className="font-serif text-2xl text-fg">{account.account_name}</h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/accounts/${account.id}?edit=1`}
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
          <Row label="Account Owner" value={account.account_owner_name} />
          <Row label="Website" value={account.website} />
          <Row label="Phone" value={account.phone} />
          <Row label="Industry" value={account.industry} />
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
              Account Information
            </h3>
            <div className="grid grid-cols-1 gap-y-3 sm:grid-cols-2">
              <Row label="Account Owner" value={account.account_owner_name} />
              <Row label="Account Name" value={account.account_name} />
              <Row label="Account Site" value={account.account_site} />
              <Row label="Account Number" value={account.account_number} />
              <Row label="Account Type" value={account.account_type} />
              <Row label="Ownership" value={account.ownership} />
              <Row label="Website" value={account.website} />
              <Row label="Phone" value={account.phone} />
              <Row label="Industry" value={account.industry} />
              <Row label="Rating" value={account.rating} />
              <Row label="No. of Employees" value={account.employees?.toString()} />
              <Row label="Annual Revenue" value={account.annual_revenue?.toString()} />
              <Row label="Ticker Symbol" value={account.ticker_symbol} />
              <Row label="SIC Code" value={account.sic_code} />
            </div>
          </div>

          <div className="rounded-lg border border-line bg-surface p-6">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Billing Address
            </h3>
            <div className="grid grid-cols-1 gap-y-3 sm:grid-cols-2">
              <Row label="Billing Address" value={account.billing_address} />
              <Row label="Billing City" value={account.billing_city} />
              <Row label="Billing State" value={account.billing_state} />
              <Row label="Billing Country" value={account.billing_country} />
              <Row label="Billing Postal Code" value={account.billing_postal_code} />
            </div>
          </div>

          <div className="rounded-lg border border-line bg-surface p-6">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Description Information
            </h3>
            <div className="grid grid-cols-1 gap-y-3 sm:grid-cols-2">
              <Row label="Description" value={account.description} fullWidth />
            </div>
          </div>

          <div className="rounded-lg border border-line bg-surface p-6">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-soft">
              System Information
            </h3>
            <div className="grid grid-cols-1 gap-y-3 sm:grid-cols-2">
              <Row label="Created At" value={formatDate(account.created_at)} />
              <Row label="Updated At" value={formatDate(account.updated_at)} />
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
