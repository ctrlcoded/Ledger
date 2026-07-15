"use client";

import Amount from "@/components/ui/Amount";

interface DashboardEmptyStateProps {
  onAddTransaction: () => void;
}

export default function DashboardEmptyState({ onAddTransaction }: DashboardEmptyStateProps) {
  return (
    <>
      <div className="bg-paper border border-rule rounded-xl p-8 mb-8">
        <p className="text-[10px] font-medium uppercase tracking-widest text-muted mb-2">CURRENT BALANCE</p>
        <Amount value={0} showSign={false} className="text-[60px] font-medium tracking-tight text-rule mb-4 leading-none" />
        <p className="text-sm text-muted">No transactions yet</p>
      </div>

      <div className="bg-paper border border-rule rounded-xl p-16 flex flex-col items-center justify-center min-h-[400px] mb-8">
        {/* Document Icon */}
        <div className="mb-6 text-rule">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
        
        <h3 className="font-sans text-base font-semibold text-ink mb-2">Your ledger is empty</h3>
        <p className="text-sm text-muted mb-6 text-center">Add your first transaction to see it here</p>
        
        <button 
          onClick={onAddTransaction}
          className="px-6 py-2.5 bg-ink text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          Add transaction
        </button>
      </div>

      <div className="flex gap-8">
        {/* Cash Flow */}
        <div className="w-[300px] flex-shrink-0 bg-paper border border-rule rounded-xl p-6 h-[200px] flex flex-col justify-between">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted">CASH FLOW</p>
          <div className="flex justify-between items-end gap-2 h-16">
            <div className="w-full bg-canvas rounded h-[10%]" />
            <div className="w-full bg-canvas rounded h-[10%]" />
            <div className="w-full bg-canvas rounded h-[10%]" />
            <div className="w-full bg-canvas rounded h-[10%]" />
          </div>
        </div>

        {/* Active Budgets */}
        <div className="flex-1 bg-paper border border-rule rounded-xl p-6">
          <div className="flex justify-between items-center mb-8">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted">ACTIVE BUDGETS</p>
            <button className="text-xs font-medium text-ink">View all</button>
          </div>
          
          <div className="flex items-center justify-between py-4 border-b border-rule">
            <p className="text-sm text-muted">No active budgets defined</p>
            <p className="text-sm text-muted/50">—</p>
          </div>
        </div>
      </div>
    </>
  );
}
