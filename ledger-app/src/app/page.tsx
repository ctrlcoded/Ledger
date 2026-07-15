"use client";

import { useState } from "react";
import Navbar from "@/components/ui/Navbar";
import Amount from "@/components/ui/Amount";
import CategoryIcon from "@/components/ui/CategoryIcon";
import AddTransactionPanel from "@/components/ui/AddTransactionPanel";

const recentTransactions = [
  {
    name: "Zomato",
    category: "Food & Beverage",
    date: "14 July",
    amount: -485,
    icon: "food",
  },
  {
    name: "Swiggy Instamart",
    category: "Groceries",
    date: "13 July",
    amount: -1240,
    icon: "groceries",
  },
  {
    name: "Amazon India",
    category: "Shopping",
    date: "12 July",
    amount: -2850,
    icon: "shopping",
  },
  {
    name: "HDFC Bank Interest",
    category: "Dividends",
    date: "10 July",
    amount: 245,
    icon: "bank",
  },
  {
    name: "ACT Fibernet",
    category: "Utilities",
    date: "08 July",
    amount: -1149,
    icon: "utilities",
  },
  {
    name: "Uber India",
    category: "Transport",
    date: "07 July",
    amount: -420,
    icon: "transport",
  },
];


// Mini Calendar Component
function MiniCalendar() {
  const year = 2026;
  const month = 6; // July (0-indexed)
  const today = 15;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); // Sunday = 0

  // Days from previous month to show
  const prevMonthDays = new Date(year, month, 0).getDate();
  const prevDays = Array.from({ length: firstDay }, (_, i) => prevMonthDays - firstDay + 1 + i);
  const currentDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const nextDays = Array.from({ length: totalCells - firstDay - daysInMonth }, (_, i) => i + 1);

  // Dots data: which days have transactions
  const dotData: Record<number, { credit?: boolean; debit?: boolean }> = {
    3: { debit: true },
    5: { credit: true, debit: true },
    10: { debit: true },
    14: { debit: true },
    15: { credit: true },
  };

  const dayLabels = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

  return (
    <div className="bg-paper border border-rule rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-sans text-base font-semibold text-ink">This month</h3>
        <span className="text-sm text-muted">
          July {year}
        </span>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayLabels.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-medium uppercase tracking-wider text-muted py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {prevDays.map((day, i) => (
          <div
            key={`p-${i}`}
            className="text-center py-1.5 text-sm text-muted/30"
          >
            {day}
          </div>
        ))}
        {currentDays.map((day) => {
          const isToday = day === today;
          const dots = dotData[day];

          return (
            <div key={day} className="text-center relative">
              <div
                className={`py-1.5 text-sm ${
                  isToday
                    ? "bg-canvas border border-rule rounded-lg font-semibold text-ink"
                    : "text-ink"
                }`}
              >
                {day}
              </div>
              {dots && (
                <div className="flex justify-center gap-0.5 -mt-0.5">
                  {dots.credit && (
                    <div className="w-1.5 h-1.5 rounded-full bg-credit" />
                  )}
                  {dots.debit && (
                    <div className="w-1.5 h-1.5 rounded-full bg-debit" />
                  )}
                </div>
              )}
            </div>
          );
        })}
        {nextDays.map((day, i) => (
          <div
            key={`n-${i}`}
            className="text-center py-1.5 text-sm text-muted/30"
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar
        rightContent={
          <div className="flex items-center gap-4">
            <button className="p-2 text-muted hover:text-ink transition-colors duration-150">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M8 15C11.866 15 15 11.866 15 8C15 4.134 11.866 1 8 1C4.134 1 1 4.134 1 8C1 11.866 4.134 15 8 15Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13 13L19 19"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className="w-8 h-8 bg-ink rounded-full flex items-center justify-center text-xs font-medium text-white">
              JD
            </div>
          </div>
        }
      />

      <main className="max-w-content mx-auto px-8 py-8">
        {/* Balance Section */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted mb-2">
              CURRENT BALANCE
            </p>
            <p className="font-mono text-6xl font-medium tracking-tight text-ink">
              ₹52,600.00
            </p>
            <p className="text-sm text-muted mt-2">as of 15 July 2026</p>
          </div>
          <div className="text-right space-y-3">
            <div className="flex items-center gap-4 justify-end">
              <span className="text-xs font-medium uppercase tracking-widest text-muted">
                INCOME · JULY
              </span>
              <span className="font-mono text-lg font-medium tabular-nums text-credit">
                ₹85,000.00
              </span>
            </div>
            <div className="flex items-center gap-4 justify-end">
              <span className="text-xs font-medium uppercase tracking-widest text-muted">
                EXPENSES · JULY
              </span>
              <span className="font-mono text-lg font-medium tabular-nums text-debit">
                ₹32,400.00
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left: Recent Transactions */}
          <div className="col-span-2">
            <div className="bg-paper border border-rule rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-sans text-xl font-semibold text-ink">
                  Recent transactions
                </h2>
                <a
                  href="#"
                  className="text-sm text-muted hover:text-ink transition-colors duration-150"
                >
                  View all
                </a>
              </div>

              <div className="space-y-0">
                {recentTransactions.map((tx, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-4 py-4 ${
                      i < recentTransactions.length - 1 ? "border-b border-rule" : ""
                    }`}
                  >
                    <CategoryIcon type={tx.icon} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink">{tx.name}</p>
                      <p className="text-xs text-muted mt-0.5">{tx.category}</p>
                    </div>
                    <span className="font-mono text-sm text-muted mr-4 flex-shrink-0">
                      {tx.date}
                    </span>
                    <Amount
                      value={tx.amount}
                      showSign={true}
                      className="text-sm font-medium flex-shrink-0"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Calendar + CTA + Insights */}
          <div className="space-y-6">
            <MiniCalendar />

            {/* Add Transaction CTA */}
            <button 
              onClick={() => setIsPanelOpen(true)}
              className="w-full py-3 bg-ink text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity duration-150 flex items-center justify-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 3V13M3 8H13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Add transaction
            </button>

            {/* Insights */}
            <div className="bg-paper border border-rule rounded-xl p-6">
              <h3 className="font-sans text-base font-semibold text-ink mb-4">
                Insights
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-credit mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-ink">
                    Savings are up 12% from last month.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-debit mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-ink">
                    High dining spend in the last 7 days.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pb-8 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-muted">
            LEDGER SYSTEMATIC FINANCE · 2026
          </p>
        </footer>
      </main>

      <AddTransactionPanel 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)} 
      />
    </div>
  );
}
