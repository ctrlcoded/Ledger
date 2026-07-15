"use client";

import { useState } from "react";
import Navbar from "@/components/ui/Navbar";
import LineChart from "@/components/ui/LineChart";

const chartData = [
  { label: "Feb", income: 28000, expenses: 14000 },
  { label: "Mar", income: 64000, expenses: 32000 },
  { label: "Apr", income: 42000, expenses: 10000 },
  { label: "May", income: 98000, expenses: 40000 },
  { label: "Jun", income: 104250, expenses: 42800 },
  { label: "Jul", income: 78000, expenses: 25000 },
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<"6 months" | "12 months" | "All">("12 months");

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />

      <main className="max-w-content mx-auto px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-6">
          <div>
            <h1 className="font-sans text-2xl font-semibold text-ink mb-1">
              Analytics
            </h1>
            <p className="text-sm text-muted">Income and spending over time</p>
          </div>

          {/* Segmented Control */}
          <div className="inline-flex bg-paper border border-rule rounded-lg p-1">
            {(["6 months", "12 months", "All"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all duration-150 ${
                  period === p
                    ? "bg-canvas border border-rule text-ink shadow-sm"
                    : "text-muted hover:text-ink transparent border border-transparent"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-paper border border-rule rounded-xl p-6 pt-8 mb-6">
          <LineChart data={chartData} height={350} />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-paper border border-rule rounded-xl p-6">
            <p className="text-xs font-medium uppercase tracking-widest text-muted mb-2">
              HIGHEST MONTH
            </p>
            <p className="font-mono text-3xl font-medium tracking-tight text-ink mb-1">
              ₹1,04,250
            </p>
            <p className="text-xs text-muted">June 2026</p>
          </div>
          
          <div className="bg-paper border border-rule rounded-xl p-6">
            <p className="text-xs font-medium uppercase tracking-widest text-muted mb-2">
              MONTHLY AVERAGE
            </p>
            <p className="font-mono text-3xl font-medium tracking-tight text-ink mb-1">
              ₹11,800
            </p>
            <p className="text-xs text-muted">across 12 months</p>
          </div>

          <div className="bg-paper border border-rule rounded-xl p-6">
            <p className="text-xs font-medium uppercase tracking-widest text-muted mb-2">
              SAVED THIS YEAR
            </p>
            <p className="font-mono text-3xl font-medium tracking-tight text-ink mb-1">
              ₹82,600
            </p>
            <p className="text-xs font-medium text-credit">
              ▲ 7.4% vs last year
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Top Expense Categories */}
          <div className="md:col-span-2 bg-paper border border-rule rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-medium uppercase tracking-widest text-muted">
                TOP EXPENSE CATEGORIES
              </h3>
              <button className="text-xs font-medium text-ink hover:underline">
                View All
              </button>
            </div>

            <div className="space-y-0">
              {/* Category 1 */}
              <div className="flex items-center justify-between py-4 border-b border-rule">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-canvas border border-rule rounded-lg flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink">
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">Grocery & Retail</p>
                    <p className="text-xs text-muted">14 Transactions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-semibold text-ink">₹24,500.00</p>
                  <p className="text-xs font-medium text-debit mt-0.5">12% of total</p>
                </div>
              </div>

              {/* Category 2 */}
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-canvas border border-rule rounded-lg flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">Rent & Utilities</p>
                    <p className="text-xs text-muted">4 Transactions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-semibold text-ink">₹45,000.00</p>
                  <p className="text-xs font-medium text-debit mt-0.5">22% of total</p>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Insight */}
          <div className="bg-ink rounded-xl p-6 text-white flex flex-col justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-white/50 mb-4">
                FINANCIAL INSIGHT
              </p>
              <p className="text-sm font-medium leading-relaxed">
                You&apos;re saving 14% more this quarter compared to Q1 2026. Keep this pace to reach your goal.
              </p>
            </div>
            <button className="w-full mt-6 py-3 bg-white text-ink text-xs font-semibold rounded-lg hover:bg-paper transition-colors duration-150 uppercase tracking-widest">
              REVIEW BUDGET
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pb-8 border-t border-rule pt-8 flex items-center justify-between">
          <p className="text-xs font-medium text-muted">
            © 2026 Ledger Financial Systems. No shadows, pure data.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs font-medium text-muted hover:text-ink transition-colors">Privacy Policy</a>
            <a href="/api/v1/export" className="text-xs font-medium text-muted hover:text-ink transition-colors">Export Data (CSV)</a>
          </div>
        </footer>
      </main>
    </div>
  );
}
