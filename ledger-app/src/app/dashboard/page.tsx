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

export default function DashboardPage() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await getOverview();
    if (res.ok) setData(res);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const cashflowMax = data
    ? Math.max(1, ...data.cashflow.flatMap((b) => [b.income, b.expense]))
    : 1;

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
          <LoadingState />
        ) : !data || !data.hasData ? (
          <DashboardEmptyState onAddTransaction={() => setIsPanelOpen(true)} />
        ) : (
          <>
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">Your ledger</h1>
              <p className="mt-1 text-sm text-muted">Every rupee, accounted for.</p>
            </div>

            {/* Row 1 — Balance + this month */}
            <div className="mb-4 grid grid-cols-1 gap-4 sm:mb-6 sm:gap-6 lg:grid-cols-3">
              <div className="relative col-span-1 overflow-hidden rounded-2xl border border-rule bg-paper p-5 shadow-card sm:p-7 lg:col-span-2">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(130%_150%_at_100%_0%,var(--accent-soft),transparent_55%)]" />
                <div className="relative">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    Total balance
                  </p>
                  <p className="mt-2 font-mono text-3xl font-medium tracking-tight text-ink tabular-nums sm:mt-3 sm:text-5xl md:text-6xl">
                    {inr(data.balance)}
                  </p>
                  {data.net !== 0 && (
                    <p className="mt-3 text-sm text-muted sm:mt-4">
                      {data.net > 0 ? "You saved " : "You overspent "}
                      <span className={`font-semibold ${data.net > 0 ? "text-credit" : "text-debit"}`}>
                        {inr(Math.abs(data.net))}
                      </span>{" "}
                      this month.
                    </p>
                  )}
                </div>
              </div>

              <div className="col-span-1 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-1 lg:grid-rows-2">
                <MiniStat label="Income · this month" value={inr(data.income)} tone="credit" />
                <MiniStat label="Expenses · this month" value={inr(data.expense)} tone="debit" />
              </div>
            </div>

            {/* Row 2 — Transactions + Cashflow */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
              <div className="col-span-1 overflow-hidden rounded-2xl border border-rule bg-paper shadow-card lg:col-span-2">
                <div className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
                  <h2 className="text-base font-semibold text-ink">Recent transactions</h2>
                </div>
                <div className="divide-y divide-rule border-t border-rule">
                  {data.transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-canvas sm:gap-4 sm:px-6 sm:py-3.5">
                      <TransactionIcon amount={tx.signedRupees} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">{tx.description}</p>
                        <p className="mt-0.5 font-mono text-xs text-muted">
                          {tx.dateLabel}
                          {tx.category ? ` · ${tx.category}` : ""}
                        </p>
                      </div>
                      <Amount value={tx.signedRupees} showSign className="flex-shrink-0 text-sm font-semibold" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-span-1 rounded-2xl border border-rule bg-paper p-4 shadow-card sm:p-6">
                <div className="mb-4 flex items-center justify-between sm:mb-6">
                  <h2 className="text-base font-semibold text-ink">Cashflow</h2>
                  <div className="flex items-center gap-3 text-[11px] font-medium text-muted">
                    <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-accent" /> In</span>
                    <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rule-strong" /> Out</span>
                  </div>
                </div>
                <div className="flex h-32 items-end gap-2 sm:h-40 sm:gap-3">
                  {data.cashflow.map((bar, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center gap-1.5 sm:gap-2">
                      <div className="flex w-full flex-1 items-end justify-center gap-0.5 sm:gap-1">
                        <div className="w-full max-w-[14px] rounded-t-md bg-accent transition-all" style={{ height: `${(bar.income / cashflowMax) * 100}%` }} />
                        <div className="w-full max-w-[14px] rounded-t-md bg-rule-strong transition-all" style={{ height: `${(bar.expense / cashflowMax) * 100}%` }} />
                      </div>
                      <span className="text-[10px] font-medium text-muted sm:text-[11px]">{bar.label}</span>
                    </div>
                  ))}
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

function MiniStat({ label, value, tone }: { label: string; value: string; tone: "credit" | "debit" }) {
  return (
    <div className="rounded-2xl border border-rule bg-paper p-4 shadow-card sm:p-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted sm:text-xs">{label}</p>
      <p className={`mt-1.5 font-mono text-xl font-medium tracking-tight tabular-nums sm:mt-2 sm:text-2xl ${tone === "credit" ? "text-credit" : "text-debit"}`}>
        {value}
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="animate-pulse space-y-4 sm:space-y-6">
      <div className="h-8 w-48 rounded-lg bg-rule" />
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="h-44 rounded-2xl bg-rule lg:col-span-2" />
        <div className="h-44 rounded-2xl bg-rule" />
      </div>
      <div className="h-72 rounded-2xl bg-rule" />
    </div>
  );
}
