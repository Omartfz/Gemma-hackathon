"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ZONE1_REQUIRED_DOCS } from "@/lib/checklist-zone1";
import { CAREOS_SAMPLES, seedCareosSamples } from "@/lib/seed-careos";
import { loadState } from "@/lib/store";
import type { Appointment, LibraryDoc, TimelineEntry } from "@/lib/types";

type LibraryRow = {
  doc: LibraryDoc;
  entry?: TimelineEntry;
  appointment?: Appointment;
  checklistLabel?: string;
  openFlagCount: number;
};

function checklistLabel(id?: string): string | undefined {
  if (!id) return undefined;
  return (
    ZONE1_REQUIRED_DOCS.find((d) => d.id === id)?.label ??
    id.replace(/_/g, " ")
  );
}

function buildRows(): LibraryRow[] {
  const state = loadState();
  return [...state.documents]
    .sort((a, b) => b.uploaded_at.localeCompare(a.uploaded_at))
    .map((doc) => {
      const entry = state.entries.find((e) => e.id === doc.linked_entry_id);
      const appointment = doc.appointment_id
        ? state.appointments.find((a) => a.id === doc.appointment_id)
        : undefined;
      const openFlagCount = (entry?.flags ?? []).filter((f) => !f.resolved)
        .length;
      return {
        doc,
        entry,
        appointment,
        checklistLabel: checklistLabel(doc.checklist_item_id),
        openFlagCount,
      };
    });
}

export default function LibraryPage() {
  const [rows, setRows] = useState<LibraryRow[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);
  const [seedError, setSeedError] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => setRows(buildRows());
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  function onSeedCareos() {
    setSeedError(null);
    setSeedMsg(null);
    try {
      const { count } = seedCareosSamples();
      setRows(buildRows());
      setSeedMsg(`Added ${count} CareOS sample documents to the library.`);
    } catch (e) {
      setSeedError(e instanceof Error ? e.message : "Could not seed samples");
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <p className="text-sm font-medium uppercase tracking-wide text-[var(--muted)]">
        Document library
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--ink)]">
        Uploaded documents
      </h1>
      <p className="mt-3 max-w-xl text-[var(--muted)]">
        Documents saved from Upload (or seeded for demo). Static files under{" "}
        <code className="text-sm">/samples/</code> are not listed until you
        save or seed them.
      </p>

      {seedMsg ? (
        <p className="mt-4 text-sm text-[var(--ink)]">{seedMsg}</p>
      ) : null}
      {seedError ? (
        <p className="mt-4 text-sm text-[#6b3f2a]" role="alert">
          {seedError}
        </p>
      ) : null}

      {rows.length === 0 ? (
        <div className="mt-8 space-y-4 text-[var(--muted)]">
          <p>
            No documents in the store yet. Either{" "}
            <Link href="/upload" className="underline">
              Upload → Extract → Save
            </Link>
            , load{" "}
            <Link href="/demo" className="underline">
              Maya — anatomy scan
            </Link>{" "}
            (has 2 docs), or seed the CareOS samples below.
          </p>
          <button
            type="button"
            onClick={onSeedCareos}
            className="rounded-md bg-[var(--ink)] px-4 py-2 text-sm text-[var(--surface)]"
          >
            Seed CareOS samples into library
          </button>
          <ul className="text-sm">
            {CAREOS_SAMPLES.map((s) => (
              <li key={s.filename}>
                <a className="underline" href={s.href}>
                  {s.filename}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-[var(--border)] border border-[var(--border)] bg-[var(--surface)]">
          {rows.map(
            ({
              doc,
              entry,
              appointment,
              checklistLabel: label,
              openFlagCount,
            }) => {
              const expanded = openId === doc.doc_id;
              return (
                <li key={doc.doc_id}>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenId((id) =>
                        id === doc.doc_id ? null : doc.doc_id,
                      )
                    }
                    className="flex w-full flex-col gap-1 px-4 py-3 text-left sm:flex-row sm:items-start sm:justify-between sm:gap-6"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-[var(--ink)]">
                        {doc.filename}
                      </p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {new Date(doc.uploaded_at).toLocaleString()}
                        {label ? ` · ${label}` : ""}
                        {appointment ? ` · ${appointment.title}` : ""}
                      </p>
                    </div>
                    <span className="mt-1 shrink-0 text-xs font-semibold uppercase tracking-wide text-[var(--muted)] sm:mt-0">
                      {openFlagCount > 0
                        ? `${openFlagCount} open flag${openFlagCount === 1 ? "" : "s"}`
                        : "No open flags"}
                      {" · "}
                      {expanded ? "Hide" : "Show"}
                    </span>
                  </button>
                  {expanded ? (
                    <div className="border-t border-[var(--border)] px-4 py-3">
                      {entry ? (
                        <>
                          <p className="font-medium text-[var(--ink)]">
                            {entry.title}
                          </p>
                          <p className="mt-1 text-sm text-[var(--muted)]">
                            {entry.summary}
                          </p>
                          {entry.flags.length > 0 ? (
                            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#5c4a1f]">
                              {entry.flags.map((f, i) => (
                                <li key={`${f.field}-${i}`}>
                                  {f.field}: {f.issue}
                                  {f.resolved ? " (resolved)" : ""}
                                </li>
                              ))}
                            </ul>
                          ) : null}
                          <pre className="mt-3 max-h-48 overflow-auto text-xs text-[var(--ink)]">
                            {JSON.stringify(entry.fields, null, 2)}
                          </pre>
                        </>
                      ) : (
                        <p className="text-sm text-[var(--muted)]">
                          No linked timeline entry.
                        </p>
                      )}
                      {doc.raw_text_extracted ? (
                        <pre className="mt-3 max-h-32 overflow-auto whitespace-pre-wrap text-xs text-[var(--muted)]">
                          {doc.raw_text_extracted.slice(0, 800)}
                          {doc.raw_text_extracted.length > 800 ? "…" : ""}
                        </pre>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              );
            },
          )}
        </ul>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setRows(buildRows())}
          className="rounded-md border border-[var(--border)] px-4 py-2 text-sm text-[var(--ink)]"
        >
          Refresh
        </button>
        <button
          type="button"
          onClick={onSeedCareos}
          className="rounded-md border border-[var(--border)] px-4 py-2 text-sm text-[var(--ink)]"
        >
          Seed CareOS samples
        </button>
      </div>
    </main>
  );
}
