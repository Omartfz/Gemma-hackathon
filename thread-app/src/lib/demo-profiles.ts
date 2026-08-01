import { appointmentFromProfile, defaultState, saveState } from "./store";
import type {
  Appointment,
  AppState,
  LibraryDoc,
  PatientProfile,
  TimelineEntry,
} from "./types";

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

/** Attach a next-visit appointment (Zone 1 defaults + optional clinical overrides). */
function withNextAppt(
  state: AppState,
  apptId: string,
  overrides?: Partial<Omit<Appointment, "id">>,
): AppState {
  if (!state.profile) return state;
  const appt: Appointment = {
    ...appointmentFromProfile(state.profile, apptId),
    ...overrides,
    id: apptId,
  };
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
  showcases: [
    "Onboarding form → store",
    "Empty timeline",
    "First prenatal visit · all docs Missing",
  ],
  blurb:
    "Week 8 · first prenatal / OB intake with Dr. Maya Patel. No docs uploaded yet — Meeting Prep shows 0/4.",
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
          title: "First prenatal visit (OB intake)",
        },
        onboarding_source: "form",
      }),
      readinessScore: 0,
    },
    "appt_aisha",
    {
      appointment_type: "prenatal_checkup",
      location: "Riverside Women's Health — Clinic A",
      notes:
        "New OB intake (~8 weeks): history, exam, baseline labs ordered, dating ultrasound discussed.",
      doc_reasons: {
        intake:
          "New-patient maternal history, medications, and consent forms are completed at the first prenatal visit.",
        labs: "Baseline prenatal labs (blood type, CBC, infectious disease screen) are ordered at or right after the first visit — bring any prior results.",
        ultrasound:
          "Dating ultrasound (often 8–12 weeks) confirms gestational age; bring any early pregnancy scan reports if already done elsewhere.",
        insurance:
          "Photo ID and insurance card are typically required at check-in for a new OB intake.",
      },
      research_citations: [
        {
          title: "Initial Antepartum Care (NCBI StatPearls)",
          url: "https://www.ncbi.nlm.nih.gov/books/NBK570635/",
        },
        {
          title: "Prenatal Appointment Timeline (Sinai Health)",
          url: "https://www.sinaihealth.ca/areas-of-care/wih/pregnancy-birth-and-newborn-care/prenatal-appointment-timeline",
        },
      ],
    },
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
    "12-week visit · partial prep",
    "Timeline + library with 2 docs",
  ],
  blurb:
    "Week 12 · prenatal checkup in the NT / first-trimester screening window. Intake needs check; labs uploaded; ultrasound & insurance missing.",
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
          title: "12-week prenatal checkup",
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
    {
      appointment_type: "prenatal_checkup",
      location: "Northside OB Clinic — Suite 210",
      notes:
        "Routine ~12-week follow-up in the 11–14 week first-trimester screening / NT window. Review labs; confirm dating US or NT referral.",
      doc_reasons: {
        intake:
          "Updated intake/history so the provider can counsel on genetic screening options at this visit.",
        labs: "First-trimester panel results (blood type, CBC, infectious screens) should be available for review.",
        ultrasound:
          "Dating or NT ultrasound report (11–14 weeks) confirms GA and supports aneuploidy screening discussion.",
        insurance:
          "Insurance card for check-in and coverage of screening ultrasound / lab add-ons.",
      },
      research_citations: [
        {
          title: "Prenatal Appointment Timeline (Sinai Health)",
          url: "https://www.sinaihealth.ca/areas-of-care/wih/pregnancy-birth-and-newborn-care/prenatal-appointment-timeline",
        },
        {
          title: "Early Prenatal Care Checklist (Perinatal Services BC)",
          url: "https://www.perinatalservicesbc.ca/Documents/Resources/Checklists/PSBC_Prenatal_Checklist.pdf",
        },
      ],
    },
  ),
};

/** All Zone 1 checklist items satisfied — high readiness. */
const priyaReady: DemoProfile = {
  id: "priya-ready",
  label: "Priya — visit-ready",
  name: "Priya Desai",
  showcases: [
    "Full Zone 1 checklist (Have ×4)",
    "NT / dating ultrasound visit",
    "High readinessScore",
    "Document Library with multiple types",
  ],
  blurb:
    "Week 12 · NT / first-trimester dating ultrasound with Dr. Helen Cho. Intake, labs, dating US, and insurance all on file — Meeting Prep 4/4.",
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
          title: "NT / first-trimester ultrasound",
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
    {
      appointment_type: "dating_ultrasound",
      location: "Summit Imaging — Maternal-Fetal Unit",
      notes:
        "Nuchal translucency / first-trimester ultrasound (11–14 weeks). Prior dating report and labs on file for correlation.",
      provider: { name: "Dr. Ana Park", role: "Maternal-Fetal Medicine" },
      doc_reasons: {
        intake:
          "Completed intake confirms history and consent before genetic screening ultrasound.",
        labs: "First-trimester serum results (or panel) pair with NT imaging for integrated screening when offered.",
        ultrasound:
          "Prior dating ultrasound report establishes GA so the NT window (11–13+6 weeks) is scheduled correctly.",
        insurance:
          "Insurance card required for imaging check-in and coverage verification.",
      },
      research_citations: [
        {
          title: "Early Prenatal Care Checklist (Perinatal Services BC)",
          url: "https://www.perinatalservicesbc.ca/Documents/Resources/Checklists/PSBC_Prenatal_Checklist.pdf",
        },
        {
          title: "Antenatal Screening Guidelines (RCP Nova Scotia)",
          url: "https://rcp.nshealth.ca/sites/default/files/clinical-practice-guidelines/antenatal%20screening%20guidelines%2011X17%20Rev%20July%202024.pdf",
        },
      ],
    },
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
