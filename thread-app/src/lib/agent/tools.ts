import {
  findLinkedDoc,
  statusForDoc,
  type DocPrepStatus,
} from "@/lib/checklist-status";
import { ZONE1_REQUIRED_DOCS } from "@/lib/checklist-zone1";
import type { AppState, DocFlag } from "@/lib/types";

export type RequiredDocToolResult = {
  id: string;
  label: string;
  reason: string;
};

export type CheckDocumentResult = {
  checklist_item_id: string;
  label: string;
  status: DocPrepStatus;
  filename?: string;
  open_flags: DocFlag[];
};

export type ReadinessCounts = {
  required: number;
  uploaded: number;
  need_check: number;
  missing: number;
};

export type ComputeReadinessResult = {
  score: number;
  counts: ReadinessCounts;
};

function appointmentOrThrow(state: AppState, appointmentId: string) {
  const appointment = state.appointments.find((a) => a.id === appointmentId);
  if (!appointment) {
    throw new Error(`Appointment not found: ${appointmentId}`);
  }
  return appointment;
}

function catalogLabel(id: string): string {
  return (
    ZONE1_REQUIRED_DOCS.find((d) => d.id === id)?.label ??
    id.replace(/_/g, " ")
  );
}

/** Tool: list required docs for an appointment. */
export function get_required_docs(
  state: AppState,
  appointmentId: string,
): RequiredDocToolResult[] {
  const appointment = appointmentOrThrow(state, appointmentId);
  return appointment.required_doc_ids.map((id) => {
    const base = ZONE1_REQUIRED_DOCS.find((d) => d.id === id);
    return {
      id,
      label: base?.label ?? catalogLabel(id),
      reason:
        appointment.doc_reasons?.[id] ??
        base?.description ??
        "Required for this visit.",
    };
  });
}

/** Tool: status + open flags for one required doc. */
export function check_document(
  state: AppState,
  appointmentId: string,
  checklistItemId: string,
): CheckDocumentResult {
  appointmentOrThrow(state, appointmentId);
  const matching = findLinkedDoc(
    appointmentId,
    checklistItemId,
    state.documents,
  );
  const status = statusForDoc(matching, state.entries);
  const entry = matching
    ? state.entries.find((e) => e.id === matching.linked_entry_id)
    : undefined;
  const open_flags = (entry?.flags ?? []).filter((f) => !f.resolved);

  return {
    checklist_item_id: checklistItemId,
    label: catalogLabel(checklistItemId),
    status,
    filename: matching?.filename,
    open_flags,
  };
}

/** Tool: score 0–100 from per-doc statuses. */
export function compute_readiness(
  checks: CheckDocumentResult[],
): ComputeReadinessResult {
  const required = checks.length;
  if (required === 0) {
    return {
      score: 100,
      counts: { required: 0, uploaded: 0, need_check: 0, missing: 0 },
    };
  }

  let uploaded = 0;
  let need_check = 0;
  let missing = 0;
  for (const c of checks) {
    if (c.status === "uploaded") uploaded += 1;
    else if (c.status === "need_check") need_check += 1;
    else missing += 1;
  }

  const score = Math.round(
    (100 * (uploaded + 0.5 * need_check)) / required,
  );

  return {
    score,
    counts: { required, uploaded, need_check, missing },
  };
}
