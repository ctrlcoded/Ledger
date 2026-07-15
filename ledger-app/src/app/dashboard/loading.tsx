"use client";

import Navbar from "@/components/ui/Navbar";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />
      
      <main className="max-w-content mx-auto px-8 py-8 animate-pulse">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="w-32 h-6 bg-rule/50 rounded" />
          <div className="w-24 h-8 bg-rule/50 rounded-lg" />
        </div>

        <div className="flex gap-8 items-start">
          {/* Main Left Content */}
          <div className="flex-1 bg-paper border border-rule rounded-xl overflow-hidden min-h-[600px]">
            {/* Header row skeleton */}
            <div className="px-6 py-4 border-b border-rule flex items-center justify-between">
              <div className="w-24 h-4 bg-rule/50 rounded" />
              <div className="w-16 h-4 bg-rule/50 rounded" />
            </div>
            
            {/* List items skeleton */}
            <div className="p-6 space-y-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-rule/50 rounded-lg" />
                    <div className="space-y-2">
                      <div className="w-32 h-4 bg-rule/50 rounded" />
                      <div className="w-20 h-3 bg-rule/50 rounded" />
                    </div>
                  </div>
                  <div className="w-24 h-4 bg-rule/50 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-[340px] flex-shrink-0 space-y-8">
            {/* Mini Calendar Skeleton */}
            <div className="bg-paper border border-rule rounded-xl p-6 min-h-[200px]">
              <div className="w-24 h-4 bg-rule/50 rounded mb-6" />
              <div className="w-full h-24 bg-rule/50 rounded-lg" />
              <div className="flex justify-between mt-6">
                <div className="w-12 h-2 bg-rule/50 rounded" />
                <div className="w-12 h-2 bg-rule/50 rounded" />
              </div>
            </div>

            {/* Another Card Skeleton */}
            <div className="bg-paper border border-rule rounded-xl p-6 min-h-[250px]">
              <div className="w-32 h-4 bg-rule/50 rounded mb-8" />
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="w-24 h-3 bg-rule/50 rounded" />
                  <div className="w-10 h-3 bg-rule/50 rounded" />
                </div>
                <div className="flex justify-between items-center">
                  <div className="w-24 h-3 bg-rule/50 rounded" />
                  <div className="w-10 h-3 bg-rule/50 rounded" />
                </div>
                <div className="flex justify-between items-center">
                  <div className="w-24 h-3 bg-rule/50 rounded" />
                  <div className="w-10 h-3 bg-rule/50 rounded" />
                </div>
              </div>
            </div>
            
            {/* Third Card Skeleton (Darker) */}
            <div className="bg-ink rounded-xl p-6 min-h-[140px] flex flex-col justify-between">
              <div className="w-24 h-4 bg-white/20 rounded" />
              <div className="w-full h-4 bg-white/20 rounded" />
              <div className="w-full h-8 bg-white/10 rounded" />
            </div>
          </div>
        </div>

        <footer className="mt-16 flex items-center justify-between text-[11px] text-muted">
          <span className="uppercase tracking-widest">Disciplined Data Architecture</span>
          <span>© 2024 Ledger Financial Systems. All rights reserved.</span>
        </footer>
      </main>
    </div>
  );
}
