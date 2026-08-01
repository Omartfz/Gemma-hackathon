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
  // Demo profiles set next_appointment; appointmentFromProfile may return null.
  const base = appointmentFromProfile(state.profile, apptId);
  if (!base) return state;
  const appt: Appointment = {
    ...base,
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

/** Early prenatal — first OB intake, empty library. */
const aishaOnboarded: DemoProfile = {
  id: "aisha-onboarded",
  label: "Aisha — first prenatal",
  name: "Aisha Khan",
  showcases: [
    "Onboarding form → store",
    "Empty timeline",
    "First prenatal / OB intake · all docs Missing",
  ],
  blurb:
    "Week 8 · first prenatal / OB intake with Dr. Maya Patel. Photo ID, insurance, intake, and prior labs/US all still missing — Meeting Prep 0/4.",
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
        "New OB intake (~8 weeks): full history, physical exam, baseline prenatal labs ordered, dating ultrasound discussed. Bring photo ID, insurance card, medication list, and any prior pregnancy or early-scan records.",
      doc_reasons: {
        intake:
          "New-patient maternal history, medications, allergies, and consent forms are completed at the first prenatal visit.",
        labs: "Baseline prenatal labs (blood type/Rh, CBC, infectious disease screen, urine) are drawn at or right after the first visit — bring any prior results.",
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
        {
          title: "What to Expect at Your First Prenatal Appointment (Tufts Medicine)",
          url: "https://www.tuftsmedicine.org/about-us/news/what-expect-your-first-prenatal-appointment-step-step-guide",
        },
      ],
    },
  ),
};

/**
 * Mid-pregnancy anatomy scan — partial prep with a flagged intake.
 * Distinct from Aisha’s week-8 intake and Priya’s postpartum visit.
 */
const mayaCanonical: DemoProfile = {
  id: "maya-canonical",
  label: "Maya — anatomy scan",
  name: "Maya Rivera",
  showcases: [
    "Canonical demo persona",
    "Unresolved field flags",
    "Anatomy scan (~20w) · partial prep",
    "Timeline + library with 2 docs",
  ],
  blurb:
    "Week 20 · anatomy / anomaly scan (18–22w). Intake needs check; first-trimester labs on file; prior dating US & insurance missing — mixed Have/Missing.",
  state: withNextAppt(
    {
      ...defaultState(),
      gemmaMode: "cloud",
      readinessScore: 45,
      profile: profile({
        name: "Maya Rivera",
        gestational_week: 20,
        due_date: "2026-09-15",
        provider: { name: "Dr. Sarah Chen", role: "OB/GYN" },
        next_appointment: {
          date: "2026-03-14",
          title: "Anatomy scan (20-week ultrasound)",
        },
        onboarding_source: "form",
      }),
      documents: [
        doc({
          doc_id: "doc_maya_intake",
          filename: "CareOS_Template_1_Maternal_Baseline_Intake_Form.pdf",
          uploaded_at: "2026-02-12T15:04:00.000Z",
          linked_entry_id: "entry_maya_intake",
          checklist_item_id: "intake",
          raw_text_extracted:
            "CareOS Maternal Baseline Intake — Maya Rivera, Week 20 anatomy scan prep, Dr. Sarah Chen. Emergency contact phone blank.",
        }),
        doc({
          doc_id: "doc_maya_labs",
          filename: "CareOS_Template_2_First_Trimester_Lab_Panel_Report.pdf",
          uploaded_at: "2026-02-13T11:20:00.000Z",
          linked_entry_id: "entry_maya_labs",
          checklist_item_id: "labs",
          raw_text_extracted:
            "CareOS First Trimester Lab Panel — Maya Rivera. Blood type A+, Hgb 12.4, Hep B negative. Glucose screen not yet due (24–28w).",
        }),
      ],
      entries: [
        entry({
          id: "entry_maya_intake",
          date: "2026-02-12",
          trimester: "second",
          type: "intake",
          provider: { name: "Dr. Sarah Chen", role: "OB/GYN" },
          category: "intake",
          title: "Maternal Baseline Intake Form",
          summary:
            "Updated intake ahead of Maya Rivera’s anatomy scan. Most fields complete; emergency contact phone is blank.",
          fields: {
            patient_name: "Maya Rivera",
            dob: "1994-06-12",
            gestational_week: 20,
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
            filename: "CareOS_Template_1_Maternal_Baseline_Intake_Form.pdf",
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
            "Prenatal lab panel with CBC, blood type, and infectious disease screen — still referenced at the anatomy-scan visit.",
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
            filename: "CareOS_Template_2_First_Trimester_Lab_Panel_Report.pdf",
            uploaded_at: "2026-02-13T11:20:00.000Z",
          },
        }),
      ],
    },
    "appt_maya",
    {
      appointment_type: "anatomy_scan",
      location: "Northside Imaging — Maternal Ultrasound",
      notes:
        "Detailed fetal anatomy / anomaly ultrasound (~18–22 weeks). Reviews organ development, placenta location, and amniotic fluid. Bring prior dating or NT report for GA correlation; glucose screening is usually later (24–28w).",
      provider: { name: "Dr. Ana Park", role: "Maternal-Fetal Medicine" },
      doc_reasons: {
        intake:
          "Updated history and emergency contacts so imaging and OB teams share a complete chart before a long anatomy scan.",
        labs: "Prior prenatal panel (blood type, CBC, infectious screens) should be available; GDM glucose testing is typically separate at 24–28 weeks.",
        ultrasound:
          "Prior dating or NT ultrasound report (11–14 weeks) confirms gestational age so the anatomy window is scheduled correctly — bring the report if imaging was done elsewhere.",
        insurance:
          "Insurance card for imaging check-in and coverage verification of the detailed second-trimester scan.",
      },
      research_citations: [
        {
          title: "Prenatal Appointment Timeline (Sinai Health)",
          url: "https://www.sinaihealth.ca/areas-of-care/wih/pregnancy-birth-and-newborn-care/prenatal-appointment-timeline",
        },
        {
          title: "20 Week Ultrasound / Anatomy Scan (Cleveland Clinic)",
          url: "https://my.clevelandclinic.org/health/diagnostics/22644-20-week-ultrasound",
        },
        {
          title: "Nuchal Translucency or Early Anatomy Ultrasound (Sinai Health)",
          url: "https://www.sinaihealth.ca/areas-of-care/wih/pregnancy-birth-and-newborn-care/nuchal-translucency-or-early-anatomy-ultrasound",
        },
      ],
    },
  ),
};

/**
 * Postpartum comprehensive visit — Zone 1 checklist mapped onto
 * discharge / birth / prenatal US / insurance paperwork patients typically bring.
 * gestational_week holds postpartum week (schema has no separate postpartum field).
 */
const priyaReady: DemoProfile = {
  id: "priya-ready",
  label: "Priya — postpartum ready",
  name: "Priya Desai",
  showcases: [
    "Full Zone 1 checklist (Have ×4)",
    "6-week postpartum checkup",
    "High readinessScore",
    "Discharge summary + birth record in library",
  ],
  blurb:
    "6 weeks postpartum · comprehensive checkup with Dr. Helen Cho after vaginal birth. Discharge summary, birth record, prior anatomy US, and insurance on file — Meeting Prep 4/4.",
  state: withNextAppt(
    {
      ...defaultState(),
      gemmaMode: "cloud",
      readinessScore: 92,
      profile: profile({
        name: "Priya Desai",
        /** Postpartum week 6 — profile field is gestational_week only. */
        gestational_week: 6,
        due_date: "2026-01-15",
        provider: { name: "Dr. Helen Cho", role: "OB/GYN" },
        next_appointment: {
          date: "2026-03-01",
          title: "6-week postpartum checkup",
        },
        onboarding_source: "form",
      }),
      documents: [
        doc({
          doc_id: "doc_priya_intake",
          filename: "postpartum_intake.pdf",
          uploaded_at: "2026-02-20T14:00:00.000Z",
          linked_entry_id: "entry_priya_intake",
          checklist_item_id: "intake",
          raw_text_extracted:
            "Postpartum visit questionnaire — Priya Desai, SVD 2026-01-15 at 39w2d. Bleeding decreasing, breastfeeding, mood screen pending visit.",
        }),
        doc({
          doc_id: "doc_priya_labs",
          filename: "hospital_discharge_summary.pdf",
          uploaded_at: "2026-01-17T10:00:00.000Z",
          linked_entry_id: "entry_priya_labs",
          checklist_item_id: "labs",
          raw_text_extracted:
            "Hospital discharge summary — Priya Desai. SVD 39w2d, GBS negative, blood type O+, estimated blood loss 300 mL, newborn Apgar 8/9.",
        }),
        doc({
          doc_id: "doc_priya_us",
          filename: "anatomy_ultrasound_w20.pdf",
          uploaded_at: "2025-11-05T16:30:00.000Z",
          linked_entry_id: "entry_priya_us",
          checklist_item_id: "ultrasound",
          raw_text_extracted:
            "Anatomy US 20w — normal survey, anterior placenta, EDD 2026-01-15. Kept on file from prenatal course.",
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
          date: "2026-02-20",
          trimester: "postpartum",
          type: "intake",
          provider: { name: "Dr. Helen Cho", role: "OB/GYN" },
          category: "intake",
          title: "Postpartum Visit Questionnaire",
          summary:
            "Recovery, feeding, and mood checklist completed ahead of the 6-week postpartum visit.",
          fields: {
            patient_name: "Priya Desai",
            postpartum_week: 6,
            delivery_date: "2026-01-15",
            delivery_type: "spontaneous vaginal delivery",
            primary_provider: "Dr. Helen Cho",
            allergies: "Penicillin",
            breastfeeding: true,
            signature_present: true,
          },
          flags: [],
          source_doc: {
            doc_id: "doc_priya_intake",
            filename: "postpartum_intake.pdf",
            uploaded_at: "2026-02-20T14:00:00.000Z",
          },
        }),
        entry({
          id: "entry_priya_labs",
          date: "2026-01-17",
          trimester: "postpartum",
          type: "lab",
          provider: { name: "Dr. Helen Cho", role: "OB/GYN" },
          category: "lab",
          title: "Hospital Discharge Summary",
          summary:
            "Delivery and discharge record with blood type, GBS status, and newborn Apgars — typical paperwork for the postpartum checkup.",
          fields: {
            patient_name: "Priya Desai",
            delivery_date: "2026-01-15",
            gestational_age_at_birth: "39w2d",
            blood_type: "O+",
            gbs_status: "negative",
            estimated_blood_loss_ml: 300,
            newborn_apgar: "8/9",
          },
          flags: [],
          source_doc: {
            doc_id: "doc_priya_labs",
            filename: "hospital_discharge_summary.pdf",
            uploaded_at: "2026-01-17T10:00:00.000Z",
          },
        }),
        entry({
          id: "entry_priya_us",
          date: "2025-11-05",
          trimester: "second",
          type: "ultrasound",
          provider: { name: "Dr. Ana Park", role: "Maternal-Fetal Medicine" },
          category: "ultrasound",
          title: "Anatomy Ultrasound Report",
          summary:
            "Prenatal anatomy survey kept in the chart; Zone 1 still uses the ultrasound checklist slot for visit-ready demos.",
          fields: {
            patient_name: "Priya Desai",
            exam_date: "2025-11-05",
            gestational_age_weeks: 20,
            estimated_due_date: "2026-01-15",
            placenta: "anterior",
            survey: "normal",
          },
          flags: [],
          source_doc: {
            doc_id: "doc_priya_us",
            filename: "anatomy_ultrasound_w20.pdf",
            uploaded_at: "2025-11-05T16:30:00.000Z",
          },
        }),
        entry({
          id: "entry_priya_ins",
          date: "2026-01-20",
          trimester: "postpartum",
          type: "note",
          provider: { name: "Dr. Helen Cho", role: "OB/GYN" },
          category: "note",
          title: "Insurance Card",
          summary: "Insurance card on file for postpartum visit check-in.",
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
      appointment_type: "postpartum_checkup",
      location: "Summit Women's Health — Clinic B",
      notes:
        "Comprehensive postpartum visit (~4–12 weeks after birth; often ~6 weeks). Review physical recovery, mood, infant feeding, contraception, and birth details. Bring hospital discharge paperwork and a symptom/question list. ACOG also recommends earlier contact within 3 weeks when needed.",
      doc_reasons: {
        intake:
          "Postpartum questionnaire / updated history covers bleeding, incision or perineal healing, mood, feeding, and contraception preferences.",
        labs: "Hospital discharge summary (and birth record details such as blood type, GBS, complications) helps the OB review delivery without hunting the inpatient chart.",
        ultrasound:
          "Prior prenatal ultrasound reports (e.g. anatomy scan) often remain in the longitudinal chart; mapped here to the Zone 1 ultrasound checklist slot.",
        insurance:
          "Insurance card for check-in — coverage for postpartum visits can change after delivery, so verifying benefits matters.",
      },
      research_citations: [
        {
          title: "Optimizing Postpartum Care (ACOG)",
          url: "https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2018/05/optimizing-postpartum-care",
        },
        {
          title: "What to Expect at a Postpartum Checkup (ACOG)",
          url: "https://www.acog.org/womens-health/experts-and-stories/the-latest/what-to-expect-at-a-postpartum-checkup-and-why-the-visit-matters",
        },
        {
          title: "Prenatal Appointment Timeline — six weeks postpartum (Sinai Health)",
          url: "https://www.sinaihealth.ca/areas-of-care/wih/pregnancy-birth-and-newborn-care/prenatal-appointment-timeline",
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
