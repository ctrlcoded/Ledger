"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string | null;
  onDismiss: () => void;
  /** auto-dismiss after N ms (default 4000) */
  duration?: number;
  tone?: "error" | "success";
}

/** Fixed bottom-center toast for transient feedback (e.g. delete failed). */
export default function Toast({ message, onDismiss, duration = 4000, tone = "error" }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [message, duration, onDismiss]);

  if (!message) return null;

  return (
    <div className="fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
      <div
        role="status"
        className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-panel ${
          tone === "error"
            ? "border-debit/30 bg-paper text-debit"
            : "border-credit/30 bg-paper text-credit"
        }`}
      >
        <span>{message}</span>
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="text-muted transition-colors hover:text-ink"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
