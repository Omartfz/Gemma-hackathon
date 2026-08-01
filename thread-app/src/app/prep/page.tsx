"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReadinessRunResult } from "@/lib/agent/run-readiness";
import {
  getAppointmentPrepViews,
  type AppointmentPrepView,
  type DocPrepStatus,
} from "@/lib/checklist-status";
import { loadState, updateState } from "@/lib/store";

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
  const [score, setScore] = useState<number | null>(null);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<ReadinessRunResult | null>(null);
  const [traceOpen, setTraceOpen] = useState(false);

  useEffect(() => {
    const refresh = () => {
      const state = loadState();
      setViews(getAppointmentPrepViews(state));
      setScore(state.readinessScore);
    };
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  async function runCheck(appointmentId: string) {
    setError(null);
    setRunningId(appointmentId);
    try {
      const state = loadState();
      const res = await fetch("/api/readiness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointment_id: appointmentId,
          state,
        }),
      });
      const data = (await res.json()) as ReadinessRunResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Readiness check failed");
      }
      updateState((prev) => ({ ...prev, readinessScore: data.score }));
      setScore(data.score);
      setLastRun(data);
      setTraceOpen(false);
      setViews(getAppointmentPrepViews(loadState()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Readiness check failed");
    } finally {
      setRunningId(null);
    }
  }

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
        are missing, uploaded, or need a check. Run a readiness check to score
        paperwork completeness.
      </p>

      {score !== null ? (
        <p className="mt-4 text-sm text-[var(--ink)]">
          Readiness score:{" "}
          <span className="font-semibold tabular-nums">{score}%</span>
        </p>
      ) : null}

      {lastRun ? (
        <div className="mt-4 border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <p className="text-sm text-[var(--ink)]">{lastRun.summary}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Summary source: {lastRun.summary_source} · appointment{" "}
            {lastRun.appointment_id}
          </p>
          <button
            type="button"
            onClick={() => setTraceOpen((o) => !o)}
            className="mt-2 text-xs font-medium underline text-[var(--ink)]"
          >
            {traceOpen ? "Hide" : "Show"} agent tool trace
          </button>
          {traceOpen ? (
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-xs text-[var(--muted)]">
              {lastRun.steps.map((step, i) => (
                <li key={`${step.tool}-${i}`}>
                  <span className="font-medium text-[var(--ink)]">
                    {step.tool}
                  </span>
                  {step.input ? (
                    <span>
                      {" "}
                      (
                      {Object.entries(step.input)
                        .map(([k, v]) => `${k}=${v}`)
                        .join(", ")}
                      )
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p className="mt-4 text-sm text-[#6b3f2a]" role="alert">
          {error}
        </p>
      ) : null}

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
              <header className="flex flex-col gap-3 border-b border-[var(--border)] px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--ink)]">
                    {appointment.title}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {appointment.date} · {appointment.provider.name} (
                    {appointment.provider.role})
                  </p>
                </div>
                <button
                  type="button"
                  disabled={runningId === appointment.id}
                  onClick={() => void runCheck(appointment.id)}
                  className="shrink-0 rounded-md bg-[var(--ink)] px-3 py-2 text-sm text-[var(--surface)] disabled:opacity-60"
                >
                  {runningId === appointment.id
                    ? "Running…"
                    : "Run readiness check"}
                </button>
              </header>
              <ul className="divide-y divide-[var(--border)]">
                {docs.map((doc) => {
                  const live =
                    lastRun?.appointment_id === appointment.id
                      ? lastRun.docs.find(
                          (d) => d.checklist_item_id === doc.id,
                        )
                      : undefined;
                  const status = live?.status ?? doc.status;
                  return (
                    <li
                      key={doc.id}
                      className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-[var(--ink)]">
                          {doc.label}
                        </p>
                        <p className="mt-1 text-sm text-[var(--muted)]">
                          Why: {doc.description}
                        </p>
                        {doc.matchingDoc ? (
                          <p className="mt-1 text-xs text-[var(--muted)]">
                            File: {doc.matchingDoc.filename}
                          </p>
                        ) : null}
                        {live?.open_flags && live.open_flags.length > 0 ? (
                          <p className="mt-1 text-xs text-[#5c4a1f]">
                            Flags:{" "}
                            {live.open_flags.map((f) => f.issue).join("; ")}
                          </p>
                        ) : null}
                      </div>
                      <span
                        className={`mt-2 shrink-0 self-start rounded px-2 py-1 text-xs font-semibold uppercase tracking-wide sm:mt-0 ${statusClass(status)}`}
                      >
                        {statusLabel(status)}
                      </span>
                    </li>
                  );
                })}
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
          onClick={() => {
            const state = loadState();
            setViews(getAppointmentPrepViews(state));
            setScore(state.readinessScore);
          }}
          className="rounded-md border border-[var(--border)] px-4 py-2 text-sm text-[var(--ink)]"
        >
          Refresh
        </button>
      </div>
    </main>
  );
}
