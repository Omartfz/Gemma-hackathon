import { appointmentFromProfile, defaultState, saveState } from "./store";
import type { AppState, LibraryDoc, PatientProfile, TimelineEntry } from "./types";

/** Demo persona packaged as a full AppState snapshot for localStorage. */
export type DemoProfile = {
  id: string;
  /** Short label for the picker UI */
  label: string;
  /** Patient display name (matches profile.name when onboarded) */
  name: string;
  /** What this snapshot is for in a demo */
  showcases: string[];
  blurb: string;
  state: AppState;
};

function profile(partial: PatientProfile): PatientProfile {
  return partial;
}

function doc(partial: LibraryDoc): LibraryDoc {
  return partial;
}

function entry(partial: TimelineEntry): TimelineEntry {
  return partial;
}

/** Attach a Zone 1 next-visit appointment and link checklist docs to it. */
function withNextAppt(state: AppState, apptId: string): AppState {
  if (!state.profile) return state;
  const appt = appointmentFromProfile(state.profile, apptId);
  return {
    ...state,
    appointments: [appt],
    documents: state.documents.map((d) =>
      d.checklist_item_id ? { ...d, appointment_id: apptId } : d,
    ),
  };
}

/** Profile only — just finished the onboarding form. */
const aishaOnboarded: DemoProfile = {
  id: "aisha-onboarded",
  label: "Aisha — onboarded only",
  name: "Aisha Khan",
  showcases: ["Onboarding form → store", "Empty timeline", "Prep checklist all Missing"],
  blurb: "Week 8 patient with next appointment set; zero documents uploaded.",
  state: withNextAppt(
    {
      ...defaultState(),
      profile: profile({
        name: "Aisha Khan",
        gestational_week: 8,
        due_date: "2026-10-20",
        provider: { name: "Dr. Maya Patel", role: "OB/GYN" },
        next_appointment: {
          date: "2026-03-18",
          title: "First prenatal visit",
        },
        onboarding_source: "form",
      }),
      readinessScore: 0,
    },
    "appt_aisha",
  ),
};

/**
 * Canonical PLAN.md persona — Maya at week 12 with a flagged intake + labs.
 * Missing ultrasound + insurance so Meeting Prep shows mixed Have/Missing.
 */
const mayaCanonical: DemoProfile = {
  id: "maya-canonical",
  label: "Maya — Zone 1 mid-demo",
  name: "Maya Rivera",
  showcases: [
    "Canonical demo persona",
    "Unresolved field flags",
    "Partial Meeting Prep checklist",
    "Timeline + library with 2 docs",
  ],
  blurb:
    "PLAN.md default: week 12, Dr. Sarah Chen. Intake need-check; labs uploaded; ultrasound & insurance missing.",
  state: withNextAppt(
    {
      ...defaultState(),
      gemmaMode: "cloud",
      readinessScore: 45,
      profile: profile({
        name: "Maya Rivera",
        gestational_week: 12,
        due_date: "2026-09-15",
        provider: { name: "Dr. Sarah Chen", role: "OB/GYN" },
        next_appointment: {
          date: "2026-03-14",
          title: "12-Week Prenatal Checkup",
        },
        onboarding_source: "form",
      }),
      documents: [
        doc({
          doc_id: "doc_maya_intake",
          filename: "careos_template_1_intake.pdf",
          uploaded_at: "2026-02-12T15:04:00.000Z",
          linked_entry_id: "entry_maya_intake",
          checklist_item_id: "intake",
          raw_text_extracted:
            "CareOS Maternal Baseline Intake — Maya Rivera, Week 12, Dr. Sarah Chen. Emergency contact phone blank.",
        }),
        doc({
          doc_id: "doc_maya_labs",
          filename: "careos_template_2_labs.pdf",
          uploaded_at: "2026-02-13T11:20:00.000Z",
          linked_entry_id: "entry_maya_labs",
          checklist_item_id: "labs",
          raw_text_extracted:
            "CareOS First Trimester Lab Panel — Maya Rivera. Blood type A+, Hgb 12.4, Hep B negative.",
        }),
      ],
      entries: [
        entry({
          id: "entry_maya_intake",
          date: "2026-02-12",
          trimester: "first",
          type: "intake",
          provider: { name: "Dr. Sarah Chen", role: "OB/GYN" },
          category: "intake",
          title: "Maternal Baseline Intake Form",
          summary:
            "First-trimester intake for Maya Rivera. Most fields complete; emergency contact phone is blank.",
          fields: {
            patient_name: "Maya Rivera",
            dob: "1994-06-12",
            gestational_week: 12,
            primary_provider: "Dr. Sarah Chen",
            allergies: "NKDA",
            emergency_contact_name: "Luis Rivera",
            emergency_contact_phone: null,
            signature_present: true,
          },
          flags: [
            {
              field: "emergency_contact_phone",
              issue: "missing_in_source",
              resolved: false,
            },
          ],
          source_doc: {
            doc_id: "doc_maya_intake",
            filename: "careos_template_1_intake.pdf",
            uploaded_at: "2026-02-12T15:04:00.000Z",
          },
        }),
        entry({
          id: "entry_maya_labs",
          date: "2026-02-10",
          trimester: "first",
          type: "lab",
          provider: { name: "Dr. Sarah Chen", role: "OB/GYN" },
          category: "lab",
          title: "First Trimester Lab Panel Report",
          summary:
            "Prenatal lab panel with CBC, blood type, and infectious disease screen.",
          fields: {
            patient_name: "Maya Rivera",
            collection_date: "2026-02-10",
            blood_type: "A+",
            hemoglobin_g_dl: 12.4,
            rubella_immunity: "immune",
            hepatitis_b: "negative",
            ordering_provider: "Dr. Sarah Chen",
          },
          flags: [],
          source_doc: {
            doc_id: "doc_maya_labs",
            filename: "careos_template_2_labs.pdf",
            uploaded_at: "2026-02-13T11:20:00.000Z",
          },
        }),
      ],
    },
    "appt_maya",
  ),
};

/** All Zone 1 checklist items satisfied — high readiness. */
const priyaReady: DemoProfile = {
  id: "priya-ready",
  label: "Priya — visit-ready",
  name: "Priya Desai",
  showcases: [
    "Full Zone 1 checklist (Have ×4)",
    "High readinessScore",
    "Document Library with multiple types",
  ],
  blurb:
    "Intake, labs, ultrasound, and insurance all on file — Meeting Prep should show 4/4 uploaded.",
  state: withNextAppt(
    {
      ...defaultState(),
      gemmaMode: "cloud",
      readinessScore: 92,
      profile: profile({
        name: "Priya Desai",
        gestational_week: 12,
        due_date: "2026-09-01",
        provider: { name: "Dr. Helen Cho", role: "OB/GYN" },
        next_appointment: {
          date: "2026-03-08",
          title: "NT scan consult",
        },
        onboarding_source: "form",
      }),
      documents: [
        doc({
          doc_id: "doc_priya_intake",
          filename: "intake_baseline.pdf",
          uploaded_at: "2026-01-20T14:00:00.000Z",
          linked_entry_id: "entry_priya_intake",
          checklist_item_id: "intake",
          raw_text_extracted: "Baseline intake — Priya Desai, complete and signed.",
        }),
        doc({
          doc_id: "doc_priya_labs",
          filename: "lab_panel_w11.pdf",
          uploaded_at: "2026-02-01T10:00:00.000Z",
          linked_entry_id: "entry_priya_labs",
          checklist_item_id: "labs",
          raw_text_extracted: "First trimester labs — blood type O+, Hgb 11.9.",
        }),
        doc({
          doc_id: "doc_priya_us",
          filename: "dating_ultrasound.pdf",
          uploaded_at: "2026-02-05T16:30:00.000Z",
          linked_entry_id: "entry_priya_us",
          checklist_item_id: "ultrasound",
          raw_text_extracted: "Dating US — GA 12w, EDD 2026-09-01, FHR 156.",
        }),
        doc({
          doc_id: "doc_priya_ins",
          filename: "insurance_card.pdf",
          uploaded_at: "2026-01-20T14:05:00.000Z",
          linked_entry_id: "entry_priya_ins",
          checklist_item_id: "insurance",
          raw_text_extracted: "Summit Mutual — Member SM-992184 — Priya Desai.",
        }),
      ],
      entries: [
        entry({
          id: "entry_priya_intake",
          date: "2026-01-20",
          trimester: "first",
          type: "intake",
          provider: { name: "Dr. Helen Cho", role: "OB/GYN" },
          category: "intake",
          title: "Maternal Baseline Intake Form",
          summary: "Complete signed intake for Priya Desai.",
          fields: {
            patient_name: "Priya Desai",
            gestational_week: 12,
            primary_provider: "Dr. Helen Cho",
            allergies: "Penicillin",
            signature_present: true,
          },
          flags: [],
          source_doc: {
            doc_id: "doc_priya_intake",
            filename: "intake_baseline.pdf",
            uploaded_at: "2026-01-20T14:00:00.000Z",
          },
        }),
        entry({
          id: "entry_priya_labs",
          date: "2026-02-01",
          trimester: "first",
          type: "lab",
          provider: { name: "Dr. Helen Cho", role: "OB/GYN" },
          category: "lab",
          title: "First Trimester Lab Panel Report",
          summary: "CBC and prenatal panel on file.",
          fields: {
            patient_name: "Priya Desai",
            collection_date: "2026-02-01",
            blood_type: "O+",
            hemoglobin_g_dl: 11.9,
          },
          flags: [],
          source_doc: {
            doc_id: "doc_priya_labs",
            filename: "lab_panel_w11.pdf",
            uploaded_at: "2026-02-01T10:00:00.000Z",
          },
        }),
        entry({
          id: "entry_priya_us",
          date: "2026-02-05",
          trimester: "first",
          type: "ultrasound",
          provider: { name: "Dr. Ana Park", role: "Maternal-Fetal Medicine" },
          category: "ultrasound",
          title: "Early Dating Ultrasound Report",
          summary: "Dating ultrasound consistent with ~12 weeks.",
          fields: {
            patient_name: "Priya Desai",
            exam_date: "2026-02-05",
            gestational_age_weeks: 12,
            estimated_due_date: "2026-09-01",
            fetal_heart_rate_bpm: 156,
          },
          flags: [],
          source_doc: {
            doc_id: "doc_priya_us",
            filename: "dating_ultrasound.pdf",
            uploaded_at: "2026-02-05T16:30:00.000Z",
          },
        }),
        entry({
          id: "entry_priya_ins",
          date: "2026-01-20",
          trimester: "first",
          type: "note",
          provider: { name: "Dr. Helen Cho", role: "OB/GYN" },
          category: "note",
          title: "Insurance Card",
          summary: "Insurance card on file.",
          fields: {
            payer_name: "Summit Mutual",
            member_id: "SM-992184",
            subscriber_name: "Priya Desai",
          },
          flags: [],
          source_doc: {
            doc_id: "doc_priya_ins",
            filename: "insurance_card.pdf",
            uploaded_at: "2026-01-20T14:05:00.000Z",
          },
        }),
      ],
    },
    "appt_priya",
  ),
};

export const DEMO_PROFILES: DemoProfile[] = [
  aishaOnboarded,
  mayaCanonical,
  priyaReady,
];

export function getDemoProfile(id: string): DemoProfile | undefined {
  return DEMO_PROFILES.find((p) => p.id === id);
}

/** Replace localStorage AppState with a cloned demo snapshot. */
export function applyDemoProfile(id: string): AppState {
  const demo = getDemoProfile(id);
  if (!demo) {
    throw new Error(`Unknown demo profile: ${id}`);
  }
  const next = structuredClone(demo.state);
  saveState(next);
  return next;
}

/** Reset store to default empty state (not a patient profile). */
export function resetDemoState(): AppState {
  const next = defaultState();
  saveState(next);
  return next;
}
