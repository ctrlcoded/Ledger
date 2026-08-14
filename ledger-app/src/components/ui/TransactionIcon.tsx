/**
 * A single, unambiguous indicator for money direction:
 *   • incoming (amount ≥ 0) → arrow into the wallet, credit green
 *   • outgoing (amount < 0)  → arrow out of the wallet, debit red
 * Replaces per-category icons so every row reads at a glance.
 */
export default function TransactionIcon({
  amount,
  className = "",
}: {
  amount: number;
  className?: string;
}) {
  const incoming = amount >= 0;
  return (
    <div
      className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg ${
        incoming ? "bg-credit-soft text-credit" : "bg-debit-soft text-debit"
      } ${className}`}
      aria-hidden
    >
      {incoming ? (
        // Money in — arrow pointing down into the tray
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 4v10" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
          <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 19h14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        </svg>
      ) : (
        // Money out — arrow pointing up out of the tray
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 20V10" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
          <path d="M7 14l5-5 5 5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 5h14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        </svg>
      )}
    </div>
  );
}
