"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ZONE1_REQUIRED_DOCS } from "@/lib/checklist-zone1";
import {
  buildOnboardingResult,
  extractDocument,
  type OnboardingFileResult,
  type OnboardingResult,
} from "@/lib/onboarding";
import { updateState } from "@/lib/store";

const SAMPLE_DOC_NAMES = [
  "CareOS_Template_1_Maternal_Baseline_Intake_Form.pdf",
  "CareOS_Template_2_First_Trimester_Lab_Panel_Report.pdf",
  "CareOS_Template_3_Early_Dating_Ultrasound_Report.pdf",
];

async function loadSampleFiles(): Promise<File[]> {
  return Promise.all(
    SAMPLE_DOC_NAMES.map(async (name) => {
      const res = await fetch(`/sample-docs/${name}`);
      const blob = await res.blob();
      return new File([blob], name, { type: blob.type || "application/pdf" });
    })
  );
}

type Stage = "upload" | "processing" | "review";
type FileStatus = "waiting" | "reading" | "done";

export default function OnboardingPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stage, setStage] = useState<Stage>("upload");
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [statuses, setStatuses] = useState<FileStatus[]>([]);
  const [results, setResults] = useState<OnboardingFileResult[]>([]);
  const [onboardingResult, setOnboardingResult] = useState<OnboardingResult | null>(null);
  const [loadingSamples, setLoadingSamples] = useState(false);

  function addFiles(incoming: FileList | File[]) {
    const next = Array.from(incoming);
    setFiles((prev) => [...prev, ...next]);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleUseSamples() {
    setLoadingSamples(true);
    try {
      const sampleFiles = await loadSampleFiles();
      setFiles(sampleFiles);
    } finally {
      setLoadingSamples(false);
    }
  }

  async function runExtraction(inputFiles: File[]) {
    setStage("processing");
    setStatuses(inputFiles.map(() => "waiting"));

    const collected: OnboardingFileResult[] = [];
    for (let i = 0; i < inputFiles.length; i++) {
      setStatuses((prev) => prev.map((s, idx) => (idx === i ? "reading" : s)));
      const extraction = await extractDocument(inputFiles[i]);
      collected.push({ file: inputFiles[i], extraction });
      setStatuses((prev) => prev.map((s, idx) => (idx === i ? "done" : s)));
    }

    setResults(collected);
    setOnboardingResult(buildOnboardingResult(collected));
    setStage("review");
  }

  function handleGoToHome() {
    if (!onboardingResult) return;
    const { profile, entries, documents } = onboardingResult;
    updateState((prev) => ({
      ...prev,
      profile,
      entries,
      documents,
    }));
    router.push("/");
  }

  const uploadedDocTypes = new Set(results.map((r) => r.extraction.result.type));
  const missingRequiredDocs = ZONE1_REQUIRED_DOCS.filter(
    (doc) => doc.doc_type && !uploadedDocTypes.has(doc.doc_type)
  );
  const flagCount = results.reduce((sum, r) => sum + r.extraction.result.flags.length, 0);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <p className="text-sm font-medium uppercase tracking-wide text-[var(--muted)]">
        Onboarding
      </p>
      <h1
        className="mt-2 text-3xl font-semibold tracking-tight text-[var(--ink)]"
        style={{ fontFamily: "var(--font-display), Georgia, serif" }}
      >
        {stage === "upload" && "Upload your first document"}
        {stage === "processing" && "Reading your documents"}
        {stage === "review" && "Your profile is ready"}
      </h1>

      {stage === "upload" && (
        <>
          <p className="mt-3 text-[var(--muted)]">
            No forms to fill out — upload a visit document, lab report, or ultrasound and
            Gemma will build your care profile and timeline from it automatically.
          </p>

          <button
            type="button"
            aria-label="Upload a document"
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`mt-6 flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors ${
              dragActive
                ? "border-[var(--ink)] bg-[var(--accent-soft)]"
                : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--accent-soft)]"
            }`}
          >
            <p className="text-[var(--ink)]">Drag & drop a PDF or photo here</p>
            <p className="mt-1 text-sm text-[var(--muted)]">or click to browse</p>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) addFiles(e.target.files);
              e.target.value = "";
            }}
          />

          <div className="mt-4 flex items-center justify-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                void handleUseSamples();
              }}
              disabled={loadingSamples}
              className="text-sm text-[var(--muted)] underline decoration-dotted underline-offset-4 hover:text-[var(--ink)] disabled:opacity-50"
            >
              {loadingSamples ? "Loading sample documents…" : "Or use the 3 sample documents"}
            </button>
          </div>

          {files.length > 0 && (
            <ul className="mt-6 space-y-2">
              {files.map((file, i) => (
                <li
                  key={`${file.name}-${i}`}
                  className="flex items-center justify-between rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink)]"
                >
                  <span className="truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="ml-3 text-[var(--muted)] hover:text-[var(--ink)]"
                    aria-label={`Remove ${file.name}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 flex items-center justify-between">
            <p className="text-xs text-[var(--muted)]">
              Processed on this device — nothing is uploaded to a server.
            </p>
            <button
              type="button"
              disabled={files.length === 0}
              onClick={() => void runExtraction(files)}
              className="rounded-md bg-[var(--ink)] px-4 py-2 text-sm font-medium text-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        </>
      )}

      {stage === "processing" && (
        <>
          <p className="mt-3 text-[var(--muted)]">
            Running locally via Gemma. This can take a few seconds per document.
          </p>
          <ul className="mt-6 space-y-2">
            {files.map((file, i) => (
              <li
                key={`${file.name}-${i}`}
                className="flex items-center justify-between rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
              >
                <span className="truncate text-[var(--ink)]">{file.name}</span>
                <span className="ml-3 shrink-0 text-[var(--muted)]">
                  {statuses[i] === "done" && "Extracted"}
                  {statuses[i] === "reading" && "Reading…"}
                  {statuses[i] === "waiting" && "Waiting"}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      {stage === "review" && (
        <>
          <p className="mt-3 text-[var(--muted)]">
            Generated from {results.length} document{results.length === 1 ? "" : "s"}.
            Review below, then continue to your home timeline.
          </p>

          {onboardingResult && (
            <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <dt className="text-[var(--muted)]">Name</dt>
                <dd className="text-[var(--ink)]">{onboardingResult.profile.name}</dd>
                <dt className="text-[var(--muted)]">Gestational week</dt>
                <dd className="text-[var(--ink)]">
                  {onboardingResult.profile.gestational_week || "—"}
                </dd>
                <dt className="text-[var(--muted)]">Due date</dt>
                <dd className="text-[var(--ink)]">{onboardingResult.profile.due_date ?? "—"}</dd>
                <dt className="text-[var(--muted)]">Provider</dt>
                <dd className="text-[var(--ink)]">
                  {onboardingResult.profile.provider.name} ·{" "}
                  {onboardingResult.profile.provider.role}
                </dd>
              </dl>
            </div>
          )}

          <ul className="mt-6 space-y-3">
            {results.map(({ file, extraction }) => (
              <li
                key={file.name}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4"
              >
                <p className="text-sm font-medium text-[var(--ink)]">{extraction.result.title}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{extraction.result.summary}</p>
                {extraction.result.flags.length > 0 && (
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {extraction.result.flags.map((flag) => (
                      <li
                        key={flag.field}
                        className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-xs text-[var(--ink)]"
                      >
                        Needs follow-up: {flag.field.replaceAll("_", " ")}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>

          {missingRequiredDocs.length > 0 && (
            <p className="mt-4 text-sm text-[var(--muted)]">
              {missingRequiredDocs.length} recommended First Trimester document
              {missingRequiredDocs.length === 1 ? "" : "s"} still missing:{" "}
              {missingRequiredDocs.map((d) => d.label).join(", ")}. You can add these later
              from Upload Docs.
            </p>
          )}

          {flagCount > 0 && (
            <p className="mt-1 text-sm text-[var(--muted)]">
              {flagCount} field{flagCount === 1 ? "" : "s"} flagged for review.
            </p>
          )}

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={handleGoToHome}
              className="rounded-md bg-[var(--ink)] px-4 py-2 text-sm font-medium text-[var(--surface)]"
            >
              Go to Home
            </button>
          </div>
        </>
      )}
    </main>
  );
}
