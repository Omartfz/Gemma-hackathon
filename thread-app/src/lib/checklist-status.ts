import { ZONE1_REQUIRED_DOCS } from "./checklist-zone1";
import type {
  Appointment,
  AppState,
  LibraryDoc,
  RequiredDocItem,
  TimelineEntry,
} from "./types";

export type DocPrepStatus = "missing" | "uploaded" | "need_check";

export type AppointmentDocStatus = RequiredDocItem & {
  status: DocPrepStatus;
  matchingDoc?: LibraryDoc;
};

export type AppointmentPrepView = {
  appointment: Appointment;
  docs: AppointmentDocStatus[];
};

function catalogItem(id: string): RequiredDocItem {
  return (
    ZONE1_REQUIRED_DOCS.find((d) => d.id === id) ?? {
      id,
      label: id,
      description: "Required for this visit.",
    }
  );
}

export function findLinkedDoc(
  appointmentId: string,
  checklistId: string,
  documents: LibraryDoc[],
): LibraryDoc | undefined {
  return documents.find(
    (d) =>
      d.appointment_id === appointmentId && d.checklist_item_id === checklistId,
  );
}

export function statusForDoc(
  doc: LibraryDoc | undefined,
  entries: TimelineEntry[],
): DocPrepStatus {
  if (!doc) return "missing";
  const entry = entries.find((e) => e.id === doc.linked_entry_id);
  const hasOpenFlags = Boolean(
    entry?.flags.some((f) => f.resolved === false),
  );
  return hasOpenFlags ? "need_check" : "uploaded";
}

/** Per-appointment required docs with missing / uploaded / need_check. */
export function getAppointmentPrepViews(state: AppState): AppointmentPrepView[] {
  const appointments = [...state.appointments].sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  return appointments.map((appointment) => ({
    appointment,
    docs: appointment.required_doc_ids.map((id) => {
      const item = catalogItem(id);
      const matchingDoc = findLinkedDoc(
        appointment.id,
        id,
        state.documents,
      );
      return {
        ...item,
        status: statusForDoc(matchingDoc, state.entries),
        matchingDoc,
      };
    }),
  }));
}

/** @deprecated Prefer getAppointmentPrepViews — kept for any leftover callers. */
export type RequiredDocStatus = RequiredDocItem & {
  have: boolean;
  matchingDoc?: LibraryDoc;
};

export function getRequiredDocStatuses(state: AppState): RequiredDocStatus[] {
  const views = getAppointmentPrepViews(state);
  const first = views[0];
  if (!first) {
    return ZONE1_REQUIRED_DOCS.map((item) => ({
      ...item,
      have: false,
    }));
  }
  return first.docs.map((d) => ({
    id: d.id,
    label: d.label,
    description: d.description,
    doc_type: d.doc_type,
    have: d.status !== "missing",
    matchingDoc: d.matchingDoc,
  }));
}
