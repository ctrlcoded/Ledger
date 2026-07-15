"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Calendar", href: "/calendar" },
  { label: "Reports", href: "/reports" },
  { label: "Settings", href: "/settings" },
];

interface NavbarProps {
  rightContent?: React.ReactNode;
}

export default function Navbar({ rightContent }: NavbarProps) {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-paper border-b border-rule">
      <div className="flex items-center gap-8">
        <Link href="/" className="font-sans text-xl font-bold text-ink tracking-tight">
          Ledger
        </Link>
        <div className="flex items-center gap-6">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/" && pathname === "/") ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? "text-ink border-b-2 border-ink pb-0.5"
                    : "text-muted hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
      {rightContent && <div className="flex items-center gap-4">{rightContent}</div>}
    </nav>
  );
}
