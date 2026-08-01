"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { loadState, updateState } from "@/lib/store";
import type { GemmaMode } from "@/lib/types";

const links = [
  { href: "/", label: "Home" },
  { href: "/schedule", label: "Schedule" },
  { href: "/upload", label: "Upload" },
  { href: "/prep", label: "Meeting Prep" },
  { href: "/library", label: "Library" },
  { href: "/demo", label: "Demo" },
] as const;

export function AppNav() {
  const pathname = usePathname();
  const [mode, setMode] = useState<GemmaMode>("cloud");

  useEffect(() => {
    setMode(loadState().gemmaMode);
  }, []);

  function setGemmaMode(next: GemmaMode) {
    updateState((prev) => ({ ...prev, gemmaMode: next }));
    setMode(next);
  }

  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-[var(--ink)]"
          >
            Thread
          </Link>
          <div
            className="flex items-center gap-1 rounded-md border border-[var(--border)] p-0.5 text-xs sm:hidden"
            role="group"
            aria-label="Extract mode"
          >
            <ModeButton
              active={mode === "cloud"}
              onClick={() => setGemmaMode("cloud")}
              label="Cloud"
            />
            <ModeButton
              active={mode === "local"}
              onClick={() => setGemmaMode("local")}
              label="Local"
            />
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-1 sm:gap-2">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? "bg-[var(--accent-soft)] text-[var(--ink)]"
                    : "text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--ink)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div
            className="ml-1 hidden items-center gap-1 rounded-md border border-[var(--border)] p-0.5 text-xs sm:flex"
            role="group"
            aria-label="Extract mode"
          >
            <ModeButton
              active={mode === "cloud"}
              onClick={() => setGemmaMode("cloud")}
              label="Cloud"
            />
            <ModeButton
              active={mode === "local"}
              onClick={() => setGemmaMode("local")}
              label="Local"
            />
          </div>
        </nav>
      </div>
    </header>
  );
}

function ModeButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded px-2 py-1 ${
        active
          ? "bg-[var(--ink)] text-[var(--surface)]"
          : "text-[var(--muted)] hover:text-[var(--ink)]"
      }`}
    >
      {label}
    </button>
  );
}
