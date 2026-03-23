"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import UserMenu from "@/components/UserMenu";

const navItems = [
  { href: "/", label: "首頁" },
  { href: "/taiwan", label: "台灣賽事" },
  { href: "/international", label: "國際賽事" },
  { href: "/open", label: "可報名" },
  { href: "/calendar", label: "行事曆" },
  { href: "/about", label: "關於" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md ring-1 ring-gray-950/10">
      <div className="container-narrow flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <img src="/logo-2.svg" alt="MB" className="w-7 h-7" />
          <span>Runner Will Guide</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-emerald-600",
                pathname === item.href ? "text-emerald-600" : "text-gray-600"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop user menu */}
        <div className="hidden sm:block">
          <UserMenu />
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="選單"
        >
          <div className="space-y-1.5">
            <span className={cn("block h-0.5 w-6 bg-gray-600 transition-transform", mobileOpen && "translate-y-2 rotate-45")} />
            <span className={cn("block h-0.5 w-6 bg-gray-600 transition-opacity", mobileOpen && "opacity-0")} />
            <span className={cn("block h-0.5 w-6 bg-gray-600 transition-transform", mobileOpen && "-translate-y-2 -rotate-45")} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="sm:hidden bg-white px-6 py-4 space-y-3 ring-1 ring-inset ring-gray-950/5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block text-sm font-medium py-2 leading-7",
                pathname === item.href ? "text-emerald-600" : "text-gray-600"
              )}
            >
              {item.label}
            </Link>
          ))}
          
          {/* Mobile user menu */}
          <div className="pt-4" style={{ borderTop: "1px solid rgba(17, 17, 17, 0.05)" }}>
            <UserMenu />
          </div>
        </nav>
      )}
    </header>
  );
}
