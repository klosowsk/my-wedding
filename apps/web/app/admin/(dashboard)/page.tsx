"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { PageHeader } from "@/components/ui/PageHeader";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { formatCurrency } from "@marriage/shared";

interface DashboardResponse {
  guests: {
    total: number;
    pending: number;
    confirmed: number;
    declined: number;
    partial: number;
  };
  members: {
    total: number;
    confirmed: {
      adult: number;
      child: number;
      infant: number;
      total: number;
    };
  };
  gifts: {
    total: number;
    totalCollectedCents: number;
    totalPriceCents: number;
  };
  contributions: {
    confirmed: number;
    confirmedTotalCents: number;
  };
  expenses: {
    totalPaidCents: number;
    totalBudgetedCents: number;
    overUnderCents: number;
    costPerConfirmedGuestCents: number;
    grossCostPerConfirmedGuestCents: number;
    netCostPerConfirmedGuestCents: number;
    netSpentCents: number;
    confirmedGuests: number;
  } | null;
}

type StatTone = "primary" | "accent" | "warning" | "error" | "info";

interface DashboardStat {
  label: string;
  value: string;
  icon: string;
  tone: StatTone;
}

const toneClassMap: Record<
  StatTone,
  { strip: string; badge: string; value: string }
> = {
  primary: {
    strip: "bg-primary/70",
    badge: "bg-primary-faint text-primary border border-primary/20",
    value: "text-heading",
  },
  accent: {
    strip: "bg-accent/70",
    badge: "bg-accent-faint text-accent border border-accent/20",
    value: "text-heading",
  },
  warning: {
    strip: "bg-warning/70",
    badge: "bg-warning-bg text-warning border border-warning/25",
    value: "text-heading",
  },
  error: {
    strip: "bg-error/70",
    badge: "bg-error-bg text-error border border-error/25",
    value: "text-heading",
  },
  info: {
    strip: "bg-info/70",
    badge: "bg-info-bg text-info border border-info/25",
    value: "text-heading",
  },
};

function buildStats(
  data: DashboardResponse,
  currency?: { code?: string; locale?: string }
): DashboardStat[] {
  const stats: DashboardStat[] = [
    { label: "Total Guests", value: String(data.guests.total), tone: "primary", icon: "👥" },
    { label: "Confirmed Adults", value: String(data.members.confirmed.adult), tone: "accent", icon: "🧑" },
    { label: "Confirmed Children", value: String(data.members.confirmed.child), tone: "accent", icon: "🧒" },
    { label: "Infants", value: String(data.members.confirmed.infant), tone: "info", icon: "👶" },
    { label: "Pending", value: String(data.guests.pending), tone: "warning", icon: "⏳" },
    { label: "Declined", value: String(data.guests.declined), tone: "error", icon: "❌" },
    { label: "Total Gifts", value: String(data.gifts.total), tone: "primary", icon: "🎁" },
    {
      label: "Revenue",
      value: formatCurrency(data.contributions.confirmedTotalCents, currency),
      tone: "accent",
      icon: "💰",
    },
  ];

  if (data.expenses) {
    stats.push(
      {
        label: "Total Spent",
        value: formatCurrency(data.expenses.totalPaidCents, currency),
        tone: "warning",
        icon: "💸",
      },
      {
        label: "Cost / Guest (Gross)",
        value:
          data.expenses.confirmedGuests > 0
            ? formatCurrency(data.expenses.grossCostPerConfirmedGuestCents, currency)
            : "—",
        tone: "info",
        icon: "🧾",
      },
      {
        label: "Cost / Guest (Net)",
        value:
          data.expenses.confirmedGuests > 0
            ? formatCurrency(data.expenses.netCostPerConfirmedGuestCents, currency)
            : "—",
        tone: data.expenses.netSpentCents > 0 ? "warning" : "accent",
        icon: "⚖️",
      }
    );
  }

  return stats;
}

function StatCardSkeleton() {
  return (
    <Card>
      <div className="flex items-center gap-4">
        <Skeleton className="rounded-full" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton height={28} width={80} />
          <Skeleton height={14} width={120} />
        </div>
      </div>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { data, isLoading, error } = useQuery<DashboardResponse>({
    queryKey: ["admin", "dashboard"],
    queryFn: () => apiGet("/api/v1/admin/dashboard"),
  });

  const { data: settings } = useQuery<{
    currencyCode: string;
    currencyLocale: string;
  }>({
    queryKey: ["admin", "settings", "dashboard-currency"],
    queryFn: () => apiGet("/api/v1/admin/settings"),
    staleTime: 60_000,
  });

  const currency = {
    code: settings?.currencyCode,
    locale: settings?.currencyLocale,
  };

  const stats = data ? buildStats(data, currency) : [];

  return (
    <div>
      <PageHeader title="Dashboard" />

      {error && (
        <ErrorAlert className="mb-6">
          Failed to load dashboard data. Please try again.
        </ErrorAlert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))
          : stats.map((stat) => {
              const tone = toneClassMap[stat.tone];

              return (
                <Card key={stat.label} className="relative overflow-hidden pt-7 pb-5">
                  <div className={`absolute inset-x-0 top-0 h-1 ${tone.strip}`} />

                  <div className="flex items-center gap-4">
                    <div
                      className={[
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-xl",
                        tone.badge,
                      ].join(" ")}
                    >
                      {stat.icon}
                    </div>
                    <div>
                      <p className={`text-2xl font-bold font-body ${tone.value}`}>
                        {stat.value}
                      </p>
                      <p className="text-sm text-muted font-body">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
      </div>
    </div>
  );
}
