"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import Amount from "@/components/ui/Amount";
import AddTransactionPanel from "@/components/ui/AddTransactionPanel";
import DashboardEmptyState from "@/components/dashboard/DashboardEmptyState";
import DashboardErrorState from "@/components/dashboard/DashboardErrorState";

const recentTransactions = [
  { date: "24 Oct 2023", description: "Dividend Payout - HDFC Bank", amount: 12400 },
  { date: "23 Oct 2023", description: "Monthly Rent - Apartment 4B", amount: 35000 },
  { date: "22 Oct 2023", description: "Consulting Fee - Project Aurora", amount: 72600 },
  { date: "21 Oct 2023", description: "Zomato - Weekend Dinner", amount: 2450.5 },
  { date: "20 Oct 2023", description: "Internet Subscription - ACT Fibernet", amount: 1299 },
  { date: "19 Oct 2023", description: "Amazon India - Office Supplies", amount: 3600.5 },
];

const cashflowBars = [
  { income: 30, expense: 65 },
  { income: 50, expense: 70 },
  { income: 40, expense: 45 },
  { income: 55, expense: 80 },
  { income: 35, expense: 50 },
  { income: 60, expense: 45 },
];

export default function DashboardPage() {
  return (
    <Suspense fallback={<div />}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const searchParams = useSearchParams();
  const stateParam = searchParams.get("state");

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar
        rightContent={
          <button 
            onClick={() => setIsPanelOpen(true)}
            className="px-5 py-2.5 bg-ink text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity duration-150"
          >
            Log transaction
          </button>
        }
      />

      <main className="max-w-content mx-auto px-8 py-8">
        {stateParam === "error" ? (
          <DashboardErrorState />
        ) : stateParam === "empty" ? (
          <DashboardEmptyState onAddTransaction={() => setIsPanelOpen(true)} />
        ) : (
          <>
            {/* Current Balance */}
            <div className="text-right mb-8">
              <p className="text-xs font-medium uppercase tracking-widest text-muted mb-2">
                CURRENT BALANCE
              </p>
              <p className="font-mono text-6xl font-medium tracking-tight text-ink">
                ₹1,24,500.00
              </p>
            </div>

            <div className="mb-6">
              <h2 className="font-sans text-xl font-semibold text-ink mb-4">
                Recent transactions
              </h2>
              <div className="bg-paper border border-rule rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-rule">
                      <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-widest text-muted">
                        DATE
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-widest text-muted">
                        DESCRIPTION
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-medium uppercase tracking-widest text-muted">
                        AMOUNT
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((tx, i) => (
                      <tr
                        key={i}
                        className="border-b border-rule last:border-b-0 hover:bg-canvas/50 transition-colors duration-100"
                      >
                        <td className="px-6 py-4 font-mono text-sm text-ink whitespace-nowrap">
                          {tx.date}
                        </td>
                        <td className="px-6 py-4 text-sm text-ink">{tx.description}</td>
                        <td className="px-6 py-4 text-right">
                          <Amount value={tx.amount} className="text-sm font-medium" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* View Full Ledger */}
            <div className="text-right mb-10">
              <a
                href="#"
                className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink transition-colors duration-150"
              >
                View full ledger
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="ml-1"
                >
                  <path
                    d="M6 12L10 8L6 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>

            {/* Cashflow + Quick Insight */}
            <div className="grid grid-cols-3 gap-6">
              {/* Cashflow Architecture */}
              <div className="col-span-2 bg-paper border border-rule rounded-xl p-6">
                <p className="text-xs font-medium uppercase tracking-widest text-muted mb-6">
                  CASHFLOW ARCHITECTURE
                </p>
                <div className="flex items-end gap-4 h-32">
                  {cashflowBars.map((bar, i) => (
                    <div key={i} className="flex items-end gap-1 flex-1">
                      <div
                        className="flex-1 bg-rule rounded-sm"
                        style={{ height: `${bar.income}%` }}
                      />
                      <div
                        className="flex-1 bg-ink rounded-sm"
                        style={{ height: `${bar.expense}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Insight */}
              <div className="bg-ink rounded-xl p-6 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-white/60 mb-4">
                    QUICK INSIGHT
                  </p>
                  <p className="text-sm text-white leading-relaxed">
                    Your spending on{" "}
                    <span className="underline underline-offset-2">dining</span> is 12%
                    lower than last month. Good discipline.
                  </p>
                </div>
                <div className="text-right mt-4">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="ml-auto"
                  >
                    <path
                      d="M4 16L8 12L12 14L20 6"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14 6H20V12"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <AddTransactionPanel 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)} 
      />
    </div>
  );
}
