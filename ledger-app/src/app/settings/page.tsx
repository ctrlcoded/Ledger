"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/ui/Navbar";
import { signOut } from "@/app/auth/actions";
import { currentUser } from "@/lib/user";

type ThemeMode = "light" | "dark" | "system";

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === "system") {
    localStorage.removeItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", prefersDark);
  } else {
    localStorage.setItem("theme", mode);
    root.classList.toggle("dark", mode === "dark");
  }
}

export default function SettingsPage() {
  // Account (editable, persisted locally for the demo)
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [editing, setEditing] = useState(false);

  // Preferences
  const [theme, setTheme] = useState<ThemeMode>("system");
  const [notifications, setNotifications] = useState(false);
  const [currency, setCurrency] = useState("INR");

  // Delete flow
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteText, setDeleteText] = useState("");

  // Hydrate persisted values on mount
  useEffect(() => {
    const stored = (localStorage.getItem("theme") as ThemeMode | null) ?? "system";
    setTheme(stored === "light" || stored === "dark" ? stored : "system");
    setNotifications(localStorage.getItem("notifications") === "on");
    setCurrency(localStorage.getItem("currency") ?? "INR");
    const savedName = localStorage.getItem("profileName");
    const savedEmail = localStorage.getItem("profileEmail");
    if (savedName) setName(savedName);
    if (savedEmail) setEmail(savedEmail);
  }, []);

  // Keep "system" mode reactive to OS changes
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  const chooseTheme = (mode: ThemeMode) => {
    setTheme(mode);
    applyTheme(mode);
  };

  const toggleNotifications = async () => {
    const next = !notifications;
    if (next && "Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
    setNotifications(next);
    localStorage.setItem("notifications", next ? "on" : "off");
    if (next && "Notification" in window && Notification.permission === "granted") {
      new Notification("Ledger", { body: "Daily summaries are on. You'll get a 9:00 PM recap." });
    }
  };

  const changeCurrency = (v: string) => {
    setCurrency(v);
    localStorage.setItem("currency", v);
  };

  const saveAccount = () => {
    localStorage.setItem("profileName", name.trim());
    localStorage.setItem("profileEmail", email.trim());
    setEditing(false);
  };

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />

      <main className="mx-auto flex max-w-[1000px] gap-16 px-8 py-16 md:gap-24">
        {/* Left Sidebar */}
        <div className="w-48 flex-shrink-0">
          <div className="sticky top-24">
            <nav className="flex flex-col gap-4">
              <a href="#account" className="text-sm font-medium text-ink">Account</a>
              <a href="#preferences" className="text-sm text-muted transition-colors hover:text-ink">Preferences</a>
              <a href="#data" className="text-sm text-muted transition-colors hover:text-ink">Data</a>
            </nav>
            <form action={signOut}>
              <button
                type="submit"
                className="mt-12 rounded-lg border border-debit px-5 py-2.5 text-left text-sm font-medium text-debit transition-colors hover:bg-debit/10"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        {/* Right Content */}
        <div className="max-w-[600px] flex-1 space-y-6">
          {/* Account */}
          <div id="account" className="scroll-mt-24 rounded-2xl border border-rule bg-paper p-8 shadow-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-accent font-bold text-accent-contrast">
                  {initials}
                </div>
                {editing ? (
                  <div className="space-y-2">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-56 rounded-lg border border-rule bg-paper-elevated px-3 py-1.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="Full name"
                    />
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-56 rounded-lg border border-rule bg-paper-elevated px-3 py-1.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="Email"
                    />
                  </div>
                ) : (
                  <div>
                    <h3 className="text-base font-semibold text-ink">{name}</h3>
                    <p className="mt-0.5 text-sm text-muted">{email}</p>
                  </div>
                )}
              </div>
              {editing ? (
                <div className="flex gap-2">
                  <button
                    onClick={saveAccount}
                    className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-contrast transition-colors hover:bg-accent-hover"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="rounded-lg border border-rule px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-ink"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="rounded-lg border border-rule bg-paper px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-canvas"
                >
                  Edit
                </button>
              )}
            </div>
          </div>

          {/* Preferences */}
          <div id="preferences" className="scroll-mt-24 overflow-hidden rounded-2xl border border-rule bg-paper shadow-card">
            <div className="p-8 pb-6">
              <h2 className="text-xl font-semibold text-ink">Preferences</h2>
            </div>
            <div className="border-t border-rule">
              {/* Currency */}
              <Row title="Currency" subtitle="Used across all screens">
                <div className="relative">
                  <select
                    value={currency}
                    onChange={(e) => changeCurrency(e.target.value)}
                    className="w-56 cursor-pointer appearance-none rounded-lg border border-rule bg-paper py-2.5 pl-4 pr-10 text-sm font-medium text-ink focus:border-accent focus:outline-none"
                  >
                    <option value="INR">₹ Indian Rupee (INR)</option>
                    <option value="USD">$ US Dollar (USD)</option>
                    <option value="EUR">€ Euro (EUR)</option>
                  </select>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted">
                    <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </Row>

              {/* Notifications */}
              <Row title="Push notifications" subtitle="Daily summary at 9:00 PM">
                <button
                  role="switch"
                  aria-checked={notifications}
                  onClick={toggleNotifications}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    notifications ? "bg-accent" : "bg-rule-strong"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-paper shadow-sm transition-transform ${
                      notifications ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </Row>

              {/* Appearance */}
              <Row title="Appearance" subtitle="Choose light, dark, or match your system" last>
                <div className="flex w-56 rounded-lg border border-rule bg-canvas p-1">
                  {(["light", "dark", "system"] as ThemeMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => chooseTheme(mode)}
                      className={`flex-1 rounded py-1.5 text-xs font-medium capitalize transition-colors ${
                        theme === mode
                          ? "bg-paper text-ink shadow-sm"
                          : "text-muted hover:text-ink"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </Row>
            </div>
          </div>

          {/* Data */}
          <div id="data" className="scroll-mt-24 overflow-hidden rounded-2xl border border-rule bg-paper shadow-card">
            <div className="p-8 pb-6">
              <h2 className="text-xl font-semibold text-ink">Data</h2>
            </div>
            <div className="border-t border-rule">
              <Row title="Export your data" subtitle="Download every transaction as CSV">
                <a
                  href="/api/v1/export"
                  className="rounded-lg border border-rule bg-paper px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-canvas"
                >
                  Export
                </a>
              </Row>

              <Row title="Delete account" subtitle="Permanently removes your ledger. This cannot be undone." last>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="rounded-lg border border-debit px-5 py-2.5 text-sm font-medium text-debit transition-colors hover:bg-debit/10"
                >
                  Delete account
                </button>
              </Row>
            </div>
          </div>
        </div>
      </main>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-rule bg-paper p-7 shadow-panel">
            <h3 className="text-lg font-semibold text-ink">Delete your account?</h3>
            <p className="mt-2 text-sm text-muted">
              This permanently deletes your ledger and every transaction. To confirm, type{" "}
              <span className="font-mono font-semibold text-ink">DELETE</span> below.
            </p>
            <input
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
              placeholder="DELETE"
              className="mt-4 w-full rounded-lg border border-rule bg-paper-elevated px-4 py-2.5 text-sm text-ink focus:border-debit focus:outline-none focus:ring-2 focus:ring-debit/40"
            />
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setConfirmDelete(false);
                  setDeleteText("");
                }}
                className="rounded-lg border border-rule px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-ink"
              >
                Cancel
              </button>
              <form action={signOut}>
                <button
                  type="submit"
                  disabled={deleteText !== "DELETE"}
                  className="rounded-lg bg-debit px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Delete account
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({
  title,
  subtitle,
  children,
  last,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between p-8 ${last ? "" : "border-b border-rule"}`}>
      <div>
        <h3 className="text-sm font-medium text-ink">{title}</h3>
        <p className="mt-1 text-xs text-muted">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
