import { ZONE1_REQUIRED_DOCS } from "./checklist-zone1";
import { newDocId, newEntryId } from "./ids";
import { ensureAppointments, loadState, updateState } from "./store";
import type { LibraryDoc, TimelineEntry } from "./types";

/** Public sample PDFs under /samples/ */
export const CAREOS_SAMPLES = [
  {
    checklist_item_id: "intake",
    filename: "CareOS_Template_1_Maternal_Baseline_Intake_Form.pdf",
    href: "/samples/CareOS_Template_1_Maternal_Baseline_Intake_Form.pdf",
    title: "Maternal Baseline Intake Form",
    type: "intake" as const,
    summary:
      "CareOS synthetic intake — patient demographics and consent fields for Zone 1 demo.",
    fields: {
      patient_name: "Maya Rivera",
      signature_present: true,
      emergency_contact_phone: null,
    },
    flags: [
      {
        field: "emergency_contact_phone",
        issue: "missing_in_source",
        resolved: false,
      },
    ],
  },
  {
    checklist_item_id: "labs",
    filename: "CareOS_Template_2_First_Trimester_Lab_Panel_Report.pdf",
    href: "/samples/CareOS_Template_2_First_Trimester_Lab_Panel_Report.pdf",
    title: "First Trimester Lab Panel Report",
    type: "lab" as const,
    summary:
      "CareOS synthetic lab panel — blood type, CBC, and early prenatal screening.",
    fields: {
      blood_type: "A+",
      hemoglobin_g_dl: 12.4,
      hepatitis_b: "negative",
    },
    flags: [],
  },
  {
    checklist_item_id: "ultrasound",
    filename: "CareOS_Template_3_Early_Dating_Ultrasound_Report.pdf",
    href: "/samples/CareOS_Template_3_Early_Dating_Ultrasound_Report.pdf",
    title: "Early Dating Ultrasound Report",
    type: "ultrasound" as const,
    summary:
      "CareOS synthetic dating ultrasound — gestational age confirmation for Zone 1.",
    fields: {
      gestational_age_weeks: 8,
      fetal_heart_rate_bpm: 160,
    },
    flags: [],
  },
] as const;

/**
 * Put the three CareOS sample PDFs into the document library for the
 * next upcoming appointment (creates appointment from profile if needed).
 */
export function seedCareosSamples(): { count: number; appointmentId: string } {
  let state = ensureAppointments(loadState());
  let appointment = [...state.appointments]
    .filter((a) => a.status === "upcoming")
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  if (!appointment) {
    appointment = state.appointments[0];
  }
  if (!appointment) {
    throw new Error(
      "No appointment yet. Load a demo profile or book a visit first.",
    );
  }

  const appointmentId = appointment.id;
  const uploaded_at = new Date().toISOString();
  const date = uploaded_at.slice(0, 10);
  const provider = appointment.provider;

  const required = new Set(appointment.required_doc_ids);
  for (const sample of CAREOS_SAMPLES) {
    if (!required.has(sample.checklist_item_id)) {
      // still seed; also ensure checklist includes it
    }
  }

  updateState((prev) => {
    const appt =
      prev.appointments.find((a) => a.id === appointmentId) ??
      prev.appointments[0];
    if (!appt) return prev;

    const extraIds = CAREOS_SAMPLES.map((s) => s.checklist_item_id).filter(
      (id) => !appt.required_doc_ids.includes(id),
    );
    const required_doc_ids = [...appt.required_doc_ids, ...extraIds];
    const doc_reasons = { ...appt.doc_reasons };
    for (const id of extraIds) {
      const cat = ZONE1_REQUIRED_DOCS.find((d) => d.id === id);
      doc_reasons[id] = cat?.description ?? "Required for this visit.";
    }

    let documents = prev.documents.filter(
      (d) =>
        !(
          d.appointment_id === appointmentId &&
          CAREOS_SAMPLES.some((s) => s.checklist_item_id === d.checklist_item_id)
        ),
    );
    const removedEntryIds = new Set(
      prev.documents
        .filter(
          (d) =>
            d.appointment_id === appointmentId &&
            CAREOS_SAMPLES.some(
              (s) => s.checklist_item_id === d.checklist_item_id,
            ),
        )
        .map((d) => d.linked_entry_id)
        .filter(Boolean) as string[],
    );
    let entries = prev.entries.filter((e) => !removedEntryIds.has(e.id));

    const newDocs: LibraryDoc[] = [];
    const newEntries: TimelineEntry[] = [];

    for (const sample of CAREOS_SAMPLES) {
      const doc_id = newDocId();
      const entry_id = newEntryId();
      newDocs.push({
        doc_id,
        filename: sample.filename,
        uploaded_at,
        linked_entry_id: entry_id,
        raw_text_extracted: sample.summary,
        checklist_item_id: sample.checklist_item_id,
        appointment_id: appointmentId,
      });
      newEntries.push({
        id: entry_id,
        date,
        trimester: "first",
        type: sample.type,
        provider,
        category: sample.type,
        title: sample.title,
        summary: sample.summary,
        fields: { ...sample.fields },
        flags: sample.flags.map((f) => ({ ...f })),
        source_doc: { doc_id, filename: sample.filename, uploaded_at },
      });
    }

    documents = [...documents, ...newDocs];
    entries = [...entries, ...newEntries];

    return {
      ...prev,
      appointments: prev.appointments.map((a) =>
        a.id === appointmentId
          ? { ...a, required_doc_ids, doc_reasons }
          : a,
      ),
      documents,
      entries,
    };
  });

  return { count: CAREOS_SAMPLES.length, appointmentId };
}
