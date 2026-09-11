"use client";

import { useState } from "react";
import { LogOut, Menu, Search } from "lucide-react";
import type { AuthUser } from "@/features/auth/types/auth.types";
import ThemeToggle from "@/shared/components/ThemeToggle";

interface DashboardHeaderProps {
  user: AuthUser;
  onLogout: () => void;
  onToggleSidebar: () => void;
}

/**
 * Persistent top bar shown above the page content. Navigation
 * (Home/Leads/Contacts/Accounts) lives in the Sidebar, which is hidden by
 * default and toggled open from the hamburger button on the left here.
 */
export default function DashboardHeader({ user, onLogout, onToggleSidebar }: DashboardHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="flex items-center justify-between gap-4 border-b border-line bg-surface px-4 py-3">
      <div className="flex flex-1 items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-ink-soft hover:bg-paper hover:text-fg"
        >
          <Menu size={18} />
        </button>

        <div className="relative w-full max-w-sm">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            placeholder="Search records…"
            className="w-full rounded-md border border-line bg-paper py-2 pl-9 pr-3 text-sm outline-none focus:border-slate focus:bg-surface focus:ring-2 focus:ring-slate-light"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        <div className="relative">
          <button
            onClick={() => setIsMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-paper"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-light text-sm font-semibold text-slate">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium leading-tight text-fg">{user.name}</p>
              <p className="text-xs leading-tight text-ink-soft">{user.role}</p>
            </div>
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-md border border-line bg-surface p-1 shadow-lg">
              <button
                onClick={onLogout}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm text-danger hover:bg-danger-soft"
              >
                <LogOut size={14} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
