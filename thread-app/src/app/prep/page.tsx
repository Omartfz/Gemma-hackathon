"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getAppointmentPrepViews,
  type AppointmentPrepView,
  type DocPrepStatus,
} from "@/lib/checklist-status";
import { loadState } from "@/lib/store";

function statusLabel(status: DocPrepStatus): string {
  if (status === "need_check") return "Need check";
  if (status === "uploaded") return "Uploaded";
  return "Missing";
}

function statusClass(status: DocPrepStatus): string {
  if (status === "uploaded") {
    return "bg-[var(--accent-soft)] text-[var(--ink)]";
  }
  if (status === "need_check") {
    return "bg-[#ebe4c8] text-[#5c4a1f]";
  }
  return "bg-[#f0e6e0] text-[#6b3f2a]";
}

export default function PrepPage() {
  const [views, setViews] = useState<AppointmentPrepView[]>([]);

  useEffect(() => {
    const refresh = () => setViews(getAppointmentPrepViews(loadState()));
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <p className="text-sm font-medium uppercase tracking-wide text-[var(--muted)]">
        Meeting prep
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--ink)]">
        Upcoming appointments
      </h1>
      <p className="mt-3 max-w-xl text-[var(--muted)]">
        Under each visit: documents you need, why they matter, and whether they
        are missing, uploaded, or need a check.
      </p>

      {views.length === 0 ? (
        <p className="mt-8 text-[var(--muted)]">
          No appointments yet. Complete onboarding (or load a demo profile) so a
          next visit is set.
        </p>
      ) : (
        <div className="mt-8 space-y-8">
          {views.map(({ appointment, docs }) => (
            <section
              key={appointment.id}
              className="border border-[var(--border)] bg-[var(--surface)]"
            >
              <header className="border-b border-[var(--border)] px-4 py-3">
                <h2 className="text-lg font-semibold text-[var(--ink)]">
                  {appointment.title}
                </h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {appointment.date} · {appointment.provider.name} (
                  {appointment.provider.role})
                </p>
              </header>
              <ul className="divide-y divide-[var(--border)]">
                {docs.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-[var(--ink)]">{doc.label}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        Why: {doc.description}
                      </p>
                      {doc.matchingDoc ? (
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          File: {doc.matchingDoc.filename}
                        </p>
                      ) : null}
                    </div>
                    <span
                      className={`mt-2 shrink-0 self-start rounded px-2 py-1 text-xs font-semibold uppercase tracking-wide sm:mt-0 ${statusClass(doc.status)}`}
                    >
                      {statusLabel(doc.status)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/upload"
          className="rounded-md bg-[var(--ink)] px-4 py-2 text-sm text-[var(--surface)]"
        >
          Upload for an appointment
        </Link>
        <button
          type="button"
          onClick={() => setViews(getAppointmentPrepViews(loadState()))}
          className="rounded-md border border-[var(--border)] px-4 py-2 text-sm text-[var(--ink)]"
        >
          Refresh
        </button>
      </div>
    </main>
  );
}
