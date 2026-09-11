"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";
import type { Lead } from "@/features/leads/types/lead.types";
import { LeadService } from "@/features/leads/services/LeadService";

interface LeadListProps {
  leads: Lead[];
  isLoading: boolean;
  error: string | null;
  onLeadDeleted: (id: string, message: string) => void;
}

const PAGE_SIZE = 10;

export default function LeadList({ leads, isLoading, error, onLeadDeleted }: LeadListProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [openMenu, setOpenMenu] = useState<{ id: string; top: number; left: number } | null>(
    null
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!openMenu) return;
    const close = () => setOpenMenu(null);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [openMenu]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return leads.filter((lead) => {
      const haystack = `${lead.name} ${lead.company_name} ${lead.email ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [leads, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  async function handleDelete(lead: Lead) {
    setOpenMenu(null);
    if (!window.confirm(`Delete ${lead.name || lead.email}? This can't be undone.`)) return;
    setDeletingId(lead.id);
    try {
      const message = await LeadService.deleteLead(lead.id);
      onLeadDeleted(lead.id, message);
    } catch {
      window.alert("Couldn't delete this lead. Try again.");
    } finally {
      setDeletingId(null);
    }
  }

  const menuLead = openMenu ? leads.find((l) => l.id === openMenu.id) : null;

  return (
    <div className="rounded-lg border border-line bg-surface">
      <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-xl text-fg">Leads</h1>
          <p className="text-sm text-ink-soft">
            {filtered.length} total {filtered.length === 1 ? "lead" : "leads"}
          </p>
        </div>
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search leads…"
            className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-slate focus:ring-2 focus:ring-slate-light sm:w-56"
          />
          <Link
            href="/dashboard/leads/new"
            className="whitespace-nowrap rounded-md bg-amber px-4 py-2 text-sm font-semibold text-fg transition hover:bg-amber-dark"
          >
            + Create Lead
          </Link>
        </div>
      </div>

      {error && (
        <p className="border-b border-line bg-danger-soft px-4 py-3 text-sm text-danger">{error}</p>
      )}

      {isLoading ? (
        <LeadListSkeleton />
      ) : pageItems.length === 0 ? (
        <EmptyState hasQuery={query.length > 0} />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  <th className="w-10 px-4 py-3" />
                  <th className="px-4 py-3">Lead Name</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Lead Source</th>
                  <th className="px-4 py-3">Lead Status</th>
                  <th className="px-4 py-3">Lead Owner</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((lead) => (
                  <tr key={lead.id} className="group border-b border-line last:border-0 hover:bg-paper">
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setOpenMenu((v) =>
                            v?.id === lead.id
                              ? null
                              : { id: lead.id, top: rect.bottom + 4, left: rect.left }
                          );
                        }}
                        className="rounded p-1 text-ink-soft opacity-0 hover:bg-line group-hover:opacity-100"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/leads/${lead.id}`}
                        className="font-medium text-slate hover:underline"
                      >
                        {lead.name || "(No name)"}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{lead.company_name || "—"}</td>
                    <td className="px-4 py-3 text-ink-soft">{lead.email || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-light px-2.5 py-1 text-xs font-medium text-slate">
                        {lead.lead_source}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-slate-light px-2.5 py-1 text-xs font-medium text-slate">
                        {lead.lead_status || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{lead.owner?.name ?? "Unassigned"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-line px-4 py-3 text-sm text-ink-soft">
            <span>Total Records {filtered.length}</span>
            <div className="flex items-center gap-3">
              <span>
                {pageStart + 1} to {Math.min(pageStart + PAGE_SIZE, filtered.length)}
              </span>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded border border-line px-2 py-1 disabled:opacity-40"
              >
                ‹
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded border border-line px-2 py-1 disabled:opacity-40"
              >
                ›
              </button>
            </div>
          </div>
        </>
      )}

      {openMenu && menuLead && (
        <>
          {/* Invisible backdrop so clicking anywhere else closes the menu */}
          <div className="fixed inset-0 z-30" onClick={() => setOpenMenu(null)} />
          <div
            style={{ top: openMenu.top, left: openMenu.left }}
            className="fixed z-40 w-32 rounded-md border border-line bg-surface py-1 shadow-lg"
          >
            <button
              onClick={() => {
                setOpenMenu(null);
                router.push(`/dashboard/leads/${menuLead.id}/edit`);
              }}
              className="block w-full px-3 py-1.5 text-left text-sm text-fg hover:bg-paper"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(menuLead)}
              disabled={deletingId === menuLead.id}
              className="block w-full px-3 py-1.5 text-left text-sm text-danger hover:bg-danger-soft disabled:opacity-50"
            >
              {deletingId === menuLead.id ? "Deleting…" : "Delete"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function LeadListSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-10 animate-pulse rounded-md bg-paper" />
      ))}
    </div>
  );
}

function EmptyState({ hasQuery }: { hasQuery: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
      <p className="font-serif text-lg text-fg">
        {hasQuery ? "No leads match that search" : "No leads yet"}
      </p>
      <p className="max-w-sm text-sm text-ink-soft">
        {hasQuery
          ? "Try a different name, company, or email."
          : "Start building your pipeline by creating your first lead."}
      </p>
      {!hasQuery && (
        <Link
          href="/dashboard/leads/new"
          className="mt-1 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink-2"
        >
          + Create Lead
        </Link>
      )}
    </div>
  );
}
