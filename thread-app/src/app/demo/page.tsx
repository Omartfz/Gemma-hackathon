"use client";

import Link from "next/link";
import { useState } from "react";
import {
  applyDemoProfile,
  DEMO_PROFILES,
  resetDemoState,
} from "@/lib/demo-profiles";

export default function DemoProfilesPage() {
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load(id: string) {
    try {
      applyDemoProfile(id);
      setLoadedId(id);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load profile");
    }
  }

  function reset() {
    resetDemoState();
    setLoadedId("reset");
    setError(null);
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <p className="text-sm font-medium uppercase tracking-wide text-[var(--muted)]">
        Demo seeds
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--ink)]">
        Patient profiles
      </h1>
      <p className="mt-3 max-w-2xl text-[var(--muted)]">
        Three female patient snapshots for early, mid, and visit-ready demos.
        Load one into localStorage, then walk through Thread. Synthetic /
        decision-support data only.
      </p>

      {loadedId === "reset" ? (
        <p className="mt-4 text-sm text-[var(--ink)]">
          Store reset to empty. Open{" "}
          <Link href="/" className="underline">
            Home
          </Link>{" "}
          for the pre-onboarding state.
        </p>
      ) : loadedId ? (
        <p className="mt-4 text-sm text-[var(--ink)]">
          Loaded <code className="text-sm">{loadedId}</code>. Open{" "}
          <Link href="/prep" className="underline">
            Meeting Prep
          </Link>
          ,{" "}
          <Link href="/library" className="underline">
            Library
          </Link>
          , or{" "}
          <Link href="/" className="underline">
            Home
          </Link>
          .
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 text-sm text-[#6b3f2a]">{error}</p>
      ) : null}

      <ul className="mt-8 divide-y divide-[var(--border)] border border-[var(--border)] bg-[var(--surface)]">
        {DEMO_PROFILES.map((demo) => (
          <li
            key={demo.id}
            className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="min-w-0">
              <p className="font-medium text-[var(--ink)]">{demo.label}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{demo.blurb}</p>
              <p className="mt-2 text-xs text-[var(--muted)]">
                Shows: {demo.showcases.join(" · ")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => load(demo.id)}
              className="shrink-0 self-start rounded-md bg-[var(--ink)] px-3 py-1.5 text-sm text-[var(--surface)]"
            >
              {loadedId === demo.id ? "Loaded" : "Load"}
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-md border border-[var(--border)] px-4 py-2 text-sm text-[var(--ink)]"
      >
        Reset store (clear profile)
      </button>
    </main>
  );
}
