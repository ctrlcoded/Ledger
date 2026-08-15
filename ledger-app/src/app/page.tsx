"use client";

import { useCallback, useEffect, useState } from "react";
import Navbar from "@/components/ui/Navbar";
import Amount from "@/components/ui/Amount";
import TransactionIcon from "@/components/ui/TransactionIcon";
import AddTransactionPanel from "@/components/ui/AddTransactionPanel";
import DashboardEmptyState from "@/components/dashboard/DashboardEmptyState";
import { getOverview } from "@/app/data";
import { inr } from "@/lib/format";

type Overview = Extract<Awaited<ReturnType<typeof getOverview>>, { ok: true }>;

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const dayLabels = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

function MiniCalendar({ dots }: { dots: Record<number, { credit?: boolean; debit?: boolean }> }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const prevDays = Array.from({ length: firstDay }, (_, i) => prevMonthDays - firstDay + 1 + i);
  const currentDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const nextDays = Array.from({ length: totalCells - firstDay - daysInMonth }, (_, i) => i + 1);

  return (
    <div className="rounded-2xl border border-rule bg-paper p-4 shadow-card sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-ink">This month</h3>
        <span className="text-sm text-muted">{monthNames[month]} {year}</span>
      </div>
      <div className="mb-2 grid grid-cols-7 gap-1">
        {dayLabels.map((d) => (
          <div key={d} className="py-1 text-center text-[10px] font-medium uppercase tracking-wider text-muted sm:text-xs sm:tracking-widest">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
        {prevDays.map((day, i) => (
          <div key={`p-${i}`} className="py-1 text-center text-xs text-muted/30 sm:py-1.5 sm:text-sm">{day}</div>
        ))}
        {currentDays.map((day) => {
          const isToday = day === today;
          const d = dots[day];
          return (
            <button
              key={day}
              onClick={() => window.location.href = '/calendar'}
              className="relative text-center cursor-pointer group"
            >
              <div className={`py-1 text-xs sm:py-1.5 sm:text-sm transition-colors duration-100 ${isToday ? "rounded-lg border border-rule bg-canvas font-semibold text-ink" : "rounded-lg text-ink group-hover:bg-accent-soft group-hover:text-accent"}`}>{day}</div>
              {d && (
                <div className="-mt-0.5 flex justify-center gap-0.5">
                  {d.credit && <div className="h-1 w-1 rounded-full bg-credit sm:h-1.5 sm:w-1.5" />}
                  {d.debit && <div className="h-1 w-1 rounded-full bg-debit sm:h-1.5 sm:w-1.5" />}
                </div>
              )}
            </button>
          );
        })}
        {nextDays.map((day, i) => (
          <div key={`n-${i}`} className="py-1 text-center text-xs text-muted/30 sm:py-1.5 sm:text-sm">{day}</div>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await getOverview();
    if (res.ok) setData(res);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Real per-day dots for the current month, from the fetched transactions.
  const dots: Record<number, { credit?: boolean; debit?: boolean }> = {};
  if (data) {
    const now = new Date();
    const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    for (const tx of data.transactions) {
      if (tx.occurredOn.startsWith(prefix)) {
        const day = Number(tx.occurredOn.split("-")[2]);
        (dots[day] ??= {})[tx.direction] = true;
      }
    }
  }

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar
        rightContent={
          <button
            onClick={() => setIsPanelOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-contrast shadow-card transition-all duration-150 hover:bg-accent-hover hover:shadow-card-hover active:scale-[0.98] sm:px-4"
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span className="hidden sm:inline">Log transaction</span>
          </button>
        }
      />

      <main className="mx-auto max-w-content px-4 py-6 sm:px-6 sm:py-8 md:px-8">
        {loading ? (
          <div className="h-96 animate-pulse rounded-2xl bg-rule" />
        ) : !data || !data.hasData ? (
          <DashboardEmptyState onAddTransaction={() => setIsPanelOpen(true)} />
        ) : (
          <>
            {/* Balance band */}
            <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:mb-10 sm:gap-6 md:flex-row md:items-end">
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-widest text-muted sm:mb-2">Current balance</p>
                <p className="font-mono text-3xl font-medium tracking-tight text-ink tabular-nums sm:text-5xl md:text-6xl">{inr(data.balance)}</p>
              </div>
              <div className="space-y-1 sm:space-y-2 md:text-right">
                <div className="flex items-center gap-3 sm:gap-4 md:justify-end">
                  <span className="text-[10px] font-medium uppercase tracking-widest text-muted sm:text-xs">Income · month</span>
                  <span className="font-mono text-base font-medium tabular-nums text-credit sm:text-lg">{inr(data.income)}</span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 md:justify-end">
                  <span className="text-[10px] font-medium uppercase tracking-widest text-muted sm:text-xs">Expenses · month</span>
                  <span className="font-mono text-base font-medium tabular-nums text-debit sm:text-lg">{inr(data.expense)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
              {/* Recent transactions */}
              <div className="overflow-hidden rounded-2xl border border-rule bg-paper shadow-card lg:col-span-2">
                <div className="px-4 py-4 sm:px-6 sm:py-5">
                  <h2 className="text-base font-semibold text-ink">Recent transactions</h2>
                </div>
                <div className="divide-y divide-rule border-t border-rule">
                  {data.transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-canvas sm:gap-4 sm:px-6 sm:py-3.5">
                      <TransactionIcon amount={tx.signedRupees} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">{tx.description}</p>
                        <p className="mt-0.5 font-mono text-xs text-muted">{tx.dateLabel}{tx.category ? ` · ${tx.category}` : ""}</p>
                      </div>
                      <Amount value={tx.signedRupees} showSign className="flex-shrink-0 text-sm font-semibold" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Calendar + insight */}
              <div className="space-y-4 sm:space-y-6">
                <MiniCalendar dots={dots} />
                <div className="rounded-2xl border border-[color:var(--accent)]/25 bg-accent-soft p-4 sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-accent">This month</p>
                  <p className="mt-2 text-sm font-medium text-ink sm:mt-3">
                    {data.net >= 0
                      ? <>You&apos;re net positive by <span className="font-semibold text-credit">{inr(data.net)}</span>. Keep it up.</>
                      : <>You&apos;re net negative by <span className="font-semibold text-debit">{inr(Math.abs(data.net))}</span> this month.</>}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <AddTransactionPanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} onSaved={load} />
    </div>
  );
}
