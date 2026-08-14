"use client";

import Amount from "@/components/ui/Amount";

export default function DashboardErrorState() {
  return (
    <>
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between sm:mb-8">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted mb-1">FINANCIAL OVERVIEW</p>
          <h1 className="font-sans text-3xl font-semibold text-ink tracking-tight sm:text-4xl">Dashboard</h1>
        </div>
        <button className="self-start px-5 py-2.5 bg-ink text-canvas text-sm font-medium rounded-lg hover:opacity-90 transition-opacity sm:self-auto">
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 sm:gap-6 sm:mb-12 md:grid-cols-3">
        <div className="bg-paper border border-rule rounded-xl p-5 sm:p-8">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted mb-3 sm:mb-4">TOTAL BALANCE</p>
          <Amount value={142384.12} showSign={false} className="text-2xl font-medium tracking-tight text-ink sm:text-3xl" />
        </div>
        <div className="bg-paper border border-rule rounded-xl p-5 sm:p-8">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted mb-3 sm:mb-4">MONTHLY INFLOW</p>
          <Amount value={12040.00} showSign={true} className="text-2xl font-medium tracking-tight text-credit sm:text-3xl" />
        </div>
        <div className="bg-paper border border-rule rounded-xl p-5 sm:p-8">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted mb-3 sm:mb-4">MONTHLY OUTFLOW</p>
          <Amount value={-8420.50} showSign={true} className="text-2xl font-medium tracking-tight text-debit sm:text-3xl" />
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-sans text-xl font-semibold text-ink">Recent Transactions</h2>
        <span className="text-[10px] font-medium uppercase tracking-widest text-muted">STATUS: CONNECTION FAILED</span>
      </div>

      <div className="bg-paper border border-rule rounded-xl p-8 flex flex-col items-center justify-center min-h-[280px] mb-6 sm:p-16 sm:min-h-[400px] sm:mb-8">
        <div className="mb-6 text-muted">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" opacity="0.3"/>
            <path d="M22 22 2 2" />
          </svg>
        </div>
        
        <h3 className="font-sans text-base font-semibold text-ink mb-2">Couldn't load your transactions</h3>
        <p className="text-sm text-muted mb-6">Check your connection and try again</p>
        
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-paper border border-rule text-ink text-sm font-medium rounded-lg hover:bg-canvas transition-colors"
        >
          Retry
        </button>
      </div>
    </>
  );
}
