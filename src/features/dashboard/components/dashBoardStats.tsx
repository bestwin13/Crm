"use client";

import type { Lead } from "@/features/leads/types/lead.types";

interface DashboardStatsProps {
  leads: Lead[];
}

function isWithinLastDays(dateString: string, days: number): boolean {
  const date = new Date(dateString);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return date >= cutoff;
}

export default function DashboardStats({ leads }: DashboardStatsProps) {
  const total = leads.length;
  const newThisWeek = leads.filter((lead) => isWithinLastDays(lead.created_at, 7)).length;
  const qualified = leads.filter((lead) => lead.lead_source !== "None").length;
  const uniqueOwners = new Set(leads.map((lead) => lead.owner?.id).filter(Boolean)).size;

  const cards = [
    { label: "Total Leads", value: total, accent: "var(--color-slate)" },
    { label: "New This Week", value: newThisWeek, accent: "var(--color-amber)" },
    { label: "With a Source", value: qualified, accent: "var(--color-success)" },
    { label: "Active Owners", value: uniqueOwners, accent: "var(--color-ink)" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-line bg-surface p-4"
          style={{ borderLeft: `3px solid ${card.accent}` }}
        >
          <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
            {card.label}
          </p>
          <p className="mt-2 font-serif text-3xl text-fg">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
