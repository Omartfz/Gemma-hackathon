"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getAppointmentPrepViews,
  type AppointmentPrepView,
} from "@/lib/checklist-status";
import { saveExtractToStore } from "@/lib/save-extract";
import { loadState } from "@/lib/store";
import type { ExtractResponse, ExtractResult } from "@/lib/types";

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

export default function UploadPage() {
  const [views, setViews] = useState<AppointmentPrepView[]>([]);
  const [appointmentId, setAppointmentId] = useState("");
  const [checklistItemId, setChecklistItemId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractResult | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const next = getAppointmentPrepViews(loadState());
    setViews(next);
    setAppointmentId((prev) => prev || next[0]?.appointment.id || "");
  }, []);

  const selectedView = useMemo(
    () => views.find((v) => v.appointment.id === appointmentId),
    [views, appointmentId],
  );

  const docOptions = selectedView?.docs ?? [];

  useEffect(() => {
    if (!selectedView) {
      setChecklistItemId("");
      return;
    }
    const preferred =
      selectedView.docs.find((d) => d.status === "missing") ??
      selectedView.docs.find((d) => d.status === "need_check") ??
      selectedView.docs[0];
    setChecklistItemId(preferred?.id ?? "");
  }, [appointmentId, selectedView]);

  async function onExtract() {
    if (!file || !appointmentId || !checklistItemId) return;
    setLoading(true);
    setError(null);
    setSavedMsg(null);
    setResult(null);
    setSource(null);

    try {
      const mode = loadState().gemmaMode;
      const body: Record<string, string> = {
        filename: file.name,
        mode,
        mimeType: file.type || "application/octet-stream",
      };

      if (file.type.startsWith("image/")) {
        body.imageBase64 = await fileToBase64(file);
      }

      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`Extract failed (${res.status})`);
      }

      const data = (await res.json()) as ExtractResponse;
      setSource(data.source);
      setResult(data.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Extract failed");
    } finally {
      setLoading(false);
    }
  }

  function onSave() {
    if (!file || !result || !appointmentId || !checklistItemId) return;
    saveExtractToStore({
      filename: file.name,
      result,
      appointmentId,
      checklistItemId,
    });
    setViews(getAppointmentPrepViews(loadState()));
    setSavedMsg("Saved to that appointment. Check Meeting Prep for status.");
  }

  const canExtract = Boolean(file && appointmentId && checklistItemId && !loading);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <p className="text-sm font-medium uppercase tracking-wide text-[var(--muted)]">
        Targeted upload
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--ink)]">
        Upload Docs
      </h1>
      <p className="mt-3 max-w-xl text-[var(--muted)]">
        Pick the appointment and document title first, then upload. See status on{" "}
        <Link href="/prep" className="underline">
          Meeting Prep
        </Link>
        . Sample PDFs:{" "}
        <a className="underline" href="/samples/CareOS_Template_1_Maternal_Baseline_Intake_Form.pdf">
          intake
        </a>
        ,{" "}
        <a className="underline" href="/samples/CareOS_Template_2_First_Trimester_Lab_Panel_Report.pdf">
          labs
        </a>
        ,{" "}
        <a className="underline" href="/samples/CareOS_Template_3_Early_Dating_Ultrasound_Report.pdf">
          ultrasound
        </a>
        .
      </p>

      {views.length === 0 ? (
        <p className="mt-8 text-[var(--muted)]">
          No appointments available. Load a demo profile or finish onboarding
          first.
        </p>
      ) : (
        <div className="mt-8 flex flex-col gap-4">
          <label className="flex max-w-md flex-col gap-1 text-sm text-[var(--ink)]">
            Appointment
            <select
              className="rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
              value={appointmentId}
              onChange={(e) => setAppointmentId(e.target.value)}
            >
              {views.map(({ appointment }) => (
                <option key={appointment.id} value={appointment.id}>
                  {appointment.date} — {appointment.title}
                </option>
              ))}
            </select>
          </label>

          <label className="flex max-w-md flex-col gap-1 text-sm text-[var(--ink)]">
            Document title
            <select
              className="rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
              value={checklistItemId}
              onChange={(e) => setChecklistItemId(e.target.value)}
            >
              {docOptions.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.label} ({doc.status === "need_check" ? "need check" : doc.status})
                </option>
              ))}
            </select>
          </label>

          <input
            type="file"
            accept="application/pdf,image/*"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setResult(null);
              setSource(null);
              setSavedMsg(null);
            }}
          />

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={!canExtract}
              onClick={onExtract}
              className="rounded-md bg-[var(--ink)] px-4 py-2 text-sm text-[var(--surface)] disabled:opacity-40"
            >
              {loading ? "Extracting…" : "Extract"}
            </button>
            <button
              type="button"
              disabled={!result || !appointmentId || !checklistItemId}
              onClick={onSave}
              className="rounded-md border border-[var(--border)] px-4 py-2 text-sm text-[var(--ink)] disabled:opacity-40"
            >
              Save to appointment
            </button>
          </div>

          {error ? <p className="text-sm text-[#6b3f2a]">{error}</p> : null}
          {savedMsg ? (
            <p className="text-sm text-[var(--ink)]">
              {savedMsg}{" "}
              <Link href="/prep" className="underline">
                Open Prep
              </Link>
            </p>
          ) : null}

          {result ? (
            <div className="border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                Source: {source}
              </p>
              <p className="mt-2 font-medium text-[var(--ink)]">{result.title}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{result.summary}</p>
              <p className="mt-2 text-xs text-[var(--muted)]">
                Will save as checklist: {checklistItemId} · flags:{" "}
                {result.flags.length}
              </p>
              <pre className="mt-3 max-h-64 overflow-auto text-xs text-[var(--ink)]">
                {JSON.stringify(result.fields, null, 2)}
              </pre>
            </div>
          ) : null}
        </div>
      )}
    </main>
  );
}
