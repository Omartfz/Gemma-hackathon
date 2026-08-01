import { newDocId, newEntryId } from "./ids";
import { updateState } from "./store";
import type { ExtractResult, LibraryDoc, TimelineEntry } from "./types";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
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
  return todayISO();
}

/** Persist extract result as LibraryDoc + TimelineEntry in shared store. */
export function saveExtractToStore(
  filename: string,
  result: ExtractResult,
): { document: LibraryDoc; entry: TimelineEntry } {
  const doc_id = newDocId();
  const entry_id = newEntryId();
  const uploaded_at = new Date().toISOString();

  const state = updateState((prev) => {
    const provider = prev.profile?.provider ?? {
      name: "Unknown",
      role: "Provider",
    };

    const document: LibraryDoc = {
      doc_id,
      filename,
      uploaded_at,
      linked_entry_id: entry_id,
      raw_text_extracted: result.raw_text_extracted,
      checklist_item_id: result.checklist_item_id,
    };

    const entry: TimelineEntry = {
      id: entry_id,
      date: pickDate(result),
      trimester: result.trimester,
      type: result.type,
      provider,
      category: result.type,
      title: result.title,
      summary: result.summary,
      fields: result.fields,
      flags: result.flags,
      source_doc: { doc_id, filename, uploaded_at },
    };

    return {
      ...prev,
      documents: [...prev.documents, document],
      entries: [...prev.entries, entry],
    };
  });

  const document = state.documents.find((d) => d.doc_id === doc_id)!;
  const entry = state.entries.find((e) => e.id === entry_id)!;
  return { document, entry };
}
