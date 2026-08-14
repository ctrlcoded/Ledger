"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import ProfileMenu from "./ProfileMenu";

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
    <nav className="sticky top-0 z-40 border-b border-rule bg-canvas/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-content items-center justify-between px-6 py-3.5 md:px-8">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold tracking-tight text-ink"
          >
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-ink text-[13px] font-bold text-canvas">
              ₹
            </span>
            Ledger
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? "text-ink"
                      : "text-muted hover:bg-paper hover:text-ink"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute inset-x-3 -bottom-[15px] h-0.5 rounded-full bg-accent" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {rightContent}
          <ThemeToggle />
          <ProfileMenu />
        </div>
      </div>
    </nav>
  );
}
