"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";
import type { Account } from "@/features/accounts/types/account.types";
import { AccountService } from "@/features/accounts/services/AccountService";

interface AccountListProps {
  accounts: Account[];
  isLoading: boolean;
  onAccountDeleted: (id: string) => void;
}

const PAGE_SIZE = 10;

export default function AccountList({ accounts, isLoading, onAccountDeleted }: AccountListProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [openMenu, setOpenMenu] = useState<{ id: string; top: number; left: number } | null>(
    null
  );

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
    return accounts.filter((a) => a.account_name.toLowerCase().includes(q));
  }, [accounts, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  async function handleDelete(account: Account) {
    setOpenMenu(null);
    if (!window.confirm(`Delete ${account.account_name}?`)) return;
    await AccountService.deleteAccount(account.id);
    onAccountDeleted(account.id);
  }

  const menuAccount = openMenu ? accounts.find((a) => a.id === openMenu.id) : null;

  return (
    <div className="rounded-lg border border-line bg-surface">
      <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-xl text-fg">Accounts</h1>
          <p className="text-sm text-ink-soft">
            {filtered.length} total {filtered.length === 1 ? "account" : "accounts"}
          </p>
        </div>
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search accounts…"
            className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-slate focus:ring-2 focus:ring-slate-light sm:w-56"
          />
          <Link
            href="/dashboard/accounts/new"
            className="whitespace-nowrap rounded-md bg-amber px-4 py-2 text-sm font-semibold text-fg hover:bg-amber-dark"
          >
            + Create Account
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3 p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-md bg-paper" />
          ))}
        </div>
      ) : pageItems.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
          <p className="font-serif text-lg text-fg">No accounts yet</p>
          <p className="max-w-sm text-sm text-ink-soft">
            Companies you do business with show up here.
          </p>
          <Link
            href="/dashboard/accounts/new"
            className="mt-1 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink-2"
          >
            + Create Account
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  <th className="w-10 px-4 py-3" />
                  <th className="px-4 py-3">Account Name</th>
                  <th className="px-4 py-3">Website</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Industry</th>
                  <th className="px-4 py-3">Account Owner</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((account) => (
                  <tr key={account.id} className="group border-b border-line last:border-0 hover:bg-paper">
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setOpenMenu((v) =>
                            v?.id === account.id
                              ? null
                              : { id: account.id, top: rect.bottom + 4, left: rect.left }
                          );
                        }}
                        className="rounded p-1 text-ink-soft opacity-0 hover:bg-line group-hover:opacity-100"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/accounts/${account.id}`}
                        className="font-medium text-slate hover:underline"
                      >
                        {account.account_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{account.website || "—"}</td>
                    <td className="px-4 py-3 text-ink-soft">{account.phone || "—"}</td>
                    <td className="px-4 py-3 text-ink-soft">{account.industry || "—"}</td>
                    <td className="px-4 py-3 text-ink-soft">{account.account_owner_name ?? "Unassigned"}</td>
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

      {openMenu && menuAccount && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpenMenu(null)} />
          <div
            style={{ top: openMenu.top, left: openMenu.left }}
            className="fixed z-40 w-32 rounded-md border border-line bg-surface py-1 shadow-lg"
          >
            <button
              onClick={() => {
                setOpenMenu(null);
                router.push(`/dashboard/accounts/${menuAccount.id}?edit=1`);
              }}
              className="block w-full px-3 py-1.5 text-left text-sm text-fg hover:bg-paper"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(menuAccount)}
              className="block w-full px-3 py-1.5 text-left text-sm text-danger hover:bg-danger-soft"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
