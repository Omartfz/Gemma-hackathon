import { defaultState, saveState } from "./store";
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

function profile(
  partial: PatientProfile,
): PatientProfile {
  return partial;
}

function doc(
  partial: LibraryDoc,
): LibraryDoc {
  return partial;
}

function entry(
  partial: TimelineEntry,
): TimelineEntry {
  return partial;
}

/** Fresh install — Home empty state before onboarding. */
const emptySlate: DemoProfile = {
  id: "empty",
  label: "Empty slate",
  name: "(no patient yet)",
  showcases: ["Home empty state", "Pre-onboarding"],
  blurb: "No profile or documents. Use before walking through onboarding.",
  state: defaultState(),
};

/** Profile only — just finished the onboarding form. */
const aishaOnboarded: DemoProfile = {
  id: "aisha-onboarded",
  label: "Aisha — onboarded only",
  name: "Aisha Khan",
  showcases: ["Onboarding form → store", "Empty timeline", "Prep checklist all Missing"],
  blurb: "Week 8 patient with next appointment set; zero documents uploaded.",
  state: {
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
    "PLAN.md default: week 12, Dr. Sarah Chen. Intake has a missing emergency phone; labs on file; ultrasound & insurance still missing.",
  state: {
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
};

/** Heavy unresolved flags — walk through inline correction on Upload. */
const jordanFlags: DemoProfile = {
  id: "jordan-flags",
  label: "Jordan — flag review",
  name: "Jordan Lee",
  showcases: [
    "Multiple unresolved flags",
    "Incomplete intake extract",
    "Inline field correction path",
  ],
  blurb:
    "Incomplete/unsigned intake only — several missing_in_source / missing_signature flags still open.",
  state: {
    ...defaultState(),
    gemmaMode: "cloud",
    readinessScore: 15,
    profile: profile({
      name: "Jordan Lee",
      gestational_week: 10,
      due_date: "2026-09-28",
      provider: { name: "Midwife Ana Ortiz", role: "Certified Nurse-Midwife" },
      next_appointment: {
        date: "2026-03-10",
        title: "Intake review visit",
      },
      onboarding_source: "form",
    }),
    documents: [
      doc({
        doc_id: "doc_jordan_incomplete",
        filename: "incomplete_intake_unsigned.pdf",
        uploaded_at: "2026-02-28T09:12:00.000Z",
        linked_entry_id: "entry_jordan_incomplete",
        checklist_item_id: "intake",
        raw_text_extracted:
          "Partial intake — patient name present; provider, signature, and insurance ID blank.",
      }),
    ],
    entries: [
      entry({
        id: "entry_jordan_incomplete",
        date: "2026-02-28",
        trimester: "first",
        type: "intake",
        provider: { name: "Midwife Ana Ortiz", role: "Certified Nurse-Midwife" },
        category: "intake",
        title: "Incomplete Intake Form",
        summary:
          "Intake uploaded but required fields are blank or unsigned.",
        fields: {
          patient_name: "Jordan Lee",
          gestational_week: 10,
          primary_provider: null,
          signature_present: false,
          insurance_member_id: null,
        },
        flags: [
          { field: "primary_provider", issue: "missing_in_source", resolved: false },
          { field: "signature_present", issue: "missing_signature", resolved: false },
          {
            field: "insurance_member_id",
            issue: "missing_in_source",
            resolved: false,
          },
        ],
        source_doc: {
          doc_id: "doc_jordan_incomplete",
          filename: "incomplete_intake_unsigned.pdf",
          uploaded_at: "2026-02-28T09:12:00.000Z",
        },
      }),
    ],
  },
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
    "Intake, labs, ultrasound, and insurance all on file — Meeting Prep should show 4/4 ready.",
  state: {
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
};

/** Private (local) Gemma mode with one solid visit doc. */
const sofiaLocal: DemoProfile = {
  id: "sofia-local",
  label: "Sofia — local Gemma",
  name: "Sofia Alvarez",
  showcases: ["Private/local Gemma mode", "Visit-type timeline entry", "Midwife provider"],
  blurb:
    "gemmaMode set to local. Single visit summary on the timeline; checklist mostly Missing.",
  state: {
    ...defaultState(),
    gemmaMode: "local",
    readinessScore: 20,
    profile: profile({
      name: "Sofia Alvarez",
      gestational_week: 11,
      due_date: "2026-09-22",
      provider: { name: "CNM Rosa Delgado", role: "Certified Nurse-Midwife" },
      next_appointment: {
        date: "2026-03-20",
        title: "Routine prenatal check",
      },
      onboarding_source: "form",
    }),
    documents: [
      doc({
        doc_id: "doc_sofia_visit",
        filename: "visit_summary_w11.pdf",
        uploaded_at: "2026-02-25T13:40:00.000Z",
        linked_entry_id: "entry_sofia_visit",
        raw_text_extracted:
          "Visit summary — Sofia Alvarez, BP 110/70, weight 138 lbs, next visit in 4 weeks.",
      }),
    ],
    entries: [
      entry({
        id: "entry_sofia_visit",
        date: "2026-02-25",
        trimester: "first",
        type: "visit",
        provider: { name: "CNM Rosa Delgado", role: "Certified Nurse-Midwife" },
        category: "physical",
        title: "11-Week Prenatal Checkup",
        summary: "Routine checkup; vitals documented; labs ordered.",
        fields: {
          blood_pressure: "110/70",
          weight_lbs: 138,
          next_appointment_recommended: "2026-03-20",
        },
        flags: [],
        source_doc: {
          doc_id: "doc_sofia_visit",
          filename: "visit_summary_w11.pdf",
          uploaded_at: "2026-02-25T13:40:00.000Z",
        },
      }),
    ],
  },
};

/**
 * Second-trimester scaffolding — shows trimester zones beyond the Zone 1 demo.
 * Checklist logic is still Zone 1-only in the app today.
 */
const emilySecond: DemoProfile = {
  id: "emily-second",
  label: "Emily — second trimester",
  name: "Emily Chen",
  showcases: [
    "Second-trimester timeline entries",
    "Multi-provider history",
    "Resolved vs open flags",
  ],
  blurb:
    "Week 20 with first- + second-trimester docs. Useful once Home renders trimester zones.",
  state: {
    ...defaultState(),
    gemmaMode: "cloud",
    readinessScore: 70,
    profile: profile({
      name: "Emily Chen",
      gestational_week: 20,
      due_date: "2026-07-12",
      provider: { name: "Dr. Sarah Chen", role: "OB/GYN" },
      next_appointment: {
        date: "2026-03-25",
        title: "Anatomy ultrasound review",
      },
      onboarding_source: "form",
    }),
    documents: [
      doc({
        doc_id: "doc_emily_intake",
        filename: "intake_w8.pdf",
        uploaded_at: "2025-12-10T10:00:00.000Z",
        linked_entry_id: "entry_emily_intake",
        checklist_item_id: "intake",
        raw_text_extracted: "Intake — Emily Chen, week 8 baseline.",
      }),
      doc({
        doc_id: "doc_emily_labs",
        filename: "labs_w10.pdf",
        uploaded_at: "2025-12-28T11:00:00.000Z",
        linked_entry_id: "entry_emily_labs",
        checklist_item_id: "labs",
        raw_text_extracted: "Early labs — Emily Chen.",
      }),
      doc({
        doc_id: "doc_emily_anatomy",
        filename: "anatomy_scan_w20.pdf",
        uploaded_at: "2026-02-20T09:00:00.000Z",
        linked_entry_id: "entry_emily_anatomy",
        raw_text_extracted:
          "Anatomy ultrasound — Emily Chen, GA 20w. Referral to MFM noted.",
      }),
      doc({
        doc_id: "doc_emily_referral",
        filename: "mfm_referral.pdf",
        uploaded_at: "2026-02-21T12:00:00.000Z",
        linked_entry_id: "entry_emily_referral",
        raw_text_extracted: "Referral to Dr. Luis Romero, MFM — anatomy follow-up.",
      }),
    ],
    entries: [
      entry({
        id: "entry_emily_intake",
        date: "2025-12-10",
        trimester: "first",
        type: "intake",
        provider: { name: "Dr. Sarah Chen", role: "OB/GYN" },
        category: "intake",
        title: "Maternal Baseline Intake Form",
        summary: "Early intake; emergency phone was missing then corrected.",
        fields: {
          patient_name: "Emily Chen",
          gestational_week: 8,
          emergency_contact_phone: "555-0142",
        },
        flags: [
          {
            field: "emergency_contact_phone",
            issue: "missing_in_source",
            resolved: true,
          },
        ],
        source_doc: {
          doc_id: "doc_emily_intake",
          filename: "intake_w8.pdf",
          uploaded_at: "2025-12-10T10:00:00.000Z",
        },
      }),
      entry({
        id: "entry_emily_labs",
        date: "2025-12-28",
        trimester: "first",
        type: "lab",
        provider: { name: "Dr. Sarah Chen", role: "OB/GYN" },
        category: "lab",
        title: "First Trimester Lab Panel Report",
        summary: "Baseline prenatal labs complete.",
        fields: {
          patient_name: "Emily Chen",
          blood_type: "B+",
          hemoglobin_g_dl: 12.1,
        },
        flags: [],
        source_doc: {
          doc_id: "doc_emily_labs",
          filename: "labs_w10.pdf",
          uploaded_at: "2025-12-28T11:00:00.000Z",
        },
      }),
      entry({
        id: "entry_emily_anatomy",
        date: "2026-02-20",
        trimester: "second",
        type: "ultrasound",
        provider: { name: "Dr. Ana Park", role: "Radiology" },
        category: "ultrasound",
        title: "Anatomy Ultrasound Report",
        summary: "20-week anatomy scan; MFM referral recommended for follow-up.",
        fields: {
          patient_name: "Emily Chen",
          exam_date: "2026-02-20",
          gestational_age_weeks: 20,
          anatomy_complete: true,
        },
        flags: [],
        source_doc: {
          doc_id: "doc_emily_anatomy",
          filename: "anatomy_scan_w20.pdf",
          uploaded_at: "2026-02-20T09:00:00.000Z",
        },
      }),
      entry({
        id: "entry_emily_referral",
        date: "2026-02-21",
        trimester: "second",
        type: "referral",
        provider: { name: "Dr. Luis Romero", role: "Maternal-Fetal Medicine" },
        category: "referral",
        title: "MFM Referral",
        summary: "Referral placed after anatomy ultrasound.",
        fields: {
          referred_to: "Dr. Luis Romero",
          reason: "Anatomy ultrasound follow-up",
          urgency: "routine",
        },
        flags: [
          {
            field: "appointment_date",
            issue: "missing_in_source",
            resolved: false,
          },
        ],
        source_doc: {
          doc_id: "doc_emily_referral",
          filename: "mfm_referral.pdf",
          uploaded_at: "2026-02-21T12:00:00.000Z",
        },
      }),
    ],
  },
};

/** EHR roadmap path flagged in profile (UI-only concept in PLAN). */
const noahEhrRoadmap: DemoProfile = {
  id: "noah-ehr-roadmap",
  label: "Noah — EHR roadmap source",
  name: "Noah Brooks",
  showcases: ["onboarding_source: ehr_roadmap", "Nearly empty continuity story"],
  blurb:
    "Profile marked as ehr_roadmap (pitch/UI path). Minimal docs — shows the non-form identity source.",
  state: {
    ...defaultState(),
    gemmaMode: "cloud",
    readinessScore: null,
    profile: profile({
      name: "Noah Brooks",
      gestational_week: 9,
      due_date: "2026-10-05",
      provider: { name: "Dr. Kim Okonkwo", role: "OB/GYN" },
      next_appointment: {
        date: "2026-03-16",
        title: "New patient prenatal",
      },
      onboarding_source: "ehr_roadmap",
    }),
    documents: [],
    entries: [],
  },
};

export const DEMO_PROFILES: DemoProfile[] = [
  emptySlate,
  aishaOnboarded,
  mayaCanonical,
  jordanFlags,
  priyaReady,
  sofiaLocal,
  emilySecond,
  noahEhrRoadmap,
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

/** Reset store to default empty state. */
export function resetDemoState(): AppState {
  const next = defaultState();
  saveState(next);
  return next;
}
