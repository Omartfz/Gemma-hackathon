import type { ResearchDocItem, ResearchDocsResponse } from "@/lib/types";

const intake: ResearchDocItem = {
  id: "intake",
  label: "Maternal baseline intake form",
  reason: "Clinic intake and consent so the visit can proceed without paperwork delays.",
};
const labs: ResearchDocItem = {
  id: "labs",
  label: "First trimester lab panel",
  reason: "Prior lab results help the provider review screening without reordering unnecessarily.",
};
const ultrasound: ResearchDocItem = {
  id: "ultrasound",
  label: "Early dating ultrasound",
  reason: "Dating or prior ultrasound reports support gestational age and visit planning.",
};
const insurance: ResearchDocItem = {
  id: "insurance",
  label: "Insurance card",
  reason: "Insurance information is typically required for check-in and coverage verification.",
};

const byType: Record<string, ResearchDocItem[]> = {
  prenatal_checkup: [intake, labs, insurance],
  dating_ultrasound: [intake, insurance, ultrasound],
  anatomy_scan: [insurance, ultrasound, labs],
  labs: [insurance, labs, intake],
  other: [intake, insurance],
};

/** Deterministic required-doc suggestions when Tavily is unavailable. */
export function fixtureResearchDocs(
  appointmentType: string,
): ResearchDocsResponse {
  const key = appointmentType in byType ? appointmentType : "other";
  return {
    source: "fixture",
    required: byType[key] ?? byType.other!,
    citations: [
      {
        title: "Fixture: public prenatal visit preparation guidance",
        url: "https://www.cdc.gov/pregnancy/index.html",
      },
    ],
  };
}
