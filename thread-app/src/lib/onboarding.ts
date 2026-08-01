import { newDocId, newEntryId } from "./ids";
import { loadState } from "./store";
import type {
  ExtractResponse,
  ExtractResult,
  LibraryDoc,
  PatientProfile,
  TimelineEntry,
} from "./types";

export type OnboardingFileResult = { file: File; extraction: ExtractResponse };
export type OnboardingResult = {
  profile: PatientProfile;
  entries: TimelineEntry[];
  documents: LibraryDoc[];
};

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

function fallbackExtraction(filename: string): ExtractResponse {
  return {
    source: "fixture",
    result: {
      title: filename,
      summary:
        "Couldn't reach the extraction service for this document. No structured fields could be pulled — review manually.",
      type: "note",
      trimester: "first",
      fields: {},
      flags: [
        {
          field: "document_type",
          issue: "unrecognized_document",
          resolved: false,
        },
      ],
      raw_text_extracted: "",
    },
  };
}

/** Calls the same /api/extract route the Upload page uses (sends PDF/image bytes). */
export async function extractDocument(file: File): Promise<ExtractResponse> {
  try {
    const mimeType = file.type || "application/octet-stream";
    const body: Record<string, string> = {
      filename: file.name,
      mode: loadState().gemmaMode,
      mimeType,
    };

    // Always send file bytes — PDFs need text extraction server-side; images go to vision.
    if (
      mimeType.startsWith("image/") ||
      mimeType === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf")
    ) {
      body.imageBase64 = await fileToBase64(file);
      if (!body.mimeType || body.mimeType === "application/octet-stream") {
        if (file.name.toLowerCase().endsWith(".pdf")) {
          body.mimeType = "application/pdf";
        }
      }
    }

    const res = await fetch("/api/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Extract failed (${res.status})`);
    return (await res.json()) as ExtractResponse;
  } catch {
    return fallbackExtraction(file.name);
  }
}

export async function extractAll(files: File[]): Promise<OnboardingFileResult[]> {
  const results: OnboardingFileResult[] = [];
  for (const file of files) {
    results.push({ file, extraction: await extractDocument(file) });
  }
  return results;
}

function pickDate(result: ExtractResult): string {
  const candidates = [
    result.fields.exam_date,
    result.fields.collection_date,
    result.fields.document_date,
    result.fields.date,
  ];
  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) return value;
  }
  return new Date().toISOString().slice(0, 10);
}

function pickNumber(
  fields: ExtractResult["fields"],
  keys: string[],
): number | undefined {
  for (const key of keys) {
    const value = fields[key];
    if (typeof value === "number" && Number.isFinite(value) && value > 0) {
      return value;
    }
    if (typeof value === "string" && value.trim()) {
      const n = Number(value);
      if (Number.isFinite(n) && n > 0) return n;
    }
  }
  return undefined;
}

function pickString(
  fields: ExtractResult["fields"],
  keys: string[],
): string | undefined {
  for (const key of keys) {
    const value = fields[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

function addDaysISO(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Extraction field-key names vary by document type / model output, so try a few. */
function pickProviderName(fields: ExtractResult["fields"]): string | undefined {
  return pickString(fields, [
    "primary_provider",
    "ordering_provider",
    "interpreting_provider",
    "attending_md",
  ]);
}

export function buildOnboardingResult(
  results: OnboardingFileResult[],
): OnboardingResult {
  const uploadedAt = new Date().toISOString();

  let name = "Patient";
  let gestationalWeek = 0;
  let dueDate: string | undefined;
  let providerName: string | undefined;

  const entries: TimelineEntry[] = [];
  const documents: LibraryDoc[] = [];

  for (const { file, extraction } of results) {
    const { result } = extraction;
    const entryId = newEntryId();
    const docId = newDocId();
    const provider = {
      name: pickProviderName(result.fields) ?? "Unknown",
      role: "OB/GYN",
    };

    entries.push({
      id: entryId,
      date: pickDate(result),
      trimester: result.trimester,
      type: result.type,
      provider,
      category: result.type,
      title: result.title,
      summary: result.summary,
      fields: result.fields,
      flags: result.flags,
      source_doc: { doc_id: docId, filename: file.name, uploaded_at: uploadedAt },
    });

    documents.push({
      doc_id: docId,
      filename: file.name,
      uploaded_at: uploadedAt,
      linked_entry_id: entryId,
      raw_text_extracted: result.raw_text_extracted,
      checklist_item_id: result.checklist_item_id,
    });

    const patientName = pickString(result.fields, [
      "patient_name",
      "subscriber_name",
      "name",
    ]);
    if (patientName) name = patientName;

    const week = pickNumber(result.fields, [
      "gestational_week",
      "gestational_age_weeks",
      "ga_weeks",
    ]);
    if (week && week > gestationalWeek) gestationalWeek = week;

    const edd = pickString(result.fields, [
      "estimated_due_date",
      "due_date",
      "edd",
    ]);
    if (edd) dueDate = edd;

    if (provider.name !== "Unknown") providerName = provider.name;
  }

  entries.sort((a, b) => a.date.localeCompare(b.date));

  if (!gestationalWeek && dueDate) {
    const due = Date.parse(dueDate);
    if (!Number.isNaN(due)) {
      const weeksLeft = Math.round(
        (due - Date.now()) / (7 * 24 * 60 * 60 * 1000),
      );
      const approx = 40 - weeksLeft;
      if (approx > 0 && approx < 45) gestationalWeek = approx;
    }
  }
  if (!gestationalWeek) gestationalWeek = 12;

  const profile: PatientProfile = {
    name,
    gestational_week: gestationalWeek,
    due_date: dueDate,
    provider: { name: providerName ?? "Unknown", role: "OB/GYN" },
    next_appointment: {
      date: addDaysISO(14),
      title:
        gestationalWeek <= 14
          ? "Prenatal checkup"
          : gestationalWeek <= 28
            ? "Anatomy / prenatal follow-up"
            : "Prenatal checkup",
    },
    onboarding_source: "document",
  };

  return { profile, entries, documents };
}
