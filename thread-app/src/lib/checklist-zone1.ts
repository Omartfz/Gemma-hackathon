import type { RequiredDocItem } from "./types";

/** Static required docs for First Trimester (Zone 1) demo. */
export const ZONE1_REQUIRED_DOCS: RequiredDocItem[] = [
  {
    id: "intake",
    label: "Maternal baseline intake form",
    description: "Completed intake with patient info and consent fields.",
    doc_type: "intake",
  },
  {
    id: "labs",
    label: "First trimester lab panel",
    description: "Lab panel report for early prenatal screening.",
    doc_type: "lab",
  },
  {
    id: "ultrasound",
    label: "Early dating ultrasound",
    description: "Dating ultrasound report for gestational age confirmation.",
    doc_type: "ultrasound",
  },
  {
    id: "insurance",
    label: "Insurance card",
    description: "Front/back of insurance card on file for the visit.",
  },
];
