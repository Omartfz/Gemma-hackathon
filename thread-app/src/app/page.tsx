"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GrowthOrbCard } from "@/components/GrowthOrbCard";
import { Timeline } from "@/components/Timeline";
import { getCurrentGestationalWeek } from "@/lib/timeline";
import { loadState } from "@/lib/store";
import type { AppState } from "@/lib/types";

export default function HomePage() {
  const [state, setState] = useState<AppState | null>(null);

  useEffect(() => {
    // localStorage is unavailable during SSR; load after mount to avoid a
    // hydration mismatch between the server-rendered empty state and the
    // client's real state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(loadState());
  }, []);

  if (!state) return null;

  if (!state.profile) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-10 text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-[var(--muted)]">
          Nightingale
        </p>
        <h1
          className="mt-2 text-4xl font-semibold tracking-tight text-[var(--ink)]"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          Your care timeline starts with a document
        </h1>
        <p className="mt-3 max-w-md text-[var(--muted)]">
          Upload a visit summary, lab report, or ultrasound and Gemma will build your
          profile and timeline automatically — no forms to fill out.
        </p>
        <Link
          href="/onboarding"
          className="mt-8 rounded-md bg-[var(--ink)] px-5 py-2.5 text-sm font-medium text-[var(--surface)]"
        >
          Get started
        </Link>
      </main>
    );
  }

  const { profile, entries } = state;
  const currentWeek = getCurrentGestationalWeek(profile);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <p className="text-sm font-medium uppercase tracking-wide text-[var(--muted)]">
        Home
      </p>
      <h1
        className="mt-2 text-4xl font-semibold tracking-tight text-[var(--ink)]"
        style={{ fontFamily: "var(--font-display), Georgia, serif" }}
      >
        {profile.name}
      </h1>
      <p className="mt-2 text-[var(--muted)]">
        Week {currentWeek}
        {profile.due_date ? ` · Due ${profile.due_date}` : ""} · {profile.provider.name} (
        {profile.provider.role})
      </p>

      <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
        <p className="text-sm font-medium uppercase tracking-wide text-[var(--muted)]">
          Next appointment
        </p>
        {profile.next_appointment ? (
          <p className="mt-1 text-[var(--ink)]">
            {profile.next_appointment.title} · {profile.next_appointment.date}
          </p>
        ) : (
          <p className="mt-1 text-[var(--muted)]">
            Not yet scheduled — this will be flagged in Meeting Prep.
          </p>
        )}
      </div>

      <GrowthOrbCard week={currentWeek} />

      <h2 className="mt-10 text-lg font-semibold text-[var(--ink)]">Care Timeline</h2>
      <div className="mt-6">
        <Timeline profile={profile} entries={entries} />
      </div>

      <p className="mt-10 text-xs text-[var(--muted)]">
        <Link href="/onboarding" className="underline decoration-dotted underline-offset-4">
          Restart onboarding
        </Link>
      </p>
    </main>
  );
}
