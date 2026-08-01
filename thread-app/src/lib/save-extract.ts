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

export type SaveExtractInput = {
  filename: string;
  result: ExtractResult;
  appointmentId: string;
  checklistItemId: string;
};

/** Persist extract linked to an appointment + required doc title. */
export function saveExtractToStore(
  input: SaveExtractInput,
): { document: LibraryDoc; entry: TimelineEntry } {
  const { filename, result, appointmentId, checklistItemId } = input;
  const doc_id = newDocId();
  const entry_id = newEntryId();
  const uploaded_at = new Date().toISOString();

  const state = updateState((prev) => {
    const appt = prev.appointments.find((a) => a.id === appointmentId);
    const provider = appt?.provider ??
      prev.profile?.provider ?? {
        name: "Unknown",
        role: "Provider",
      };

    const document: LibraryDoc = {
      doc_id,
      filename,
      uploaded_at,
      linked_entry_id: entry_id,
      raw_text_extracted: result.raw_text_extracted,
      checklist_item_id: checklistItemId,
      appointment_id: appointmentId,
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

    // Replace prior doc for same appointment + checklist item
    const documents = prev.documents.filter(
      (d) =>
        !(
          d.appointment_id === appointmentId &&
          d.checklist_item_id === checklistItemId
        ),
    );
    const removedIds = new Set(
      prev.documents
        .filter(
          (d) =>
            d.appointment_id === appointmentId &&
            d.checklist_item_id === checklistItemId,
        )
        .map((d) => d.linked_entry_id)
        .filter(Boolean),
    );
    const entries = prev.entries.filter((e) => !removedIds.has(e.id));

    return {
      ...prev,
      documents: [...documents, document],
      entries: [...entries, entry],
    };
  });

  const document = state.documents.find((d) => d.doc_id === doc_id)!;
  const entry = state.entries.find((e) => e.id === entry_id)!;
  return { document, entry };
}
