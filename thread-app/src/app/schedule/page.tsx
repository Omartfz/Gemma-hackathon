"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { loadState } from "@/lib/store";
import type { Appointment } from "@/lib/types";

export default function SchedulePage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const refresh = () => setAppointments(loadState().appointments);
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  const { upcoming, completed } = useMemo(() => {
    const sorted = [...appointments].sort((a, b) => a.date.localeCompare(b.date));
    return {
      upcoming: sorted.filter((a) => (a.status ?? "upcoming") === "upcoming"),
      completed: sorted.filter((a) => a.status === "completed"),
    };
  }, [appointments]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-[var(--muted)]">
            Care schedule
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--ink)]">
            Appointments
          </h1>
          <p className="mt-3 max-w-xl text-[var(--muted)]">
            Upcoming visits and a place to book the next one. Booking researches
            which documents you will need.
          </p>
        </div>
        <Link
          href="/schedule/book"
          className="rounded-md bg-[var(--ink)] px-4 py-2 text-sm text-[var(--surface)]"
        >
          Book appointment
        </Link>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-[var(--ink)]">Upcoming</h2>
        {upcoming.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">
            No upcoming appointments. Book one or load a demo profile.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-[var(--border)] border border-[var(--border)] bg-[var(--surface)]">
            {upcoming.map((appt) => (
              <li key={appt.id} className="px-4 py-4">
                <p className="font-medium text-[var(--ink)]">{appt.title}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {appt.date}
                  {appt.appointment_type
                    ? ` · ${appt.appointment_type.replace(/_/g, " ")}`
                    : ""}
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  With {appt.provider.name} ({appt.provider.role})
                  {appt.location ? ` · ${appt.location}` : ""}
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {appt.required_doc_ids.length} required document
                  {appt.required_doc_ids.length === 1 ? "" : "s"}
                </p>
                <Link
                  href="/prep"
                  className="mt-2 inline-block text-sm underline text-[var(--ink)]"
                >
                  Prep documents
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {completed.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-[var(--ink)]">Completed</h2>
          <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
            {completed.map((appt) => (
              <li key={appt.id}>
                {appt.date} — {appt.title}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
