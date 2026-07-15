"use client";

import Amount from "@/components/ui/Amount";

export default function DashboardErrorState() {
  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted mb-1">FINANCIAL OVERVIEW</p>
          <h1 className="font-sans text-4xl font-semibold text-ink tracking-tight">Dashboard</h1>
        </div>
        <button className="px-5 py-2.5 bg-ink text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity">
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-3 gap-8 mb-12">
        <div className="bg-paper border border-rule rounded-xl p-8">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted mb-4">TOTAL BALANCE</p>
          <Amount value={142384.12} showSign={false} className="text-3xl font-medium tracking-tight text-ink" />
        </div>
        <div className="bg-paper border border-rule rounded-xl p-8">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted mb-4">MONTHLY INFLOW</p>
          <Amount value={12040.00} showSign={true} className="text-3xl font-medium tracking-tight text-credit" />
        </div>
        <div className="bg-paper border border-rule rounded-xl p-8">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted mb-4">MONTHLY OUTFLOW</p>
          <Amount value={-8420.50} showSign={true} className="text-3xl font-medium tracking-tight text-debit" />
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-sans text-xl font-semibold text-ink">Recent Transactions</h2>
        <span className="text-[10px] font-medium uppercase tracking-widest text-muted">STATUS: CONNECTION FAILED</span>
      </div>

      <div className="bg-paper border border-rule rounded-xl p-16 flex flex-col items-center justify-center min-h-[400px] mb-8">
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
