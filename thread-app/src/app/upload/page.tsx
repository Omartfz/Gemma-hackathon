"use client";

import Link from "next/link";
import { useState } from "react";
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
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractResult | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onExtract() {
    if (!file) return;
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
    if (!file || !result) return;
    const { document } = saveExtractToStore(file.name, result);
    setSavedMsg(
      `Saved. Checklist: ${document.checklist_item_id ?? "none"} → see Meeting Prep.`,
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <p className="text-sm font-medium uppercase tracking-wide text-[var(--muted)]">
        Thin upload
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--ink)]">
        Upload Docs
      </h1>
      <p className="mt-3 max-w-xl text-[var(--muted)]">
        Pick a CareOS PDF (name matters for fixtures), extract, then save. See
        what you need on{" "}
        <Link href="/prep" className="underline">
          Meeting Prep
        </Link>
        .
      </p>

      <div className="mt-8 flex flex-col gap-4">
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
            disabled={!file || loading}
            onClick={onExtract}
            className="rounded-md bg-[var(--ink)] px-4 py-2 text-sm text-[var(--surface)] disabled:opacity-40"
          >
            {loading ? "Extracting…" : "Extract"}
          </button>
          <button
            type="button"
            disabled={!result}
            onClick={onSave}
            className="rounded-md border border-[var(--border)] px-4 py-2 text-sm text-[var(--ink)] disabled:opacity-40"
          >
            Save to store
          </button>
        </div>

        {error ? (
          <p className="text-sm text-[#6b3f2a]">{error}</p>
        ) : null}
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
              checklist_item_id: {result.checklist_item_id ?? "—"} · flags:{" "}
              {result.flags.length}
            </p>
            <pre className="mt-3 max-h-64 overflow-auto text-xs text-[var(--ink)]">
              {JSON.stringify(result.fields, null, 2)}
            </pre>
          </div>
        ) : null}
      </div>
    </main>
  );
}
