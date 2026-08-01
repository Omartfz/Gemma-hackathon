import { extractDocument } from "./gemma/extract";
import type { ExtractionResult } from "./gemma/types";
import type { LibraryDoc, PatientProfile, TimelineEntry } from "./types";

export type OnboardingFileResult = {
  file: File;
  extraction: ExtractionResult;
};

export type OnboardingResult = {
  profile: PatientProfile;
  entries: TimelineEntry[];
  documents: LibraryDoc[];
};

/** More precise dating sources should win when documents disagree on due date. */
const DUE_DATE_SOURCE_PRIORITY: Partial<Record<TimelineEntry["type"], number>> = {
  ultrasound: 2,
  intake: 1,
};

export async function extractAll(files: File[]): Promise<OnboardingFileResult[]> {
  const results: OnboardingFileResult[] = [];
  for (const file of files) {
    results.push({ file, extraction: await extractDocument(file) });
  }
  return results;
}

export function buildOnboardingResult(results: OnboardingFileResult[]): OnboardingResult {
  const uploadedAt = new Date().toISOString();

  let name = "Patient";
  let gestationalWeek = 0;
  let dueDate: string | undefined;
  let dueDateSourcePriority = -1;
  let provider = { name: "Unknown", role: "Unknown" };

  const entries: TimelineEntry[] = [];
  const documents: LibraryDoc[] = [];

  for (const { file, extraction } of results) {
    const entryId = `entry_${crypto.randomUUID()}`;
    const docId = `doc_${crypto.randomUUID()}`;

    entries.push({
      id: entryId,
      ...extraction.entry,
      source_doc: { doc_id: docId, filename: file.name, uploaded_at: uploadedAt },
    });

    documents.push({
      doc_id: docId,
      filename: file.name,
      uploaded_at: uploadedAt,
      linked_entry_id: entryId,
      raw_text_extracted: extraction.rawTextExtracted,
    });

    const pf = extraction.profileFields;
    if (pf.name) name = pf.name;
    if (typeof pf.gestational_week === "number" && pf.gestational_week > 0) {
      gestationalWeek = pf.gestational_week;
    }
    if (pf.provider) provider = pf.provider;
    if (pf.due_date) {
      const priority = DUE_DATE_SOURCE_PRIORITY[extraction.entry.type] ?? 0;
      if (priority >= dueDateSourcePriority) {
        dueDate = pf.due_date;
        dueDateSourcePriority = priority;
      }
    }
  }

  entries.sort((a, b) => a.date.localeCompare(b.date));

  const profile: PatientProfile = {
    name,
    gestational_week: gestationalWeek,
    due_date: dueDate,
    provider,
    onboarding_source: "document",
  };

  return { profile, entries, documents };
}
