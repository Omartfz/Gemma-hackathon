"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getRequiredDocStatuses,
  type RequiredDocStatus,
} from "@/lib/checklist-status";
import { loadState } from "@/lib/store";

export default function PrepPage() {
  const [items, setItems] = useState<RequiredDocStatus[]>([]);

  useEffect(() => {
    const refresh = () => setItems(getRequiredDocStatuses(loadState()));
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  const haveCount = items.filter((i) => i.have).length;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <p className="text-sm font-medium uppercase tracking-wide text-[var(--muted)]">
        Zone 1 · First trimester
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--ink)]">
        Documents you need
      </h1>
      <p className="mt-3 max-w-xl text-[var(--muted)]">
        For your next visit, upload or bring these. Each item explains why it
        matters. ({haveCount}/{items.length || 4} ready)
      </p>

      <ul className="mt-8 divide-y divide-[var(--border)] border border-[var(--border)] bg-[var(--surface)]">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
          >
            <div className="min-w-0">
              <p className="font-medium text-[var(--ink)]">{item.label}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Why: {item.description}
              </p>
              {item.matchingDoc ? (
                <p className="mt-1 text-xs text-[var(--muted)]">
                  On file: {item.matchingDoc.filename}
                </p>
              ) : null}
            </div>
            <span
              className={`mt-2 shrink-0 self-start rounded px-2 py-1 text-xs font-semibold uppercase tracking-wide sm:mt-0 ${
                item.have
                  ? "bg-[var(--accent-soft)] text-[var(--ink)]"
                  : "bg-[#f0e6e0] text-[#6b3f2a]"
              }`}
            >
              {item.have ? "Have" : "Missing"}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/upload"
          className="rounded-md bg-[var(--ink)] px-4 py-2 text-sm text-[var(--surface)]"
        >
          Upload a document
        </Link>
        <button
          type="button"
          onClick={() => setItems(getRequiredDocStatuses(loadState()))}
          className="rounded-md border border-[var(--border)] px-4 py-2 text-sm text-[var(--ink)]"
        >
          Refresh status
        </button>
      </div>

      <p className="mt-6 max-w-xl text-xs text-[var(--muted)]">
        Static checklist for now. Next: an agent will call tools against this
        list to score readiness.
      </p>
    </main>
  );
}
