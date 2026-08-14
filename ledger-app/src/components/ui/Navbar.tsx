"use client";

import { useState, useEffect } from "react";
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
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-rule bg-canvas/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-content items-center justify-between px-4 py-3 sm:px-6 md:px-8">
          <div className="flex items-center gap-4 sm:gap-8">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle navigation menu"
              className="grid h-9 w-9 place-items-center rounded-lg border border-rule text-ink transition-colors hover:bg-paper md:hidden"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                {mobileOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                )}
              </svg>
            </button>

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

          <div className="flex items-center gap-2 sm:gap-3">
            {rightContent}
            <ThemeToggle />
            <ProfileMenu />
          </div>
        </div>
      </nav>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-ink/20 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute left-0 right-0 top-[57px] border-b border-rule bg-canvas/95 backdrop-blur-xl">
            <div className="mx-auto max-w-content px-4 py-3 sm:px-6">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium transition-colors ${
                      isActive
                        ? "bg-accent-soft text-ink"
                        : "text-muted hover:bg-paper hover:text-ink"
                    }`}
                  >
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    )}
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
