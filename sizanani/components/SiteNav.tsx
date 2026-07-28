"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/opportunities", label: "Opportunities" },
  { href: "/applications", label: "My Journey" },
  { href: "/adviser", label: "Adviser" },
];

export function SiteNav() {
  const pathname = usePathname();
  const { apps } = useStore();
  const [open, setOpen] = useState(false);
  const savedCount = Object.keys(apps).length;

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-paper/90 backdrop-blur">
      <nav className="container-x flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink font-display text-lg font-bold text-gold">
            S
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-ink">
            Sizanani
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                  active ? "bg-ink text-gold" : "text-ink/70 hover:bg-black/5"
                }`}
              >
                {l.label}
                {l.href === "/applications" && savedCount > 0 && (
                  <span className="ml-1.5 rounded-full bg-gold px-1.5 text-xs text-ink">{savedCount}</span>
                )}
              </Link>
            );
          })}
          <Link href="/onboarding" className="btn-gold ml-2">
            My Profile
          </Link>
        </div>

        <button
          className="btn-ghost md:hidden"
          aria-expanded={open}
          aria-label="Toggle menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span aria-hidden>☰</span>
        </button>
      </nav>

      {open && (
        <div className="border-t border-black/5 bg-paper md:hidden">
          <div className="container-x flex flex-col gap-1 py-3">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink/80 hover:bg-black/5"
              >
                {l.label}
              </Link>
            ))}
            <Link href="/onboarding" onClick={() => setOpen(false)} className="btn-gold mt-1">
              My Profile
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
