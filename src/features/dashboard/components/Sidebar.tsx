"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ChevronDown,
  Contact2,
  Home,
  X,
  Users as UsersIcon,
} from "lucide-react";
import type { AuthUser } from "@/features/auth/types/auth.types";
import { teamspaceService } from "@/features/teamspace/services/teamspaceService";
import type { Teamspace } from "@/features/teamspace/types/teamspace.types";

interface SidebarProps {
  user: AuthUser;
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { href: "/dashboard/leads", label: "Leads", icon: UsersIcon },
  { href: "/dashboard/contacts", label: "Contacts", icon: Contact2 },
  { href: "/dashboard/accounts", label: "Accounts", icon: Building2 },
];

export default function Sidebar({ user: _user, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [teamspaces, setTeamspaces] = useState<Teamspace[]>([]);
  const [active, setActive] = useState<Teamspace | null>(null);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  useEffect(() => {
    setTeamspaces(teamspaceService.list());
    setActive(teamspaceService.getActive());
  }, []);

  // Close on Escape while the sidebar is open.
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  function handleSelect(teamspace: Teamspace) {
    teamspaceService.setActive(teamspace.id);
    setActive(teamspace);
    setIsSwitcherOpen(false);
  }

  return (
    <>
      {/* Backdrop — click to close, only rendered while open */}
      {isOpen && (
        <div
          onClick={onClose}
          aria-hidden="true"
          className="fixed inset-0 z-30 bg-black/30 transition-opacity"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-64 shrink-0 flex-col border-r border-line bg-surface shadow-xl transition-transform duration-200 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <span className="font-serif text-xl text-fg">LeadPulse</span>
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="flex h-7 w-7 items-center justify-center rounded-md text-ink-soft hover:bg-paper hover:text-fg"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="px-3">
          <SidebarLink
            href="/dashboard"
            icon={Home}
            label="Home"
            isActive={pathname === "/dashboard"}
            onNavigate={onClose}
          />
        </nav>

        <div className="mt-6 px-3">
          <div className="relative">
            <button
              onClick={() => setIsSwitcherOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft hover:bg-paper"
            >
              <span className="truncate">{active?.name ?? "Teamspace"}</span>
              <ChevronDown size={14} />
            </button>

            {isSwitcherOpen && (
              <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-md border border-line bg-surface p-1 shadow-lg">
                {teamspaces.map((teamspace) => (
                  <button
                    key={teamspace.id}
                    onClick={() => handleSelect(teamspace)}
                    className={`block w-full rounded px-2 py-1.5 text-left text-sm ${
                      teamspace.id === active?.id
                        ? "bg-slate-light text-fg"
                        : "text-fg hover:bg-paper"
                    }`}
                  >
                    {teamspace.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <nav className="mt-1 space-y-0.5">
            {NAV_ITEMS.map((item) => (
              <SidebarLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isActive={pathname.startsWith(item.href)}
                onNavigate={onClose}
              />
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}

function SidebarLink({
  href,
  icon: Icon,
  label,
  isActive,
  onNavigate,
}: {
  href: string;
  icon: typeof Home;
  label: string;
  isActive: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition ${
        isActive ? "bg-ink text-white" : "text-fg hover:bg-paper"
      }`}
    >
      <Icon size={16} />
      {label}
    </Link>
  );
}
