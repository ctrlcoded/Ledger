"use client";

import Navbar from "@/components/ui/Navbar";
import { signOut } from "@/app/auth/actions";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />

      <main className="max-w-[1000px] mx-auto px-8 py-16 flex gap-24">
        
        {/* Left Sidebar */}
        <div className="w-48 flex-shrink-0">
          <div className="sticky top-16">
            <nav className="flex flex-col gap-6">
              <a href="#account" className="text-sm font-medium text-ink">Account</a>
              <a href="#preferences" className="text-sm text-muted hover:text-ink transition-colors">Preferences</a>
              <a href="#data" className="text-sm text-muted hover:text-ink transition-colors">Data</a>
            </nav>
          
            <form action={signOut}>
              <button
                type="submit"
                className="px-5 py-2.5 border border-debit text-debit text-sm font-medium rounded-lg hover:bg-debit/5 transition-colors text-left mt-16"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 max-w-[600px] space-y-6">
          
          {/* Account Card */}
          <div id="account" className="bg-paper border border-rule rounded-xl p-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-canvas border border-rule flex items-center justify-center text-ink font-medium">
                RD
              </div>
              <div>
                <h3 className="font-sans text-base font-semibold text-ink">Rahul Das</h3>
                <p className="text-sm text-muted mt-0.5">rahul.das@example.com</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-paper border border-rule rounded-lg text-sm font-medium text-ink hover:bg-canvas transition-colors">
              Edit
            </button>
          </div>

          {/* Preferences Card */}
          <div id="preferences" className="bg-paper border border-rule rounded-xl overflow-hidden">
            <div className="p-8 pb-6">
              <h2 className="font-sans text-xl font-semibold text-ink">Preferences</h2>
            </div>
            
            <div className="border-t border-rule">
              {/* Currency */}
              <div className="p-8 flex items-center justify-between border-b border-rule">
                <div>
                  <h3 className="text-sm font-medium text-ink">Currency</h3>
                  <p className="text-xs text-muted mt-1">Used across all screens</p>
                </div>
                <div className="relative">
                  <select className="appearance-none pl-4 pr-10 py-2.5 bg-paper border border-rule rounded-lg text-sm font-medium text-ink focus:outline-none focus:border-ink cursor-pointer w-56">
                    <option>₹ Indian Rupee (INR)</option>
                  </select>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="absolute right-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              {/* Push notifications */}
              <div className="p-8 flex items-center justify-between border-b border-rule">
                <div>
                  <h3 className="text-sm font-medium text-ink">Push notifications</h3>
                  <p className="text-xs text-muted mt-1">Daily summary at 9:00 PM</p>
                </div>
                <button className="w-11 h-6 bg-ink rounded-full relative transition-colors">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-paper rounded-full transition-transform" />
                </button>
              </div>

              {/* Appearance */}
              <div className="p-8 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-ink">Appearance</h3>
                  <p className="text-xs text-muted mt-1">Follows your system setting</p>
                </div>
                <div className="flex bg-canvas p-1 rounded-lg border border-rule w-56">
                  <button className="flex-1 py-1.5 text-xs font-medium text-ink bg-paper rounded shadow-sm border border-rule/50">
                    Light
                  </button>
                  <button className="flex-1 py-1.5 text-xs font-medium text-muted hover:text-ink transition-colors">
                    Dark
                  </button>
                  <button className="flex-1 py-1.5 text-xs font-medium text-muted hover:text-ink transition-colors">
                    System
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Data Card */}
          <div id="data" className="bg-paper border border-rule rounded-xl overflow-hidden">
            <div className="p-8 pb-6">
              <h2 className="font-sans text-xl font-semibold text-ink">Data</h2>
            </div>
            
            <div className="border-t border-rule">
              {/* Export */}
              <div className="p-8 flex items-center justify-between border-b border-rule">
                <div>
                  <h3 className="text-sm font-medium text-ink">Export your data</h3>
                  <p className="text-xs text-muted mt-1">Download every transaction as CSV</p>
                </div>
                <a
                  href="/api/v1/export"
                  className="px-5 py-2.5 bg-paper border border-rule rounded-lg text-sm font-medium text-ink hover:bg-canvas transition-colors"
                >
                  Export
                </a>
              </div>

              {/* Delete */}
              <div className="p-8 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-ink">Delete account</h3>
                  <p className="text-xs text-muted mt-1">This permanently removes your ledger and cannot be undone</p>
                </div>
                <button className="px-5 py-2.5 bg-paper border border-debit text-debit rounded-lg text-sm font-medium hover:bg-debit/5 transition-colors">
                  Delete account
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
