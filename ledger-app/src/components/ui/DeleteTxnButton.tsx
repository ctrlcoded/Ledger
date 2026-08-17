"use client";

interface DeleteTxnButtonProps {
  onClick: () => void;
  disabled?: boolean;
  /** show only on row hover (desktop); always visible on touch */
  hoverReveal?: boolean;
}

/** Trash affordance for a transaction row. */
export default function DeleteTxnButton({
  onClick,
  disabled = false,
  hoverReveal = true,
}: DeleteTxnButtonProps) {
  return (
    <button
      type="button"
      aria-label="Delete transaction"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      className={`grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg text-muted transition-all duration-150 hover:bg-debit/10 hover:text-debit disabled:opacity-40 ${
        hoverReveal ? "opacity-0 focus-visible:opacity-100 group-hover:opacity-100 sm:opacity-0" : ""
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7h12ZM10 11v6M14 11v6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
