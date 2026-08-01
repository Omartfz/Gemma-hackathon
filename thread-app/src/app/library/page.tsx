"use client";

import { useEffect, useState } from "react";
import { SAMPLE_LIBRARY_DOCS, type SampleLibraryDoc } from "@/lib/sample-library";
import { TIMELINE_ZONES, ZONE_COLORS } from "@/lib/timeline";

export default function LibraryPage() {
  const [openDoc, setOpenDoc] = useState<SampleLibraryDoc | null>(null);

  useEffect(() => {
    if (!openDoc) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenDoc(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openDoc]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <p className="text-sm font-medium uppercase tracking-wide text-[var(--muted)]">
        Document Library
      </p>
      <h1
        className="mt-2 text-3xl font-semibold tracking-tight text-[var(--ink)]"
        style={{ fontFamily: "var(--font-display), Georgia, serif" }}
      >
        All documents
      </h1>
      <p className="mt-3 max-w-xl text-[var(--muted)]">
        Reference library of the 12 CareOS sample documents across all four stages. Click
        any document to view it.
      </p>

      <div className="mt-8 space-y-8">
        {TIMELINE_ZONES.map((zone) => {
          const docs = SAMPLE_LIBRARY_DOCS.filter((d) => d.trimester === zone.id);
          if (docs.length === 0) return null;
          const color = ZONE_COLORS[zone.id];

          return (
            <section key={zone.id}>
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: color.solid }}
                />
                <h2 className="text-lg font-semibold text-[var(--ink)]">{zone.label}</h2>
                <span className="text-sm text-[var(--muted)]">{zone.weekRange}</span>
              </div>
              <ul className="mt-3 space-y-2">
                {docs.map((doc) => (
                  <li key={doc.id}>
                    <button
                      type="button"
                      onClick={() => setOpenDoc(doc)}
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-left transition-colors hover:bg-[var(--accent-soft)]"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="font-medium text-[var(--ink)]">{doc.title}</p>
                        {doc.date && (
                          <p className="shrink-0 text-xs text-[var(--muted)]">{doc.date}</p>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-[var(--muted)]">{doc.provider}</p>
                      <p className="mt-2 text-sm text-[var(--ink)]">{doc.summary}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      {openDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpenDoc(null)}
        >
          <div
            className="flex h-full max-h-[85vh] w-full max-w-3xl flex-col rounded-lg bg-[var(--surface)] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] p-4">
              <div>
                <p className="font-medium text-[var(--ink)]">{openDoc.title}</p>
                <p className="mt-0.5 text-sm text-[var(--muted)]">
                  {openDoc.provider}
                  {openDoc.date ? ` · ${openDoc.date}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpenDoc(null)}
                aria-label="Close"
                className="shrink-0 rounded-md px-2 py-1 text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--ink)]"
              >
                ✕
              </button>
            </div>
            <p className="border-b border-[var(--border)] px-4 py-3 text-sm text-[var(--ink)]">
              {openDoc.summary}
            </p>
            <iframe
              title={openDoc.title}
              src={`/sample-docs/${openDoc.filename}`}
              className="w-full flex-1"
            />
          </div>
        </div>
      )}
    </main>
  );
}
