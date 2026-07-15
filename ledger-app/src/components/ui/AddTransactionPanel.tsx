"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addTransaction, getCategories } from "@/app/actions";

interface Category {
  id: string;
  name: string;
  icon: string;
  direction: "credit" | "debit" | null;
}

interface AddTransactionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

function todayISO() {
  // Local YYYY-MM-DD (avoids UTC off-by-one from toISOString()).
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10);
}

export default function AddTransactionPanel({ isOpen, onClose, onSaved }: AddTransactionPanelProps) {
  const router = useRouter();
  const [type, setType] = useState<"credit" | "debit">("debit");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [categoryId, setCategoryId] = useState<string>("");
  const [note, setNote] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Load the user's categories when the panel opens.
  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    getCategories().then((res) => {
      if (active && res.ok) setCategories(res.categories as Category[]);
    });
    return () => {
      active = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9.]/g, "");
    setAmount(val);
  };

  // Categories usable for the selected direction (null direction = usable for both).
  const visibleCategories = categories.filter(
    (c) => c.direction === null || c.direction === type
  );

  const handleSave = async () => {
    setError(null);
    const rupees = parseFloat(amount);
    if (!rupees || rupees <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }

    setSaving(true);
    const res = await addTransaction({
      clientId: crypto.randomUUID(),
      direction: type,
      amountMinor: Math.round(rupees * 100), // rupees → paise
      currencyCode: "INR",
      occurredOn: date,
      categoryId: categoryId || null,
      note: note.trim() || null,
    });
    setSaving(false);

    if (!res.ok) {
      setError(
        res.error === "UNAUTHENTICATED"
          ? "Your session expired. Sign in again to save."
          : res.error === "RATE_LIMITED"
          ? "Too many transactions too fast. Wait a moment and retry."
          : "Could not save the transaction. Check the details and retry."
      );
      return;
    }

    // Reset and close.
    setAmount("");
    setNote("");
    setCategoryId("");
    setType("debit");
    onSaved?.();
    router.refresh();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/20 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[400px] bg-paper shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out border-l border-rule">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rule shrink-0">
          <h2 className="font-sans text-base font-semibold text-ink">Add transaction</h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-muted hover:text-ink transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Segmented Control */}
          <div className="bg-canvas p-1 rounded-xl flex items-center">
            <button
              onClick={() => setType("credit")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                type === "credit" ? "bg-paper text-ink shadow-sm border border-rule" : "text-muted hover:text-ink"
              }`}
            >
              Credit
            </button>
            <button
              onClick={() => setType("debit")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                type === "debit" ? "bg-paper text-ink shadow-sm border border-rule" : "text-muted hover:text-ink"
              }`}
            >
              Debit
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-widest text-muted mb-2">
              AMOUNT
            </label>
            <div className="relative">
              <div className="font-mono text-[40px] font-medium tracking-tight text-ink border-b border-rule pb-2">
                <input
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="₹ 0.00"
                  className="w-full bg-transparent outline-none placeholder:text-ink/40"
                />
              </div>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-widest text-muted mb-2">
              DATE
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-paper border border-rule rounded-lg font-mono text-sm text-ink focus:outline-none focus:border-ink transition-colors cursor-pointer"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-widest text-muted mb-2">
              CATEGORY
            </label>
            <div className="relative flex items-center">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-paper border border-rule rounded-lg text-sm font-medium text-ink focus:outline-none focus:border-ink transition-colors appearance-none cursor-pointer"
              >
                <option value="">Uncategorised</option>
                {visibleCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="absolute right-4 text-muted pointer-events-none">
                <path d="M4.94 5.72656L8 8.7799L11.06 5.72656L12 6.66656L8 10.6666L4 6.66656L4.94 5.72656Z" fill="currentColor" />
              </svg>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-widest text-muted mb-2">
              NOTE
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional — what was this for?"
              className="w-full px-4 py-3 bg-paper border border-rule rounded-lg text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:border-ink transition-colors"
            />
          </div>

          {error && <p className="text-sm text-debit">{error}</p>}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-rule shrink-0 bg-paper">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-ink text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save transaction"}
          </button>
        </div>
      </div>
    </>
  );
}
