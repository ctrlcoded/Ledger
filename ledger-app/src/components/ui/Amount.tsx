import { inr } from "@/lib/format";

interface AmountProps {
  value: number;
  className?: string;
  showSign?: boolean;
}

export default function Amount({ value, className = "", showSign = false }: AmountProps) {
  const isPositive = value >= 0;
  const colorClass = isPositive ? "text-credit" : "text-debit";
  const prefix = showSign ? (isPositive ? "+" : "") : "";
  const formatted = inr(Math.abs(value));
  const display = showSign && !isPositive ? `−${formatted}` : `${prefix}${formatted}`;

  return (
    <span
      className={`font-mono tabular-nums ${colorClass} ${className}`}
    >
      {display}
    </span>
  );
}
