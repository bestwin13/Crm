"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LeadService } from "@/features/leads/services/LeadService";
import type {
  ConversionAction,
  ConversionCheckResponse,
  Lead,
  MatchingAccount,
  MatchingContact,
} from "@/features/leads/types/lead.types";

interface LeadConvertProps {
  lead: Lead;
}

export default function LeadConvert({ lead }: LeadConvertProps) {
  const router = useRouter();

  const [checkResult, setCheckResult] = useState<ConversionCheckResponse | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const [accountAction, setAccountAction] = useState<ConversionAction>("create_new");
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const [contactAction, setContactAction] = useState<ConversionAction>("create_new");
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // GET /leads/{id}/conversion-check/ — covers all four cases: both,
  // account-only, contact-only, or neither matching an existing record.
  useEffect(() => {
    let cancelled = false;
    LeadService.checkConversion(lead.id)
      .then((result) => {
        if (cancelled) return;
        setCheckResult(result);
        // Default to "use existing" the moment we know there's exactly
        // one clean match, same as Zoho pre-selecting the single record.
        if (result.accounts.length > 0) {
          setAccountAction("use_existing");
          setSelectedAccountId(result.accounts[0].id);
        }
        if (result.contacts.length > 0) {
          setContactAction("use_existing");
          setSelectedContactId(result.contacts[0].id);
        }
      })
      .catch(() => {
        if (!cancelled) setCheckResult({ lead_id: lead.id, accounts: [], contacts: [] });
      })
      .finally(() => {
        if (!cancelled) setIsChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [lead.id]);

  async function handleConvert() {
    if (accountAction === "use_existing" && !selectedAccountId) {
      setError("Select an existing account to link, or switch to Create New Account.");
      return;
    }
    if (contactAction === "use_existing" && !selectedContactId) {
      setError("Select an existing contact to link, or switch to Create New Contact.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await LeadService.convertLead(lead.id, {
        account_action: accountAction,
        ...(accountAction === "use_existing" ? { account_id: selectedAccountId! } : {}),
        contact_action: contactAction,
        ...(contactAction === "use_existing" ? { contact_id: selectedContactId! } : {}),
      });
      router.push(`/dashboard/leads/${lead.id}?converted=1`);
    } catch {
      setError("Couldn't convert this lead. Try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl rounded-lg border border-line bg-surface p-6">
      <h1 className="font-serif text-2xl text-fg">
        Convert Lead <span className="text-lg text-ink-soft">({lead.name || lead.email})</span>
      </h1>

      {error && (
        <p className="mt-4 rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      {isChecking ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-md bg-paper" />
          ))}
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <ConversionSection
            label="Account"
            newRecordLabel={lead.company_name || "(untitled account)"}
            matches={checkResult?.accounts ?? []}
            action={accountAction}
            onActionChange={setAccountAction}
            selectedId={selectedAccountId}
            onSelect={setSelectedAccountId}
            renderMatch={(account: MatchingAccount, isSelected, onClick) => (
              <MatchRow key={account.id} isSelected={isSelected} onClick={onClick}>
                <span className="font-medium text-fg">{account.account_name}</span>
                <span className="text-xs text-ink-soft">
                  {account.website || "No website"} · {account.phone || "No phone"}
                </span>
              </MatchRow>
            )}
          />

          <ConversionSection
            label="Contact"
            newRecordLabel={lead.name || "(untitled contact)"}
            matches={checkResult?.contacts ?? []}
            action={contactAction}
            onActionChange={setContactAction}
            selectedId={selectedContactId}
            onSelect={setSelectedContactId}
            renderMatch={(contact: MatchingContact, isSelected, onClick) => (
              <MatchRow key={contact.id} isSelected={isSelected} onClick={onClick}>
                <span className="font-medium text-fg">{contact.name}</span>
                <span className="text-xs text-ink-soft">
                  {contact.email || "No email"} · {contact.mobile || contact.phone || "No phone"}
                </span>
              </MatchRow>
            )}
          />

          <p className="text-xs text-ink-soft">
            This creates (or links) an Account and a Contact for this lead. The lead itself is
            left as-is so you can still refer back to it.
          </p>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => router.back()}
          className="rounded-md border border-line px-4 py-2 text-sm font-medium text-fg hover:bg-paper"
        >
          Cancel
        </button>
        <button
          onClick={handleConvert}
          disabled={isSubmitting || isChecking}
          className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink-2 disabled:opacity-60"
        >
          {isSubmitting ? "Converting…" : "Convert"}
        </button>
      </div>
    </div>
  );
}

/**
 * One Account or Contact block: a "similar record(s) already exist" note,
 * a Create New / Add to existing radio choice, and — when "Add to
 * existing" is picked — the selectable list of matches.
 */
function ConversionSection<T extends { id: string }>({
  label,
  newRecordLabel,
  matches,
  action,
  onActionChange,
  selectedId,
  onSelect,
  renderMatch,
}: {
  label: string;
  newRecordLabel: string;
  matches: T[];
  action: ConversionAction;
  onActionChange: (action: ConversionAction) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  renderMatch: (match: T, isSelected: boolean, onClick: () => void) => React.ReactNode;
}) {
  const hasMatches = matches.length > 0;

  return (
    <div>
      <span className="mb-2 block text-sm font-medium text-fg">{label}</span>

      {!hasMatches ? (
        <p className="rounded-md border border-line bg-paper px-3 py-2.5 text-sm text-ink-soft">
          No matching {label.toLowerCase()} found — a new one will be created:{" "}
          <span className="font-medium text-fg">{newRecordLabel}</span>
        </p>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-ink-soft">
            {label} with similar details already {matches.length === 1 ? "exists" : "exist"}.
          </p>

          <label className="flex items-center gap-2 text-sm text-fg">
            <input
              type="radio"
              name={`${label}-action`}
              checked={action === "use_existing"}
              onChange={() => onActionChange("use_existing")}
              className="h-4 w-4 accent-ink"
            />
            Add to existing {label}
          </label>

          {action === "use_existing" && (
            <div className="ml-6 max-h-48 space-y-1 overflow-y-auto rounded-md border border-line p-1">
              {matches.map((match) =>
                renderMatch(match, match.id === selectedId, () => onSelect(match.id))
              )}
            </div>
          )}

          <label className="flex items-center gap-2 text-sm text-fg">
            <input
              type="radio"
              name={`${label}-action`}
              checked={action === "create_new"}
              onChange={() => onActionChange("create_new")}
              className="h-4 w-4 accent-ink"
            />
            Create New {label}:{" "}
            <span className="text-ink-soft">{newRecordLabel}</span>
          </label>
        </div>
      )}
    </div>
  );
}

function MatchRow({
  isSelected,
  onClick,
  children,
}: {
  isSelected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full flex-col rounded px-2.5 py-2 text-left ${
        isSelected ? "bg-slate-light" : "hover:bg-paper"
      }`}
    >
      {children}
    </button>
  );
}
