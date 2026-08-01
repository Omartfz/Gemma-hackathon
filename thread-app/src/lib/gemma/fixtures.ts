import type { ExtractResult } from "@/lib/types";

const intake: ExtractResult = {
  title: "Maternal Baseline Intake Form",
  summary:
    "First-trimester intake form for Maya Rivera. Most fields complete; emergency contact phone is blank.",
  type: "intake",
  trimester: "first",
  checklist_item_id: "intake",
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
  raw_text_extracted:
    "CareOS Maternal Baseline Intake — Maya Rivera, Week 12, Dr. Sarah Chen. Emergency contact phone blank.",
};

const labs: ExtractResult = {
  title: "First Trimester Lab Panel Report",
  summary:
    "Prenatal lab panel with CBC, blood type, and infectious disease screen. Results within reported reference ranges.",
  type: "lab",
  trimester: "first",
  checklist_item_id: "labs",
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
  raw_text_extracted:
    "CareOS First Trimester Lab Panel — Maya Rivera. Blood type A+, Hgb 12.4, Hep B negative.",
};

const ultrasound: ExtractResult = {
  title: "Early Dating Ultrasound Report",
  summary:
    "Dating ultrasound consistent with ~12 weeks gestation. CRL and EDD documented.",
  type: "ultrasound",
  trimester: "first",
  checklist_item_id: "ultrasound",
  fields: {
    patient_name: "Maya Rivera",
    exam_date: "2026-02-14",
    gestational_age_weeks: 12,
    crown_rump_length_mm: 54,
    estimated_due_date: "2026-09-15",
    fetal_heart_rate_bpm: 158,
    interpreting_provider: "Dr. Ana Park",
  },
  flags: [],
  raw_text_extracted:
    "CareOS Early Dating Ultrasound — GA 12w, CRL 54mm, EDD 2026-09-15, FHR 158.",
};

const incomplete: ExtractResult = {
  title: "Incomplete Intake Form",
  summary:
    "Intake form uploaded but several required fields are blank or unsigned.",
  type: "intake",
  trimester: "first",
  checklist_item_id: "intake",
  fields: {
    patient_name: "Maya Rivera",
    gestational_week: 12,
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
  raw_text_extracted:
    "Partial intake — patient name present; provider, signature, and insurance ID blank.",
};

const insurance: ExtractResult = {
  title: "Insurance Card",
  summary: "Insurance card on file with member ID and group number visible.",
  type: "note",
  trimester: "first",
  checklist_item_id: "insurance",
  fields: {
    payer_name: "Northstar Health",
    member_id: "NSH-448291",
    group_number: "GRP-1200",
    subscriber_name: "Maya Rivera",
  },
  flags: [],
  raw_text_extracted:
    "Northstar Health — Member NSH-448291 — Group GRP-1200 — Maya Rivera.",
};

const generic: ExtractResult = {
  title: "Uploaded Document",
  summary:
    "Generic first-trimester document extract. Review fields and flags before saving.",
  type: "note",
  trimester: "first",
  fields: {
    patient_name: "Maya Rivera",
    document_date: null,
  },
  flags: [
    { field: "document_date", issue: "missing_in_source", resolved: false },
  ],
  raw_text_extracted: "Untitled prenatal document — date not found in source.",
};

/** Resolve a deterministic fixture from filename / keywords. */
export function fixtureForFilename(filename: string): ExtractResult {
  const name = filename.toLowerCase();

  if (
    name.includes("incomplete") ||
    name.includes("missing") ||
    name.includes("unsigned")
  ) {
    return structuredClone(incomplete);
  }
  if (name.includes("insurance") || name.includes("ins_card")) {
    return structuredClone(insurance);
  }
  if (
    name.includes("template_1") ||
    name.includes("intake") ||
    name.includes("baseline")
  ) {
    return structuredClone(intake);
  }
  if (
    name.includes("template_2") ||
    name.includes("lab") ||
    name.includes("panel")
  ) {
    return structuredClone(labs);
  }
  if (
    name.includes("template_3") ||
    name.includes("ultrasound") ||
    name.includes("dating")
  ) {
    return structuredClone(ultrasound);
  }

  return structuredClone(generic);
}
