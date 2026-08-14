"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import LineChart from "@/components/ui/LineChart";
import { getReports } from "@/app/data";
import { inr } from "@/lib/format";

type Reports = Extract<Awaited<ReturnType<typeof getReports>>, { ok: true }>;

export default function AnalyticsPage() {
  const [data, setData] = useState<Reports | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReports().then((res) => {
      if (res.ok) setData(res);
      setLoading(false);
    });
  }, []);

  const scrollToCategories = () =>
    document.getElementById("categories")?.scrollIntoView({ behavior: "smooth", block: "center" });

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />

      <main className="mx-auto max-w-content px-4 py-6 sm:px-6 sm:py-8 md:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl font-semibold text-ink sm:text-2xl">Analytics</h1>
          <p className="text-sm text-muted">Income and spending over time</p>
        </div>

        {loading ? (
          <div className="h-64 animate-pulse rounded-2xl bg-rule sm:h-96" />
        ) : !data || !data.hasData ? (
          <div className="grid place-items-center rounded-2xl border border-rule bg-paper py-16 text-center shadow-card sm:py-24">
            <div className="max-w-sm px-6">
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-accent-soft text-accent">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 19V5M4 19h16M8 15l3-3 3 2 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <h2 className="text-lg font-semibold text-ink">No analytics yet</h2>
              <p className="mt-2 text-sm text-muted">Add a few transactions and your income, spending, and trends will appear here.</p>
              <Link href="/dashboard" className="mt-5 inline-flex rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-contrast hover:bg-accent-hover">
                Add a transaction
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Chart */}
            <div className="mb-4 rounded-2xl border border-rule bg-paper p-3 pt-5 shadow-card sm:mb-6 sm:p-6 sm:pt-8">
              <LineChart data={data.chart} height={350} />
            </div>

            {/* Summary cards */}
            <div className="mb-4 grid grid-cols-1 gap-4 sm:mb-6 sm:gap-6 md:grid-cols-3">
              <SummaryCard label="Highest month" value={inr(data.highestMonthValue)} sub={data.highestMonthLabel} />
              <SummaryCard label="Avg monthly spend" value={inr(data.monthlyAvgExpense)} sub="active months" />
              <SummaryCard label="Saved this year" value={inr(data.totalSaved)} sub={`${data.savingsRate}% savings rate`} accent />
            </div>

            {/* Categories + insight */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
              <div id="categories" className="scroll-mt-24 rounded-2xl border border-rule bg-paper p-4 shadow-card sm:p-6 md:col-span-2">
                <h3 className="mb-4 text-xs font-medium uppercase tracking-widest text-muted sm:mb-6">Top expense categories</h3>
                {data.topCategories.length > 0 ? (
                  <div className="divide-y divide-rule">
                    {data.topCategories.map((c) => (
                      <div key={c.name} className="flex items-center justify-between py-3 sm:py-4">
                        <div>
                          <p className="text-sm font-semibold text-ink">{c.name}</p>
                          <p className="text-xs text-muted">{c.count} transaction{c.count === 1 ? "" : "s"}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-sm font-semibold text-ink">{inr(c.total)}</p>
                          <p className="mt-0.5 text-xs font-medium text-debit">{c.pct}% of spend</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-6 text-sm text-muted">No expenses recorded yet.</p>
                )}
              </div>

              {/* Financial insight */}
              <div className="flex flex-col justify-between rounded-2xl border border-[color:var(--accent)]/25 bg-accent-soft p-4 sm:p-6">
                <div>
                  <div className="mb-3 flex items-center gap-2 sm:mb-4">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-accent-contrast">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 16l4-4 3 2 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M14 6h5v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                    <p className="text-xs font-semibold uppercase tracking-widest text-accent">Financial insight</p>
                  </div>
                  <p className="text-sm font-medium leading-relaxed text-ink">
                    You&apos;ve saved <span className="font-mono font-semibold tabular-nums">{inr(data.totalSaved)}</span> over the last year — a{" "}
                    <span className="font-semibold text-credit">{data.savingsRate}% savings rate</span>. Trim your top categories to push it higher.
                  </p>
                </div>
                <button onClick={scrollToCategories} className="mt-4 w-full rounded-lg bg-accent py-2.5 text-xs font-semibold uppercase tracking-widest text-accent-contrast shadow-card transition-all hover:bg-accent-hover active:scale-[0.99] sm:mt-6 sm:py-3">
                  Review budget
                </button>
              </div>
            </div>
          </>
        )}

        <footer className="mt-10 flex flex-col items-center gap-3 border-t border-rule pb-8 pt-6 sm:mt-16 sm:flex-row sm:justify-between sm:gap-0 sm:pt-8">
          <p className="text-xs font-medium text-muted">© 2026 Ledger</p>
          <div className="flex items-center gap-6">
            <a href="/api/v1/export" className="text-xs font-medium text-muted transition-colors hover:text-ink">Export Data (CSV)</a>
          </div>
        </footer>
      </main>
    </div>
  );
}

function SummaryCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-rule bg-paper p-4 shadow-card sm:p-6">
      <p className="mb-1 text-xs font-medium uppercase tracking-widest text-muted sm:mb-2">{label}</p>
      <p className="mb-1 font-mono text-2xl font-medium tracking-tight text-ink tabular-nums sm:text-3xl">{value}</p>
      <p className={`text-xs font-medium ${accent ? "text-credit" : "text-muted"}`}>{sub}</p>
    </div>
  );
}
